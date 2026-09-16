# Endometriosis Structured Data — Cleaning & Exploratory Analysis

This notebook (`endo_data_clean.ipynb`) documents the data cleaning and initial exploratory data analysis (EDA) of the structured questionnaire pathway for the endometriosis diagnosis project. It takes the raw patient-level CSV export and produces a clean, analysis-ready dataset (`endo_data_cleaned.csv`).

## 1. Input & Output

| | File | Description |
|---|---|---|
| **Input** | `endo_data.csv.xls` | Raw structured questionnaire export, ~480,080 rows |
| **Output** | `endo_data_cleaned.csv` | Cleaned dataset, 85,000 rows, 14 columns |

## 2. Dataset Schema

The dataset contains one row per patient record, with the following columns:

| Column | Type | Description |
|---|---|---|
| `Age` | numeric | Patient age (years) |
| `BMI` | numeric | Body Mass Index |
| `Cycle_Length` | numeric | Menstrual cycle length (days) |
| `Age_of_Menarche` | numeric | Age at first menstruation (years) |
| `Dysmenorrhea_Score` | numeric (0–10) | Menstrual pain severity |
| `Pelvic_Pain_Score` | numeric (0–10) | Pelvic pain severity |
| `Dyspareunia_Score` | numeric (0–10) | Pain during intercourse severity |
| `Dyschezia_Score` | numeric (0–10) | Painful bowel movement severity |
| `Urinary_Symptoms_Score` | numeric (0–10) | Urinary symptom severity |
| `Family_History` | boolean | Family history of endometriosis |
| `Infertility_Status` | boolean | Infertility diagnosis present |
| `CA_125_Level` | numeric | CA-125 biomarker blood level |
| `CRP_Level` | numeric | C-reactive protein (CRP) blood level |
| `Mental_Health_Score` | numeric (0–10) | Self-reported mental health score |
| `Endometriosis_Stage` | boolean | Target label — endometriosis diagnosis (true/false) |

## 3. Cleaning Pipeline

The notebook applies the following steps, in order:

### Step 1 — Import libraries
Loads `pandas`, `numpy`, `matplotlib`, and `seaborn` for data handling and visualization.

### Step 2 — Load the raw data
Reads `endo_data.csv.xls` into a DataFrame. At this stage all columns except `Age` are loaded as text/object type, because the source file mixes numeric values with repeated header rows and inconsistent boolean formatting.

### Step 3 — Remove repeated header rows
The raw export contains the header row duplicated inline as data (rows where `Age_of_Menarche` literally equals the string `"Age_of_Menarche"`). These are filtered out.

### Step 4 — Remove the junk row
Drops a single fully-blank trailing row (row index 480079) that carried a stray, non-numeric character only in the `Age` field, with every other column null. Row count after this step: 480,079.

### Step 5 — Convert text to numbers
Coerces all numeric columns to proper numeric dtypes using `pd.to_numeric(..., errors='coerce')`, converting anything unparseable to `NaN`. This addresses source-data columns that stored numbers as text.

### Step 6 — Standardize boolean columns
*(Documented in a markdown note rather than code.)* `Family_History`, `Infertility_Status`, and `Endometriosis_Stage` mixed `'true'`/`'false'` string values with `'1'`/`'0'` numeric-style values in the raw export; these are standardized into clean Python booleans.

### Step 7 — Remove duplicate rows
Drops exact duplicate rows. This step alone removes **395,000 duplicate rows**, taking the dataset from 480,000 rows down to **85,000 unique rows** — indicating the raw export contained a very high proportion (~82%) of duplicate records.

### Step 8 — Handle missing values
Checks per-column null counts. All columns are fully populated except `CA_125_Level` and `CRP_Level`, each missing 5,000 values (~5.9% of the 85,000-row dataset at that point). Rows missing either biomarker are dropped via `dropna(subset=['CA_125_Level', 'CRP_Level'])`.

### Step 9 — Summary statistics
Computes min/max/mean for all numeric columns as a sanity check on ranges (see Section 4).

