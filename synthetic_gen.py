"""
<<<<<<< HEAD
EndoScan AI — Synthetic Training Data Generator v6
====================================================
Generates labelled symptom sentences for NER fine-tuning.

Changes from v5:
  - English and Kenyan English only (Swahili deferred to Week 2)
  - Larger template pool for more sentence diversity
  - Duration phrases expanded
  - Severity amplifiers expanded
  - n_per_combo default raised to 50 → ~20,000 records
  - Output includes all columns needed by bio_tag_record_v3

Usage:
  python synthetic_data_generator_v6.py --n 100 --output synthetic_large.csv
=======
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
>>>>>>> origin/main
"""

import json
import csv
import random
import argparse
from pathlib import Path
from collections import Counter

random.seed(42)

<<<<<<< HEAD
# ── Templates ────────────────────────────────────────────────────────────────
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
        "My life is affected by {alias}.",
        "I went to see the doctor about {alias}.",
        "I need help with {alias}.",
        "I have been suffering from {alias}.",
        "Every month I deal with {alias}.",
        "I told my doctor I have {alias}.",
        "I have been experiencing {alias} for some time.",
        "The main thing bothering me is {alias}.",
        "I cannot ignore {alias} anymore.",
        "I have lived with {alias} for years.",
        "I was told my symptoms could be {alias}.",
        "My biggest concern is {alias}.",
        "Recently I have been having {alias}.",
        "I woke up with {alias} again today.",
        "I have reported {alias} to my doctor.",
        "Things have been hard because of {alias}.",
        "I am here about {alias}.",
        "I have noticed {alias} getting worse.",
        "I feel like {alias} is ruining my life.",
        "I cannot cope with {alias} anymore.",
=======
    ],
    'sw': [
        "Nina {alias}.",
        "Nimekuwa na {alias} kwa muda mrefu.",
        "Tatizo langu kuu ni {alias}.",
        "Nilikuja hospitalini kwa sababu ya {alias}.",
        "Nimekuwa nikilalamika kuhusu {alias}.",
        "Sijui nifanye nini kuhusu {alias}.",
>>>>>>> origin/main
    ],
    'en-KE': [
        "I have {alias} and it is really affecting me.",
        "Since I was young I have had {alias}.",
        "Every month I suffer from {alias}.",
        "I have come to see the doctor because of {alias}.",
        "I need help with {alias}.",
<<<<<<< HEAD
        "This {alias} is giving me problems.",
        "I have been having {alias} for a long time now.",
        "Doctor please help me with {alias}.",
        "I am not okay because of {alias}.",
        "My body is not right because of {alias}.",
        "I have tried many things but {alias} is still there.",
        "Even at work {alias} is bothering me.",
        "I came all the way here because of {alias}.",
        "This {alias} started when I was in secondary school.",
        "My friend told me to see a doctor about {alias}.",
    ],
}

# Wrappers for long phrases (> 4 words) — phrase used as-is
LONG_PHRASE_WRAPPERS = {
    'en': [
        "{phrase}.",
        "I told the doctor that {phrase}.",
        "My experience is that {phrase}.",
        "The problem I have is that {phrase}.",
        "I am here because {phrase}.",
        "I want you to know that {phrase}.",
        "Something I have noticed is that {phrase}.",
        "I have been dealing with the fact that {phrase}.",
        "It has been hard because {phrase}.",
        "I need help because {phrase}.",
        "I cannot carry on because {phrase}.",
        "My daily life is affected because {phrase}.",
        "I finally came to the clinic because {phrase}.",
        "I have been ignoring it but {phrase}.",
        "My family is worried because {phrase}.",
    ],
    'en-KE': [
        "{phrase}.",
        "I told the doctor that {phrase}.",
        "My experience is that {phrase}.",
        "The problem I have is that {phrase}.",
        "I am here because {phrase}.",
        "I want you to know that {phrase}.",
        "It is hard for me because {phrase}.",
        "Every month {phrase}.",
        "I have been struggling because {phrase}.",
        "Please help me because {phrase}.",
    ],
}

# ── Duration phrases ─────────────────────────────────────────────────────────
=======
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

>>>>>>> origin/main
DURATION_PHRASES = [
    "for about {n} months",
    "for the past {n} months",
    "for {n} months now",
    "for over {n} months",
    "for {n} years",
<<<<<<< HEAD
    "for over {n} years",
    "since I was {age} years old",
    "for as long as I can remember",
    "since my first period",
    "since I was a teenager",
    "since secondary school",
    "for about {n} weeks now",
    "every month for the past {n} years",
    "on and off for {n} years",
]

