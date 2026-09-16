# Forum Data — Cleaning & EDA

This cleans and explores `forum_data.csv` — text scraped from two endometriosis-related web sources: the **endometriosis.org** news/forum pages and the **HealthUnlocked** endometriosis community forum. **No modeling is included** — the notebook stops at a clean, well-understood dataset.

## Files

| File | Description |
|---|---|
| `forum_data.csv` | Raw input dataset (32 rows) |
| `Forum_Data_Cleaning_EDA.ipynb` | Notebook: columns, missing values, duplicates, cleaning, EDA |
| `forum_data_cleaned.csv` | Cleaned, deduplicated output (12 rows) |
| `README.md` | This file |

## Dataset columns

| Column | What it holds |
|---|---|
| `source` | Which site the row was scraped from (`endometriosis_org` or `healthunlocked_endo`) |
| `text` | The scraped text content |
| `url` | The page URL the text was scraped from |
| `page` | The pagination number of that URL |
| `language` | Detected/assigned language (constant `"en"` in this dataset) |
| `esi_label` | Placeholder for a future severity-labeling task (constant `"unlabelled"`) |
| `symptom_id` | Placeholder for a future symptom-tagging task (constant `"unknown"`) |
| `content_type` *(added during cleaning)* | Rule-based tag: `forum_post`, `news_or_other`, `event_listing`, `cookie_notice`, or `community_guideline` |

## How to run

1. Place `forum_data.csv` in the same folder as the notebook.
2. Run `Forum_Data_Cleaning_EDA.ipynb` start to finish. It writes `forum_data_cleaned.csv`.

Requires: `pandas`, `numpy`, `matplotlib`, `seaborn` (also uses Python's built-in `re`).

## What the notebook does

**Missing values:** no true `NaN`s and no blank strings anywhere. However, `language`, `esi_label`, and `symptom_id` are each a single constant value across all 32 rows — not "missing" in the strict sense, but placeholder fields with no distinguishing information yet. They're kept (dropping them would lose the schema needed for future labeling) but flagged.

**Duplicates:** a plain `duplicated()` check finds *no* exact duplicate rows — but reading the text surfaces two content-level duplicate patterns that row-equality checks can't see:

1. **Nested fragments (17 rows).** Some rows are a full forum post (title + question + latest reply, scraped as one block); other rows are that *same* question or reply, scraped again on their own, because the page's HTML nests those elements inside the post container. **Fix:** keep the more complete "parent" row per post, drop its fragments.
2. **Cross-page repeats (3 rows).** The forum shows a "featured" sidebar post on every results page; the scraper picked it up again each time it turned the page, with only the relative timestamp changing (*"7 minutes ago"* → *"8 minutes ago"* → …). **Fix:** normalize away the timestamp with a regex, then keep only the first occurrence.

| Stage | Rows |
|---|---|
| Raw | 32 |
| After removing nested fragments | 15 |
| After removing cross-page repeats | **12** |

**Columns:** reviewed for dtype, uniqueness, and the constant-value placeholders noted above.

**Cleaning:** whitespace stripped from all text columns, `page` cast to integer, nested fragments and cross-page repeats removed, and a rule-based `content_type` tag added (keyword matching, not a model) so the mix of content is easy to see at a glance.

**EDA:** row counts by source, `content_type` breakdown, and text-length (word count) distribution on the cleaned data.

## Not covered (by design)

Any NLP preprocessing (tokenization, entity extraction) or model training. `forum_data_cleaned.csv` is the clean, de-duplicated starting point for that work, not the work itself.
