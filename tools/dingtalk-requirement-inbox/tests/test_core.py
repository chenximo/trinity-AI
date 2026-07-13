"""Tests for dingtalk-requirement-inbox."""

import asyncio
import json
from pathlib import Path

from src.config import Settings
from src.dedup import ProcessedMessageStore, dedupe_candidates_by_title
from src.dingtalk.incoming import extract_download_codes
from src.dingtalk.messages import fetch_conversation_messages
from src.dingtalk.notable import (
    attachment_target_indices,
    build_notable_fields,
    normalize_reporter,
    resolve_owner_name,
)
from src.dingtalk.reply import build_quoted_message, extract_replied_download_codes, has_quoted_reply
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


def test_build_quoted_message_from_reply_richtext():
    """DingTalk repliedMsg may use content.richText with msgType (not type)."""
    incoming = {
        "text": {
            "content": "整理",
            "repliedMsg": {
                "msgId": "quoted-rt",
                "senderNick": "测试",
                "createdAt": 1700000000000,
                "content": {
                    "richText": [
                        {"msgType": "picture", "downloadCode": "pic-code-1"},
                        {"msgType": "text", "content": "已经通过的用户没有地方能到官网登录"},
                    ]
                },
            },
        }
    }
    quoted = build_quoted_message(incoming)
    assert quoted is not None
    assert "官网登录" in quoted["text"]
    assert quoted["has_image"] is True

    async def _run():
        trigger = build_trigger_message({"msgId": "t1", "senderNick": "PM", "text": {"content": "整理"}})
        return await fetch_conversation_messages(
            Settings(),
            conversation_id="cid",
            trigger_message=trigger,
            incoming=incoming,
        )

    msgs = asyncio.run(_run())
    assert len(msgs) == 2
    assert "官网登录" in msgs[0]["text"]


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


def test_extract_replied_download_codes_richtext():
    incoming = {
        "text": {
            "content": "整理",
            "repliedMsg": {
                "content": {
                    "richText": [
                        {"msgType": "picture", "downloadCode": "code-from-reply"},
                        {"msgType": "text", "content": "有图"},
                    ]
                }
            },
        }
    }
    assert extract_replied_download_codes(incoming) == ["code-from-reply"]
    assert extract_download_codes(incoming) == []


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


def test_build_notable_fields_pm_columns():
    settings = Settings(
        notable_owner_default_union_id="cui-uid",
        notable_owner_product_union_id="li-uid",
        notable_team_renxiaolei_union_id="ren-uid",
    )
    fields = build_notable_fields(
        batch_id="20260709-1630-abcd",
        session_summary="讨论断流问题",
        candidate={
            "type": "optimization",
            "title": "CC Switch 断流",
            "summary": "切换后流中断，复现于 Safari",
            "module_suggestion": "用户侧",
            "reporter": "任晓雷",
        },
        attachments=[],
        screenshot_field="图片和附件",
        settings=settings,
    )
    assert fields["类型"] == "优化"
    assert fields["标题"] == "CC Switch 断流"
    assert fields["问题描述"] == [{"type": "text", "text": "切换后流中断，复现于 Safari"}]
    assert fields["处理进度"] == "待确认"
    assert fields["优先级"] == "P2"
    assert fields["负责人"] == "崔宇光"
    assert fields["发现者"] == [{"unionId": "ren-uid"}]
    assert fields["创建时间"]
    assert "群 ID" not in fields


def test_build_notable_fields_type_labels():
    settings = Settings()
    for raw, label, priority in [
        ("bug", "Bug", "P0"),
        ("feature", "需求", "P1"),
        ("optimization", "优化", "P2"),
    ]:
        fields = build_notable_fields(
            batch_id="b1",
            session_summary="s",
            candidate={"type": raw, "title": "t", "summary": "d"},
            attachments=[],
            screenshot_field="图片和附件",
            settings=settings,
        )
        assert fields["类型"] == label
        assert fields["优先级"] == priority


def test_normalize_reporter_known_names():
    assert normalize_reporter("李玲") == "李玲"
    assert normalize_reporter("PM李玲") == "李玲"


def test_resolve_owner_name():
    assert resolve_owner_name("bug") == "崔宇光"
    assert resolve_owner_name("feature") == "李玲"
    assert resolve_owner_name("optimization") == "崔宇光"


def test_build_notable_fields_owner():
    settings = Settings(notable_owner_product_union_id="product-uid")
    fields = build_notable_fields(
        batch_id="b1",
        session_summary="s",
        candidate={"type": "feature", "title": "t", "summary": "d", "reporter": "李玲"},
        attachments=[],
        screenshot_field="图片和附件",
        settings=settings,
    )
    assert fields["负责人"] == "李玲"
    assert fields["发现者"] == [{"unionId": "product-uid"}]


def test_codex_fixture():
    data = json.loads((FIXTURES / "codex-sample-messages.json").read_text(encoding="utf-8"))
    assert len(data["messages"]) >= 4


def test_dedupe_candidates_by_title():
    candidates = [
        {"title": "登录失败", "type": "bug"},
        {"title": "登录失败", "type": "bug"},
        {"title": "页面慢", "type": "optimization"},
    ]
    kept, skipped = dedupe_candidates_by_title(candidates)
    assert len(kept) == 2
    assert skipped == ["登录失败"]


def test_processed_message_store(tmp_path):
    db_path = tmp_path / "processed.db"
    store = ProcessedMessageStore(db_path, retention_days=30)
    assert not store.is_processed("msg-1")
    store.mark_processed("msg-1", "batch-a")
    assert store.is_processed("msg-1")
    assert not store.is_processed("msg-2")
