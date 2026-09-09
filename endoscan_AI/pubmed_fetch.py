"""
EndoScan AI — PubMed Abstract Fetcher
======================================
Pulls endometriosis-related abstracts from PubMed using the free NCBI E-utilities API.
No API key required for up to 3 requests/second.

Output: pubmed_abstracts.csv
Columns: pmid, title, abstract, year, keywords

Usage:
    python pubmed_fetch.py
    python pubmed_fetch.py --max 2000  # fetch more records
"""

import requests
import time
import csv
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path

# ── Search queries — cast wide, filter later ──────────────────────────────────
SEARCH_QUERIES = [
    'endometriosis[MeSH] AND symptoms[Title/Abstract]',
    'endometriosis[MeSH] AND pelvic pain[Title/Abstract]',
    'endometriosis[MeSH] AND dysmenorrhea[Title/Abstract]',
    'endometriosis[MeSH] AND diagnosis[Title/Abstract]',
    'endometriosis[MeSH] AND quality of life[Title/Abstract]',
    'endometriosis[MeSH] AND infertility[Title/Abstract]',
    'endometriosis[MeSH] AND dyspareunia[Title/Abstract]',
    'endometriosis[MeSH] AND menorrhagia[Title/Abstract]',
    'adenomyosis[MeSH] AND symptoms[Title/Abstract]',
    'endometriosis[MeSH] AND Africa[Title/Abstract]',
    'endometriosis[MeSH] AND sub-Saharan Africa[Title/Abstract]',
    'endometriosis[MeSH] AND Kenya[Title/Abstract]',
]

BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'


def search_pmids(query: str, max_results: int = 500) -> list[str]:
    """Search PubMed and return list of PMIDs."""
    resp = requests.get(f'{BASE_URL}/esearch.fcgi', params={
        'db': 'pubmed',
        'term': query,
        'retmax': max_results,
        'retmode': 'json',
        'usehistory': 'n',
    }, timeout=30)
    resp.raise_for_status()
    return resp.json()['esearchresult']['idlist']


def fetch_abstracts(pmids: list[str], batch_size: int = 100) -> list[dict]:
    """Fetch abstract text for a list of PMIDs in batches."""
    records = []

    for i in range(0, len(pmids), batch_size):
        batch = pmids[i:i + batch_size]
        resp = requests.get(f'{BASE_URL}/efetch.fcgi', params={
            'db': 'pubmed',
            'id': ','.join(batch),
            'rettype': 'abstract',
            'retmode': 'xml',
        }, timeout=60)
        resp.raise_for_status()

        root = ET.fromstring(resp.content)

        for article in root.findall('.//PubmedArticle'):
            try:
                pmid = article.findtext('.//PMID', '')
                title = article.findtext('.//ArticleTitle', '')
                year = article.findtext('.//PubDate/Year', '')

                # Abstract may have multiple sections (structured abstracts)
                abstract_texts = article.findall('.//AbstractText')
                abstract = ' '.join(
                    (el.get('Label', '') + ': ' if el.get('Label') else '') + (el.text or '')
                    for el in abstract_texts
                ).strip()

                # Keywords
                kw_list = [kw.text for kw in article.findall('.//Keyword') if kw.text]
                keywords = '; '.join(kw_list)

                if abstract:  # only keep records with actual abstract text
                    records.append({
                        'pmid': pmid,
                        'title': title,
                        'abstract': abstract,
                        'year': year,
                        'keywords': keywords,
                    })
            except Exception:
                continue

        print(f'  Fetched batch {i // batch_size + 1} — {len(records)} records so far')
        time.sleep(0.4)  # stay under NCBI rate limit (3 req/s)

    return records


def run(max_per_query: int = 500, output_path: str = 'pubmed_abstracts.csv'):
    all_pmids = set()

    print('=== PubMed Search ===')
    for query in SEARCH_QUERIES:
        pmids = search_pmids(query, max_results=max_per_query)
        new = set(pmids) - all_pmids
        all_pmids.update(pmids)
        print(f'  [{len(new):>4} new | {len(all_pmids):>5} total] {query}')
        time.sleep(0.4)

    print(f'\nTotal unique PMIDs: {len(all_pmids)}')
    print('\n=== Fetching Abstracts ===')

    pmid_list = list(all_pmids)
    records = fetch_abstracts(pmid_list)

    # Save
    out = Path(output_path)
    with open(out, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['pmid', 'title', 'abstract', 'year', 'keywords'])
        writer.writeheader()
        writer.writerows(records)

    print(f'\n✅ Saved {len(records)} abstracts → {out}')
    print(f'   Average abstract length: {sum(len(r["abstract"]) for r in records) // len(records)} chars')
    return records


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--max', type=int, default=500, help='Max PMIDs per query')
    parser.add_argument('--output', type=str, default='pubmed_abstracts.csv')
    args = parser.parse_args()
    run(max_per_query=args.max, output_path=args.output)