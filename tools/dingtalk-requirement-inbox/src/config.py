"""Application configuration."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    dingtalk_client_id: str = ""
    dingtalk_client_secret: str = ""
    dingtalk_allowed_conversation_ids: str = ""

    notable_base_id: str = ""
    notable_sheet_name: str = ""
    notable_sheet_id: str = ""
    notable_operator_union_id: str = ""
    notable_owner_default_union_id: str = ""
    notable_owner_product_union_id: str = ""
    notable_team_renxiaolei_union_id: str = ""
    notable_doc_url: str = ""
    notable_attach_images_enabled: bool = True
    notable_screenshot_field: str = "图片和附件"

    trinity_base_url: str = "https://api.trinitydesk.ai/v1"
    trinity_api_key: str = ""
    llm_model: str = "deepseek-v3"
    llm_json_object: bool = True

    message_limit: int = 50
    message_window_hours: int = 2

    log_level: str = "INFO"
    api_port: int = 8788
    internal_dry_run_token: str = ""

    notable_write_enabled: bool = False
    chat_message_read_enabled: bool = False

    dedup_msg_id_enabled: bool = True
    dedup_db_path: str = ""
    dedup_retention_days: int = 30

    @property
    def prompt_path(self) -> Path:
        return ROOT_DIR / "prompt.md"

    @property
    def schema_path(self) -> Path:
        return ROOT_DIR / "schema.json"

    def allowed_conversation_id_set(self) -> set[str]:
        if not self.dingtalk_allowed_conversation_ids.strip():
            return set()
        return {
            item.strip()
            for item in self.dingtalk_allowed_conversation_ids.split(",")
            if item.strip()
        }

    def resolved_dedup_db_path(self) -> Path:
        if self.dedup_db_path.strip():
            return Path(self.dedup_db_path.strip())
        return ROOT_DIR / "data" / "processed.db"

    def resolved_notable_doc_url(self) -> str:
        if self.notable_doc_url.strip():
            return self.notable_doc_url.strip()
        if self.notable_base_id.strip():
            return f"https://alidocs.dingtalk.com/i/nodes/{self.notable_base_id.strip()}"
        return ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
