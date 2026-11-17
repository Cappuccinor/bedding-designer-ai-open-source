import { Palette } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold text-foreground">
              床品花型设计师
            </h1>
            <p className="text-xs text-muted-foreground">
              AI智能生成四件套花型效果图
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-full bg-accent/50">
            Powered by AI
          </span>
        </div>
      </div>
    </header>
  );
}