# ── Severity amplifiers ───────────────────────────────────────────────────────
SEVERITY_AMPLIFIERS = {
    'mild': [
        'slight', 'mild', 'occasional', 'some', 'a little',
        'minor', 'light', 'manageable', 'low-level',
    ],
    'moderate': [
        'moderate', 'significant', 'noticeable', 'regular',
        'persistent', 'recurring', 'considerable', 'fairly bad',
    ],
    'severe': [
        'severe', 'very bad', 'serious', 'intense', 'bad',
        'terrible', 'awful', 'really bad', 'debilitating',
        'crippling', 'overwhelming',
    ],
    'critical': [
        'unbearable', 'excruciating', 'extreme', 'the worst',
        'impossible to live with', 'absolutely terrible',
        'I cannot describe how bad', 'completely debilitating',
    ],
}

# ── Full alias pool — all 38 symptoms, English only ──────────────────────────
# Built from symptom_aliases.json + all expansion rounds from the notebook
ALIAS_POOL = {
    'S001': [  # dysmenorrhoea
        'painful periods', 'period pain', 'pain during my period',
        'cramps during period', 'period cramps', 'menstrual cramps',
        'painful menstruation', 'dysmenorrhoea', 'dysmenorrhea',
        'pain every month', 'monthly pain', 'severe period pain',
        'endometriosis', 'pain since teenager', 'pain since adolescence',
        'unbearable period pain', 'excruciating period pain',
        'pain so bad i cannot move', 'period pain that stops me working',
        'pain that started with my first period',
    ],
    'S002': [  # chronic pelvic pain
        'chronic pelvic pain', 'pelvic pain', 'constant pelvic pain',
        'pain in my pelvis', 'lower pelvic pain', 'deep pelvic pain',
        'pelvic ache', 'pain in lower abdomen', 'pain below belly button',
        'pain in the pelvic area', 'ongoing pelvic pain',
        'pelvic pain that never goes away', 'pain in my lower belly',
        'pain deep inside', 'night pain', 'pain at night',
        'pain that wakes me up', 'pain worse at night',
    ],
    'S003': [  # premenstrual pain
        'pain before period', 'premenstrual pain', 'pain before my period starts',
        'pain a week before period', 'pain leading up to period',
        'pain in the days before my period',
    ],
    'S004': [  # intermenstrual bleeding
        'bleeding between periods', 'spotting between periods',
        'blood when not on period', 'irregular bleeding',
        'bleeding mid cycle', 'unexpected bleeding',
        'bleeding outside of period', 'blood between periods',
    ],
    'S005': [  # heavy menstrual bleeding
        'heavy periods', 'heavy bleeding', 'heavy menstrual bleeding',
        'flooding during period', 'soaking pads', 'soaking through pads',
        'going through pads quickly', 'emergency pad changes',
        'changing pad every 30 minutes', 'pad changes every hour',
        'bleeding through clothes', 'hemorrhaging during period',
        'cannot keep up with bleeding', 'menorrhagia',
        'extremely heavy period', 'losing a lot of blood during period',
    ],
    'S006': [  # dyspareunia deep
        'pain during sex', 'sex is painful', 'painful sex',
        'pain during intercourse', 'sex hurts', 'sex has become impossible',
        'cannot have sex', 'dyspareunia', 'pain deep during sex',
        'pain inside during sex', 'pain after sex',
        'sex causes me pain', 'intercourse is painful',
        'pain when having sex', 'sex is too painful',
    ],
    'S007': [  # dyspareunia superficial
        'pain at the entrance during sex', 'pain at entrance',
        'superficial pain during sex', 'burning during sex',
        'pain on the outside during sex',
    ],
    'S008': [  # post coital bleeding
        'bleeding after sex', 'bleed after sex',
        'slight bleeding after sex', 'spotting after sex',
        'blood after sex', 'bleed during sex',
        'bleeding during intercourse', 'sometimes bleed after sex',
        'bleed a little after sex', 'light bleeding after sex',
        'occasional bleeding after sex', 'notice blood after sex',
    ],
    'S009': [  # dyschezia
        'pain when going to the toilet', 'pain passing stool',
        'pain when passing stool', 'bowel movements painful',
        'pain using the toilet', 'pain opening bowels',
        'pain when having a bowel movement', 'dyschezia',
        'painful bowel movements', 'it hurts to go to the toilet',
    ],
    'S010': [  # rectal bleeding
        'rectal bleeding', 'blood in stool', 'bleeding from rectum',
        'blood when going to toilet', 'bleeding when opening bowels',
        'blood in my stool during period', 'rectal blood',
    ],
    'S011': [  # constipation cyclical
        'constipation during period', 'hard to pass stool',
        'cannot pass stool', 'straining to pass stool',
        'difficult to pass stool', 'cannot pass anything',
        'blocked during period', 'constipated during period',
        'bowels stop working during period',
    ],
    'S012': [  # diarrhoea cyclical
        'diarrhoea during period', 'diarrhea during period',
        'loose stools during period', 'bowels go crazy during period',
        'runny stomach during period', 'stomach goes loose during period',
        'urgent bowel movements during period',
    ],
    'S013': [  # nausea vomiting cyclical
        'nausea during period', 'vomiting during period',
        'period makes me vomit', 'feel sick during period',
        'nauseous during period', 'sick during period',
        'throwing up with period', 'nausea with period',
        'feel feverish during period', 'feverish with period',
        'hot during period', 'chills during period',
        'fever during period', 'vomit from the pain',
    ],
    'S014': [  # bloating abdominal
        'bloating', 'abdominal bloating', 'stomach swells',
        'endo belly', 'abdomen swells', 'swollen abdomen',
        'swollen stomach during period', 'belly swells during period',
        'my stomach blows up', 'look pregnant from bloating',
        'distended abdomen', 'uncomfortable fullness in stomach',
        'fatigue', 'exhaustion', 'exhausted', 'no energy',
        'completely drained', 'too tired to function',
        'bed from exhaustion', 'cannot get out of bed',
        'in bed from exhaustion', 'hot and sweaty during period',
        'sweating during period', 'night sweats during period',
    ],
    'S015': [  # dysuria
        'hurts to urinate', 'pain when urinating',
        'burning when urinating', 'painful urination',
        'pain urinating', 'burning when peeing',
        'pain when peeing', 'dysuria',
        'it hurts to pee',
    ],
    'S016': [  # haematuria
        'blood in urine', 'peeing blood', 'haematuria',
        'hematuria', 'bloody urine', 'blood in my urine',
        'urine has blood', 'red urine',
        'pink urine', 'blood when i pee',
    ],
    'S017': [  # urinary frequency
        'need to pee all the time', 'going to toilet constantly',
        'urinating constantly', 'frequent urination',
        'toilet constantly', 'urgent need to urinate',
        'bladder pressure', 'cannot hold urine',
        'rushing to toilet', 'cannot make it to toilet in time',
        'need to pee constantly', 'always need to pee',
        'peeing all the time', 'urge to urinate',
        'urgency to urinate', 'waking up to pee at night',
    ],
    'S018': [  # lower back pain
        'lower back pain', 'back pain during period',
        'back pain with period', 'pain in lower back',
        'aching lower back', 'lower back ache',
        'back pain every month', 'back hurts during period',
        'lower back pain before period',
    ],
    'S019': [  # leg pain sciatica
        'leg pain during period', 'shooting pain down leg',
        'pain down my leg', 'legs feel heavy',
        'sciatica', 'sciatic pain', 'pain radiating down leg',
        'leg ache during period', 'heavy legs during period',
        'pain from pelvis down leg', 'thigh pain during period',
        'cannot walk from leg pain',
    ],
    'S020': [  # shoulder tip pain
        'shoulder tip pain', 'pain in shoulder tip',
        'shoulder tip', 'pain in my shoulder tip',
        'shoulder pain during period', 'referred shoulder pain',
        'pain in right shoulder during period',
    ],
    'S021': [  # hip groin pain
        'hip pain during period', 'groin pain during period',
        'cannot walk from hip pain', 'pain in hips',
        'hips ache during period', 'hip pain with period',
        'groin ache', 'pain in the groin area',
        'hip and groin pain',
    ],
    'S022': [  # fatigue chronic
        'chronic fatigue', 'always tired', 'constantly tired',
        'fatigue that never goes away', 'bone tired',
        'tired all the time', 'exhausted every day',
        'cannot recover my energy', 'extreme tiredness',
        'bedridden from fatigue', 'too tired to do anything',
    ],
    'S023': [  # anaemia
        'anaemia', 'anemia', 'low haemoglobin',
        'low hemoglobin', 'haemoglobin low',
        'low blood count', 'iron deficiency',
        'low iron', 'iron deficiency anaemia',
        'I was told I am anaemic', 'my blood count is low',
    ],
    'S024': [  # fever cyclical
        'fever during period', 'hot and sweaty during period',
        'sweating during period', 'temperature during period',
        'feel feverish with period', 'cyclical fever',
        'fever that comes with period', 'feel hot during period',
    ],
    'S025': [  # fainting syncope
        'fainting', 'faint during period', 'passed out from pain',
        'cannot function', 'cannot leave the house',
        'housebound', 'cannot walk from pain',
        'fainting during period', 'dizzy during period',
        'fainted from pain', 'black out from pain',
        'cannot function during my period',
        'the pain makes me faint',
        'I have fainted from the pain',
        'pain so bad I passed out',
    ],
    'S026': [  # infertility
        'infertility', 'cannot get pregnant',
        'trying to conceive', 'fertility problems',
        'I cannot get pregnant', 'trouble getting pregnant',
        'struggling to conceive', 'subfertility',
        'been trying for a baby', 'not able to conceive',
        'two years of trying to get pregnant',
        'fertility issues', 'reproductive problems',
    ],
    'S027': [  # irregular periods
        'irregular periods', 'unpredictable periods',
        'periods unpredictable', 'erratic periods',
        'periods all over the place', 'never know when period comes',
        'period comes randomly', 'my cycle is irregular',
        'no pattern to my period', 'missed periods',
        'period comes early or late',
    ],
    'S028': [  # pelvic mass sensation
        'pelvic mass', 'feeling of fullness in pelvis',
        'pelvic fullness', 'pelvic pressure',
        'heaviness in pelvis', 'pelvic heaviness',
        'pressure in lower abdomen', 'heavy feeling in pelvis',
        'feeling something in my pelvis',
        'lump feeling in pelvis', 'mass in pelvis',
    ],
    'S029': [  # depression
        'depression', 'feeling depressed',
        'I have depression', 'dealing with depression',
        'on medication for depression', 'low mood',
        'feel hopeless', 'feeling hopeless about pain',
        'pain affects my mental health',
        'I feel like giving up', 'mentally exhausted from pain',
        'the pain is making me depressed',
    ],
    'S030': [  # anxiety
        'anxiety', 'constant worry', 'health anxiety',
        'noticeable worry', 'anxious about pain',
        'worried about my health', 'anxiety from pain',
        'I have anxiety', 'panic about the pain',
        'fear about what is wrong with me',
        'the uncertainty is making me anxious',
    ],
    'S031': [  # sleep disturbance
        'sleep problems', 'cannot sleep from pain',
        'pain wakes me at night', 'night pain',
        'insomnia from pain', 'waking up in pain',
        'disturbed sleep', 'pain keeps me awake',
        'cannot get a good night sleep',
        'pain interrupts my sleep', 'sleep disturbance',
        'lying awake because of pain',
    ],
    'S032': [  # catamenial pneumothorax
        'catamenial pneumothorax', 'chest pain during period',
        'shoulder tip pain with period',
        'pain in shoulder tip', 'pain in right shoulder',
        'breathing pain during period',
        'chest tightness with period',
    ],
    'S033': [  # catamenial haemoptysis
        'catamenial haemoptysis', 'coughing blood with period',
        'blood when coughing during period',
        'coughing up blood at period time',
    ],
    'S034': [  # umbilical pain bleeding
        'belly button pain during period',
        'swelling at belly button', 'painful lump at belly button',
        'lump at belly button', 'belly button bleeds',
        'belly button swells during period',
        'navel pain during period', 'pain at belly button',
        'umbilical pain', 'my belly button hurts during period',
        'bleeding from belly button',
    ],
    'S035': [  # scar endometriosis
        'scar pain during period', 'scar swells during period',
        'cyclical scar pain', 'scar hurts during period',
        'scar pain every month', 'scar aches with period',
        'cesarean scar pain', 'c-section scar pain',
        'scar tissue pain', 'adhesion pain',
        'scar painful cyclically',
        'my surgery scar hurts during period',
    ],
    'S036': [  # work school absence
        'cannot work', 'missing work', 'dropped out of school',
        'cannot attend school', 'work school absence',
        'missing work due to pain', 'cannot attend school from pain',
        'school affected by pain', 'cannot study from pain',
        'dropped out of school from pain', 'missing school from pain',
        'cannot go to work', 'called in sick from period pain',
        'lost my job because of pain', 'cannot keep a job',
        'my grades are suffering because of pain',
    ],
    'S037': [  # relationship social impact
        'pain affects my relationship', 'relationship affected by pain',
        'relationship social impact', 'my relationship suffers',
        'partner affected by my pain', 'cannot be with my partner',
        'intimacy affected', 'sex life affected',
        'cannot be intimate', 'relationship is suffering',
        'my partner does not understand my pain',
        'social life is gone because of pain',
        'I have lost friends because of the pain',
        'cannot socialise because of pain',
    ],
    'S038': [  # previous misdiagnosis
        'no one believed me', 'dismissed by doctors',
        'told it was normal', 'years with no diagnosis',
        'previous misdiagnosis', 'misdiagnosed',
        'not believed by doctors', 'suffering for years',
        'told it was just period pain',
        'doctors said nothing was wrong',
        'I have been told it is all in my head',
        'been to many doctors with no answer',
        'no diagnosis for years',
        'I was told it was IBS',
        'wrongly diagnosed',
    ],
=======
    "since I was {age} years old",
]

