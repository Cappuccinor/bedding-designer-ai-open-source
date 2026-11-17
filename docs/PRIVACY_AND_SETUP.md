# 隐私与配置 / Privacy and setup

## 数据如何流动 / Data flow

1. 选择参考图后，浏览器通过 `FileReader` 将其读为 Base64 data URL，并保存在当前页面 React state。
2. 点击生成时，前端把图片 Base64、正向提示词、负向提示词和变化序号发送给你配置的 Supabase Edge Function。
3. Edge Function 将组合后的提示词和图片发给 Lovable AI Gateway；网关请求中使用 `google/gemini-3-pro-image-preview` 模型 ID。
4. Edge Function 以 Base64 图片响应；结果保存在当前页面 state 中。源码未提供云端图库或项目历史。

1. The browser reads the selected reference image as a Base64 data URL and holds it in page React state.
2. On generation, the frontend sends the image Base64, positive prompt, negative prompt, and variation index to the Supabase Edge Function you configured.
3. The Edge Function sends the assembled prompt and image to the Lovable AI Gateway using the `google/gemini-3-pro-image-preview` model ID.
4. The function returns a Base64 image, which the current page keeps in state. The source does not provide cloud storage or project history.

函数代码会把原始提示词、负向提示词和截断后的完整提示词写入函数日志。因此不要把机密、客户资料或敏感设计细节放进提示词，也不要假设上传和日志具有零保留或私密处理。请分别查阅你所用 Supabase、Lovable 和模型服务的最新条款、日志保留与数据处理设置。

The function code logs the raw prompt, negative prompt, and a truncated form of the full prompt. Do not put secrets, client information, or sensitive design details in prompts, and do not assume uploads or logs are private or zero-retention. Review the current terms, log retention, and data processing settings for the Supabase, Lovable, and model services you use.

## 建立你自己的开发环境 / Configure your own environment

1. 创建或选择你有权管理的 Supabase 项目。
2. 复制 `.env.example` 为 `.env.local`，填入项目 URL 和 publishable key：

1. Create or select a Supabase project you control.
2. Copy `.env.example` to `.env.local` and provide the project URL and publishable key:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_REF
```

`VITE_` 变量会进入浏览器构建，因此只能放 Supabase publishable/可公开客户端配置，不能放服务端密钥。当前应用代码只直接读取 URL 与 publishable key；Project ID 是模板中保留的项目标识。

`VITE_` variables are exposed to the browser build. Use only the Supabase publishable/client configuration here; never put a server secret in them. The current application code directly reads only the URL and publishable key; the project ID remains in the template as an identifier.

3. 在本地 Supabase 项目中部署 `generate-pattern` Edge Function，并用 Supabase 的函数密钥管理配置服务端 `LOVABLE_API_KEY`。切勿将其放入 `.env.local`、前端代码或 Git。常见 CLI 流程为：

3. Deploy the `generate-pattern` Edge Function to your Supabase project and configure the server-side `LOVABLE_API_KEY` using Supabase function secrets management. Do not put it in `.env.local`, frontend code, or Git. A typical CLI flow is:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set LOVABLE_API_KEY=YOUR_LOVABLE_API_KEY
supabase functions deploy generate-pattern
```

请在受控终端中安全提供密钥，避免将真实密钥写入 shell 历史或日志。部署前核对 CLI 显示的目标项目。Supabase 官方说明：[部署 Edge Functions](https://supabase.com/docs/guides/functions/deploy) 与 [函数密钥管理](https://supabase.com/docs/guides/functions/secrets)。

Provide secrets through a controlled terminal or the Supabase dashboard; avoid putting real values in shell history or logs. Confirm the target project before deployment. See Supabase's official guides for [deploying Edge Functions](https://supabase.com/docs/guides/functions/deploy) and [managing function secrets](https://supabase.com/docs/guides/functions/secrets).

4. 安装并运行前端：

4. Install and run the frontend:

```bash
npm ci
npm run dev
```

可选本地脚本：`npm run build`、`npm run lint`、`npm test`。此文档没有执行这些脚本，也没有部署 Supabase 函数。

Optional local scripts: `npm run build`, `npm run lint`, and `npm test`. This documentation update did not run them or deploy a Supabase function.

## 使用前检查 / Before using the app

- 仅上传你有权使用且可以发送到第三方服务的图像。
- 不要在参考图、提示词或负向提示词中包含个人资料、商业机密或未经授权的客户设计。
- 前端页面移除结果只会更新本地页面状态；不能保证撤销已发送的请求、服务端日志或模型服务处理。
- `.env.local` 与任何函数密钥不得提交。若凭据意外进入版本控制，应在服务端立即撤销/轮换。

- Upload only images you are authorized to use and may send to third-party services.
- Keep personal data, trade secrets, and unauthorized client designs out of images and prompts.
- Removing a result only updates page state; it cannot undo a request already sent or guarantee removal from service logs/model processing.
- Never commit `.env.local` or function secrets. Revoke/rotate any credential accidentally committed.
