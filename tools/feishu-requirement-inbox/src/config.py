"""Application configuration from environment variables."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    feishu_app_id: str = ""
    feishu_app_secret: str = ""
    feishu_verification_token: str = ""
    feishu_encrypt_key: str = ""
    feishu_allowed_chat_ids: str = ""

    bitable_app_token: str = ""
    bitable_table_id: str = ""

    trinity_base_url: str = "https://api.trinitydesk.ai/v1"
    trinity_api_key: str = ""
    llm_model: str = "deepseek-v3"

    message_limit: int = 50
    message_window_hours: int = 2

    host: str = "0.0.0.0"
    port: int = 8787
    log_level: str = "INFO"

    internal_dry_run_token: str = ""

    @property
    def prompt_path(self) -> Path:
        return ROOT_DIR / "prompt.md"

    @property
    def schema_path(self) -> Path:
        return ROOT_DIR / "schema.json"

    def allowed_chat_id_set(self) -> set[str]:
        if not self.feishu_allowed_chat_ids.strip():
            return set()
        return {
            item.strip()
            for item in self.feishu_allowed_chat_ids.split(",")
            if item.strip()
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
