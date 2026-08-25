"""
EndoScan AI — Synthetic Training Data Generator v5
====================================================
Generates labelled symptom sentences from symptoms.json and symptom_aliases.json.

Design (v5):
  - Phrases split into two pools per language:
      * short_phrases (≤ 4 words)  → slot into templates, amplifier allowed
      * long_phrases  (> 4 words)  → used as-is with minimal prefix wrapper
  - user_descriptors (always short fragments) → slot into templates, no amplifier
  - Swahili / en-KE never use user_descriptors (English only)

Output: synthetic_training_data.csv
"""

import json
import csv
import random
import argparse
from pathlib import Path
from collections import Counter

random.seed(42)

TEMPLATES = {
    'en': [
        "I have {alias}.",
        "I experience {alias} regularly.",
        "I have been dealing with {alias} for a while now.",
        "My main problem is {alias}.",
        "I came to the clinic because of {alias}.",
        "I have had {alias} since I was a teenager.",
        "I am struggling with {alias}.",
        "Doctor, I have {alias} and I do not know what to do.",
        "For the past few months I have had {alias}.",
        "I cannot work properly because of {alias}.",
    ],
    'sw': [
        "Nina {alias}.",
        "Nimekuwa na {alias} kwa muda mrefu.",
        "Tatizo langu kuu ni {alias}.",
        "Nilikuja hospitalini kwa sababu ya {alias}.",
        "Nimekuwa nikilalamika kuhusu {alias}.",
        "Sijui nifanye nini kuhusu {alias}.",
    ],
    'en-KE': [
        "I have {alias} and it is really affecting me.",
        "Since I was young I have had {alias}.",
        "Every month I suffer from {alias}.",
        "I have come to see the doctor because of {alias}.",
        "I need help with {alias}.",
    ],
}

# Wrappers for long clauses — phrase stays intact, just gets a light prefix
LONG_PHRASE_WRAPPERS = [
    "{phrase}.",
    "I told the doctor that {phrase}.",
    "My experience is that {phrase}.",
    "The problem I have is that {phrase}.",
    "I am here because {phrase}.",
    "I want you to know that {phrase}.",
]

DURATION_PHRASES = [
    "for about {n} months",
    "for the past {n} months",
    "for {n} months now",
    "for over {n} months",
    "for {n} years",
    "since I was {age} years old",
]

SEVERITY_AMPLIFIERS = {
    'mild':     ['slight', 'mild', 'occasional', 'some'],
    'moderate': ['moderate', 'significant', 'noticeable', 'regular'],
    'severe':   ['severe', 'very bad', 'serious', 'intense'],
    'critical': ['unbearable', 'excruciating', 'extreme'],
}


def derive_esi_label(base_weight: int, severity: str) -> str:
    modifiers = {'mild': 1.0, 'moderate': 1.5, 'severe': 2.0, 'critical': 3.0}
    score = base_weight * modifiers.get(severity, 1.0)
    if score >= 25:   return 'Critical'
    elif score >= 15: return 'High'
    elif score >= 8:  return 'Moderate'
    return 'Low'


def load_data(data_dir: Path) -> tuple[list, dict]:
    with open(data_dir / 'symptoms.json', encoding='utf-8') as f:
        raw = json.load(f)

    symptoms = []
    for cat in raw['symptom_categories'].values():
        for s in cat['symptoms']:
            s['category_weight_multiplier'] = cat['category_weight_multiplier']
            symptoms.append(s)

    with open(data_dir / 'symptom_aliases.json', encoding='utf-8') as f:
        raw_aliases = json.load(f)

    alias_map = {}
    for entry in raw_aliases['aliases']:
        sid  = entry['symptom_id']
        lang = entry['language']
        alias_map.setdefault(sid, {}).setdefault(lang, []).append(entry['alias'])

    return symptoms, alias_map


