#!/usr/bin/env python3
"""Convert source images under images/ into optimized WebP under images/webp/.

The site serves every picture from images/webp/<name>.webp; images/ keeps the
original master. Run this after dropping a new master in images/ so the two
stay in sync instead of converting by hand each season.

    scripts/to-webp.py images/cartel-27.jpg
    scripts/to-webp.py --all
"""

import argparse
import sys
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parent.parent
SOURCE_DIR = REPO / "images"
TARGET_DIR = SOURCE_DIR / "webp"
SOURCE_SUFFIXES = {".jpg", ".jpeg", ".png", ".gif"}

# Widest the site ever renders a picture; anything larger is dead bytes.
MAX_WIDTH = 1080
QUALITY = 82


def convert(source: Path, *, max_width: int, quality: int) -> Path:
    target = TARGET_DIR / f"{source.stem}.webp"
    with Image.open(source) as img:
        img = img.convert("RGB")
        if img.width > max_width:
            height = round(img.height * max_width / img.width)
            img = img.resize((max_width, height), Image.LANCZOS)
        TARGET_DIR.mkdir(parents=True, exist_ok=True)
        img.save(target, "WEBP", quality=quality, method=6)
        print(
            f"{source.relative_to(REPO)} -> {target.relative_to(REPO)} "
            f"({img.width}x{img.height}, "
            f"{source.stat().st_size // 1024}K -> {target.stat().st_size // 1024}K)"
        )
    return target


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sources", nargs="*", type=Path, help="images to convert")
    parser.add_argument("--all", action="store_true", help="convert every master in images/")
    parser.add_argument("--max-width", type=int, default=MAX_WIDTH)
    parser.add_argument("--quality", type=int, default=QUALITY)
    args = parser.parse_args()

    if args.all:
        sources = sorted(
            p for p in SOURCE_DIR.iterdir()
            if p.is_file() and p.suffix.lower() in SOURCE_SUFFIXES
        )
    else:
        sources = [p.resolve() for p in args.sources]

    if not sources:
        parser.error("pass one or more image paths, or --all")

    for source in sources:
        if not source.is_file():
            print(f"skipping missing file: {source}", file=sys.stderr)
            return 1
        convert(source, max_width=args.max_width, quality=args.quality)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
