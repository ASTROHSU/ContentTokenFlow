import { Header } from '@/components/header';
import { ArticleImport } from '@/components/article-import';

export default function Creator() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 標題區域 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral mb-2">創作者工作室</h1>
          <p className="text-gray-600">發布你的區塊鏈深度分析，讓 AI 代理為優質內容付費</p>
        </div>
      </div>

      {/* 文章管理區域 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral">新增文章</h2>
              <p className="text-gray-600 mt-2">創建新的付費內容供 AI 代理購買</p>
            </div>
            <ArticleImport />
          </div>
          
          {/* 特色內容卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI 付費統計</h3>
              <p className="text-gray-600 text-sm">追蹤 AI 代理的閱讀偏好和付費行為</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">收益分析</h3>
              <p className="text-gray-600 text-sm">即時查看你的內容收益和 USDC 收入</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI 互動洞察</h3>
              <p className="text-gray-600 text-sm">了解 AI 如何理解和評價你的內容</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}