SEVERITY_AMPLIFIERS = {
    'mild':     ['slight', 'mild', 'occasional', 'some'],
    'moderate': ['moderate', 'significant', 'noticeable', 'regular'],
    'severe':   ['severe', 'very bad', 'serious', 'intense'],
    'critical': ['unbearable', 'excruciating', 'extreme'],
>>>>>>> origin/main
}


def derive_esi_label(base_weight: int, severity: str) -> str:
    modifiers = {'mild': 1.0, 'moderate': 1.5, 'severe': 2.0, 'critical': 3.0}
    score = base_weight * modifiers.get(severity, 1.0)
<<<<<<< HEAD
    if score >= 25:    return 'Critical'
    elif score >= 15:  return 'High'
    elif score >= 8:   return 'Moderate'
    return 'Low'


def load_symptom_weights(data_dir: Path) -> dict:
    """Load base_weight per symptom_id from symptoms.json."""
    with open(data_dir / 'symptoms.json', encoding='utf-8') as f:
        raw = json.load(f)
    weights = {}
    names   = {}
    for cat in raw['symptom_categories'].values():
        for s in cat['symptoms']:
            weights[s['symptom_id']] = s['base_weight']
            names[s['symptom_id']]   = s['symptom_name']
    return weights, names


def make_sentence(alias: str, lang: str, severity: str,
                  duration_sensitive: bool) -> str:
    words = alias.split()

    if len(words) > 4:
        wrappers = LONG_PHRASE_WRAPPERS.get(lang, LONG_PHRASE_WRAPPERS['en'])
        wrapper  = random.choice(wrappers)
        text     = wrapper.format(phrase=alias.rstrip('.'))
    else:
        template = random.choice(TEMPLATES.get(lang, TEMPLATES['en']))
        if lang == 'en' and random.random() > 0.5:
            amp   = random.choice(SEVERITY_AMPLIFIERS[severity])
            alias = f"{amp} {alias}"
        text = template.format(alias=alias)

    if duration_sensitive and random.random() > 0.5:
        dur  = random.choice(DURATION_PHRASES).format(
            n   = random.choice([2, 3, 6, 12, 24, 36]),
            age = random.choice([13, 14, 15, 16, 17, 18, 19, 20])
=======
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
>>>>>>> origin/main
        )
        text = text.rstrip('.') + f', {dur}.'

    return text


