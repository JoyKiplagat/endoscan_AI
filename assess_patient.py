"""
EndoScan — Diagnostic Path Integration
========================================
Combines the structured questionnaire path (predict_esi) and the NLP
free-text path (run_full_pipeline) into ONE unified ESI assessment.

This is the DIAGNOSTIC / SCORING layer. It is separate from, and upstream
of, the complementary scan-explainer router (endoscan_scan_router.ipynb —
MRI + laparoscopy). This module decides severity; the scan explainer only
explains an already-diagnosed patient's existing scan afterward, and never
feeds back into the score computed here.

DEPENDENCY NOTE: this file imports the actual model-loading modules below
(structured_model.py, nlp_model.py). Importing this file loads BOTH
trained models into memory — do that ONCE at backend startup (e.g. as a
global in your API server's startup event), not per-request.
"""

from typing import Optional

# ── THE ACTUAL MODEL IMPORTS — this is what loads both trained models ──
# Each import runs that module's top-level loading code immediately
# (joblib.load for the structured model, BioBERT + sentence-transformer
# for the NLP model) — see structured_model.py and nlp_model.py for where
# each actual model call happens.
from structured_model import predict_esi
from nlp_model import run_full_pipeline, generate_explanation, id_to_name, ESI_TIERS as NLP_ESI_TIERS


# ── Tier normalisation ──────────────────────────────────────────────
# The two paths use different tier casing (structured: 'Low'/'Moderate'/
# 'High'/'Critical'; NLP: 'LOW'/'MODERATE'/'HIGH'/'CRITICAL') and, more
# importantly, different SCALES underneath — struct_score is a calibrated
# ML probability x100 (Platt-scaled, validated on a held-out test set);
# nlp_score is a hand-weighted clinical-rules formula normalised against
# an arbitrary ceiling, with NO outcome validation yet (only synthetic
# unit tests). Their raw numbers are not statistically comparable, so
# fusion happens at the TIER level, not by averaging raw scores.
#
# TODO (flagged, not blocking): once the NLP path's raw score is Platt-
# calibrated against its own labelled data (synthetic_training_data /
# synthetic_large both carry a real esi_label column — see the
# discussion this file was born from), both paths' scores become
# genuine probabilities and a real weighted average becomes valid.
# Until then, tier-level fusion is the honest choice.

TIER_RANK = {
    'Low': 0, 'LOW': 0,
    'Moderate': 1, 'MODERATE': 1,
    'High': 2, 'HIGH': 2,
    'Critical': 3, 'CRITICAL': 3,
}
RANK_TIER = {0: 'Low', 1: 'Moderate', 2: 'High', 3: 'Critical'}  # canonical output casing


def fuse_esi(struct_result: Optional[dict], nlp_result: Optional[dict]) -> dict:
    """
    Combine the structured and NLP paths' tiers into one final tier.

    The more severe of the two tiers wins — matches the system's stated
    "missing a case is worse than a false alarm" philosophy, and mirrors
    the auto-escalation logic already built into the NLP scorer itself.

    Args:
        struct_result: output of predict_esi() from the structured path
                        (has 'esi_tier', 'esi_score'), or None if the
                        patient didn't fill out the questionnaire
        nlp_result:     the 'esi_result' dict from run_full_pipeline()'s
                         output (has 'tier' [UPPERCASE], 'score'), or None
                         if the patient didn't provide free text

    Returns:
        dict with final_tier, which path drove the decision, whether the
        two paths agreed (None if only one path ran), and both paths'
        raw results for transparency/debugging.
    """
    inputs = []
    if struct_result:
        inputs.append(('structured', TIER_RANK[struct_result['esi_tier']], struct_result.get('esi_score')))
    if nlp_result:
        inputs.append(('nlp', TIER_RANK[nlp_result['tier']], nlp_result.get('score')))

    if not inputs:
        raise ValueError(
            "fuse_esi() needs at least one of struct_result or nlp_result — "
            "the patient must have completed the questionnaire, the free-text "
            "input, or both."
        )

    winning_path, winning_rank, _ = max(inputs, key=lambda x: x[1])
    ranks = [r for _, r, _ in inputs]

    return {
        'final_tier':   RANK_TIER[winning_rank],
        'driving_path': winning_path,
        'paths_agree':  (len(set(ranks)) == 1) if len(inputs) > 1 else None,
        'path_results': {
            name: {'tier': RANK_TIER[rank], 'raw_score': score}
            for name, rank, score in inputs
        },
    }


# ── The actual backend entry point ──────────────────────────────────

