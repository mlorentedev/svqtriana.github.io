#!/usr/bin/env python3
"""Convert source images under images/ into optimized WebP under images/webp/.

The site serves every picture from images/webp/<name>.webp; images/ keeps the
original master. Run this after dropping a new master in images/ so the two
stay in sync instead of converting by hand each season.

    scripts/to-webp.py images/cartel-27.jpg
    scripts/to-webp.py --all

Requires Pillow: python3 -m pip install -r scripts/requirements.txt
"""

import argparse
import sys
from collections import defaultdict
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover - environment problem, not logic
    sys.exit(
        "Pillow is required: python3 -m pip install -r scripts/requirements.txt"
    )

REPO = Path(__file__).resolve().parent.parent
SOURCE_DIR = REPO / "images"
TARGET_DIR = SOURCE_DIR / "webp"
SOURCE_SUFFIXES = {".jpg", ".jpeg", ".png", ".gif"}

# Widest the site ever renders a picture; anything larger is dead bytes.
MAX_WIDTH = 1080
QUALITY = 82


def display(path: Path) -> str:
    """Path relative to the repo when it is inside it, absolute otherwise."""
    try:
        return str(path.relative_to(REPO))
    except ValueError:
        return str(path)


def target_for(source: Path) -> Path:
    return TARGET_DIR / f"{source.stem}.webp"


def positive_int(raw: str) -> int:
    value = int(raw)
    if value <= 0:
        raise argparse.ArgumentTypeError("must be greater than zero")
    return value


def check_collisions(sources: list[Path]) -> None:
    """Refuse before writing anything if two sources want the same target.

    images/ holds both video1.PNG and video1.jpg, and the target name comes from
    the stem alone - so a run would convert both into video1.webp and the last
    one would silently win. Fail up front rather than half-way through.
    """
    by_target: dict[Path, list[Path]] = defaultdict(list)
    for source in sources:
        by_target[target_for(source)].append(source)

    clashes = {t: s for t, s in by_target.items() if len(s) > 1}
    if not clashes:
        return

    lines = ["refusing to convert: several sources map to the same target"]
    for target, group in sorted(clashes.items()):
        names = ", ".join(display(s) for s in sorted(group))
        lines.append(f"  {display(target)} <- {names}")
    lines.append("Rename one of them, or pass the single source you meant.")
    sys.exit("\n".join(lines))


def convert(source: Path, *, max_width: int, quality: int) -> Path:
    target = target_for(source)
    with Image.open(source) as img:
        # Flattening to RGB would fill the transparent parts of the site's PNG
        # icons with black; WebP carries alpha, so keep it when it is there.
        has_alpha = img.mode in ("RGBA", "LA", "PA") or "transparency" in img.info
        img = img.convert("RGBA" if has_alpha else "RGB")

        if img.width > max_width:
            height = round(img.height * max_width / img.width)
            img = img.resize((max_width, height), Image.LANCZOS)

        TARGET_DIR.mkdir(parents=True, exist_ok=True)
        img.save(target, "WEBP", quality=quality, method=6)

        print(
            f"{display(source)} -> {display(target)} "
            f"({img.width}x{img.height}{', alpha' if has_alpha else ''}, "
            f"{source.stat().st_size // 1024}K -> {target.stat().st_size // 1024}K)"
        )
    return target


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sources", nargs="*", type=Path, help="images to convert")
    parser.add_argument("--all", action="store_true", help="convert every master in images/")
    parser.add_argument("--max-width", type=positive_int, default=MAX_WIDTH)
    parser.add_argument("--quality", type=positive_int, default=QUALITY)
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

    missing = [s for s in sources if not s.is_file()]
    if missing:
        for s in missing:
            print(f"no such file: {display(s)}", file=sys.stderr)
        return 1

    check_collisions(sources)

    for source in sources:
        convert(source, max_width=args.max_width, quality=args.quality)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
