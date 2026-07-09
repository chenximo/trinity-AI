"""LLM extraction via Trinity OpenAI-compatible API."""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

from src.config import Settings


class LlmExtractor:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._system_prompt = settings.prompt_path.read_text(encoding="utf-8")

    async def extract(self, messages: list[dict[str, Any]]) -> dict[str, Any]:
        if not self.settings.trinity_api_key:
            raise RuntimeError("TRINITY_API_KEY is not configured")

        user_content = json.dumps(messages, ensure_ascii=False, indent=2)
        payload = {
            "model": self.settings.llm_model,
            "messages": [
                {"role": "system", "content": self._system_prompt},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.2,
        }
        if self.settings.llm_json_object:
            payload["response_format"] = {"type": "json_object"}

        url = self.settings.trinity_base_url.rstrip("/") + "/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.settings.trinity_api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        content = data["choices"][0]["message"]["content"]
        parsed = self._parse_json_content(content)
        self._validate_extraction(parsed)
        return parsed

    @staticmethod
    def _parse_json_content(content: str) -> dict[str, Any]:
        text = content.strip()
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if fence_match:
            text = fence_match.group(1).strip()
        return json.loads(text)

    @staticmethod
    def _validate_extraction(data: dict[str, Any]) -> None:
        if "session_summary" not in data or "candidates" not in data:
            raise ValueError("LLM output missing session_summary or candidates")
        if not isinstance(data["candidates"], list):
            raise ValueError("candidates must be a list")
