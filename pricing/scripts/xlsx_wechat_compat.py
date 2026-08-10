#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""微信 / 部分移动端预览兼容：补全 OOXML applyFill/applyFont/applyBorder。

openpyxl 3.x 写入 cellXfs 时常有 fillId/fontId/borderId，但不写 applyFill="1" 等。
桌面 Excel 多数仍上色；微信内置预览会忽略未 apply 的填充，看起来「没颜色」。
"""
from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path


def _patch_cellxfs_block(block: str) -> str:
    def fix_xf(m: re.Match) -> str:
        tag = m.group(0)
        open_end = tag.find(">")
        head = tag[: open_end + 1]
        rest = tag[open_end + 1 :]
        if not head.startswith("<xf "):
            return tag

        def get(name: str) -> int:
            mm = re.search(fr'{name}="(\d+)"', head)
            return int(mm.group(1)) if mm else 0

        additions: list[str] = []
        if get("fillId") and "applyFill=" not in head:
            additions.append('applyFill="1"')
        if get("fontId") and "applyFont=" not in head:
            additions.append('applyFont="1"')
        if get("borderId") and "applyBorder=" not in head:
            additions.append('applyBorder="1"')
        if not additions:
            return tag
        inject = " ".join(additions) + " "
        for anchor in (" applyAlignment=", " pivotButton=", " xfId="):
            if anchor in head:
                head = head.replace(anchor, " " + inject + anchor.lstrip(), 1)
                break
        else:
            if head.endswith("/>"):
                head = head[:-2] + " " + inject + "/>"
            elif head.endswith(">"):
                head = head[:-1] + " " + inject + ">"
        return head + rest

    return re.sub(r"<xf\b[^>]*?/>|<xf\b[^>]*>.*?</xf>", fix_xf, block, flags=re.S)


def patch_styles_xml(xml: str) -> str:
    return re.sub(
        r"<cellXfs\b[^>]*>.*?</cellXfs>",
        lambda m: _patch_cellxfs_block(m.group(0)),
        xml,
        flags=re.S,
    )


def patch_xlsx_for_wechat(path: Path | str) -> None:
    """原地改写 xlsx 的 xl/styles.xml，补 apply* 标志。"""
    path = Path(path)
    raw = path.read_bytes()
    zin = zipfile.ZipFile(io.BytesIO(raw), "r")
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "xl/styles.xml":
                data = patch_styles_xml(data.decode("utf-8")).encode("utf-8")
            # 保持原压缩信息外的文件名；统一 deflated 即可
            zout.writestr(item.filename, data)
    zin.close()
    path.write_bytes(out.getvalue())
