# Multimodal overview

## Trinity multimodal API overview

Trinity provides **image and video input** (model understanding) and **generation** over a unified HTTP API. Pick the path and Part types for your scenario—do not mix them up.

| Scenario | Endpoint | Notes |
| --- | --- | --- |
| Image / video **input** (understanding) | `POST /v1/chat/completions` | Parts such as `image_url`, `file` in `messages[].content` |
| **Image generation** | `POST /v1/chat/completions` | `modalities` + `image_config` |
| **Video generation** | `POST /v1/video/generations` | Async task + `GET /video/tasks/{taskId}` |

Set **`model`** to an ID from [List models](../api/models.md) or the [model catalog](https://trinity.ai/models).

## Guides

| Topic | Guide |
| --- | --- |
| Image input | [Image input](./image-input) |
| Image generation | [Image generation](./image-generation) |
| Video input | [Video input](./video-input) |
| Video generation | [Video generation](./video-generation) |
