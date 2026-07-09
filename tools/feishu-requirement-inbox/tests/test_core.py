"""Tests for feishu-requirement-inbox."""

import json
from pathlib import Path

import pytest

from src.config import ROOT_DIR
from src.feishu.client import FeishuClient
from src.llm.extract import LlmExtractor
from src.pipeline import make_batch_id

FIXTURES = Path(__file__).parent / "fixtures"


def test_make_batch_id_format():
    batch_id = make_batch_id()
    parts = batch_id.split("-")
    assert len(parts) == 3
    assert len(parts[0]) == 8
    assert len(parts[1]) == 4


def test_trigger_message_detection():
    client = FeishuClient.__new__(FeishuClient)
    content = json.dumps({"text": "@_user_1 整理一下刚才的讨论"})
    assert client.is_trigger_message(
        message_type="text",
        content_json=content,
        mentions=[{"id": {"open_id": "ou_bot"}}],
    )
    assert not client.is_trigger_message(
        message_type="text",
        content_json=content,
        mentions=[],
    )
    assert not client.is_trigger_message(
        message_type="text",
        content_json=json.dumps({"text": "大家好"}),
        mentions=[{"id": {"open_id": "ou_bot"}}],
    )


def test_schema_file_exists():
    schema_path = ROOT_DIR / "schema.json"
    assert schema_path.exists()
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    assert "candidates" in schema["properties"]


def test_prompt_file_exists():
    prompt_path = ROOT_DIR / "prompt.md"
    text = prompt_path.read_text(encoding="utf-8")
    assert "session_summary" in text
    assert "noise" in text


def test_parse_json_with_markdown_fence():
    content = """```json
{"session_summary": "test", "candidates": []}
```"""
    parsed = LlmExtractor._parse_json_content(content)
    assert parsed["session_summary"] == "test"


def test_codex_fixture_structure():
    data = json.loads((FIXTURES / "codex-sample-messages.json").read_text(encoding="utf-8"))
    messages = data["messages"]
    assert len(messages) >= 4
    assert any("断流" in m["text"] for m in messages)
