import { Header } from '@/components/header';
import { ProtocolStats } from '@/components/protocol-stats';
import { AIAgentSimulator } from '@/components/ai-agent-simulator';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 標題區域 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral mb-2">協議儀表板</h1>
          <p className="text-gray-600">監控 AI 代理活動和平台統計數據</p>
        </div>
      </div>

      {/* 統計數據 */}
      <ProtocolStats />
      
      {/* AI 代理模擬器 */}
      <AIAgentSimulator />
    </div>
  );
}