# routes-live · 2026-08-28

来源：`GET /v1/admin/model-supply-routes/export?enabled=true&modalityType=<text|image|video>`
API: `https://trinityadm.trinitydesk.ai/api`

鉴权：`TRINITY_ADMIN_TOKEN` 或 `TRINITY_ADMIN_USER`+`TRINITY_ADMIN_PASSWORD`

重建商务总表：
```bash
python3 pricing/scripts/rebuild_workbook_from_live_api.py
# 或已有 xlsx：
python3 apps/trinity-product/docs/ai-api-platform/commercial-billing/scripts/rebuild_discount_tier_workbook.py \
  --from-export-text pricing/input/routes-live/text-enabled.xlsx \
  --from-export-image pricing/input/routes-live/image-enabled.xlsx \
  --from-export-video pricing/input/routes-live/video-enabled.xlsx
```
