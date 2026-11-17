import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { ImageUploader } from '@/components/ImageUploader';
import { PromptInput } from '@/components/PromptInput';
import { ResultGallery } from '@/components/ResultGallery';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedResult {
  id: string;
  image: string;
  prompt: string;
  timestamp: Date;
}

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleImageUpload = useCallback((imageBase64: string) => {
    setUploadedImage(imageBase64);
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
  }, []);

  const handleGenerate = useCallback(async (prompt: string, negativePrompt: string, count: number) => {
    if (!uploadedImage) {
      toast.error('请先上传母图');
      return;
    }

    setIsLoading(true);
    setProgress({ current: 0, total: count });

    const newResults: GeneratedResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Generate images sequentially to ensure variety
    for (let i = 0; i < count; i++) {
      setProgress({ current: i + 1, total: count });

      try {
        const { data, error } = await supabase.functions.invoke('generate-pattern', {
          body: {
            prompt,
            negativePrompt,
            imageBase64: uploadedImage,
            variationSeed: i + 1, // Add variation seed for diversity
          },
        });

        if (error) {
          console.error('Function error:', error);
          failCount++;
          continue;
        }

        if (data.error) {
          console.error('Generation error:', data.error);
          failCount++;
          continue;
        }

        if (data.image) {
          const newResult: GeneratedResult = {
            id: crypto.randomUUID(),
            image: data.image,
            prompt,
            timestamp: new Date(),
          };
          newResults.push(newResult);
          successCount++;

          // Add result immediately so user sees progress
          setResults((prev) => [newResult, ...prev]);
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Generate error:', error);
        failCount++;
      }
    }

    setIsLoading(false);
    setProgress({ current: 0, total: 0 });

    if (successCount > 0) {
      toast.success(`成功生成 ${successCount} 张花型！${failCount > 0 ? ` (${failCount} 张失败)` : ''}`);
    } else {
      toast.error('所有图片生成失败，请重试');
    }
  }, [uploadedImage]);

  const handleDeleteResult = useCallback((id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
    toast.success('已删除');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel - Upload & Input */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-serif font-medium text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                    1
                  </span>
                  上传母图
                </h2>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  uploadedImage={uploadedImage}
                  onClear={handleClearImage}
                />
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-serif font-medium text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                    2
                  </span>
                  设计花型
                </h2>
                <PromptInput
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  disabled={!uploadedImage}
                  progress={progress}
                />
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4">
              <p className="text-xs text-muted-foreground text-center">
                💡 提示：描述越详细，生成效果越精准。可以包含颜色、图案风格、材质感等
              </p>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-8">
            <div className="glass-panel rounded-xl p-6 min-h-[600px]">
              <h2 className="text-lg font-serif font-medium text-foreground mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                  3
                </span>
                生成结果
                {results.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({results.length} 张)
                  </span>
                )}
              </h2>

              <ResultGallery results={results} onDelete={handleDeleteResult} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
