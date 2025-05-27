import { Header } from '@/components/header';
import { ContentGrid } from '@/components/content-grid';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 文章內容區域 */}
      <div className="py-8">
        <ContentGrid />
      </div>
    </div>
  );
}
