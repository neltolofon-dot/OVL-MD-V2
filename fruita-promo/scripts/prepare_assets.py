"""
Asset preparation for the Fruita spot.

Turns the raw product photos in assets/source/ into the transparent cut-outs
used by the Remotion composition (public/img/).

  pip install "rembg[cpu]" numpy opencv-python-headless pillow
  python3 scripts/prepare_assets.py

Segmentation uses BiRefNet (via rembg). The key visual shows three cans that
touch each other, so the matte of the hero (centre) can is separated from its
neighbours by fitting its two silhouette edges (the can body is a cylinder,
so each edge is a near-straight line) and intersecting the matte with them.

Each BiRefNet inference runs in its own process: the model needs ~6 GB and a
second inference in the same process gets OOM-killed on small machines.
"""

import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "source")
TMP = os.path.join(ROOT, "assets", "mattes")
OUT = os.path.join(ROOT, "public", "img")


def matte(src_path, box, out_path):
    """Run BiRefNet on (a crop of) an image in a fresh process."""
    if os.path.exists(out_path):
        return
    code = f"""
from rembg import new_session, remove
from PIL import Image
im = Image.open({src_path!r}).convert('RGB')
box = {box!r}
if box: im = im.crop(box)
remove(im, session=new_session('birefnet-general'), only_mask=True).save({out_path!r})
"""
    subprocess.run([sys.executable, "-c", code], check=True)


def robust_quadratic(ys, xs):
    keep = np.ones(len(ys), bool)
    for _ in range(6):
        c = np.polyfit(ys[keep], xs[keep], 2)
        r = xs - np.polyval(c, ys)
        s = np.median(np.abs(r[keep])) * 1.5 + 0.8
        keep = np.abs(r) < 3 * s
    return c


def hero_can():
    src = os.path.join(SRC, "fruita-keyvisual.webp")
    mpath = os.path.join(TMP, "keyvisual_matte.png")
    matte(src, None, mpath)
    im = np.array(Image.open(src).convert("RGB"))
    m = np.array(Image.open(mpath).convert("L")).astype(np.float32) / 255
    lum = cv2.GaussianBlur(im.mean(2).astype(np.float32), (0, 0), 1.0)

    # Rows where the matte bridges the centre can and its neighbours.
    rows = [y for y in range(300, 1320) if m[y, 760] > 0.5 and m[y, 1265] > 0.5]
    ys = np.arange(rows[0], rows[-1] + 1, dtype=np.float64)

    # Left edge: strongest horizontal luminance step next to the left can.
    gx = cv2.Sobel(cv2.GaussianBlur(lum, (0, 0), 1.2), cv2.CV_32F, 1, 0, ksize=3)
    left = np.array([745 + np.argmax(np.abs(gx[int(y), 745:800])) for y in ys], float)
    # Right edge: the hero can is covered in droplets, its neighbour is smooth,
    # so the boundary is where the local texture energy collapses.
    energy = cv2.GaussianBlur(np.abs(cv2.Laplacian(lum, cv2.CV_32F)), (0, 0), 3)
    right = []
    for y in ys:
        w = cv2.GaussianBlur(energy[int(y), 1240:1275].reshape(1, -1), (0, 0), 1.5).ravel()
        right.append(1240 + np.argmin(np.diff(w)) + 0.5)
    cl = robust_quadratic(ys, left)
    cr = robust_quadratic(ys, np.array(right))

    H, W = m.shape
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    coverage = np.clip(xx - np.polyval(cl, yy) + 0.5, 0, 1) * np.clip(np.polyval(cr, yy) - xx + 0.5, 0, 1)
    m *= coverage
    n, lab = cv2.connectedComponents((m > 0.5).astype(np.uint8))
    m *= cv2.dilate((lab == lab[800, 1010]).astype(np.uint8), np.ones((5, 5), np.uint8))

    ys_, xs_ = np.where(m > 0.02)
    x0, x1, y0, y1 = xs_.min() - 4, xs_.max() + 5, ys_.min() - 4, ys_.max() + 5
    rgba = np.dstack([im, (m * 255).round().astype(np.uint8)])[y0:y1, x0:x1]
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "can.png"))


def simple_cutout(src_name, box, out_name, matte_name):
    src = os.path.join(SRC, src_name)
    mpath = os.path.join(TMP, matte_name)
    matte(src, box, mpath)
    im = Image.open(src).convert("RGB")
    if box:
        im = im.crop(box)
    a = np.array(im)
    m = np.array(Image.open(mpath).convert("L"))
    ys, xs = np.where(m > 5)
    x0, x1, y0, y1 = xs.min() - 3, xs.max() + 4, ys.min() - 3, ys.max() + 4
    Image.fromarray(np.dstack([a, m])[y0:y1, x0:x1], "RGBA").save(os.path.join(OUT, out_name))


def photos():
    # Photographic plates used in the montage, re-encoded at a sane quality.
    for name in ["fruita-can-desk.jpg", "fruita-sixpack.jpg", "fruita-tray.jpg"]:
        Image.open(os.path.join(SRC, name)).convert("RGB").save(os.path.join(OUT, name), quality=92)
    # The key visual carries a generator watermark in its bottom-right corner:
    # crop it away so it can never show up on screen.
    kv = Image.open(os.path.join(SRC, "fruita-keyvisual.webp")).convert("RGB")
    kv.crop((0, 0, 1820, 1493)).save(os.path.join(OUT, "fruita-keyvisual.jpg"), quality=92)


if __name__ == "__main__":
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    hero_can()
    simple_cutout("fruita-can-desk.jpg", None, "can-real.png", "can_desk_matte.png")
    simple_cutout("fruita-keyvisual.webp", (1650, 960, 2000, 1230), "wedge.png", "wedge_matte.png")
    photos()
    print("assets ready in", OUT)
