import { Header } from '@/components/header';
import { ContentGrid } from '@/components/content-grid';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 簡潔的標題區域 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral mb-2">區塊勢 for AI</h1>
          <p className="text-gray-600">說鬼話的區塊鏈內容</p>
        </div>
      </div>

      {/* 文章內容區域 */}
      <div className="py-8">
        <ContentGrid />
      </div>
    </div>
  );
}
