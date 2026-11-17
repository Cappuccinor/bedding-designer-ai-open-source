import { useState } from 'react';
import { Sparkles, Wand2, Ban, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  onGenerate: (prompt: string, negativePrompt: string, count: number) => void;
  isLoading: boolean;
  disabled: boolean;
  progress?: { current: number; total: number };
}

const GENERATION_COUNTS = [
  { value: 1, label: '1张' },
  { value: 2, label: '2张' },
  { value: 4, label: '4张' },
  { value: 8, label: '8张' },
];

const PRESET_PROMPTS = [
  { label: '碎花田园', prompt: '清新的小碎花图案，淡粉色和浅绿色搭配，田园风格' },
  { label: '几何简约', prompt: '现代几何图案，灰白色调，简约北欧风格' },
  { label: '水墨山水', prompt: '中国风水墨画图案，淡雅山水意境' },
  { label: '热带植物', prompt: '热带棕榈叶和龟背竹图案，深绿色调' },
  { label: '星空梦幻', prompt: '深蓝色星空图案，点缀金色星星，梦幻风格' },
  { label: '纯色雅致', prompt: '纯色莫兰迪灰调，细腻的暗纹肌理' },
];

export function PromptInput({ onGenerate, isLoading, disabled, progress }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [count, setCount] = useState(1);

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim(), negativePrompt.trim(), count);
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          描述你想要的花型
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：浪漫的粉色玫瑰花朵图案，搭配浅绿色叶子，优雅复古风格..."
          className="min-h-[100px] resize-none bg-card border-border focus:ring-primary/20"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Ban className="w-4 h-4 text-destructive" />
          反向提示词 <span className="text-xs text-muted-foreground">(可选)</span>
        </label>
        <Textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="例如：模糊、变形、低质量、水印、文字..."
          className="min-h-[60px] resize-none bg-card border-border focus:ring-destructive/20"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          描述你不希望出现在生成图片中的元素
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Images className="w-4 h-4 text-primary" />
          生成数量
        </label>
        <div className="flex gap-2">
          {GENERATION_COUNTS.map((option) => (
            <button
              key={option.value}
              onClick={() => setCount(option.value)}
              disabled={isLoading}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                count === option.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary/50'
              } disabled:opacity-50`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          生成多张不同的变体供您选择
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">快速选择风格：</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset.prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={disabled || !prompt.trim() || isLoading}
        className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
            {progress && progress.total > 1
              ? `正在生成 ${progress.current}/${progress.total}...`
              : '正在生成...'}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            生成 {count} 张花型
          </>
        )}
      </Button>
    </div>
  );
}