### Step 10 — Compare averages by diagnosis group
Groups the cleaned data by `Endometriosis_Stage` and compares mean feature values between diagnosed and non-diagnosed patients (see Section 5).

### Step 11 — Correlation with diagnosis
Encodes `Endometriosis_Stage` as a binary integer target and computes each numeric feature's correlation with it (see Section 5).

### Step 12 — Categorical columns vs. diagnosis
Cross-tabulates `Family_History` and `Infertility_Status` against `Endometriosis_Stage`, normalized by row, to check for association (see Section 5).

### Step 13 — Visualization
Produces a 2×2 figure:
- **Top-left:** count plot of diagnosis distribution (positive vs. negative)
- **Top-right:** box plot of CA-125 levels split by diagnosis status
- **Bottom-left:** bar chart of average symptom severity scores across the five symptom domains
- **Bottom-right:** correlation heatmap across all numeric features

### Step 14 — Save cleaned data
Writes the final cleaned DataFrame to `endo_data_cleaned.csv`.

## 4. Summary Statistics (post-cleaning, n = 85,000 before biomarker drop)

| Feature | Min | Max | Mean |
|---|---|---|---|
| Age | 12.0 | 60.0 | 35.99 |
| BMI | 10.0 | 60.0 | 34.98 |
| Cycle_Length | 15.0 | 60.0 | 37.49 |
| Age_of_Menarche | 8.0 | 20.0 | 13.98 |
| Dysmenorrhea_Score | 0.0 | 10.0 | 5.00 |
| Pelvic_Pain_Score | 0.0 | 10.0 | 5.00 |
| Dyspareunia_Score | 0.0 | 10.0 | 5.00 |
| Dyschezia_Score | 0.0 | 10.0 | 4.99 |
| Urinary_Symptoms_Score | 0.0 | 10.0 | 5.01 |
| CA_125_Level | 0.038 | 1999.98 | 1000.58 |
| CRP_Level | 0.006 | 299.995 | 150.11 |
| Mental_Health_Score | 0.0 | 10.0 | 5.02 |

All feature ranges fall within clinically plausible bounds, with no negative values or obvious outliers surviving the cleaning steps.

## 5. Key Exploratory Findings

**No feature shows a meaningful association with the diagnosis label.** Across every check performed in the notebook:

- **Group means by diagnosis status** are nearly identical between `true` and `false` cases for every numeric feature (e.g., mean Age 35.95 vs. 36.02; mean CA-125 1000.71 vs. 1000.46).
- **Correlation with diagnosis** is negligible for all features — the strongest correlation is `Urinary_Symptoms_Score` at only **0.006**, with the rest even weaker (several near-zero or slightly negative).
- **Categorical associations** are similarly flat: `Family_History` and `Infertility_Status` each split roughly 50/50 between positive and negative diagnosis, regardless of category.

**Interpretation:** in this structured questionnaire dataset, the symptom scores, biomarkers, and demographic fields do not linearly discriminate between diagnosed and non-diagnosed patients. This is consistent with the data appearing to be synthetically generated with features and the target label assigned independently (random near-uniform distributions and ~50/50 splits across the board), rather than reflecting a real clinical signal. This has direct implications for modeling: linear/statistical association tests on this pathway alone are unlikely to yield a strong classifier, and any predictive signal in the broader multimodal project (see below) may need to come from non-linear feature interactions, engineered features, or primarily from the other three data pathways (free-text, MRI, laparoscopy).

## 6. Project Context

This structured questionnaire dataset is one of four multimodal data pathways in the broader endometriosis diagnosis project, which follows the CRISP-DM framework and is currently in the Data Understanding phase. The other three pathways are: free-text symptom narratives, MRI scans (UT-EndoMRI), and laparoscopy images (GLENDA).

## 7. Reproducing This Notebook

Requirements: `pandas`, `numpy`, `matplotlib`, `seaborn`.

```bash
pip install pandas numpy matplotlib seaborn
```

Run all cells in order — later steps (duplicate removal, missing-value handling, numeric conversion) depend on the DataFrame produced by earlier steps.
