"""Tests for dingtalk-requirement-inbox."""

import asyncio
import json
from pathlib import Path

from src.config import Settings
from src.dingtalk.incoming import extract_download_codes
from src.dingtalk.messages import fetch_conversation_messages
from src.dingtalk.notable import attachment_target_indices
from src.dingtalk.reply import build_quoted_message, has_quoted_reply
from src.dingtalk.robot_files import guess_image_type
from src.pipeline import build_trigger_message, is_trigger

FIXTURES = Path(__file__).parent / "fixtures"


def test_is_trigger():
    assert is_trigger({"isInAtList": True, "text": {"content": " @机器人 整理一下"}})
    assert not is_trigger({"isInAtList": False, "text": {"content": "整理"}})
    assert not is_trigger({"isInAtList": True, "text": {"content": "你好"}})


def test_build_trigger_message_picture():
    msg = build_trigger_message(
        {
            "msgId": "m1",
            "senderNick": "张三",
            "createAt": 1700000000000,
            "msgtype": "picture",
            "text": {"content": ""},
        }
    )
    assert msg["has_image"] is True
    assert msg["sender_name"] == "张三"


def test_is_trigger_richtext_with_image():
    incoming = {
        "isInAtList": True,
        "msgtype": "richText",
        "content": {
            "richText": [
                {"text": "创建有报错"},
                {"text": " @Trinity 需求助手 整理"},
                {"type": "picture", "downloadCode": "abc"},
            ]
        },
    }
    assert is_trigger(incoming)
    msg = build_trigger_message(incoming)
    assert "整理" in msg["text"]
    assert msg["has_image"] is True


def test_build_quoted_message_from_forward_summary():
    incoming = {
        "text": {
            "content": "整理",
            "repliedMsg": {
                "msgId": "quoted-forward",
                "msgType": "text",
                "content": {
                    "title": "吕超群和崔宇光的聊天记录",
                    "summary": "吕超群:会断流？\n吕超群:[图片]",
                },
            },
        }
    }
    quoted = build_quoted_message(incoming)
    assert quoted is not None
    assert "会断流" in quoted["text"]
    assert quoted["has_image"] is True


def test_build_quoted_message_from_reply():
    incoming = {
        "msgId": "trigger-1",
        "senderNick": "PM",
        "createAt": 1700000001000,
        "text": {
            "content": " @Trinity 整理",
            "repliedMsg": {
                "msgId": "quoted-1",
                "senderNick": "张三",
                "createdAt": 1700000000000,
                "msgType": "text",
                "content": {"text": "点成员管理没有反应"},
            },
        },
    }
    assert has_quoted_reply(incoming)
    quoted = build_quoted_message(incoming)
    assert quoted is not None
    assert quoted["text"] == "点成员管理没有反应"
    assert quoted["sender_name"] == "张三"


def test_fetch_conversation_messages_includes_quote():
    incoming = {
        "text": {
            "content": "整理",
            "repliedMsg": {
                "msgId": "quoted-1",
                "createdAt": 1700000000000,
                "msgType": "text",
                "content": {"text": "CC Switch 断流"},
            },
        }
    }
    trigger = build_trigger_message(
        {"msgId": "t1", "senderNick": "PM", "text": {"content": "整理"}}
    )

    messages = asyncio.run(
        fetch_conversation_messages(
            Settings(),
            conversation_id="cid-test",
            trigger_message=trigger,
            incoming=incoming,
        )
    )
    assert len(messages) == 2
    assert messages[0]["text"] == "CC Switch 断流"
    assert messages[1]["message_id"] == "t1"


def test_extract_download_codes_richtext():
    incoming = {
        "msgtype": "richText",
        "content": {
            "richText": [
                {"text": "创建有报错"},
                {"type": "picture", "downloadCode": "code-1"},
            ],
        },
    }
    assert extract_download_codes(incoming) == ["code-1"]


def test_attachment_target_indices_single_candidate():
    candidates = [{"has_screenshot": False, "type": "bug"}]
    assert attachment_target_indices(candidates, 1) == {0}


def test_attachment_target_indices_flagged_only():
    candidates = [
        {"has_screenshot": False, "type": "bug"},
        {"has_screenshot": True, "type": "bug"},
    ]
    assert attachment_target_indices(candidates, 1) == {1}


def test_guess_image_type_png():
    media_type, ext = guess_image_type(b"\x89PNG\r\n\x1a\n" + b"rest")
    assert media_type == "image/png"
    assert ext == ".png"


def test_codex_fixture():
    data = json.loads((FIXTURES / "codex-sample-messages.json").read_text(encoding="utf-8"))
    assert len(data["messages"]) >= 4
