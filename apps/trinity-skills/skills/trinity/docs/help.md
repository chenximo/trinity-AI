# Help & Reference

Single entry for Trinity Skill questions. Read this file, then answer from the sections below.

**Reply in the same language as the user** (简体中文 or English). Internal Chinese-only skill docs live in `skills/trinity-zh/`.

---

## Type 1: Skill usage

Users may ask in Chinese, e.g. 「Trinity 是什么」「怎么列模型」「CONFIG_MISSING 怎么办」.

### What is Trinity?

[Trinity](https://trinitydesk.ai/) is an AI API aggregation platform. Applications use an OpenAI-compatible gateway (`https://api.trinitydesk.ai/v1`) with `xh-` API keys.

This skill lets you list models and (in later phases) manage keys from the IDE without pasting secrets into the chat.

Official docs: [doc.trinitydesk.ai](https://doc.trinitydesk.ai/quickstart?lang=zh)

### FAQ

**Q: Why can't I see my full `xh-` key in the chat?**  
A: Security. Never display raw keys. P2 will add `copy-key` / `apply-key` like newapi Skill.

**Q: Where do I get `TRINITY_API_KEY`?**  
A: [Trinity console → API keys](https://trinitydesk.ai/account/keys). Create a key starting with `xh-`.

**Q: What is `TRINITY_BASE_URL`?**  
A: Gateway root, default `https://api.trinitydesk.ai/v1` (no trailing slash). Same as Cursor "Override OpenAI Base URL".

**Q: I get `[CONFIG_MISSING]` — what now?**  
A: Export:

```bash
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
export TRINITY_API_KEY="xh-..."
```

**Q: How do I list image or video models?**  
A: Use modality on the list API — see `docs/actions-query.md`: `GET /models?modality=image|video|text|all`. Default `GET /models` is **text only**.

**Q: `/trinity models` shows no price, or I need “cheapest” models?**  
A: P0 lists IDs (+ basic `metadata`). **Do not** rank by price from the list response. Price sort/filter needs a dedicated API (P1). Use [model catalog](https://trinity.ai/models) until then.

**Q: How do I install or update this skill?**  
A: `npx skills add <org>/trinity-skills --skill trinity`

**Q: Can the AI call the API with curl?**  
A: No. Use `scripts/gateway.cjs` only.

---

## Type 2: Trinity API / product questions

For HTTP formats, Cookbook tools (Cursor, Claude Code, etc.), and billing:

1. Start at [doc.trinitydesk.ai](https://doc.trinitydesk.ai/quickstart?lang=zh)
2. [Cookbook](https://doc.trinitydesk.ai/cookbook/) for IDE-specific setup
3. [Model gallery](https://trinitydesk.ai/models) for browsing models on the web

P1 may add `llms.txt` fetch for automated doc lookup.
