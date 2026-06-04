# Multimodal overview

Trinity supports **image and video** multimodal input and generation through a unified API surface.

::: info
Set **`model`** to a **model ID** from the [model catalog](https://trinity.ai/models). For multimodal **input**, send Parts in the `messages[].content` array on `POST /v1/chat/completions` (for example `image_url`, `file`)—compatible with the OpenAI-style structure. For **image output**, use the same path with `modalities` and `image_config` (see [Image generation](./image-generation.md)). For **video output**, use the async `POST /v1/video/generations` flow (see [Video generation](./video-generation.md)).
:::

## Guides

| Topic | Guide |
| --- | --- |
| Image input | [Image input](./image-input) |
| Image generation | [Image generation](./image-generation) |
| Video input | [Video input](./video-input) |
| Video generation | [Video generation](./video-generation) |