def assess_patient(
    questionnaire_input: Optional[dict] = None,
    free_text_input: Optional[str] = None,
    duration_code: Optional[str] = None,
    history_flags: Optional[list] = None,
) -> dict:
    """
    THE single diagnostic entry point for the backend to call.

    Runs whichever path(s) the patient provided input for, fuses the
    result, and returns one response shape regardless of which path(s)
    ran — so the frontend doesn't need to branch on "did they fill out
    the form, the free text, or both."

    Args:
        questionnaire_input: dict matching predict_esi()'s expected
                              FEATURES (Age, BMI, Dysmenorrhea_Score, ...),
                              or None if the patient skipped the questionnaire
        free_text_input:     patient's free-text symptom description,
                              or None if they skipped it
        duration_code:       optional DM00x code — pass this through if the
                              structured questionnaire already captured
                              duration, so the NLP path doesn't ask again
        history_flags:       optional list of HM00x codes — same idea, avoid
                              asking the patient the same question twice

    Returns:
        {
          'final_tier':      'Low' | 'Moderate' | 'High' | 'Critical',
          'driving_path':    'structured' | 'nlp',
          'paths_agree':     bool | None,
          'path_results':    {...},               # from fuse_esi()
          'structured_result': dict | None,        # full predict_esi() output
          'nlp_result':        dict | None,         # full esi_result from NLP
          'explanation':     str | None,         # generated fresh from the fused tier
          'eligible_for_scan_explainer': True,      # see note below
        }

    Note on 'eligible_for_scan_explainer': this flag is always True here —
    it's a reminder for the frontend/backend, not a computed gate. ANY
    diagnosed patient (regardless of tier) may separately request the
    complementary scan explainer (MRI/laparoscopy) if they have an
    existing scan they want explained. That's a completely different
    user action from this assessment and should never be triggered
    automatically based on final_tier.
    """
    if not questionnaire_input and not free_text_input:
        raise ValueError(
            "assess_patient() needs at least one of questionnaire_input "
            "or free_text_input."
        )

    struct_result = None
    nlp_result = None
    nlp_pipeline_output = None

    if questionnaire_input:
        struct_result = predict_esi(questionnaire_input)

    if free_text_input:
        nlp_pipeline_output = run_full_pipeline(
            free_text_input,
            duration_code=duration_code,
            history_flags=history_flags,
            verbose=False,
        )
        nlp_result = nlp_pipeline_output['esi_result']

    fused = fuse_esi(struct_result, nlp_result)
    explanation = _build_fused_explanation(fused, struct_result, nlp_pipeline_output)

    return {
        **fused,
        'structured_result': struct_result,
        'nlp_result': nlp_result,
        'explanation': explanation,
        'eligible_for_scan_explainer': True,
    }


def _build_fused_explanation(
    fused: dict,
    struct_result: Optional[dict],
    nlp_pipeline_output: Optional[dict],
) -> Optional[str]:
    """
    Generates ONE explanation consistent with the FUSED tier, rather than
    reusing either path's own self-contained narrative — that approach
    caused a real bug: the NLP path's Gemini explanation describes ITS OWN
    tier in its own words (e.g. "you fall in the High tier"), which can
    flatly contradict final_tier when the structured path was more severe
    and the fusion picked Critical instead. A patient reading such text
    would be told the wrong severity in the body even if a header said
    otherwise. This always regenerates the narrative from the actual fused
    tier, so the whole explanation — not just a prepended header — matches
    what final_tier says.
    """
    if struct_result is None and nlp_pipeline_output is None:
        return None

    tier_key = fused['final_tier'].upper()  # nlp_model's ESI_TIERS is keyed uppercase
    tier_data = NLP_ESI_TIERS[tier_key]

    # Combine symptom names from whichever path(s) ran, deduplicated,
    # order preserved (NLP names first — usually more specific/patient-voiced).
    detected_names = []
    if nlp_pipeline_output:
        detected_names.extend(
            id_to_name.get(d['symptom_id'], d['symptom_id']).replace('_', ' ')
            for d in nlp_pipeline_output['detections']
            if d['symptom_id'] != 'UNKNOWN'
        )
    if struct_result:
        detected_names.extend(struct_result.get('top_symptoms', []))
    detected_names = list(dict.fromkeys(detected_names)) or ['the symptoms described']

    extracted = nlp_pipeline_output['extracted'] if nlp_pipeline_output else {}
    duration_raw = extracted.get('duration')

    # Escalation note: true if EITHER path's own auto-escalation fired, or
    # if the two paths disagreed and fusion had to pick the more severe one.
    escalated = bool(nlp_pipeline_output and nlp_pipeline_output['esi_result'].get('escalated'))
    if fused['paths_agree'] is False:
        escalated = True  # forces generate_explanation()'s escalation_note branch on

    fused_esi_result = {
        'tier': tier_key,
        'systems_affected': (nlp_pipeline_output['esi_result']['systems_affected']
                              if nlp_pipeline_output else []),
        'escalated': escalated,
        'score': fused['path_results'][fused['driving_path']]['raw_score'],
    }

    explanation = generate_explanation(
        fused_esi_result,
        {'severity_cues': extracted.get('severity_cues', {})},
        detected_names,
        duration_raw,
    )

    if fused['paths_agree'] is False:
        explanation += (
            "\n\n(Note: your questionnaire answers and your written description "
            "pointed to different severity levels. In line with not "
            "underestimating a possible case, the more serious of the two "
            "assessments is reflected above.)"
        )

    return explanation