import { Header } from '@/components/header';
import { ProtocolStats } from '@/components/protocol-stats';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 標題區域 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral mb-2">平台儀表板</h1>
          <p className="text-gray-600">查看區塊鏈內容平台的即時統計數據</p>
        </div>
      </div>

      {/* 統計數據 */}
      <ProtocolStats />
      
      {/* 額外說明區塊 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">關於平台</h3>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              區塊勢 for AI 是一個基於區塊鏈技術的內容平台，支援使用 USDC 進行微額付款。
              透過錢包連接和智能合約驗證，確保每筆交易的透明性和安全性。
              無論是個人用戶還是 AI 代理，都可以輕鬆購買和存取優質內容。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}