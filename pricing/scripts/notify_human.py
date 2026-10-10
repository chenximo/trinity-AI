#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""拉取 Admin / 现网失败时通知人工。

主通道：Agent 在**当前对话框中断**，把横幅内容原样告知用户并停手。
附加：控制台 stderr 横幅；可选钉钉（配置了才推）。

环境变量（与价目巡检共用）：
  PRICING_ALERT_WEBHOOK_URL
  PRICING_ALERT_DINGTALK_KEYWORD  （钉钉自定义关键词，正文须包含）
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone


BANNER = """
════════════════════════════════════════════════════════
【需人工处理】Admin / 现网线路拉取失败 —— 已停止，不回退缓存
【Agent】请立刻在对话框打断用户，复述本横幅；勿只依赖钉钉
════════════════════════════════════════════════════════
"""

def _classify_error(exc: BaseException | str) -> str:
    text = str(exc)
    low = text.lower()
    if any(
        k in low
        for k in (
            "403",
            "tunnel",
            "proxy",
            "enotfound",
            "getaddrinfo",
            "nodename",
            "network is unreachable",
            "connection refused",
            "timed out",
            "timeout",
            "ssl",
        )
    ):
        return "网络/代理拦截（常见：Cursor sandbox 代理 403、DNS 失败）"
    if "401" in text or "jwt" in low or "登录" in text:
        return "鉴权失败（Token 过期或账号密码无效）"
    return "Admin API 调用失败"


def _dingtalk_keyword() -> str:
    return (os.environ.get("PRICING_ALERT_DINGTALK_KEYWORD") or "").strip()


def _webhook_url() -> str:
    return (os.environ.get("PRICING_ALERT_WEBHOOK_URL") or "").strip()


def _post_dingtalk(title: str, markdown: str) -> str:
    """成功返回 ok；失败返回原因（不抛）。"""
    url = _webhook_url()
    if not url:
        return "未配置 PRICING_ALERT_WEBHOOK_URL，跳过钉钉"
    kw = _dingtalk_keyword()
    text = markdown if (not kw or kw in markdown) else f"{kw}\n\n{markdown}"
    title_out = title if (not kw or kw in title) else f"{kw} · {title}"
    if "oapi.dingtalk.com" in url and not kw:
        return "钉钉需 PRICING_ALERT_DINGTALK_KEYWORD，跳过推送"
    payload = {
        "msgtype": "markdown",
        "markdown": {"title": title_out, "text": text},
    }
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    curl = shutil.which("curl")
    try:
        if curl:
            proc = subprocess.run(
                [
                    curl,
                    "-sS",
                    "-X",
                    "POST",
                    url,
                    "-H",
                    "Content-Type: application/json",
                    "--data-binary",
                    body,
                    "--max-time",
                    "20",
                ],
                capture_output=True,
                check=False,
            )
            raw = (proc.stdout or b"").decode("utf-8", errors="replace")
            if proc.returncode != 0:
                err = (proc.stderr or b"").decode("utf-8", errors="replace")[:200]
                return f"curl 失败: {err}"
        else:
            req = urllib.request.Request(
                url,
                data=body,
                method="POST",
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
        data = json.loads(raw) if raw.strip().startswith("{") else {}
        if isinstance(data, dict) and data.get("errcode") not in (None, 0):
            return f"钉钉 errcode={data.get('errcode')} {data.get('errmsg')}"
        return "ok"
    except Exception as exc:  # noqa: BLE001
        return f"推送异常: {exc}"


def format_chat_interrupt(
    *,
    stage: str,
    error: BaseException | str,
    action: str = "请在本机终端重跑（勿用旧 routes-live 缓存），或检查 VPN/代理/Admin 账号",
) -> str:
    """给 Agent 直接贴进对话框的打断文案（主通知通道）。"""
    kind = _classify_error(error)
    now = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    detail = str(error).strip()[:800]
    return "\n".join(
        [
            "【需人工处理 · 已中断】Admin / 现网线路拉不下，报价流水线已停，未用旧缓存。",
            f"- 时间：{now}",
            f"- 阶段：{stage}",
            f"- 类型：{kind}",
            f"- 详情：{detail}",
            f"- 请你：{action}",
        ]
    )


def notify_human_fetch_failed(
    *,
    stage: str,
    error: BaseException | str,
    action: str = "请在本机终端重跑（勿用旧 routes-live 缓存），或检查 VPN/代理/Admin 账号",
) -> str:
    """打印人工横幅；尽量推钉钉。返回对话框打断文案（调用方/Agent 应展示）。"""
    kind = _classify_error(error)
    now = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    detail = str(error).strip()[:800]
    chat = format_chat_interrupt(stage=stage, error=error, action=action)
    print(BANNER, file=sys.stderr)
    print(f"时间：{now}", file=sys.stderr)
    print(f"阶段：{stage}", file=sys.stderr)
    print(f"类型：{kind}", file=sys.stderr)
    print(f"详情：{detail}", file=sys.stderr)
    print(f"请人工：{action}", file=sys.stderr)
    print(
        "════════════════════════════════════════════════════════\n",
        file=sys.stderr,
    )
    # 也打到 stdout，方便 Agent 从命令输出里直接抄进对话
    print(chat)
    print("CHAT_INTERRUPT_MARKER", flush=True)

    title = "模型价格 · 需人工：Admin 线路拉取失败"
    md = "\n".join(
        [
            f"### {title}",
            "",
            f"- **时间**：{now}",
            f"- **阶段**：{stage}",
            f"- **类型**：{kind}",
            f"- **详情**：`{detail[:400]}`",
            f"- **请人工**：{action}",
            "",
            "脚本已停止，**未**回退旧线路缓存。主通知：对话中断；钉钉为附加。",
        ]
    )
    result = _post_dingtalk(title, md)
    if result == "ok":
        print("[notify] 已推送钉钉（附加）", file=sys.stderr)
    else:
        print(
            f"[notify] 钉钉未推送（{result}）；主通道是对话框中断，请 Agent 告知用户",
            file=sys.stderr,
        )
    return chat


def abort_with_human_notify(
    *,
    stage: str,
    error: BaseException | str,
    exit_code: int = 2,
) -> None:
    notify_human_fetch_failed(stage=stage, error=error)
    raise SystemExit(exit_code)