<<<<<<< HEAD
def generate_records(
    alias_pool:          dict,
    weights:             dict,
    names:               dict,
    n_per_combo:         int = 50,
    duration_sensitive:  set = None,
) -> list:

    if duration_sensitive is None:
        duration_sensitive = {
            'S001', 'S002', 'S003', 'S006', 'S022',
            'S026', 'S029', 'S030', 'S031', 'S036',
        }

    records    = []
    severities = ['mild', 'moderate', 'severe', 'critical']
    languages  = ['en', 'en-KE']

    for sym_id, aliases in alias_pool.items():
        base_weight = weights.get(sym_id, 5)
        sym_name    = names.get(sym_id, sym_id)
        dur_sens    = sym_id in duration_sensitive

        for severity in severities:
            esi_label = derive_esi_label(base_weight, severity)

            for lang in languages:
=======
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

>>>>>>> origin/main
                generated = 0
                attempts  = 0
                used      = set()

<<<<<<< HEAD
                while generated < n_per_combo and attempts < n_per_combo * 10:
                    attempts += 1
                    alias = random.choice(aliases)
                    text  = make_sentence(alias, lang, severity, dur_sens)
=======
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
>>>>>>> origin/main

                    if text in used:
                        continue
                    used.add(text)

                    records.append({
                        'text':         text,
<<<<<<< HEAD
                        'symptom_id':   sym_id,
                        'symptom_name': sym_name,
=======
                        'symptom_id':   sid,
                        'symptom_name': symptom['symptom_name'],
>>>>>>> origin/main
                        'severity':     severity,
                        'esi_label':    esi_label,
                        'language':     lang,
                        'source':       'synthetic',
                        'base_weight':  base_weight,
                    })
                    generated += 1

    return records


