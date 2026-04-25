"""
Generate a prize CSV from the chroma-keyed chibi images.

Each row references one cleaned PNG via a relative URL, uses the filename
as the prize name, and links to the X profile in flavor text.

Rarity is hash-distributed (deterministic): ~80% common, ~17% rare, ~3% ultra.
Ball-style colors vary by rarity to fit the Valkyrie X Truck palette.
"""
import os
import csv
import hashlib
import io

SRC = r'C:\Users\bryan\enclave\gachapon\images\chibi_clean'
OUT = r'C:\Users\bryan\enclave\gachapon\images\chibi_prizes.csv'

# Valkyrie palette
PALETTE = {
    'common': {'type': 'capsule', 'c1': '#2a2a3a', 'c2': '#c0a060', 'glow': ''},
    'rare':   {'type': 'capsule', 'c1': '#c0a060', 'c2': '#b22020', 'glow': ''},
    'ultra':  {'type': 'capsule', 'c1': '#b22020', 'c2': '#ffcc44', 'glow': '#ff3030'},
}

HEADER = ['id', 'name', 'rarity', 'flavor',
          'ballStyleType', 'color1', 'color2', 'glow',
          'artKind', 'artSource', 'artValue']

def rarity_for(name):
    """Deterministic rarity bucket from a stable hash of the filename."""
    h = int(hashlib.sha1(name.encode()).hexdigest()[:8], 16)
    pct = h % 100
    if pct < 3:   return 'ultra'
    if pct < 20:  return 'rare'
    return 'common'

def main():
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith('.png'))
    rows = []
    counts = {'common': 0, 'rare': 0, 'ultra': 0}
    for f in files:
        handle = os.path.splitext(f)[0]
        rarity = rarity_for(handle)
        counts[rarity] += 1
        style = PALETTE[rarity]
        rows.append({
            'id': f'chibi-{handle.lower()}',
            'name': handle,
            'rarity': rarity,
            'flavor': f'https://x.com/{handle}',
            'ballStyleType': style['type'],
            'color1': style['c1'],
            'color2': style['c2'],
            'glow': style['glow'],
            'artKind': 'image',
            'artSource': 'url',
            # Path is relative to the page that loads the standalone HTML.
            'artValue': f'images/chibi_clean/{f}',
        })
    with open(OUT, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=HEADER, lineterminator='\r\n')
        w.writeheader()
        w.writerows(rows)
    print(f'Wrote {len(rows)} rows to {OUT}')
    print(f'  common: {counts["common"]}  rare: {counts["rare"]}  ultra: {counts["ultra"]}')

if __name__ == '__main__':
    main()
