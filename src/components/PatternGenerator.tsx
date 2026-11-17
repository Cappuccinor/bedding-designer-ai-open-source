import { useState } from 'react';

export const PatternGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. 处理图片上传，转为 Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. 核心生成逻辑
  const handleGenerate = async () => {
    if (!prompt && !selectedImage) {
      alert("请输入提示词或上传图片！");
      return;
    }

    setIsGenerating(true);

    try {
      // 读取 Netlify 注入的环境变量
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("环境变量未配置！请检查 Netlify 设置。");
      }

      // 拼接后端函数地址
      // 注意：如果你的 URL 结尾带斜杠，这里处理一下防止双斜杠
      const baseUrl = supabaseUrl.replace(/\/$/, '');
      const functionUrl = `${baseUrl}/functions/v1/generate-pattern`;

      console.log("正在请求后端:", functionUrl);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          imageBase64: selectedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      if (data.image) {
        setGeneratedImage(data.image);
      } else {
        throw new Error("后端未返回图片数据");
      }

    } catch (error: any) {
      console.error("Error:", error);
      alert(`生成出错: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">AI 家纺花型设计 (云端版)</h1>

      {/* 输入区域 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">设计需求</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="例如：淡雅的田园风格，粉色小碎花..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">上传参考图 (可选)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          {selectedImage && (
            <img src={selectedImage} alt="Preview" className="mt-2 h-32 object-contain rounded-md border" />
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors
            ${isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isGenerating ? '正在由 Supabase 云端生成...' : '开始生成'}
        </button>
      </div>

      {/* 结果展示 */}
      {generatedImage && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">生成结果：</h2>
          <img
            src={generatedImage}
            alt="Generated Pattern"
            className="w-full h-auto rounded-lg shadow-md"
          />
          <a
            href={generatedImage}
            download="pattern.png"
            className="block text-center mt-2 text-blue-600 hover:underline"
          >
            下载大图
          </a>
        </div>
      )}
    </div>
  );
};
