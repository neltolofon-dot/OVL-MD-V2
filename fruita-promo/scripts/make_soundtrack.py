"""
Procedural soundtrack for the Fruita spot — every hit, whoosh and tick is
placed on the exact frame of the visual event it belongs to.

  pip install numpy scipy
  python3 scripts/make_soundtrack.py      # writes public/audio/fruita.wav

Music: 120 BPM, A major, two-beat pickup so bars land on frames 30, 90,
150 … and each act change (90 / 210 / 330) is a downbeat.
  0 – 3 s   tension: sub drone, shaker + liquid slosh while the can is shaken,
            riser, can-opening "pssht" into the dive
  3 – 7 s   drop: kick, bass, marimba arpeggios (D | A)
  7 – 11 s  showcase: full groove, hats in 16ths (Bm | E), odometer ticks,
            whooshes on every camera move
  11 – 15 s hero: drop, (D | E → A) resolving on "OPENING!" with a final pssht
"""

import os

import numpy as np
from scipy import signal

SR = 48000
FPS = 30
DUR = 15.0
N = int(SR * DUR)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio", "fruita.wav")

rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)
REV_L = np.zeros(N)  # reverb send
REV_R = np.zeros(N)
SIDECHAIN_TRIGGERS = []


def fr(frame):
    return frame / FPS


def add(sig, t, gain=1.0, pan=0.0, rev=0.0):
    """Mix a mono signal at time t (s), equal-power pan in [-1, 1]."""
    i = int(round(t * SR))
    if i >= N:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    gl, gr = np.cos(a) * gain, np.sin(a) * gain
    L[i : i + len(sig)] += sig * gl
    R[i : i + len(sig)] += sig * gr
    if rev:
        REV_L[i : i + len(sig)] += sig * gl * rev
        REV_R[i : i + len(sig)] += sig * gr * rev


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def highpass(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, btype="high", fs=SR, output="sos"), x)


