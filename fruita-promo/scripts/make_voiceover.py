"""
French voice-over for the Fruita spot.

  pip install kokoro-onnx soundfile numpy scipy
  python3 scripts/make_voiceover.py    # writes public/audio/vo.wav (15 s, 48 kHz mono)
  python3 scripts/make_soundtrack.py   # mixes it in with ducking

Voice: Kokoro (open-weight neural TTS, Apache-2.0), French voice `ff_siwis`,
run locally. The model files (~350 MB) are fetched once from the
kokoro-onnx GitHub releases into assets/tts/ (git-ignored).

Each line is placed on the visual beat it belongs to. The copy only uses
claims printed on the can (pure juice, 100% pineapple, no added chemicals,
shake well before opening).
"""

import os
import urllib.request

import numpy as np
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "assets", "tts")
OUT = os.path.join(ROOT, "public", "audio", "vo.wav")
SR = 48000
DUR = 15.0
VOICE = "ff_siwis"
SPEED = 0.92  # a touch slower than default: calmer, more "premium" delivery

MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"

# (start time in seconds, text) — times are tied to frames (t * 30)
LINES = [
    (0.55, "Secouez bien."),  # after the SHAKE / WELL slams (f16)
    (3.35, "Fruita Ananas, pur jus."),  # the can lands in the studio (f100)
    (5.40, "Rien que le fruit."),  # macro move over the label (f162)
    (7.10, "Cent pour cent ananas."),  # odometer "100%" (f213)
    (9.00, "Sans produits chimiques ajoutés."),  # NO ADDED CHEMICALS (f270)
    (11.20, "Fruita."),  # hero drop (f336)
    (12.75, "Secouez bien…"),  # tagline: SHAKE WELL (f390)
    (13.80, "avant d'ouvrir !"),  # … BEFORE OPENING! lands on f420
]


def fetch(name):
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        print("downloading", name)
        urllib.request.urlretrieve(MODEL_URL + name, path)
    return path


def trim(x, thr=0.008, pad=0.02, sr=24000):
    idx = np.where(np.abs(x) > thr)[0]
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr * 3))
    return x[a:b]


def polish(x):
    """Broadcast-style chain: rumble cut, presence lift, gentle compression."""
    x = signal.sosfilt(signal.butter(2, 90, "high", fs=SR, output="sos"), x)
    # +3 dB presence shelf around 3 kHz (parallel band boost)
    band = signal.sosfilt(signal.butter(2, [2500, 6000], "band", fs=SR, output="sos"), x)
    x = x + 0.4 * band
    # slight warmth around 200 Hz
    low = signal.sosfilt(signal.butter(2, [150, 300], "band", fs=SR, output="sos"), x)
    x = x + 0.2 * low
    # RMS compressor, 3:1 above -20 dBFS, 5 ms attack / 80 ms release
    env = np.sqrt(signal.lfilter([1 - 0.995], [1, -0.995], x**2) + 1e-12)
    db = 20 * np.log10(env)
    over = np.maximum(0, db + 20)
    gain_db = -over * (1 - 1 / 3)
    gain = 10 ** (signal.lfilter([1 - 0.9997], [1, -0.9997], gain_db) / 20)
    return x * gain


def main():
    from kokoro_onnx import Kokoro

    k = Kokoro(fetch("kokoro-v1.0.onnx"), fetch("voices-v1.0.bin"))
    track = np.zeros(int(SR * DUR))
    for start, text in LINES:
        s, sr = k.create(text, voice=VOICE, speed=SPEED, lang="fr-fr")
        s = trim(np.asarray(s, dtype=np.float64), sr=sr)
        s = signal.resample_poly(s, SR, sr)
        s = polish(s)
        s *= np.minimum(1, np.arange(len(s)) / (0.004 * SR))  # de-click
        i = int(start * SR)
        n = min(len(s), len(track) - i)
        track[i : i + n] += s[:n]
        print(f"{start:5.2f}s → {start + len(s) / SR:5.2f}s  {text}")
    track /= np.max(np.abs(track)) / 10 ** (-3 / 20)
    from scipy.io import wavfile

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    wavfile.write(OUT, SR, (track * 32767).astype(np.int16))
    print("wrote", OUT)


if __name__ == "__main__":
    main()
