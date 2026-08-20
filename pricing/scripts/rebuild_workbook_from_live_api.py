#!/usr/bin/env python3
"""现网 API → 商务洽谈折扣总表（本地，不上传 Admin）。

1. 拉取线路导出到 pricing/input/routes-live/
2. 调用 rebuild_discount_tier_workbook.py --from-export-*（折扣列自动分族）

环境变量：
  TRINITY_ADMIN_API_BASE  默认 https://trinityadm.trinitydesk.ai/api
  TRINITY_ADMIN_TOKEN     Admin JWT（优先）
  TRINITY_ADMIN_USER / TRINITY_ADMIN_PASSWORD  无 JWT 时自动登录

默认会重新拉取现网（即使用本地缓存已有）；`--skip-fetch` 才只用缓存。
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIVE_DIR = ROOT / "input" / "routes-live"
REBUILD = (
    ROOT.parent
    / "apps/trinity-product/docs/ai-api-platform/commercial-billing/scripts"
    / "rebuild_discount_tier_workbook.py"
)
DEFAULT_OUT = ROOT / "output" / "商务洽谈折扣总表.xlsx"

MODALITIES = ("text", "image", "video")
EXPORT_NAMES = {m: f"{m}-enabled.xlsx" for m in MODALITIES}


def ensure_fetched(live_dir: Path, modalities: list[str], skip_fetch: bool) -> None:
    if skip_fetch:
        missing = [m for m in modalities if not (live_dir / EXPORT_NAMES[m]).is_file()]
        if missing:
            raise SystemExit(
                f"缺少缓存且已 --skip-fetch: {[EXPORT_NAMES[m] for m in missing]}"
            )
        print(f"[live] skip-fetch，使用缓存: {live_dir}")
        return

    scripts_dir = Path(__file__).resolve().parent
    if str(scripts_dir) not in sys.path:
        sys.path.insert(0, str(scripts_dir))
    from fetch_live_supply_routes import write_exports  # noqa: WPS433

    print(f"[live] 强制重拉: {modalities}")
    write_exports(live_dir, modalities)


def main() -> None:
    parser = argparse.ArgumentParser(description="现网线路 → 商务洽谈折扣总表（方案1·自动分族）")
    parser.add_argument("--live-dir", type=Path, default=LIVE_DIR)
    parser.add_argument(
        "--modality",
        choices=["text", "image", "video", "all"],
        default="all",
        help="拉取哪些模态（默认 all；重建总表仍建议三模态齐全）",
    )
    parser.add_argument(
        "--skip-fetch",
        action="store_true",
        help="不拉 API，仅用 live-dir 缓存（默认会重拉现网）",
    )
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    live_dir = args.live_dir.resolve()
    fetch_mods = list(MODALITIES) if args.modality == "all" else [args.modality]
    ensure_fetched(live_dir, fetch_mods, args.skip_fetch)

    if args.modality == "all":
        missing = [m for m in MODALITIES if not (live_dir / EXPORT_NAMES[m]).is_file()]
        if missing:
            raise SystemExit(
                "三模态导出不齐，无法生成完整商务总表："
                + ", ".join(EXPORT_NAMES[m] for m in missing)
                + "\n请设置 TRINITY_ADMIN_TOKEN 或 USER/PASSWORD 后重跑"
            )

    cmd = [sys.executable, str(REBUILD), "--out", str(args.out.resolve())]
    for m in MODALITIES:
        export_path = live_dir / EXPORT_NAMES[m]
        if export_path.is_file():
            cmd.extend([f"--from-export-{m}", str(export_path)])
        elif args.modality != "all" and m in fetch_mods:
            raise SystemExit(f"缺少 {export_path}")

    print("[run]", " ".join(cmd))
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