def make_sentence(phrase: str, lang: str, severity: str,
                  is_alias: bool, duration_sensitive: bool) -> str:
    words = phrase.split()

    if len(words) > 4:
        # Long clause — wrap minimally, never slot into a template
        wrapper = random.choice(LONG_PHRASE_WRAPPERS)
        text    = wrapper.format(phrase=phrase.rstrip('.'))
    else:
        # Short phrase — slot into template
        template = random.choice(TEMPLATES.get(lang, TEMPLATES['en']))
        # Amplifier: aliases only (not descriptors), English only
        if is_alias and lang == 'en' and random.random() > 0.5:
            amp    = random.choice(SEVERITY_AMPLIFIERS[severity])
            phrase = f"{amp} {phrase}"
        text = template.format(alias=phrase)

    # Duration suffix for duration-sensitive symptoms
    if duration_sensitive and random.random() > 0.6:
        dur  = random.choice(DURATION_PHRASES).format(
            n=random.choice([2, 3, 6, 12, 24, 36]),
            age=random.choice([13, 14, 15, 16, 17, 18, 19, 20])
        )
        text = text.rstrip('.') + f', {dur}.'

    return text


def generate_records(symptoms: list, alias_map: dict, n_per_combo: int = 8) -> list[dict]:
    records    = []
    severities = ['mild', 'moderate', 'severe', 'critical']

    for symptom in symptoms:
        sid                = symptom['symptom_id']
        base_weight        = symptom['base_weight']
        duration_sensitive = symptom.get('duration_sensitive', False)

        # Build per-language alias pools
        aliases_by_lang = {}
        for lang, aliases in alias_map.get(sid, {}).items():
            aliases_by_lang[lang] = list(aliases)

        # Merge plain_language_aliases into English pool
        for alias in symptom.get('plain_language_aliases', []):
            aliases_by_lang.setdefault('en', [])
            if alias not in aliases_by_lang['en']:
                aliases_by_lang['en'].append(alias)

        for severity in severities:
            sev_data         = symptom.get('severity_levels', {}).get(severity, {})
            user_descriptors = sev_data.get('user_descriptors', [])
            esi_label        = derive_esi_label(base_weight, severity)

            for lang, aliases in aliases_by_lang.items():
                alias_pool = list(aliases)
                # Descriptors: English only, always short fragments
                desc_pool  = user_descriptors if lang == 'en' else []

                if not alias_pool:
                    continue

                generated = 0
                attempts  = 0
                used      = set()

                while generated < n_per_combo and attempts < n_per_combo * 5:
                    attempts += 1

                    # 65% alias, 35% descriptor (English only)
                    use_descriptor = bool(desc_pool) and random.random() > 0.65
                    if use_descriptor:
                        phrase   = random.choice(desc_pool)
                        is_alias = False
                    else:
                        phrase   = random.choice(alias_pool)
                        is_alias = True

                    text = make_sentence(phrase, lang, severity, is_alias, duration_sensitive)

                    if text in used:
                        continue
                    used.add(text)

                    records.append({
                        'text':         text,
                        'symptom_id':   sid,
                        'symptom_name': symptom['symptom_name'],
                        'severity':     severity,
                        'esi_label':    esi_label,
                        'language':     lang,
                        'source':       'synthetic',
                        'base_weight':  base_weight,
                    })
                    generated += 1

    return records


def run(data_dir: str = '.', output: str = 'synthetic_training_data.csv', n_per_combo: int = 8):
    data_dir = Path(data_dir)
    print('Loading data files...')
    symptoms, alias_map = load_data(data_dir)
    total_aliases = sum(len(v) for langs in alias_map.values() for v in langs.values())
    print(f'  {len(symptoms)} symptoms | {total_aliases} aliases')

    print('Generating records...')
    records = generate_records(symptoms, alias_map, n_per_combo=n_per_combo)
    random.shuffle(records)

    out = Path(output)
    fieldnames = ['text', 'symptom_id', 'symptom_name', 'severity',
                  'esi_label', 'language', 'source', 'base_weight']
    with open(out, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    lang_counts = Counter(r['language']  for r in records)
    esi_counts  = Counter(r['esi_label'] for r in records)
    sev_counts  = Counter(r['severity']  for r in records)

    print(f'\n✅ Generated {len(records)} records → {out}')
    print(f'By language  : {dict(lang_counts)}')
    print(f'By ESI label : {dict(esi_counts)}')
    print(f'By severity  : {dict(sev_counts)}')
    print(f'\nSample records:')
    for r in random.sample(records, min(10, len(records))):
        print(f"  [{r['language']:5} | {r['severity']:8} | {r['esi_label']:8}] {r['text']}")

    return records


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_dir', type=str, default='.')
    parser.add_argument('--output',   type=str, default='synthetic_training_data.csv')
    parser.add_argument('--n',        type=int, default=8)
    args = parser.parse_args()
    run(data_dir=args.data_dir, output=args.output, n_per_combo=args.n)