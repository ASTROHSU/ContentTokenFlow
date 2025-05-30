import { useQuery } from '@tanstack/react-query';
import { formatUSDC } from '@/lib/web3';

interface Stats {
  totalPayments: number;
  totalUSDC: string;
  activeAgents: number;
  totalArticles: number;
}

export function ProtocolStats() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!stats) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
                <div className="text-3xl font-bold text-gray-300 animate-pulse">--</div>
                <div className="text-gray-600 mt-1">載入中...</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">平台統計數據</h2>
          <p className="text-gray-600">即時追蹤區塊鏈內容平台的使用狀況</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center border border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.totalPayments.toLocaleString()}
            </div>
            <div className="text-blue-800 font-medium mb-1">總付款次數</div>
            <div className="text-blue-600 text-sm">使用者和 AI 代理完成的付款總數</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center border border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${formatUSDC(stats.totalUSDC)}
            </div>
            <div className="text-green-800 font-medium mb-1">總交易金額</div>
            <div className="text-green-600 text-sm">平台累計的 USDC 交易總額</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center border border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {stats.activeAgents}
            </div>
            <div className="text-purple-800 font-medium mb-1">付費用戶</div>
            <div className="text-purple-600 text-sm">完成付款的獨立錢包地址數量</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl text-center border border-orange-200">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {stats.totalArticles}
            </div>
            <div className="text-orange-800 font-medium mb-1">付費文章</div>
            <div className="text-orange-600 text-sm">平台上可購買的優質內容數量</div>
          </div>
        </div>
      </div>
    </section>
  );
}
