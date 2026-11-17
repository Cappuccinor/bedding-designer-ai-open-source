import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (imageBase64: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

export function ImageUploader({ onImageUpload, uploadedImage, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onImageUpload(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  if (uploadedImage) {
    return (
      <div className="relative group">
        <div className="upload-zone p-2 border-solid">
          <img
            src={uploadedImage}
            alt="上传的母图"
            className="w-full h-auto rounded-lg object-contain max-h-[400px]"
          />
        </div>
        <button
          onClick={onClear}
          className="absolute top-4 right-4 p-2 rounded-full bg-foreground/80 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-foreground"
          aria-label="移除图片"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "upload-zone flex flex-col items-center justify-center p-12 cursor-pointer min-h-[300px]",
        isDragging && "active"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div className="p-4 rounded-full bg-primary/10">
          {isDragging ? (
            <ImageIcon className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>

        <div className="text-center">
          <p className="text-lg font-medium text-foreground">
            {isDragging ? '松开鼠标上传图片' : '拖拽或点击上传母图'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            支持 JPG、PNG、WebP 格式
          </p>
        </div>
      </div>
    </div>
  );
}
