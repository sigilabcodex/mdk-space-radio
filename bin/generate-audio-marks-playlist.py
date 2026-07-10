#!/usr/bin/env python3
import random
from pathlib import Path

MARKS_DIR = Path("/opt/swr-radio/assets/audio-marks-clips")
SILENCE_DIR = Path("/opt/swr-radio/assets/silence")
OUT = Path("/opt/swr-radio/cache/audio-marks-timed.m3u")

marks = sorted(MARKS_DIR.glob("*.mp3"))
silences = sorted(SILENCE_DIR.glob("silence-*.mp3"))

if not marks:
    raise SystemExit(f"No marks found in {MARKS_DIR}")

if not silences:
    raise SystemExit(f"No silence files found in {SILENCE_DIR}")

# Build a long enough rotation. Liquidsoap will loop it.
items = []
marks_pool = marks[:]
random.shuffle(marks_pool)

for _ in range(120):
    if not marks_pool:
        marks_pool = marks[:]
        random.shuffle(marks_pool)

    silence = random.choice(silences)
    mark = marks_pool.pop()

    items.append(silence)
    items.append(mark)

OUT.parent.mkdir(parents=True, exist_ok=True)

with OUT.open("w", encoding="utf-8") as f:
    f.write("#EXTM3U\n")
    for item in items:
        f.write(f"#EXTINF:-1,{item.stem}\n")
        f.write(str(item) + "\n")

print(f"Wrote {len(items)} entries to {OUT}")
print(f"Marks: {len(marks)}")
print(f"Silences: {len(silences)}")