<<<<<<< HEAD
def run(data_dir: str = '.', output: str = 'synthetic_large.csv',
        n_per_combo: int = 50):

    data_dir = Path(data_dir)
    print(f"Loading symptom weights from {data_dir / 'symptoms.json'}...")
    weights, names = load_symptom_weights(data_dir)
    print(f"  {len(weights)} symptoms loaded\n")

    print(f"Generating records (n_per_combo={n_per_combo})...")
    print(f"  38 symptoms × 4 severities × 2 languages × {n_per_combo}"
          f" = up to {38 * 4 * 2 * n_per_combo:,} records\n")

    records = generate_records(
        alias_pool=ALIAS_POOL,
        weights=weights,
        names=names,
        n_per_combo=n_per_combo,
    )
=======
def run(data_dir: str = '.', output: str = 'synthetic_training_data.csv', n_per_combo: int = 8):
    data_dir = Path(data_dir)
    print('Loading data files...')
    symptoms, alias_map = load_data(data_dir)
    total_aliases = sum(len(v) for langs in alias_map.values() for v in langs.values())
    print(f'  {len(symptoms)} symptoms | {total_aliases} aliases')

    print('Generating records...')
    records = generate_records(symptoms, alias_map, n_per_combo=n_per_combo)
>>>>>>> origin/main
    random.shuffle(records)

    out = Path(output)
    fieldnames = ['text', 'symptom_id', 'symptom_name', 'severity',
                  'esi_label', 'language', 'source', 'base_weight']
