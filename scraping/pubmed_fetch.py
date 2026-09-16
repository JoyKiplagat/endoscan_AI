"""
EndoScan AI — PubMed Abstract Fetcher (extended)
Fetches abstracts from NCBI E-utilities API.
No auth required. Rate limit: 3 requests/second.
"""

import requests
import time
import csv
import argparse
from pathlib import Path
from bs4 import BeautifulSoup   # ← this was missing

QUERIES = [
    'endometriosis symptoms pain',
    'dysmenorrhea pelvic pain women',
    'endometriosis dyspareunia infertility',
    'endometriosis bowel bladder symptoms',
    'adenomyosis menorrhagia treatment',
    'endometriosis diagnosis delay patient',
    'endometriosis quality of life',
    'deep infiltrating endometriosis',
    'endometriosis fatigue chronic pain',
    'endometriosis mental health anxiety depression',
    'endometriosis Africa Kenya diagnosis',
    'endometriosis surgical treatment laparoscopy',
]

def fetch_pubmed_batch(query: str, max_results: int = 2000) -> list:
    # Step 1 — search for IDs
    search_url    = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
    search_params = {
        'db':         'pubmed',
        'term':       query,
        'retmax':     max_results,
        'retmode':    'json',
        'usehistory': 'y',
    }
    search_resp = requests.get(search_url, params=search_params, timeout=15)
    search_data = search_resp.json()

    webenv    = search_data['esearchresult']['webenv']
    query_key = search_data['esearchresult']['querykey']
    total     = int(search_data['esearchresult']['count'])
    print(f"  Found {total:,} papers for: {query}")

    # Step 2 — fetch abstracts in batches of 200
    fetch_url  = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
    abstracts  = []
    batch_size = 200

    for start in range(0, min(total, max_results), batch_size):
        fetch_params = {
            'db':        'pubmed',
            'query_key': query_key,
            'WebEnv':    webenv,
            'retstart':  start,
            'retmax':    batch_size,
            'retmode':   'xml',
            'rettype':   'abstract',
        }
        fetch_resp = requests.get(fetch_url, params=fetch_params, timeout=30)
        soup       = BeautifulSoup(fetch_resp.text, 'xml')

        for article in soup.find_all('PubmedArticle'):
            abstract = article.find('AbstractText')
            title    = article.find('ArticleTitle')
            year_tag = article.find('PubDate')

            if abstract and abstract.text and len(abstract.text) > 50:
                abstracts.append({
                    'title':      title.text if title else '',
                    'abstract':   abstract.text,
                    'year':       year_tag.find('Year').text
                                  if year_tag and year_tag.find('Year') else '',
                    'source':     'pubmed_extended',
                    'language':   'en',
                    'esi_label':  'unlabelled',
                    'symptom_id': 'unknown',
                })

        fetched = min(start + batch_size, min(total, max_results))
        print(f"  Fetched {fetched:,} / {min(total, max_results):,}")
        time.sleep(0.4)   # NCBI rate limit: max 3 req/second

    return abstracts


def run(output: str = 'pubmed_abstracts_extended.csv', max_per_query: int = 2000):
    all_abstracts = []

    for query in QUERIES:
        print(f"\nFetching: {query}")
        try:
            batch = fetch_pubmed_batch(query, max_results=max_per_query)
            all_abstracts.extend(batch)
            print(f"  Batch total: {len(batch):,}")
        except Exception as e:
            print(f"  Error: {e} — skipping this query")
        time.sleep(1)

    # Deduplicate on abstract text
    seen      = set()
    unique    = []
    for rec in all_abstracts:
        key = rec['abstract'][:100]
        if key not in seen:
            seen.add(key)
            unique.append(rec)

    print(f"\nTotal fetched    : {len(all_abstracts):,}")
    print(f"After dedup      : {len(unique):,}")

    # Save
    out        = Path(output)
    fieldnames = ['title', 'abstract', 'year', 'source',
                  'language', 'esi_label', 'symptom_id']

    with open(out, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(unique)

    print(f"✅ Saved {len(unique):,} abstracts → {out}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output',  type=str, default='pubmed_abstracts_extended.csv')
    parser.add_argument('--max',     type=int, default=2000,
                        help='Max abstracts per query')
    args = parser.parse_args()
    run(output=args.output, max_per_query=args.max)