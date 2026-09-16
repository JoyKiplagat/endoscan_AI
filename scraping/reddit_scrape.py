import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

def scrape_forum(base_url, source_name, max_pages=100):
    """Generic forum scraper for endometriosis discussion boards."""
    records = []
    
    for page in range(1, max_pages + 1):
        try:
            url  = f"{base_url}?page={page}"
            resp = requests.get(
                url,
                timeout=10,
                headers={
                    'User-Agent': 'Mozilla/5.0 (academic research bot)'
                }
            )
            if resp.status_code != 200:
                print(f"  Stopped at page {page} — status {resp.status_code}")
                break

            soup  = BeautifulSoup(resp.text, 'html.parser')

            # Generic post extraction — works across most forum layouts
            posts = soup.find_all(
                ['div', 'article', 'li'],
                class_=lambda c: c and any(
                    kw in c.lower()
                    for kw in ['post', 'message', 'comment', 'reply', 'thread']
                )
            )

            if not posts:
                break

            for post in posts:
                text = post.get_text(separator=' ', strip=True)
                if len(text) > 50:
                    records.append({
                        'source':     source_name,
                        'text':       text,
                        'url':        url,
                        'page':       page,
                        'language':   'en',
                        'esi_label':  'unlabelled',
                        'symptom_id': 'unknown',
                    })

            print(f"  Page {page:>3} — {len(records):>5} records total")
            time.sleep(1.5)  # polite delay

        except Exception as e:
            print(f"  Error on page {page}: {e}")
            break

    return records

# Target forums — publicly accessible endometriosis communities
FORUMS = [
    {
        'url':  'https://www.endometriosis.org/forums/',
        'name': 'endometriosis_org',
    },
    {
        'url':  'https://patient.info/forums/discuss/browse/endometriosis-1723',
        'name': 'patient_info',
    },
    {
        'url':  'https://www.healthunlocked.com/endometriosis-uk',
        'name': 'healthunlocked_endo',
    },
]

all_forum_records = []

for forum in FORUMS:
    print(f"\nScraping: {forum['name']}")
    records = scrape_forum(forum['url'], forum['name'], max_pages=50)
    all_forum_records.extend(records)
    print(f"  Total from {forum['name']}: {len(records):,}")
    time.sleep(3)

forum_df = pd.DataFrame(all_forum_records).drop_duplicates(subset='text')
forum_df.to_csv('forum_data.csv', index=False)
print(f"\n✅ Total forum records: {len(forum_df):,}")
print(forum_df['source'].value_counts())