<<<<<<< HEAD

=======
>>>>>>> origin/main
    with open(out, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    lang_counts = Counter(r['language']  for r in records)
    esi_counts  = Counter(r['esi_label'] for r in records)
    sev_counts  = Counter(r['severity']  for r in records)
<<<<<<< HEAD
    sym_counts  = len(set(r['symptom_id'] for r in records))

    print(f"✅ Generated {len(records):,} records → {out}")
    print(f"   By language  : {dict(lang_counts)}")
    print(f"   By ESI label : {dict(esi_counts)}")
    print(f"   By severity  : {dict(sev_counts)}")
    print(f"   Symptoms covered : {sym_counts}/38")
    print()
    print("Sample records:")
    for r in random.sample(records, min(8, len(records))):
        print(f"  [{r['language']:5} | {r['severity']:8} | {r['esi_label']:8}] "
              f"{r['text'][:80]}")
=======

    print(f'\n✅ Generated {len(records)} records → {out}')
    print(f'By language  : {dict(lang_counts)}')
    print(f'By ESI label : {dict(esi_counts)}')
    print(f'By severity  : {dict(sev_counts)}')
    print(f'\nSample records:')
    for r in random.sample(records, min(10, len(records))):
        print(f"  [{r['language']:5} | {r['severity']:8} | {r['esi_label']:8}] {r['text']}")
>>>>>>> origin/main

    return records


if __name__ == '__main__':
<<<<<<< HEAD
    parser = argparse.ArgumentParser(
        description='EndoScan synthetic data generator v6'
    )
    parser.add_argument('--data_dir', type=str,  default='.',
                        help='Directory containing symptoms.json')
    parser.add_argument('--output',   type=str,
                        default='synthetic_large.csv',
                        help='Output CSV filename')
    parser.add_argument('--n',        type=int,  default=50,
                        help='Records per symptom/severity/language combination')
=======
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_dir', type=str, default='.')
    parser.add_argument('--output',   type=str, default='synthetic_training_data.csv')
    parser.add_argument('--n',        type=int, default=8)
>>>>>>> origin/main
    args = parser.parse_args()
    run(data_dir=args.data_dir, output=args.output, n_per_combo=args.n)