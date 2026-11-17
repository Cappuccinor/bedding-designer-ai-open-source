# 床品花型 AI 设计器 / Bedding Designer AI

**上传床品参考图，以文字提示探索床品面料花型方案的 Web 原型。**

**A web prototype for exploring bedding fabric patterns from a reference image and text prompts.**

此仓库是从私有项目 `main`（源提交 `b32018a`，2026-01-20）整理的脱敏源码快照，具有独立的公开 Git 历史。它包含 React 前端和 Supabase Edge Function 源码，不包含原项目 `.env`、已配置的 Supabase 项目、Lovable AI 凭据或服务额度。

This is a sanitized source snapshot from the private project `main` (source revision `b32018a`, 2026-01-20), published with a clean Git history. It contains the React frontend and Supabase Edge Function source, but no original `.env`, configured Supabase project, Lovable AI credentials, or service credits.

## 使用流程 / User flow

1. 上传一张床品参考图。
2. 输入花型描述，可提供负向提示词并选择生成数量。
3. 浏览器依次调用 `generate-pattern` Edge Function；成功返回的图片显示在本次页面会话的结果画廊中，可逐张移除。

1. Upload a bedding reference image.
2. Describe the desired pattern, optionally add a negative prompt, and choose the number of variations.
3. The browser invokes the `generate-pattern` Edge Function sequentially. Returned images appear in the current page session's gallery and can be removed individually.

该流程用于设计探索；提示词中对相似度、分辨率或“保持其他内容不变”的要求只是发送给图像模型的指令，不是经量化或生产验收的保证。

This flow is for design exploration. Prompt instructions about similarity, resolution, or preserving the rest of the scene are sent to the image model; they are not measured guarantees or production acceptance criteria.

## 架构 / Architecture

- **前端**：React 18、TypeScript、Vite、Tailwind；主要页面为 `src/pages/Index.tsx`。
- **组件**：图片输入、提示词输入与结果画廊位于 `src/components/`。
- **Supabase 客户端**：`src/integrations/supabase/client.ts` 读取浏览器配置并调用函数。
- **生成函数**：`supabase/functions/generate-pattern/index.ts` 检查输入，组合提示词，并通过 Lovable AI Gateway 请求 `google/gemini-3-pro-image-preview`。

- **Frontend:** React 18, TypeScript, Vite, and Tailwind; the primary page is `src/pages/Index.tsx`.
- **Components:** image input, prompt entry, and the results gallery are under `src/components/`.
- **Supabase client:** `src/integrations/supabase/client.ts` reads browser configuration and invokes the function.
- **Generation function:** `supabase/functions/generate-pattern/index.ts` validates inputs, assembles the prompt, and calls the Lovable AI Gateway with `google/gemini-3-pro-image-preview`.

详见 [架构说明](docs/ARCHITECTURE.md) 和 [隐私与配置](docs/PRIVACY_AND_SETUP.md)。

See [architecture](docs/ARCHITECTURE.md) and [privacy and setup](docs/PRIVACY_AND_SETUP.md).

## 本地启动 / Run locally

需要 Node.js 与 npm。使用你自己的 Supabase 项目部署 Edge Function，再配置浏览器端变量；完整说明见 [隐私与配置](docs/PRIVACY_AND_SETUP.md)。

Use Node.js and npm. Deploy the Edge Function to a Supabase project you control and configure the browser variables; see [privacy and setup](docs/PRIVACY_AND_SETUP.md).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

可用脚本：`npm run build`、`npm run lint`、`npm test`。本仓库只提供源码和测试文件，不代表这些命令已在本次文档变更中重新运行，也不代表你已配置外部服务。

Available scripts: `npm run build`, `npm run lint`, and `npm test`. This repository provides source and test files; it does not mean these commands were rerun for this documentation change or that an external service is configured.

## 当前边界 / Current boundaries

- 生成依赖 Supabase Edge Functions、Lovable AI Gateway 和可用的服务凭据/额度。
- 图片与提示词会离开浏览器发往你配置的服务；请勿上传未经授权或不适合发送至第三方服务的素材。
- 结果状态保存在前端页面内存中；源码未实现项目级图库、云端历史或可恢复的设计档案。
- 本公开快照没有连接到原私有 Supabase 项目，不能据此推断线上服务当前可用。

- Generation depends on Supabase Edge Functions, the Lovable AI Gateway, and valid service credentials/credits.
- Images and prompts leave the browser for the services you configure. Do not upload material you are not authorized to use or send to third parties.
- Results are held in frontend page state; the source does not implement a project gallery, cloud history, or recoverable design files.
- This public snapshot is not connected to the original private Supabase project, so it does not establish current production availability.

## 许可 / License

源码依 [MIT License](LICENSE) 发布。图像服务、模型及用户上传素材仍受其各自条款约束。

The source is released under the [MIT License](LICENSE). Image services, models, and user-uploaded assets remain subject to their respective terms.
