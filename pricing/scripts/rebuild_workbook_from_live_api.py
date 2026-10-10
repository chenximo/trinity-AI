#!/usr/bin/env python3
"""现网 API → 商务洽谈折扣总表（本地，不上传 Admin）。

1. 每次强制拉取现网线路（不读、不保留本地缓存）
2. 调用 rebuild_discount_tier_workbook.py --from-export-*（折扣列自动分族）
3. 重建成功后删除 routes-live 下的临时 xlsx（禁止当作真源缓存）

环境变量：
  TRINITY_ADMIN_API_BASE  默认 https://trinityadm.trinitydesk.ai/api
  TRINITY_ADMIN_TOKEN     Admin JWT（优先）
  TRINITY_ADMIN_USER / TRINITY_ADMIN_PASSWORD  无 JWT 时自动登录

拉取失败即退出并**通知人工**（控制台横幅 + 可选钉钉），不再回退到旧文件。
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


def clear_live_exports(live_dir: Path, modalities: list[str] | None = None) -> None:
    """删除 routes-live 临时导出，避免下次误用旧折扣。"""
    mods = modalities or list(MODALITIES)
    for m in mods:
        path = live_dir / EXPORT_NAMES[m]
        if path.is_file():
            path.unlink()
            print(f"[live] removed ephemeral {path.name}")


def ensure_fetched(live_dir: Path, modalities: list[str]) -> None:
    """清掉旧导出后强制重拉；失败通知人工并退出，不回退。"""
    live_dir.mkdir(parents=True, exist_ok=True)
    clear_live_exports(live_dir, modalities)

    scripts_dir = Path(__file__).resolve().parent
    if str(scripts_dir) not in sys.path:
        sys.path.insert(0, str(scripts_dir))
    from fetch_live_supply_routes import write_exports  # noqa: WPS433
    from notify_human import abort_with_human_notify  # noqa: WPS433

    print(f"[live] 强制重拉（不使用缓存）: {modalities}")
    try:
        write_exports(live_dir, modalities)
    except SystemExit:
        raise
    except Exception as exc:  # noqa: BLE001
        abort_with_human_notify(stage="现网线路拉取", error=exc)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="现网线路 → 商务洽谈折扣总表（每次强制拉取，失败通知人工）"
    )
    parser.add_argument("--live-dir", type=Path, default=LIVE_DIR)
    parser.add_argument(
        "--modality",
        choices=["text", "image", "video", "all"],
        default="all",
        help="拉取哪些模态（默认 all；重建总表仍建议三模态齐全）",
    )
    parser.add_argument(
        "--keep-exports",
        action="store_true",
        help="重建后仍保留 routes-live/*.xlsx（默认删除，防误用旧缓存）",
    )
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    live_dir = args.live_dir.resolve()
    fetch_mods = list(MODALITIES) if args.modality == "all" else [args.modality]
    ensure_fetched(live_dir, fetch_mods)

    if args.modality == "all":
        missing = [m for m in MODALITIES if not (live_dir / EXPORT_NAMES[m]).is_file()]
        if missing:
            from notify_human import abort_with_human_notify  # noqa: WPS433

            abort_with_human_notify(
                stage="三模态导出校验",
                error="缺少: " + ", ".join(EXPORT_NAMES[m] for m in missing),
            )

    cmd = [sys.executable, str(REBUILD), "--out", str(args.out.resolve())]
    for m in MODALITIES:
        export_path = live_dir / EXPORT_NAMES[m]
        if export_path.is_file():
            cmd.extend([f"--from-export-{m}", str(export_path)])
        elif args.modality != "all" and m in fetch_mods:
            from notify_human import abort_with_human_notify  # noqa: WPS433

            abort_with_human_notify(stage=f"缺少导出 {m}", error=str(export_path))

    print("[run]", " ".join(cmd))
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        print("[live] 重建失败，保留本次导出便于排查；修好后请重跑（仍会先删再拉）")
        from notify_human import notify_human_fetch_failed  # noqa: WPS433

        notify_human_fetch_failed(
            stage="商务总表重建",
            error=exc,
            action="请人工查看 rebuild 日志；线路导出已保留在 routes-live",
        )
        raise

    if not args.keep_exports:
        clear_live_exports(live_dir)
        readme = live_dir / "README.md"
        readme.write_text(
            "# routes-live（临时落盘，不保留）\n\n"
            "本目录 **不是** 折扣真源缓存。\n\n"
            "`rebuild_workbook_from_live_api.py` 每次会：\n"
            "1. 删除旧的 `*-enabled.xlsx`\n"
            "2. 从 Admin 现网重拉\n"
            "3. 重建商务总表后再次删除导出文件\n\n"
            "拉取失败会通知人工（控制台 + 钉钉），**不**回退旧缓存。\n"
            "排查时若需保留本次导出，加 `--keep-exports`。\n",
            encoding="utf-8",
        )
        print(f"[live] 已清空临时导出；说明见 {readme}")


if __name__ == "__main__":
    main()
