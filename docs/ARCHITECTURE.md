# 架构说明 / Architecture

## 请求路径 / Request path

```text
浏览器 / Browser
  ImageUploader -> base64 data URL in page state
  PromptInput -> prompt + negative prompt + count
       |
       v
  Supabase JS client -> generate-pattern Edge Function
       |
       v
  Supabase Edge Function -> Lovable AI Gateway -> image model
       |
       v
  image response -> page results state -> ResultGallery
```

## 前端 / Frontend

- `src/pages/Index.tsx` 组合上传区、提示词表单和结果画廊，维护本页图片与结果状态。
- `src/components/ImageUploader.tsx` 使用 `FileReader.readAsDataURL` 读取图片；页面将 Base64 data URL 保存在 React state 中。
- 生成处理逐个调用 `supabase.functions.invoke('generate-pattern', ...)`，请求体包含 `prompt`、`negativePrompt`、`imageBase64` 和 `variationSeed`。
- `src/integrations/supabase/client.ts` 使用 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_PUBLISHABLE_KEY` 初始化客户端，并将 Supabase Auth 会话持久化到浏览器 `localStorage`。
- 结果以 Base64 图片、提示词和时间戳保存在组件 state；刷新页面后没有项目级结果恢复机制。

- `src/pages/Index.tsx` composes the upload area, prompt form, and results gallery and owns page-level image/result state.
- `src/components/ImageUploader.tsx` reads images with `FileReader.readAsDataURL`; the Base64 data URL is held in React state.
- Generation invokes `supabase.functions.invoke('generate-pattern', ...)` sequentially with `prompt`, `negativePrompt`, `imageBase64`, and `variationSeed`.
- `src/integrations/supabase/client.ts` initializes the client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, and persists Supabase Auth session state in browser `localStorage`.
- Results (Base64 image, prompt, and timestamp) live in component state; there is no project-level result recovery after a page refresh.

## Edge Function / 边缘函数

`supabase/functions/generate-pattern/index.ts` 负责检查必要输入、组合基础/负向/变化提示词、从 `LOVABLE_API_KEY` 读取后端凭据，并把文字和参考图发往 `https://ai.gateway.lovable.dev/v1/chat/completions`。它会处理限流和额度错误，并从网关响应中提取生成图片。

`supabase/functions/generate-pattern/index.ts` checks required inputs, composes the base/negative/variation prompt, reads its backend credential from `LOVABLE_API_KEY`, and sends the text and reference image to `https://ai.gateway.lovable.dev/v1/chat/completions`. It handles rate-limit/credit errors and extracts the generated image from the gateway response.

函数源码记录 `google/gemini-3-pro-image-preview` 作为模型 ID；目标服务、模型可用性和行为由部署环境决定，本仓库不托管或验证这些服务。

The function source specifies `google/gemini-3-pro-image-preview` as its model ID. Availability and behavior depend on the deployed services; this repository does not host or verify them.

## 配置说明 / Configuration notes

`.env.example` 列出三个变量。当前前端 Supabase client 直接读取 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`；`VITE_SUPABASE_PROJECT_ID` 在应用源码中没有被直接读取。`PatternGenerator.tsx` 是另一个组件文件，引用旧变量 `VITE_SUPABASE_ANON_KEY`；主页面 `Index.tsx` 使用的是共享 Supabase client。

`.env.example` lists three variables. The current frontend Supabase client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; application source does not directly read `VITE_SUPABASE_PROJECT_ID`. `PatternGenerator.tsx` is a separate component file that references the older `VITE_SUPABASE_ANON_KEY`; the primary `Index.tsx` page uses the shared Supabase client.
