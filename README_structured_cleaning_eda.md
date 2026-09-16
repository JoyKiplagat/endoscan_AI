# EndoScan — Structured Symptom Data: CRISP-DM Phase 1 & 2

This notebook (`endo_structured_cleaning_eda.ipynb`) covers the first two phases of the EndoScan CRISP-DM pipeline for the structured questionnaire pathway: **Business Understanding** and **Data Understanding** (structural cleaning + EDA). Phases 3–6 (feature engineering, modelling, ESI calibration, deployment) are handled separately.

## 1. Project Context

EndoScan is a clinical decision-support tool for endometriosis triage. Two independent paths — free-text symptoms (NLP) and questionnaire answers (structured, this notebook) — each produce an **ESI Score** (1–100) and **ESI Tier**, which a downstream fusion layer combines into one unified result.

| Input | File | Size |
|---|---|---|
| Raw data | `endo_data_csv.xls` | 480,080 rows × 15 columns |

## 2. Phase 1 — Business Understanding

Documents the project contract before any data is touched:

- **Output format:** ESI Score (1–100) + ESI Tier + clinical action recommendation
- **ESI Tiers:**

  | Tier | Score Range | Action |
  |---|---|---|
  | Low | 1–25 | Minimal indicators — routine monitoring |
  | Moderate | 26–50 | Moderate indicators — follow up 4–6 weeks |
  | High | 51–75 | Strong indicators — specialist referral within 2 weeks |
  | Critical | 76–100 | Severe presentation — urgent specialist referral |

- **Success criteria (for the eventual model):** AUC ≥ 0.92, F1 ≥ 0.88
- **12 features in scope:** Age, BMI, Cycle_Length, Age_of_Menarche, 6 symptom severity scores (0–10), Family_History, Infertility_Status
- **2 features excluded:** `CA_125_Level` and `CRP_Level` — lab results missing in 83% of rows, not questionnaire inputs, so kept out of the feature contract for this path

## 3. Phase 2 — Data Understanding

### 3.1 Structural quality checks
The raw target column (`Endometriosis_Stage`) mixes three encodings in one field: `'true'/'false'`, `'0'/'1'`, and **79 embedded header rows** (the literal string `'Endometriosis_Stage'` appearing as a data value, repeated every ~6,000 rows). `Family_History` and `Infertility_Status` show the same true/false + 0/1 mixing.

| Segment | Rows |
|---|---|
| Int-encoded target (no lab columns) | 400,000 |
| Boolean-encoded target (with lab columns) | 80,000 |
| Embedded header / null rows | 80 |

### 3.2 Clean & standardize
- Dropped the 79 embedded header rows and any rows with a null target
- Unified the target into a single binary `target` column (0/1)
- Normalized `Family_History` and `Infertility_Status` to consistent 0/1
- Coerced all feature columns (plus the two excluded lab columns) to numeric

**Result:** 480,000 clean rows. Target distribution: 260,054 negative / 219,946 positive (**45.8% positive** — near-balanced).

### 3.3 Missing values
No missing values in any of the 12 working features after cleaning.

### 3.4 Outlier detection (IQR method)

| Feature | Range | IQR Outliers | % |
|---|---|---|---|
| Age | 12.0 – 60.0 | 0 | 0.00% |
| BMI | 10.0 – 60.0 | 22,527 | 4.69% |
| Cycle_Length | 15.0 – 60.0 | 27,843 | 5.80% |
| Age_of_Menarche | 8.0 – 20.0 | 12,302 | 2.56% |

All 6 symptom scores stay within their valid 0–10 range with zero out-of-range values. IQR outliers in the continuous features (e.g., age 12, BMI 10) are treated as clinically plausible edge cases rather than errors — **no rows removed**.

### 3.5 Skewness & kurtosis
BMI (skew 1.36) and Cycle_Length (skew 1.78) are notably right-skewed; every other feature is close to symmetric. Since the downstream model is tree-based (LightGBM), which is invariant to monotonic transforms, no log-transform is applied.

### 3.6 Feature–target correlation (point-biserial)
Every feature is statistically significant (p < 0.01) against the target, but effect sizes are small to moderate:

| Feature | \|r\| |
|---|---|
| Family_History | 0.2111 |
| Infertility_Status | 0.1688 |
| Dyschezia_Score | 0.1017 |
| Pelvic_Pain_Score | 0.0930 |
| Dyspareunia_Score | 0.0915 |
| Dysmenorrhea_Score | 0.0864 |
| Urinary_Symptoms_Score | 0.0529 |
| Cycle_Length | 0.0202 |
| BMI | 0.0218 |
| Mental_Health_Score | 0.0157 |
| Age | 0.0102 |
| Age_of_Menarche | 0.0043 |

History flags (family history, infertility) carry the strongest individual signal; symptom severity scores follow at a lower but still significant level.

### 3.7 EDA visualizations
Six plots are produced:
- **Target & provisional ESI tier distribution** — class balance and a provisional tier assignment derived from summed symptom scores
- **Symptom score distributions** — positive vs. negative, all 6 score columns
- **Continuous feature distributions** — positive vs. negative, all 4 continuous features
- **Correlation heatmap** — all features + target; inter-symptom correlations sit in a moderate 0.3–0.5 range, no multicollinearity concern
- **History flags** — positive-diagnosis rate by Family_History / Infertility_Status
- **Symptom scores by provisional ESI tier** — boxplots across Low/Moderate/High/Critical

## 4. EDA Summary & Decisions

| | |
|---|---|
| Clean dataset shape | 480,000 × 18 |
| Embedded header rows dropped | 79 |
| Target encoding | Unified from mixed 0/1 + true/false |
| Missing values (working features) | 0 |
| Outliers removed | 0 (all clinically valid) |
| Class balance | 45.8% positive |

**Decisions carried into Phase 3:**
- No oversampling (SMOTE) — the 54/46 split is acceptable as-is
- No feature scaling — LightGBM is scale-invariant
- Outliers retained — all values are clinically plausible

## 5. Reproducing This Notebook

Requirements: `pandas`, `numpy`, `matplotlib`, `seaborn`, `scipy`.

```bash
pip install pandas numpy matplotlib seaborn scipy
```

Place `endo_data.csv.xls` in the working directory and run all cells in order.