def lowpass(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, btype="low", fs=SR, output="sos"), x)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ------------------------------------------------------------------ voices
def kick(gain=1.0):
    t = tt(0.45)
    f = 48 + 110 * np.exp(-t / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    click = highpass(noise(0.45), 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh((body + click) * 1.4) * gain


def sub_boom(dur=1.6):
    t = tt(dur)
    f = 34 + 30 * np.exp(-t / 0.12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    rumble = lowpass(noise(dur), 120) * np.exp(-t / 0.35) * 0.6
    return np.tanh((s + rumble) * 1.5)


def clap():
    t = tt(0.5)
    env = np.zeros_like(t)
    for k, d in enumerate([0, 0.011, 0.022]):
        env += (t >= d) * np.exp(-np.clip(t - d, 0, None) / (0.008 if k < 2 else 0.11))
    n = bandpass(noise(0.5), 900, 5200) * env
    body = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.05) * 0.4
    return (n + body) * 0.8


def hat(open_=False):
    d = 0.25 if open_ else 0.06
    t = tt(d)
    return highpass(noise(d), 7500, 4) * np.exp(-t / (0.09 if open_ else 0.018))


def shaker():
    t = tt(0.09)
    env = (1 - np.exp(-t / 0.006)) * np.exp(-t / 0.035)
    return bandpass(noise(0.09), 4500, 11000) * env


def tick(freq=3200, d=0.012):
    t = tt(d)
    return bandpass(noise(d), freq * 0.7, freq * 1.4) * np.exp(-t / 0.002) + np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.003) * 0.4


def whoosh(dur, f0, f1, peak=0.6):
    """Filtered noise with a moving band centre — air moving past the lens."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = noise(dur)
    centres = np.geomspace(f0, f1, 24)
    out = np.zeros(n)
    seg = n // 24
    for k, c in enumerate(centres):
        y = bandpass(x, c * 0.6, min(c * 1.6, SR / 2 - 100))
        w = np.zeros(n)
        a, b = max(0, (k - 1) * seg), min(n, (k + 2) * seg)
        w[a:b] = np.hanning(b - a)
        out += y * w
    u = t / dur
    env = np.where(u < peak, (u / peak) ** 2.2, ((1 - u) / (1 - peak)) ** 1.6)
    return out * env


def riser(dur):
    t = tt(dur)
    u = t / dur
    n = highpass(noise(dur), 400) * u**2.5
    f = 110 * 2 ** (u * 3)
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * u**3 * 0.25
    return lowpass(n + tone, 9000) * 0.6


def pssht(dur=1.4):
    """Can opening: sharp hiss + fizz of tiny bubbles."""
    t = tt(dur)
    hiss = highpass(noise(dur), 2200, 4) * (1 - np.exp(-t / 0.004)) * np.exp(-t / 0.16)
    fizz_imp = (rng.random(len(t)) < 0.012 * np.exp(-t / 0.5)) * rng.standard_normal(len(t))
    fizz = bandpass(fizz_imp, 3000, 9000) * 3
    return hiss + fizz * 0.5


def shimmer(base=2637.0, dur=1.2):
    t = tt(dur)
    s = sum(np.sin(2 * np.pi * base * m * t + p) * a for m, a, p in [(1, 1, 0), (1.5, 0.5, 1), (2.0, 0.3, 2), (1.003, 0.6, 0.5)])
    return s * (1 - np.exp(-t / 0.004)) * np.exp(-t / 0.35) * 0.18


def slosh(dur, rate=4.0):
    t = tt(dur)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * rate * t) ** 2
    return bandpass(noise(dur), 180, 900) * am * np.hanning(len(t)) ** 0.3


def marimba(freq, dur=0.6):
    t = tt(dur)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.32)
    s += 0.35 * np.sin(2 * np.pi * freq * 3.93 * t) * np.exp(-t / 0.05)
    s += 0.08 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t / 0.015)
    return s * (1 - np.exp(-t / 0.0015))


def pad(freqs, dur):
    t = tt(dur)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            s += signal.sawtooth(2 * np.pi * f * 2 ** (det / 12) * t + rng.random() * 6)
    s = lowpass(s / (3 * len(freqs)), 1400)
    env = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.2)
    return s * env


def bass(freq, dur):
    t = tt(dur)
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return np.tanh(s * 1.6) * np.minimum(1, t / 0.005) * np.exp(-t / 0.4) * np.minimum(1, (dur - t) / 0.02)


# ------------------------------------------------------------- arrangement
BEAT = 0.5

# HOOK -------------------------------------------------------------------
drone_t = tt(3.0)
add(lowpass(np.sin(2 * np.pi * 55 * drone_t) + 0.3 * signal.sawtooth(2 * np.pi * 55.2 * drone_t), 300) * np.minimum(1, drone_t / 1.5) * 0.18, 0)
for f, g in [(0, 1.0), (15, 0.75)]:  # SHAKE / WELL slams
    add(sub_boom(1.0), fr(f), 0.55 * g)
    add(kick(), fr(f), 0.8 * g)
    add(clap(), fr(f), 0.5 * g, rev=0.5)
    SIDECHAIN_TRIGGERS.append(fr(f))
add(whoosh(0.4, 200, 2400, 0.85), fr(25) - 0.3, 0.5, pan=0)  # can shoots up
add(kick(), fr(30), 0.9)
add(sub_boom(0.8), fr(30), 0.4)
for k in range(int((fr(60) - fr(34)) / (BEAT / 4)) + 1):  # shaker, 16ths, locked to the shake
    t0 = fr(34) + k * BEAT / 4
    add(shaker(), t0, 0.32 * (1.15 if k % 2 == 0 else 0.8), pan=0.25 * np.sin(k * np.pi / 2))
add(slosh(fr(61) - fr(34)), fr(34), 0.5)
for f in (45,):
    add(kick(), fr(f), 0.6)
add(kick(), fr(60), 1.0)  # the freeze
add(clap(), fr(60), 0.7, rev=0.6)
add(sub_boom(0.9), fr(60), 0.45)
add(whoosh(0.35, 400, 5000, 0.4), fr(60), 0.45, pan=-0.6)  # SHAKE flies left
add(whoosh(0.35, 400, 5000, 0.4), fr(62), 0.45, pan=0.6)  # WELL flies right
add(shimmer(2637), fr(66), 0.8, pan=0.3, rev=0.4)  # light sweep on the can
add(riser(fr(90) - fr(66)), fr(66), 0.55)
add(pssht(), fr(80), 0.5, rev=0.3)  # "opening" into the dive
add(whoosh(0.5, 150, 6000, 0.9), fr(75), 0.6)

# MUSIC (from the drop) ---------------------------------------------------
A1, B1, D2, E2 = midi(33), midi(35), midi(38), midi(40)
CHORDS = [
    (3.0, 5.0, "D", [50, 54, 57], D2),
    (5.0, 7.0, "A", [57, 61, 64], midi(45)),
    (7.0, 9.0, "Bm", [59, 62, 66], B1 * 2),
    (9.0, 11.0, "E", [52, 56, 59], E2),
    (11.0, 13.0, "D", [50, 54, 57], D2),
    (13.0, 14.0, "E", [52, 56, 59], E2),
    (14.0, 15.0, "A", [57, 61, 64], midi(45)),
]
ARP = [0, 1, 2, 3, 4, 3, 2, 1]  # index into chord tones over two octaves
for start, end, _name, notes, root in CHORDS:
    tones = notes + [n + 12 for n in notes]
    final = start >= 14.0
    add(pad([midi(n) for n in notes], end - start + (0 if final else 0.05)), start, 0.075 if not final else 0.1, rev=0.3)
    k = 0
    t0 = start
    while t0 < end - 1e-6:
        if not (final and t0 > start + 0.3):
            n = tones[ARP[k % 8] % len(tones)] + 12
            add(marimba(midi(n)), t0, 0.16, pan=0.35 * np.sin(k * 1.3), rev=0.25)
            add(bass(root, BEAT / 2 * 0.9), t0, 0.22 if k % 2 == 0 else 0.14)
        t0 += BEAT / 2
        k += 1
# Final chord, struck on "OPENING!"
for n in [45, 57, 61, 64, 69]:
    add(marimba(midi(n), 1.0), 14.0, 0.14, rev=0.5)

# Drums: kick on every beat from the drop; claps on 2 and 4; hats.
t0 = 3.0
while t0 < 14.9:
    beat_in_bar = int(round((t0 - 1.0) / BEAT)) % 4
    if t0 < 13.99 or abs(t0 - 14.0) < 1e-6:
        add(kick(), t0, 0.85)
        SIDECHAIN_TRIGGERS.append(t0)
    if beat_in_bar in (1, 3) and t0 < 13.9:
        add(clap(), t0, 0.42, rev=0.45)
    t0 += BEAT
t0 = 3.0
k = 0
while t0 < 14.0:
    showcase = 7.0 <= t0 < 11.0
    if showcase or k % 2 == 1:
        add(hat(open_=(k % 4 == 2 and not showcase)), t0, 0.12 if showcase else 0.16, pan=0.3)
    t0 += BEAT / 4 if showcase else BEAT / 2
    k += 1

# REVEAL ------------------------------------------------------------------
add(sub_boom(1.8), fr(90), 0.75)  # the drop
add(highpass(noise(1.5), 3000) * np.exp(-tt(1.5) / 0.45), fr(90), 0.18, rev=0.6)  # air/crash
add(shimmer(3136), fr(124), 0.7, pan=-0.2, rev=0.4)  # light sweep
add(whoosh(0.5, 300, 3000, 0.75), fr(155) - 0.375, 0.4, pan=-0.2)  # dive to the logo
add(whoosh(0.9, 400, 2000, 0.5), fr(166), 0.2, pan=0.3)  # glide down the label
add(whoosh(0.55, 200, 7000, 0.6), fr(198), 0.75, pan=-0.3)  # whip pan

# SHOWCASE ----------------------------------------------------------------
add(kick(), fr(210), 0.7)
add(sub_boom(0.9), fr(210), 0.35)


def bez(p1x, p1y, p2x, p2y):
    def f(x):
        tt_ = x
        for _ in range(12):
            bx = 3 * (1 - tt_) ** 2 * tt_ * p1x + 3 * (1 - tt_) * tt_**2 * p2x + tt_**3 - x
            dx = 3 * (1 - tt_) ** 2 * p1x + 6 * (1 - tt_) * tt_ * (p2x - p1x) + 3 * tt_**2 * (1 - p2x)
            tt_ = min(1, max(0, tt_ - bx / max(dx, 1e-6)))
        return 3 * (1 - tt_) ** 2 * tt_ * p1y + 3 * (1 - tt_) * tt_**2 * p2y + tt_**3

    return f


out_quint = bez(0.22, 1, 0.36, 1)
# Odometer: one tick each time the units digit rolls over (same curve as the visual).
last = 0
for i in range(0, int(17 * SR / FPS)):
    lf = 1 + 16 * i / int(16 * SR / FPS)
    if lf > 17:
        break
    v = int(100 * out_quint(min(1, (lf - 1) / 16)))
    if v != last:
        add(tick(3400, 0.008), fr(210 + lf), 0.12 if v < 100 else 0.4, pan=0.2 * np.sin(v))
        last = v
add(clap(), fr(227), 0.5, rev=0.6)  # 100 lands
for k, f in enumerate((226, 230)):  # zeros become slices
    add(marimba(midi(81 + 4 * k), 0.4), fr(f), 0.12, rev=0.4)
add(whoosh(0.4, 150, 8000, 0.92), fr(240) - 0.37, 0.6)  # dive through the slice
add(whoosh(0.35, 300, 2500, 0.6), fr(239), 0.55, pan=0.7)  # can tears in (speed ramp: fast…
add(whoosh(0.4, 2500, 300, 0.4), fr(259), 0.55, pan=-0.7)  # …slow… fast out)
add(whoosh(0.3, 500, 6000, 0.6), fr(264), 0.5, pan=-0.5)  # diagonal wipe
for f in (271, 275):  # NO ADDED / CHEMICALS
    add(kick(0.7), fr(f), 0.6)
add(whoosh(0.4, 200, 1500, 0.8), fr(272), 0.35, pan=0.5)  # can rises
add(shimmer(2794), fr(292), 0.6, pan=0.4, rev=0.4)
add(whoosh(0.35, 300, 5000, 0.55), fr(294), 0.6)  # vertical push
for f in (300, 307, 315, 322):  # montage cuts — camera shutter
    add(tick(2200, 0.01), fr(f), 0.45, pan=-0.2)
    add(tick(5200, 0.008), fr(f) + 0.035, 0.3, pan=0.2)
add(riser(fr(330) - fr(312)), fr(312), 0.4)

# HERO --------------------------------------------------------------------
add(sub_boom(2.0), fr(330), 0.85)
add(highpass(noise(2.0), 2500) * np.exp(-tt(2.0) / 0.6), fr(330), 0.2, rev=0.7)
for g in (52, 64, 76, 97, 108):  # glints
    add(shimmer(3520 + 220 * (g % 3), 0.8), fr(330 + g), 0.35, pan=0.5 * np.sin(g), rev=0.5)
for f, w in [(390, 0.6), (397, 0.6), (405, 0.7)]:  # SHAKE / WELL / BEFORE
    add(kick(0.8), fr(f), w * 0.8)
    add(clap(), fr(f), w * 0.5, rev=0.4)
add(sub_boom(1.6), fr(420), 0.7)  # OPENING!
add(clap(), fr(420), 0.6, rev=0.7)
add(pssht(1.6), fr(420), 0.6, rev=0.35)
add(shimmer(2637, 1.4), fr(424), 0.7, rev=0.6)

# ------------------------------------------------------------- mix bus
def sidechain(x):
    g = np.ones(N)
    t = np.arange(N) / SR
    for s in SIDECHAIN_TRIGGERS:
        m = (t >= s) & (t < s + 0.3)
        g[m] = np.minimum(g[m], 1 - 0.55 * np.exp(-(t[m] - s) / 0.09))
    return x * g


# Reverb: decorrelated exponentially decaying noise IR.
ir_t = tt(1.6)
ir_l = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.38)
ir_r = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.38)
ir_l, ir_r = lowpass(ir_l, 6000), lowpass(ir_r, 6000)
ir_l /= np.sqrt(np.sum(ir_l**2))
ir_r /= np.sqrt(np.sum(ir_r**2))
wet_l = signal.fftconvolve(REV_L, ir_l)[:N] * 0.6
wet_r = signal.fftconvolve(REV_R, ir_r)[:N] * 0.6

mix = np.stack([L + wet_l, R + wet_r])
mix = np.stack([sidechain(c) for c in mix])


# A breath before each drop: everything ducks for ~50 ms, so the hit lands on
# near-silence and feels bigger.
def breath(x, drop_frame, length=0.05):
    t = np.arange(N) / SR
    d = fr(drop_frame)
    g = 1 - 0.85 * np.clip((t - (d - length)) / 0.012, 0, 1) * (t < d)
    return x * g


for drop in (90, 330):
    mix = breath(mix, drop)
mix = highpass(mix, 28)
# Glue: gentle soft-knee saturation, then peak normalise to -1 dBFS.
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
fade = np.ones(N)
fade[-int(0.25 * SR) :] = np.linspace(1, 0, int(0.25 * SR)) ** 2
fade[: int(0.003 * SR)] = np.linspace(0, 1, int(0.003 * SR))
mix *= fade
mix /= np.max(np.abs(mix)) / 10 ** (-1 / 20)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
from scipy.io import wavfile  # noqa: E402

wavfile.write(OUT, SR, (mix.T * 32767).astype(np.int16))

# Loudness: measure with ffmpeg's EBU R128 meter and trim to -14 LUFS (the
# streaming / social norm). The mix peaks at -1 dBFS, so this only lowers it.
TARGET_LUFS = -14.0
try:
    import re
    import subprocess

    rep = subprocess.run(["ffmpeg", "-hide_banner", "-i", OUT, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", rep)[-1])
    gain = 10 ** ((TARGET_LUFS - lufs) / 20)
    if gain < 1:
        wavfile.write(OUT, SR, (mix.T * gain * 32767).astype(np.int16))
    print(f"loudness {lufs:.1f} LUFS -> {TARGET_LUFS} LUFS (gain {20 * np.log10(gain):+.1f} dB)")
except (FileNotFoundError, IndexError):
    print("ffmpeg not found: skipped loudness normalisation")
print("wrote", OUT, f"{DUR}s")
