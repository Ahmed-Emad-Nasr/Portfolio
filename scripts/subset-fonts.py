#!/usr/bin/env python3
"""
scripts/subset-fonts.py — rebuild the two Japanese-capable display fonts.

Dela Gothic One and Yuji Syuku ship as ~5 MB Japanese fonts. Through
@fontsource they cost five render-blocking stylesheets of ~100 KB of
@font-face rules each, plus 30+ glyph-chunk downloads per page. The site only
ever shows Latin text and the ~190 kanji/kana written in its own source, so
this script cuts each font down to exactly that and writes small woff2 files
to app/fonts/, which app/fonts.css loads.

Run it again whenever new Japanese text is added anywhere under app/:

    npm pack @expo-google-fonts/dela-gothic-one @expo-google-fonts/yuji-syuku
    (extract both .tgz files, then)
    pip install fonttools brotli
    python3 scripts/subset-fonts.py <path/to/DelaGothicOne_400Regular.ttf> <path/to/YujiSyuku_400Regular.ttf>
"""

import pathlib
import re
import sys

from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "app"
OUT = APP / "fonts"


def used_cjk() -> str:
    chars = set()
    for f in APP.rglob("*.ts*"):
        text = f.read_text(encoding="utf8")
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
        for c in text:
            # Kana, kanji and CJK punctuation (emoji flags are left to the system font)
            if 0x3000 <= ord(c) <= 0x9FFF or 0xFF00 <= ord(c) <= 0xFFEF:
                chars.add(c)
    return "".join(sorted(chars))


# Latin, Latin-1, general punctuation and arrows: everything the English text can contain
LATIN = "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2190-21FF,U+2212"


# Yuji Syuku is the brush font: on this site it only ever sets Japanese (the
# kanji watermarks, the brush captions) plus the separators between words.
# Its Latin glyphs are heavy brush strokes nobody sees, so they are left out.
BRUSH_EXTRA = "U+0020,U+00B7,U+2013-2014,U+2022"


def build(src: str, name: str, cjk: str, extra: str = LATIN) -> None:
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(src, opts)
    sub = subset.Subsetter(opts)
    unicodes = subset.parse_unicodes(extra) + [ord(c) for c in cjk]
    sub.populate(unicodes=unicodes)
    sub.subset(font)
    out = OUT / f"{name}.woff2"
    subset.save_font(font, str(out), opts)
    print(f"{out.relative_to(ROOT)}  {out.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    OUT.mkdir(exist_ok=True)
    cjk = used_cjk()
    print(f"{len(cjk)} Japanese characters in use")
    build(sys.argv[1], "dela-gothic-one", cjk)
    build(sys.argv[2], "yuji-syuku", cjk, BRUSH_EXTRA)
