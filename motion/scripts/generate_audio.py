"""Synthesize royalty-free 120 BPM background music and UI SFX for CEZAME motion design."""
import math
import os
import random
import struct
import wave

SAMPLE_RATE = 44100
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(OUT_DIR, exist_ok=True)


def write_wav(filename: str, samples: list[float]) -> None:
    path = os.path.join(OUT_DIR, filename)
    with wave.open(path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for s in samples:
            clamped = max(-0.98, min(0.98, s))
            frames.extend(struct.pack("<h", int(clamped * 32767)))
        wf.writeframes(bytes(frames))
    print(f"Generated {path} ({len(samples) / SAMPLE_RATE:.2f}s)")


def midi_to_freq(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))


def gen_music(duration_s: float = 31.0, bpm: float = 120.0) -> None:
    total = int(duration_s * SAMPLE_RATE)
    buf = [0.0] * total
    beat_s = 60.0 / bpm
    bar_s = beat_s * 4

    # Upbeat pop progression: Fmaj7 -> G6 -> Em7 -> Am7 (2 bars per loop, 6 loops = 24s)
    chords = [
        (53, [65, 69, 72, 76]),  # Fmaj7
        (55, [67, 71, 74, 76]),  # G6
        (52, [64, 67, 71, 74]),  # Em7
        (57, [69, 72, 76, 79]),  # Am7
    ]

    num_beats = int(duration_s / beat_s)
    rng = random.Random(42)

    for b in range(num_beats):
        t0 = b * beat_s
        s0 = int(t0 * SAMPLE_RATE)
        chord_idx = (b // 2) % len(chords)
        bass_midi, notes = chords[chord_idx]

        # Soft kick on beats 0, 2 (and syncopated &)
        if b % 2 == 0:
            kick_len = int(0.18 * SAMPLE_RATE)
            for i in range(kick_len):
                if s0 + i >= total:
                    break
                t = i / SAMPLE_RATE
                freq = 125.0 * math.exp(-t * 28.0) + 46.0
                env = math.exp(-t * 16.0)
                buf[s0 + i] += 0.34 * env * math.sin(2 * math.pi * freq * t)

        # Crisp shaker / closed hat on 8th notes
        for sub in (0.0, 0.5):
            hs = int((t0 + sub * beat_s) * SAMPLE_RATE)
            hat_len = int(0.045 * SAMPLE_RATE)
            amp = 0.055 if sub == 0.5 else 0.03
            prev = 0.0
            for i in range(hat_len):
                if hs + i >= total:
                    break
                t = i / SAMPLE_RATE
                noise = rng.uniform(-1.0, 1.0)
                hp = noise - prev * 0.85
                prev = noise
                buf[hs + i] += amp * math.exp(-t * 75.0) * hp

        # Warm electric-piano chord pluck on beat 0 and 1.5 of each 2-beat chord
        if b % 2 == 0:
            pluck_offsets = [0.0, 0.75 * beat_s]
        else:
            pluck_offsets = [0.5 * beat_s]

        for off in pluck_offsets:
            ps = int((t0 + off) * SAMPLE_RATE)
            plen = int(0.55 * SAMPLE_RATE)
            for i in range(plen):
                if ps + i >= total:
                    break
                t = i / SAMPLE_RATE
                attack = min(1.0, t / 0.008)
                env = attack * math.exp(-t * 4.5)
                val = 0.0
                for n in notes:
                    f = midi_to_freq(n)
                    val += math.sin(2 * math.pi * f * t) + 0.25 * math.sin(2 * math.pi * f * 2.0 * t) * math.exp(-t * 12.0)
                buf[ps + i] += 0.055 * env * val

        # Warm sub-bass on beat 0 of each chord
        if b % 2 == 0:
            blen = int(0.85 * SAMPLE_RATE)
            bf = midi_to_freq(bass_midi - 12)
            for i in range(blen):
                if s0 + i >= total:
                    break
                t = i / SAMPLE_RATE
                env = min(1.0, t / 0.015) * math.exp(-t * 2.5)
                buf[s0 + i] += 0.18 * env * math.sin(2 * math.pi * bf * t)

    # Gentle fade-in (0.4s) & fade-out (1.2s)
    fade_in = int(0.4 * SAMPLE_RATE)
    fade_out = int(1.2 * SAMPLE_RATE)
    for i in range(fade_in):
        buf[i] *= i / fade_in
    for i in range(fade_out):
        buf[total - 1 - i] *= i / fade_out

    write_wav("music.wav", buf)


def gen_whoosh() -> None:
    dur = 0.32
    n = int(dur * SAMPLE_RATE)
    rng = random.Random(7)
    samples = []
    lp = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * t / dur) ** 1.6
        raw = rng.uniform(-1.0, 1.0)
        alpha = 0.08 + 0.25 * math.sin(math.pi * t / dur)
        lp = lp + alpha * (raw - lp)
        samples.append(0.45 * env * lp)
    write_wav("whoosh.wav", samples)


def gen_pop() -> None:
    dur = 0.11
    n = int(dur * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        freq = 780.0 * math.exp(-t * 22.0) + 220.0
        env = min(1.0, t / 0.003) * math.exp(-t * 32.0)
        samples.append(0.5 * env * math.sin(2 * math.pi * freq * t))
    write_wav("pop.wav", samples)


def gen_chime() -> None:
    dur = 0.85
    n = int(dur * SAMPLE_RATE)
    buf = [0.0] * n
    # Fmaj9 bright arpeggio
    freqs = [523.25, 659.25, 783.99, 987.77, 1174.66]
    for idx, f in enumerate(freqs):
        start = int(idx * 0.055 * SAMPLE_RATE)
        for i in range(start, n):
            t = (i - start) / SAMPLE_RATE
            env = min(1.0, t / 0.005) * math.exp(-t * 5.2)
            buf[i] += 0.16 * env * (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t))
    write_wav("chime.wav", buf)


def gen_uhoh() -> None:
    dur = 0.38
    n = int(dur * SAMPLE_RATE)
    buf = [0.0] * n
    for idx, (start_s, f) in enumerate([(0.0, 440.0), (0.14, 349.23)]):
        s0 = int(start_s * SAMPLE_RATE)
        for i in range(s0, n):
            t = (i - s0) / SAMPLE_RATE
            env = min(1.0, t / 0.005) * math.exp(-t * 14.0)
            buf[i] += 0.32 * env * math.sin(2 * math.pi * f * t)
    write_wav("uhoh.wav", buf)


if __name__ == "__main__":
    gen_music()
    gen_whoosh()
    gen_pop()
    gen_chime()
    gen_uhoh()
