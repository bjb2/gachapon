"""
Chroma-key the green background out of the chibi_images set.

Reads from   images/chibi_images/*.jpg
Writes PNGs  images/chibi_clean/*.png  (RGBA, soft alpha, green spill suppressed)

Algorithm:
  - Score each pixel by "greenness": how much G dominates max(R,B).
  - Hard alpha = 0 above an upper threshold, 255 below a lower threshold,
    smooth ramp between (gives anti-aliased edges).
  - Subtract residual green spill on semi-transparent edge pixels by clamping
    the green channel to max(R,B), so wisps don't keep their lime cast.
"""
from PIL import Image
import numpy as np
import os, sys, time

SRC = os.path.join(os.path.dirname(__file__), '..', 'images', 'chibi_images')
DST = os.path.join(os.path.dirname(__file__), '..', 'images', 'chibi_clean')

# Greenness ramp. Pixel is "green" when G - max(R,B) is large.
GREEN_HARD = 60   # >= this delta: fully transparent
GREEN_SOFT = 25   # <= this delta: fully opaque
# Also require absolute green value to avoid wiping near-grey pixels.
MIN_G = 90

def chroma_key(arr):
    """arr: HxWx3 uint8 RGB → HxWx4 uint8 RGBA."""
    r = arr[..., 0].astype(np.int16)
    g = arr[..., 1].astype(np.int16)
    b = arr[..., 2].astype(np.int16)

    rb_max = np.maximum(r, b)
    delta = g - rb_max  # how much greener than red/blue

    # Smooth alpha ramp between SOFT and HARD.
    alpha = np.clip(255 - (delta - GREEN_SOFT) * (255 / (GREEN_HARD - GREEN_SOFT)), 0, 255)
    # Pixels not green enough by absolute G: keep them fully opaque.
    alpha = np.where(g < MIN_G, 255, alpha).astype(np.uint8)

    # Spill suppression: where alpha is partial, clamp green to rb_max so edge
    # halos don't read green.
    spill_mask = (alpha < 255) & (alpha > 0)
    g_clamped = np.where(spill_mask, rb_max, g)

    out = np.empty(arr.shape[:2] + (4,), dtype=np.uint8)
    out[..., 0] = arr[..., 0]
    out[..., 1] = g_clamped.astype(np.uint8)
    out[..., 2] = arr[..., 2]
    out[..., 3] = alpha
    return out

def main():
    os.makedirs(DST, exist_ok=True)
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(('.jpg', '.jpeg', '.png')))
    total = len(files)
    print(f'Processing {total} images -> {DST}')
    start = time.time()
    skipped = 0
    for i, name in enumerate(files, 1):
        out_name = os.path.splitext(name)[0] + '.png'
        out_path = os.path.join(DST, out_name)
        if os.path.exists(out_path):
            skipped += 1
            continue
        try:
            im = Image.open(os.path.join(SRC, name)).convert('RGB')
            arr = np.array(im)
            rgba = chroma_key(arr)
            Image.fromarray(rgba, 'RGBA').save(out_path, optimize=True)
        except Exception as e:
            print(f'  ! {name}: {e}', file=sys.stderr)
        if i % 50 == 0 or i == total:
            elapsed = time.time() - start
            rate = i / elapsed if elapsed else 0
            print(f'  [{i}/{total}] {rate:.1f} img/s')
    print(f'Done in {time.time()-start:.1f}s. Skipped {skipped} existing.')

if __name__ == '__main__':
    main()
