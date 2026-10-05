#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 Minecraft 原版按钮贴图提取 9-slice 精灵图。

原版按钮是一张 3px 边框 + 纯色拉伸中部的图（中间带抖动噪点）。
本脚本从任一尺寸的原始贴图（默认取 200×20 的 button.png）中，
抽取 4 个 3×3 角、4 条 3px 边和 1px 中线，拼成 7×7 精灵图：

        col: 0 1 2   3   4 5 6
    row 0   ┌───┬───────┬───┐   slice = 3
    row 1   │ TL│  边   │TR │   角/边 1:1，边与中心按需拉伸
    row 2   ├───┼───────┼───┤
    row 3   │   │ 中心  │   │
    row 4   ├───┼───────┼───┤
    row 5   │ BL│  边   │BR │
    row 6   └───┴───────┴───┘

用法:
    python3 tools/mkslice.py            # 在 assets/button/ 内生成 button_9s*.png
依赖:
    pip install pillow

注: 覆盖所有按钮尺寸只需各状态一张原图（20×20 / 71×20 / … 均可，
    边框与角完全一致）。原始按尺寸切分的贴图可从 Minecraft 资源包获取。
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BUTTON_DIR = os.path.join(HERE, os.pardir, "assets", "button")

SLICE = 3          # 边框宽度（像素）
JOBS = [
    ("button.png",            "button_9s.png"),
    ("button_highlighted.png", "button_9s_highlighted.png"),
    ("button_disabled.png",    "button_9s_disabled.png"),
]


def make_slice(src_name, dst_name):
    src = os.path.join(BUTTON_DIR, src_name)
    if not os.path.exists(src):
        print("skip (missing source): %s" % src_name)
        return False
    im = Image.open(src).convert("L")
    px = im.load()
    w, h = im.size
    if w < 2 * SLICE + 1 or h < 2 * SLICE + 1:
        print("skip (too small): %s (%dx%d)" % (src_name, w, h))
        return False

    cols = list(range(SLICE)) + [w // 2] + list(range(w - SLICE, w))
    rows = list(range(SLICE)) + [h // 2] + list(range(h - SLICE, h))

    out = Image.new("L", (len(cols), len(rows)))
    for j, y in enumerate(rows):
        for i, x in enumerate(cols):
            out.putpixel((i, j), px[x, y])

    dst = os.path.join(BUTTON_DIR, dst_name)
    out.save(dst, optimize=True)
    print("generated %-28s %s  %d B" % (dst_name, out.size, os.path.getsize(dst)))
    return True


def main():
    ok = 0
    for s, d in JOBS:
        ok += make_slice(s, d)
    if not ok:
        print("nothing generated: put original 200x20 textures into assets/button/")
        sys.exit(1)


if __name__ == "__main__":
    main()
