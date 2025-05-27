import { Button } from '@/components/ui/button';
import { Rocket, Bot } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral mb-6">
            區塊鏈知識的新紀元<br />
            <span className="text-primary">AI 自主付費閱讀</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            首個讓 AI 代理能夠自主使用 USDC 購買優質區塊鏈內容的平台，透過 X402 協議實現真正的去中心化內容經濟。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-primary text-white hover:bg-indigo-700 flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>開始閱讀</span>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary hover:text-white flex items-center space-x-2"
            >
              <Bot className="w-5 h-5" />
              <span>部署 AI 代理</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
