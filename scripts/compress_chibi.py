"""
Resize + compress the chroma-keyed chibis so the deployed gacha doesn't ship
half a gig of PNGs.

Strategy:
  - Downscale to MAX_DIM on the long edge (preserves aspect, no upscaling).
  - Save PNG with optimize=True. PIL's PNG optimizer chooses the best filter
    and zlib level for smallest size at no quality loss.

Why not WebP / JPEG-XL: PNG keeps the alpha channel as-is and is supported
in every browser. WebP would shave another ~30-40% but requires re-encoding
when the source is updated. PNG is the conservative choice for a 25% target
that the resize alone already meets.

Reads:  images/chibi_clean/*.png
Writes: images/chibi_clean/*.png  (in place — the originals are recoverable
        by re-running scripts/chroma_key_chibi.py from chibi_images/)
"""
import os
import sys
import time
from PIL import Image

SRC = r'C:\Users\bryan\enclave\gachapon\images\chibi_clean'
MAX_DIM = 512

def main():
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith('.png'))
    total = len(files)
    print(f'Compressing {total} images (max {MAX_DIM}px on long edge)')
    start = time.time()
    bytes_before = 0
    bytes_after = 0
    skipped = 0
    for i, name in enumerate(files, 1):
        path = os.path.join(SRC, name)
        size_before = os.path.getsize(path)
        bytes_before += size_before
        try:
            im = Image.open(path)
            w, h = im.size
            longest = max(w, h)
            if longest > MAX_DIM:
                ratio = MAX_DIM / longest
                new_size = (max(1, int(round(w * ratio))), max(1, int(round(h * ratio))))
                im = im.resize(new_size, Image.LANCZOS)
            else:
                # already small — just re-save with optimize to gain anything possible
                pass
            im.save(path, 'PNG', optimize=True)
        except Exception as e:
            print(f'  ! {name}: {e}', file=sys.stderr)
            skipped += 1
            continue
        bytes_after += os.path.getsize(path)
        if i % 50 == 0 or i == total:
            elapsed = time.time() - start
            rate = i / elapsed if elapsed else 0
            print(f'  [{i}/{total}] {rate:.1f} img/s')
    pct = (bytes_after / bytes_before * 100) if bytes_before else 0
    print(f'Done in {time.time()-start:.1f}s. Skipped {skipped}.')
    print(f'  Before: {bytes_before/1024/1024:.1f} MB')
    print(f'  After:  {bytes_after/1024/1024:.1f} MB  ({pct:.1f}% of original)')

if __name__ == '__main__':
    main()
