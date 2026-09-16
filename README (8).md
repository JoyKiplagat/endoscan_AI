# MTSamples — Data Cleaning & EDA

This project cleans and explores the **MTSamples** dataset — a collection of medical transcription sample reports, each tagged with a medical specialty. It stops at a clean, well-understood dataset; **no modeling is included**.

## Files

| File | Description |
|---|---|
| `mtsamples.csv` | Raw input dataset (4,999 rows × 6 columns) |
| `MTSamples_Cleaning_EDA.ipynb` | Notebook: missing-value checks, cleaning steps, and exploratory analysis |
| `mtsamples_cleaned.csv` | Output of the notebook — the cleaned dataset, ready for downstream use |
| `README.md` | This file |

## Dataset columns

| Column | Description |
|---|---|
| `Unnamed: 0` | Row index carried over from the source CSV (dropped during cleaning — redundant) |
| `description` | Short one-line summary of the transcription |
| `medical_specialty` | Medical specialty/category the report belongs to (40 unique specialties) |
| `sample_name` | Title of the specific sample report |
| `transcription` | Full text of the medical transcription |
| `keywords` | Comma-separated keywords/tags for the report |

## How to run

1. Place `mtsamples.csv` in the same folder as the notebook.
2. Open `MTSamples_Cleaning_EDA.ipynb` and run all cells in order.
3. The notebook writes `mtsamples_cleaned.csv` to the same folder when it finishes.

Requires: `pandas`, `numpy`, `matplotlib`, `seaborn`.

## What the notebook does

### 1. Missing values check
- True `NaN`s: `transcription` (~33 rows), `keywords` (~1,068 rows, ~21%)
- Blank/whitespace-only strings (missed by `isnull()`): a few in `description` and `keywords`
- `medical_specialty` values had leading whitespace on every entry (e.g. `" Allergy / Immunology"`) — not a missing-value issue, but it silently fragments categories if left uncleaned

### 2. Duplicate check
- No fully duplicated rows
- Some repeated `sample_name` values (e.g. multiple "Lumbar Discogram" reports) — expected, since each has distinct transcription text

### 3. Cleaning steps (in order)
1. Drop the redundant `Unnamed: 0` column
2. Strip leading/trailing whitespace from all text columns
3. Convert blank/whitespace-only strings to proper `NaN`
4. Drop exact duplicate rows
5. Reset the index

### 4. Exploratory analysis
- Specialty distribution — heavily imbalanced; `Surgery` (1,103 reports) and `Consult - History and Phy.` (516) dominate, several specialties have fewer than 10 reports
- Text length distributions for `description` (short, ~1 sentence) and `transcription` (long-form, right-skewed)
- Transcription length by specialty (top 10 by volume)
- Missing-keyword rate by specialty
- Top 20 most frequent keywords

## Not covered (by design)

Text preprocessing (tokenization, stopword removal, lemmatization) and any model training (e.g. specialty classification, NER) are left for a separate modeling notebook, built on top of `mtsamples_cleaned.csv`.
