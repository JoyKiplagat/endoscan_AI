"""
EndoScan — Structured Path Model Loader
==========================================
Loads the trained LightGBM classifier + Platt calibrator saved by the
structured questionnaire notebook, and defines predict_esi() — the
function assess_patient.py actually calls.

WHERE THE MODEL GETS CALLED: see predict_esi() near the bottom — that's
the one line that runs the actual trained model:
    raw_prob = final_model.predict_proba(df_row[ALL_FEATURES])[:, 1][0]

Load this ONCE at backend startup (importing this module runs the loading
code below immediately), not per-request — loading a LightGBM model from
disk on every API call would be slow and pointless.
"""

import joblib
from pathlib import Path

# ── UPDATE THIS to wherever your structured notebook actually saved these ──
ARTIFACTS_DIR = Path('.')
# ────────────────────────────────────────────────────────────────────────

CLASSIFIER_PATH = ARTIFACTS_DIR / 'endoscan_classifier.pkl'
FEATURE_LIST_PATH = ARTIFACTS_DIR / 'feature_list.pkl'

assert CLASSIFIER_PATH.exists(), f"Structured classifier not found at {CLASSIFIER_PATH}"
assert FEATURE_LIST_PATH.exists(), f"Feature list not found at {FEATURE_LIST_PATH}"

# ── THE ACTUAL MODEL LOADING ────────────────────────────────────────────
_artefacts = joblib.load(CLASSIFIER_PATH)
final_model = _artefacts['model']   # the trained LightGBM classifier
platt = _artefacts['platt']         # the Platt-scaling calibrator
ALL_FEATURES = joblib.load(FEATURE_LIST_PATH)

print(f"Structured model loaded ✓  ({len(ALL_FEATURES)} features)")

# ── Everything below is copied from the structured notebook's Phase 5, ──
# unchanged — this module's job is to load the artifacts and expose the
# same predict_esi() the notebook already validated, not to redefine its
# logic differently.

FEATURES = [
    'Age', 'BMI', 'Cycle_Length', 'Age_of_Menarche',
    'Dysmenorrhea_Score', 'Pelvic_Pain_Score', 'Dyspareunia_Score',
    'Dyschezia_Score', 'Urinary_Symptoms_Score', 'Mental_Health_Score',
    'Family_History', 'Infertility_Status'
]
SCORE_COLS = [
    'Dysmenorrhea_Score', 'Pelvic_Pain_Score', 'Dyspareunia_Score',
    'Dyschezia_Score', 'Urinary_Symptoms_Score', 'Mental_Health_Score'
]

SCORE_DESCRIPTIONS = {
    'Low':      'Minimal endometriosis indicators. Monitor and follow up at next routine appointment.',
    'Moderate': 'Moderate indicators present. Clinical follow-up recommended within 4–6 weeks.',
    'High':     'Strong endometriosis indicators. Prioritise specialist referral within 2 weeks.',
    'Critical': 'Severe presentation. Urgent specialist referral required.'
}

SYMPTOM_LABELS = {
    'Dysmenorrhea_Score':      'Painful periods (dysmenorrhoea)',
    'Pelvic_Pain_Score':       'Pelvic pain',
    'Dyspareunia_Score':       'Pain during intercourse (dyspareunia)',
    'Dyschezia_Score':         'Painful bowel movements (dyschezia)',
    'Urinary_Symptoms_Score':  'Urinary symptoms',
    'Mental_Health_Score':     'Mental health impact',
}


def prob_to_esi(prob: float):
    """Map raw probability [0,1] → ESI score [1,100] → ESI tier."""
    esi_score = int(round(prob * 99 + 1))
    esi_score = max(1, min(100, esi_score))
    if   esi_score <= 25: tier = 'Low'
    elif esi_score <= 50: tier = 'Moderate'
    elif esi_score <= 75: tier = 'High'
    else:                 tier = 'Critical'
    return esi_score, tier


def predict_esi(input_dict: dict) -> dict:
    """
    Production inference for the structured questionnaire path.
    This is where the actual trained model gets called (see the
    final_model.predict_proba(...) line below).

    Args:
        input_dict: dict with questionnaire keys matching FEATURES

    Returns:
        dict with esi_score, esi_tier, probability, description,
        top_symptoms, family_history, infertility_flag, model_version, path
    """
    import pandas as pd

    row = {f: input_dict.get(f, 0) for f in FEATURES}
    df_row = pd.DataFrame([row], dtype=float)

    sc = [row[c] for c in SCORE_COLS]
    df_row['total_symptom_burden'] = sum(sc)
    df_row['any_severe_symptom']   = int(any(s >= 8 for s in sc))
    df_row['pain_triad_score']     = sc[0] + sc[1] + sc[2]
    df_row['bowel_urinary_score']  = sc[3] + sc[4]
    df_row['years_since_menarche'] = row['Age'] - row['Age_of_Menarche']
    bmi = row['BMI']
    df_row['bmi_category'] = (0 if bmi < 18.5 else
                               1 if bmi < 25   else
                               2 if bmi < 30   else 3)

    # ── THE MODEL CALL ──────────────────────────────────────────────
    raw_prob = final_model.predict_proba(df_row[ALL_FEATURES])[:, 1][0]
    cal_prob = platt.predict_proba([[raw_prob]])[:, 1][0]
    # ─────────────────────────────────────────────────────────────────

    esi_score, esi_tier = prob_to_esi(cal_prob)

    top_symptoms = [SYMPTOM_LABELS[k]
                     for k in sorted(SYMPTOM_LABELS, key=lambda x: -input_dict.get(x, 0))
                     if input_dict.get(k, 0) >= 6][:3]

    return {
        'esi_score':        esi_score,
        'esi_tier':         esi_tier,
        'probability':      round(float(cal_prob), 4),
        'description':      SCORE_DESCRIPTIONS[esi_tier],
        'top_symptoms':     top_symptoms or ['No severe symptoms reported'],
        'family_history':   bool(input_dict.get('Family_History', 0)),
        'infertility_flag': bool(input_dict.get('Infertility_Status', 0)),
        'model_version':    'endoscan_lgb_v1.0',
        'path':             'structured_classifier'
    }


if __name__ == '__main__':
    # Quick smoke test — run this file directly to confirm the model loads
    # and produces a sane result before wiring it into the backend.
    sample = {
        'Age': 28, 'BMI': 22.5, 'Cycle_Length': 26, 'Age_of_Menarche': 12,
        'Dysmenorrhea_Score': 9, 'Pelvic_Pain_Score': 8, 'Dyspareunia_Score': 7,
        'Dyschezia_Score': 6, 'Urinary_Symptoms_Score': 5, 'Mental_Health_Score': 7,
        'Family_History': 1, 'Infertility_Status': 1
    }
    import json
    print(json.dumps(predict_esi(sample), indent=2))
