#!/usr/bin/env python3
"""
make_transparent.py

Sets a fixed, built-in list of pixel coordinates to fully transparent
(RGBA 0, 0, 0, 0) in a PNG image. Every other pixel is left completely
untouched. No external coordinate file is needed -- the ranges are baked
into this script below.

Each entry in RANGES is (x1, x2, y), meaning pixels (x1, y) through
(x2, y) inclusive on that row; x1 == x2 for a single pixel.

Usage:
    python3 make_transparent.py
        (reads night_fury_old.png, writes night_fury.png, both expected
         in the current directory)

    python3 make_transparent.py --input other.png --output result.png
        (same thing, with different filenames)
"""

import argparse
import sys
from PIL import Image

# (x1, x2, y) ranges -- inclusive on both ends
RANGES = [
    (193, 212, 21),
    (192, 213, 22),
    (193, 232, 23),
    (192, 233, 24),
    (141, 172, 25),
    (175, 234, 25),
    (140, 235, 26),
    (167, 234, 27),
    (166, 235, 28),
    (214, 214, 30),
    (212, 214, 31),
    (212, 213, 32),
    (211, 213, 33),
    (211, 213, 34),
    (210, 213, 35),
    (209, 212, 36),
    (208, 212, 37),
    (207, 213, 38),
    (201, 202, 39),
    (206, 213, 39),
    (201, 214, 40),
    (201, 215, 41),
    (200, 215, 42),
    (200, 214, 43),
    (200, 214, 44),
    (200, 213, 45),
    (199, 213, 46),
    (199, 212, 47),
    (199, 212, 48),
    (198, 211, 49),
    (198, 211, 50),
    (198, 211, 51),
    (198, 212, 52),
    (197, 212, 53),
    (197, 213, 54),
    (197, 212, 55),
    (197, 211, 56),
    (197, 210, 57),
    (197, 209, 58),
    (197, 208, 59),
    (197, 207, 60),
    (197, 207, 61),
    (197, 206, 62),
    (197, 205, 63),
    (197, 205, 64),
    (197, 205, 65),
    (197, 206, 66),
    (197, 204, 67),
    (197, 202, 68),
    (197, 200, 69),
]


def build_coordinates():
    """Expand the RANGES table above into a set of individual (x, y) pixels."""
    coords = set()
    for x1, x2, y in RANGES:
        lo, hi = (x1, x2) if x1 <= x2 else (x2, x1)
        for x in range(lo, hi + 1):
            coords.add((x, y))
    return coords


def main():
    parser = argparse.ArgumentParser(description="Punch transparent holes at the built-in coordinates.")
    parser.add_argument("--input", default="night_fury_old.png", help="source PNG (default: night_fury_old.png)")
    parser.add_argument("--output", default="night_fury.png", help="destination PNG (default: night_fury.png)")
    args = parser.parse_args()

    coords = build_coordinates()
    print(f"Built {len(coords)} pixel coordinates from the embedded ranges")

    img = Image.open(args.input).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    changed = 0
    out_of_bounds = 0
    for x, y in coords:
        if 0 <= x < width and 0 <= y < height:
            pixels[x, y] = (0, 0, 0, 0)
            changed += 1
        else:
            out_of_bounds += 1

    if out_of_bounds:
        print(f"  Warning: {out_of_bounds} coordinate(s) fell outside the {width}x{height} image and were skipped.", file=sys.stderr)

    img.save(args.output, format="PNG")
    print(f"Done: {changed} pixels made transparent. Saved to {args.output}")


if __name__ == "__main__":
    main()
