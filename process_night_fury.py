#!/usr/bin/env python3
"""
process_night_fury.py

Reads night_fury_old.png and writes night_fury.png after applying, in order:

  1. Any pixel with alpha == 0 (regardless of its RGB) is normalized to
     rgba(0, 0, 0, 0).
  2. A fixed set of individual (x, y) coordinates are overwritten with a
     specific rgba color, no matter what color was there before.
  3. A fixed set of specific rgba colors are replaced everywhere they occur
     in the image with a corrected rgba color.

Usage:
    python3 process_night_fury.py [input_file] [output_file]

    Defaults to night_fury_old.png -> night_fury.png in the current
    directory if no arguments are given.
"""

import sys
from PIL import Image

DEFAULT_INPUT = "night_fury_old.png"
DEFAULT_OUTPUT = "night_fury.png"

# Rule set 2: specific coordinate -> new color.
# Applied after the alpha-normalization pass, and overrides whatever
# color is already at that pixel.
COORD_RULES = {
    (167, 55): (0, 0, 0, 0),
    (179, 35): (0, 0, 0, 0),
    (19, 35): (34, 39, 47, 255),
    (28, 35): (34, 39, 47, 255),
    (108, 35): (34, 39, 47, 255),
    (117, 35): (34, 39, 47, 255),
    (137, 17): (27, 28, 34, 255),
    (143, 23): (27, 28, 34, 255),
}

# Rule set 3: specific color -> new color, applied globally
# (every pixel matching the old color anywhere in the image).
COLOR_RULES = {
    (33, 35, 44, 255): (33, 36, 45, 255),
    (30, 28, 34, 255): (27, 28, 34, 255),
}


def process_image(input_path: str, output_path: str) -> None:
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # --- Rule 1: rgba(*, *, *, 0) -> rgba(0, 0, 0, 0) ---
    changed_alpha0 = 0
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0 and (r, g, b) != (0, 0, 0):
                pixels[x, y] = (0, 0, 0, 0)
                changed_alpha0 += 1

    # --- Rule 2: specific (x, y) -> specific rgba ---
    applied_coords = 0
    for (x, y), color in COORD_RULES.items():
        if 0 <= x < width and 0 <= y < height:
            pixels[x, y] = color
            applied_coords += 1
        else:
            print(f"Warning: ({x}, {y}) is outside the image bounds "
                  f"{width}x{height}; skipped.")

    # --- Rule 3: specific rgba -> specific rgba, applied everywhere ---
    replaced_colors = {old: 0 for old in COLOR_RULES}
    for y in range(height):
        for x in range(width):
            current = pixels[x, y]
            if current in COLOR_RULES:
                pixels[x, y] = COLOR_RULES[current]
                replaced_colors[current] += 1

    img.save(output_path)

    print(f"Saved {output_path}")
    print(f"  alpha=0 pixels normalized: {changed_alpha0}")
    print(f"  coordinate overrides applied: {applied_coords}/{len(COORD_RULES)}")
    for old, count in replaced_colors.items():
        print(f"  pixels replaced for color {old}: {count}")


if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
    output_file = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT
    process_image(input_file, output_file)
