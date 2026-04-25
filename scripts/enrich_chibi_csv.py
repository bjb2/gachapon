"""
Enrich the chibi prize CSV with Twitter bios pulled from a folder of follower
exports.

Each CSV under TWITTER_DATA_DIR has columns:
    username, name, url, bio, location, ...
We merge bios across all files (case-insensitive on username; last wins, but
bios for the same handle are typically identical across exports).

For every row in the chibi prize CSV, if the name (case-insensitive) matches a
collected handle, replace the flavor with `<bio>\n\nhttps://x.com/<name>`.
Otherwise keep the existing `https://x.com/<name>` flavor.

Reads:  images/chibi_prizes.csv
Writes: images/chibi_prizes.csv  (in place; backup at chibi_prizes.csv.bak)
"""
import csv
import os
import shutil
import sys
import re

CHIBI_CSV = r'C:\Users\bryan\enclave\gachapon\images\chibi_prizes.csv'
TWITTER_DATA_DIR = r'C:\Users\bryan\Downloads\twitterdata'
BIO_MAX = 240  # truncate to keep reveal modal readable

# Bigger CSV field cap — bios + pinned-post links can blow past the 128 KB default.
csv.field_size_limit(10 * 1024 * 1024)

def collapse_ws(s):
    # Collapse runs of whitespace (including newlines) to a single space —
    # multi-paragraph bios render messily in a small reveal card.
    return re.sub(r'\s+', ' ', s).strip()

def truncate(s, n):
    if len(s) <= n:
        return s
    cut = s[: n - 1].rstrip()
    return cut + '…'

def load_bios():
    """Return {lowercase_username: bio}. Skips empty bios so we never overwrite
    a useful bio with an empty one when the same handle appears twice."""
    bios = {}
    files = sorted(f for f in os.listdir(TWITTER_DATA_DIR) if f.lower().endswith('.csv'))
    for f in files:
        path = os.path.join(TWITTER_DATA_DIR, f)
        with open(path, encoding='utf-8', newline='') as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                u = (row.get('username') or '').strip()
                b = (row.get('bio') or '').strip()
                if not u or not b:
                    continue
                bios[u.lower()] = b
    return bios

def main():
    print(f'Loading bios from {TWITTER_DATA_DIR}...')
    bios = load_bios()
    print(f'  {len(bios):,} unique handles with bios')

    if not os.path.exists(CHIBI_CSV):
        print(f'ERROR: {CHIBI_CSV} not found', file=sys.stderr)
        sys.exit(1)

    backup = CHIBI_CSV + '.bak'
    if not os.path.exists(backup):
        shutil.copy2(CHIBI_CSV, backup)
        print(f'Backed up to {backup}')

    rows = []
    matched = 0
    total = 0
    with open(CHIBI_CSV, encoding='utf-8', newline='') as fh:
        reader = csv.DictReader(fh)
        fields = reader.fieldnames
        for row in reader:
            total += 1
            handle = (row.get('name') or '').strip()
            link = f'https://x.com/{handle}'
            bio = bios.get(handle.lower())
            if bio:
                bio_clean = truncate(collapse_ws(bio), BIO_MAX)
                row['flavor'] = f'{bio_clean}\n\n{link}'
                matched += 1
            else:
                row['flavor'] = link
            rows.append(row)

    with open(CHIBI_CSV, 'w', encoding='utf-8', newline='') as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, lineterminator='\r\n')
        writer.writeheader()
        writer.writerows(rows)

    print(f'Updated {CHIBI_CSV}')
    print(f'  Matched: {matched}/{total} ({matched*100/total:.1f}%)')
    print(f'  Fallback (x.com link only): {total - matched}')

if __name__ == '__main__':
    main()
