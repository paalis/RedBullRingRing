"""Soundtrack for the site intro: the 12-s RBR '27 intro, then a brass section for the team intro and an engine pass-by.
120 BPM, D minor, one beat grid from t=0. Original composition (no samples)."""
import math, sys, wave
import numpy as np

SR = 44100
DUR = 26.5
BEAT = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def biquad_lp(x, fc, q=0.707):
    """RBJ low-pass; fc may be a scalar or per-sample array."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        if i % 64 == 0:
            w = 2 * math.pi * min(fc[i], SR * 0.45) / SR
            a = math.sin(w) / (2 * q)
            c = math.cos(w)
            a0 = 1 + a
            b0 = (1 - c) / 2 / a0; b1 = (1 - c) / a0; b2 = b0
            a1 = -2 * c / a0; a2 = (1 - a) / a0
        xn = x[i]
        yn = b0 * xn + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, xn, y1, yn
        y[i] = yn
    return y


def hp(x, fc):
    return x - biquad_lp(x, fc)


def env(n, a, d, sustain_level=0.0, curve=4.0):
    ta = max(1, int(a * SR)); e = np.zeros(n)
    e[:min(ta, n)] = np.linspace(0, 1, ta)[:n]
    if n > ta:
        k = np.arange(n - ta) / SR
        e[ta:] = sustain_level + (1 - sustain_level) * np.exp(-k * curve / max(d, 1e-3))
    return e


def place(buf, sig, at, gain=1.0):
    i = int(round(at * SR))
    j = min(N, i + len(sig))
    if i < N:
        buf[i:j] += sig[: j - i] * gain


def saw(f, n, detune=0.0):
    tt = np.arange(n) / SR
    ph = (tt * f * (1 + detune)) % 1.0
    return 2 * ph - 1


def reverb(x, mix=0.25):
    """Cheap feedback-delay 'room' so everything shares one space."""
    out = x.copy()
    for d, g in [(0.031, .5), (0.047, .42), (0.071, .35), (0.113, .28), (0.173, .2), (0.241, .14)]:
        k = int(d * SR)
        y = np.zeros_like(x); y[k:] = x[:-k] * g
        out += y
    wet = biquad_lp(out - x, 4500)
    return x + wet * mix


# ---------- stems ----------
drums = np.zeros(N); bass = np.zeros(N); pad = np.zeros(N); fx = np.zeros(N); lead = np.zeros(N)

# Kick
def kick(level=1.0):
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 45 + 110 * np.exp(-tt * 28)
    ph = 2 * math.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 7) * level

def snare():
    n = int(0.3 * SR); tt = np.arange(n) / SR
    noise = hp(rng.standard_normal(n), 1500) * np.exp(-tt * 18) * .45
    body = np.sin(2 * math.pi * 185 * tt) * np.exp(-tt * 25) * .5
    return noise + body

def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-tt * (14 if open_ else 70)) * .25

# Start beeps (A5, the fifth of D) on the five lights + soft sub pulse
for i in range(5):
    at = 0.5 + i * BEAT
    n = int(0.22 * SR); tt = np.arange(n) / SR
    beep = (np.sin(2 * math.pi * hz(81) * tt) + .25 * np.sin(2 * math.pi * hz(93) * tt)) * env(n, .004, .18, curve=5)
    place(fx, beep, at, .32)
    place(drums, kick(.45), at)

# Riser 0–3 s: noise swelling up through a rising filter + D drone
n = int(3.0 * SR); tt = np.arange(n) / SR
riser = biquad_lp(rng.standard_normal(n), 300 + 5000 * (tt / 3) ** 2.2, q=2.0) * (tt / 3) ** 2 * .35
place(fx, riser, 0)
drone = (saw(hz(38), n) + saw(hz(38), n, .006) + .6 * saw(hz(45), n, -.004)) * .18
drone = biquad_lp(drone, 120 + 900 * (tt / 3) ** 1.5) * (0.25 + .75 * tt / 3)
place(pad, drone, 0)

# Lights out at 3.0: impact (kick + sub drop + crash) and an engine upshift
place(drums, kick(1.3), 3.0)
n = int(1.6 * SR); tt = np.arange(n) / SR
sub = np.sin(2 * math.pi * np.cumsum(hz(38) * (1 + 1.0 * np.exp(-tt * 9))) / SR) * np.exp(-tt * 2.2) * .55
place(bass, sub, 3.0)
n = int(1.8 * SR); tt = np.arange(n) / SR
crash = hp(rng.standard_normal(n), 4000) * np.exp(-tt * 3.0) * .22
place(drums, crash, 3.0)
# Engine: two upshifts on beats 3.0 and 3.5 (rpm sweep, lowpassed saw), sits under the music
for k, at in enumerate([3.0, 3.5, 4.0]):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f0 = hz(50 + k * 2)
    f = f0 * (1 + 0.5 * tt / 0.5)
    ph = np.cumsum(f) / SR
    eng = (2 * (ph % 1) - 1) + .5 * (2 * ((ph * 2.01) % 1) - 1)
    eng = biquad_lp(eng, 900 + 1400 * tt / .5) * env(n, .01, .45, sustain_level=.6, curve=2) * np.linspace(1, .3, n)
    place(fx, eng, at, .12)

# Groove 3–12 s: kick on beats, snare on 2 & 4, offbeat hats
beat_times = np.arange(3.0, 12.0 - 1e-9, BEAT)
for bi, bt in enumerate(beat_times):
    if bt > 3.0:
        place(drums, kick(1.0), bt)
    if bi % 2 == 1:
        place(drums, snare(), bt, .8)
    place(drums, hat(open_=(bi % 4 == 3)), bt + BEAT / 2, .9)
    if bt >= 6.0:
        place(drums, hat(), bt + BEAT / 4, .45)
        place(drums, hat(), bt + 3 * BEAT / 4, .45)

# Chords per 2-s bar from 3.0: Dm, Bb, C, Dm(+ final)
chords = [(3.0, [50, 53, 57], 38), (5.0, [46, 50, 53], 34), (7.0, [48, 52, 55], 36), (9.0, [50, 53, 57], 38), (11.0, [50, 53, 57, 62], 38)]
for (at, notes, root) in chords:
    dur = 2.0 if at < 11 else 1.0
    n = int(dur * SR); tt = np.arange(n) / SR
    ch = sum(saw(hz(m), n, d) for m in notes for d in (-.004, .004)) / (2 * len(notes))
    ch = biquad_lp(ch, 1800 if at >= 9 else 1300) * env(n, .03, dur, sustain_level=.7, curve=1.0)
    place(pad, ch, at, .5)
    # bass: 8ths on the root, octave pop on the last 8th of each beat pair
    for e in range(int(dur / (BEAT / 2))):
        m = root + (12 if e % 4 == 3 else 0)
        nn = int(0.22 * SR); t2 = np.arange(nn) / SR
        b = biquad_lp(saw(hz(m), nn) + .5 * np.sin(2 * math.pi * hz(m - 12) * t2), 600) * env(nn, .004, .2, curve=3)
        place(bass, b, at + e * BEAT / 2, .55)

# Lead arpeggio (pluck) from 6.0 on 8ths, chord tones up high
arp = {5.0: [70, 74, 77, 74], 7.0: [72, 76, 79, 76], 9.0: [74, 77, 81, 77], 11.0: [74, 77, 81, 86]}
for at, seq in arp.items():
    for e in range(4 * 2 if at < 11 else 2):
        st = at + e * BEAT / 2
        if st < 6.0:
            continue
        m = seq[e % 4]
        nn = int(0.3 * SR); t2 = np.arange(nn) / SR
        p = (np.sin(2 * math.pi * hz(m) * t2) + .3 * np.sin(4 * math.pi * hz(m) * t2)) * env(nn, .003, .25, curve=5)
        place(lead, p, st, .16)

# Whooshes into the wipes at 6.0 and 8.5, plus a crash on the punchline
for cut in (6.0, 8.5):
    n = int(0.7 * SR); tt = np.arange(n) / SR
    w = biquad_lp(rng.standard_normal(n), 400 + 6000 * np.sin(np.pi * tt / .7) ** 2, q=1.5) * np.sin(np.pi * tt / .7) ** 2
    place(fx, w, cut - .35, .22)
n = int(2.5 * SR); tt = np.arange(n) / SR
place(drums, hp(rng.standard_normal(n), 4500) * np.exp(-tt * 2) * .18, 8.5)
place(drums, kick(1.2), 8.5)

# ---------- Part 2: team intro (12–23.5 s), brass over a driving groove ----------
def brass(midi, dur, bright=1.0):
    """Horn section: detuned saws through an opening filter, slow vibrato on held notes."""
    n = int(dur * SR); tt = np.arange(n) / SR
    vib = 1 + .004 * np.sin(2 * math.pi * 5.2 * tt) * np.clip((tt - .25) / .3, 0, 1)
    f = hz(midi) * vib
    ph = np.cumsum(f) / SR
    x = sum(2 * ((ph * (1 + d)) % 1) - 1 for d in (-.005, 0, .006)) / 3
    x += .35 * (2 * ((ph * .5) % 1) - 1)
    cut = 500 + 2600 * bright * (1 - np.exp(-tt * 25)) * (0.55 + .45 * np.exp(-tt * 3))
    x = biquad_lp(x, cut, q=1.1)
    rel = np.clip((dur - tt) / .08, 0, 1)
    return x * np.clip(tt / .03, 0, 1) * rel

def timpani(midi, level=1.0):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    f = hz(midi) * (1 + .08 * np.exp(-tt * 20))
    body = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
    hit = biquad_lp(rng.standard_normal(n), 900) * np.exp(-tt * 30) * .4
    return (body + hit) * level

def tom(midi, level=1.0):
    n = int(0.3 * SR); tt = np.arange(n) / SR
    f = hz(midi) * (1 + .5 * np.exp(-tt * 25))
    return np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-tt * 10) * level

# Snare roll + riser 11.0–12.0 into the team title
for k in range(16):
    at = 11.0 + k * 1.0 / 16
    place(drums, snare(), at, .25 + .55 * k / 15)
n = int(1.0 * SR); tt = np.arange(n) / SR
place(fx, biquad_lp(rng.standard_normal(n), 500 + 7000 * tt ** 2, q=1.8) * tt ** 2, 11.0, .4)

# Big hit on the title at 12.0
place(drums, kick(1.4), 12.0)
place(drums, hp(rng.standard_normal(int(2.2 * SR)), 4000) * np.exp(-np.arange(int(2.2 * SR)) / SR * 2.2) * .26, 12.0)
place(bass, timpani(38, 1.0), 12.0, .9)
for m in (50, 53, 57, 62):
    place(pad, brass(m, 1.0, 1.2), 12.0, .45)

# Bars of 2 s: Dm, Bb, C, Dm, Bb, then A (dominant) holding the line-up
bars = [(12.0, [50, 53, 57], 38), (14.0, [46, 50, 53], 34), (16.0, [48, 52, 55], 36),
        (18.0, [50, 53, 57], 38), (20.0, [46, 50, 53], 34), (22.0, [45, 49, 52], 33)]
for at, notes, root in bars:
    dur = 2.0 if at < 22 else 1.5
    for m in notes:  # sustained horn pad (lower, softer than the lead)
        place(pad, brass(m, dur, .6), at + (.0 if at > 12 else 1.0), .32 if at > 12 else 0)
    for e in range(int(dur / (BEAT / 2))):  # bass 8ths
        m = root + (12 if e % 4 == 3 else 0)
        nn = int(0.22 * SR); t2 = np.arange(nn) / SR
        b = biquad_lp(saw(hz(m), nn) + .5 * np.sin(2 * math.pi * hz(m - 12) * t2), 650) * env(nn, .004, .2, curve=3)
        place(bass, b, at + e * BEAT / 2, .6)
place(pad, brass(50, 1.0, .6) + brass(53, 1.0, .6) + brass(57, 1.0, .6), 13.0, .32)

# Fanfare (lead horns, doubled an octave down): (offset, length, midi)
fanfare = {
    12.0: [(0, .375, 62), (.375, .125, 62), (.5, .5, 69), (1.0, 1.0, 74)],
    14.0: [(0, .375, 74), (.375, .125, 72), (.5, .5, 70), (1.0, 1.0, 65)],
    16.0: [(0, .375, 67), (.375, .125, 67), (.5, .5, 72), (1.0, 1.0, 76)],
    18.0: [(0, .375, 77), (.375, .125, 76), (.5, .5, 74), (1.0, 1.0, 69)],
    20.0: [(0, .375, 70), (.375, .125, 70), (.5, .5, 74), (1.0, .5, 77), (1.5, .5, 79)],
    22.0: [(0, 1.5, 76)],
}
for at, notes in fanfare.items():
    for off, ln, m in notes:
        place(lead, brass(m, ln * .97, 1.3) + .6 * brass(m - 12, ln * .97, 1.0), at + off, .5)

# Groove 12–22: kick on beats, snare 2 & 4, 8th hats, tom fill on the last beat of each bar
for bt in np.arange(12.0, 22.0 - 1e-9, BEAT):
    bi = int(round((bt - 12.0) / BEAT))
    if bt > 12.0:
        place(drums, kick(1.0), bt)
    if bi % 2 == 1:
        place(drums, snare(), bt, .85)
    place(drums, hat(), bt + BEAT / 2, .8)
    if bi % 4 == 3:
        for k, m in enumerate((50, 47, 43, 40)):
            place(drums, tom(m, .7), bt + k * BEAT / 4)
for at in (14.0, 16.0, 18.0, 20.0):
    place(bass, timpani(38 if at != 14 and at != 20 else 34, .7), at, .8)

# Line-up 22–23.5: drums drop out, timpani roll and a riser build into the car
for k in range(24):
    at = 22.0 + k * 1.5 / 24
    place(bass, timpani(45, .15 + .5 * k / 23), at, .5)
n = int(1.5 * SR); tt = np.arange(n) / SR
place(fx, biquad_lp(rng.standard_normal(n), 400 + 6000 * (tt / 1.5) ** 2, q=2) * (tt / 1.5) ** 2, 22.0, .45)

# ---------- Part 3: engine pass-by (stereo, left → right), peak at 24.3 s ----------
eng_l = np.zeros(N); eng_r = np.zeros(N)
T0, TC, TL = 23.3, 24.3, 2.0
n = int(TL * SR); tt = np.arange(n) / SR + T0
rel = (tt - TC) / 0.22
rpm = 95 + 70 * np.clip((tt - T0) / (TC - T0), 0, 1) ** 1.5           # revving up as it approaches
dop = 1 + .14 * -np.tanh(rel)                                          # doppler: higher, then lower
f = rpm * dop
ph = np.cumsum(f) / SR
x = (2 * (ph % 1) - 1) + .7 * np.sign(np.sin(2 * math.pi * ph * 2)) + .4 * (2 * ((ph * 3.01) % 1) - 1)
x = biquad_lp(x, 1200 + 3500 / (1 + rel ** 2)) + .25 * biquad_lp(rng.standard_normal(n), 2500) / (1 + rel ** 2)
amp = 1 / (1 + rel ** 2) ** .8
amp *= np.clip((tt - T0) / .15, 0, 1) * np.clip((T0 + TL - tt) / .3, 0, 1)
pan = .5 + .5 * np.tanh(rel / 1.4)
i0 = int(T0 * SR)
eng_l[i0:i0 + n] = x * amp * np.cos(pan * math.pi / 2)
eng_r[i0:i0 + n] = x * amp * np.sin(pan * math.pi / 2)

# Final hit at 25.0: the site appears
place(drums, kick(1.4), 25.0)
place(drums, hp(rng.standard_normal(int(1.5 * SR)), 4000) * np.exp(-np.arange(int(1.5 * SR)) / SR * 2.5) * .25, 25.0)
place(bass, timpani(38, 1.0), 25.0, .9)
for m in (50, 57, 62, 65, 69):
    place(pad, brass(m, 1.5, 1.1), 25.0, .4)


# ---------- mix ----------
def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)

mix_l = (norm(drums) * .62 + norm(bass) * .5 + norm(pad) * .34 + norm(lead) * .2 + norm(fx) * .3)
pad_r = np.roll(pad, int(.012 * SR)); lead_r = np.roll(lead, int(.009 * SR))
mix_r = (norm(drums) * .62 + norm(bass) * .5 + norm(pad_r) * .34 + norm(lead_r) * .2 + norm(fx) * .3)
mix_l += eng_l / (np.max(np.abs(eng_l)) + 1e-9) * .55; mix_r += eng_r / (np.max(np.abs(eng_r)) + 1e-9) * .55
mix_l = reverb(mix_l, .22); mix_r = reverb(mix_r, .22)
# sidechain-ish pump on the pad bus is implied; soft clip + master fade
master = np.stack([mix_l, mix_r], 1)
master = np.tanh(master * 1.25) / np.tanh(1.25)
fade = np.ones(N); fl = int(1.2 * SR); fade[-fl:] = np.linspace(1, 0, fl)
master *= fade[:, None]
master *= 0.89 / np.max(np.abs(master))  # ~ -1 dBFS

out = sys.argv[1]
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((master * 32767).astype('<i2').tobytes())
print('wrote', out)
