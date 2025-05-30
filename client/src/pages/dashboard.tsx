import { useState } from 'react';
import { Header } from '@/components/header';
import { ProtocolStats } from '@/components/protocol-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Bot, Code, Copy, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestX402 = async () => {
    try {
      const response = await fetch('/api/articles/1', {
        headers: {
          'User-Agent': 'AI-Agent/Test'
        }
      });
      
      const headers = Array.from(response.headers.entries())
        .filter(([key]) => key.startsWith('x-payment'))
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
        
      setTestResult(`HTTP ${response.status} ${response.statusText}\n\n${headers}`);
    } catch (error) {
      setTestResult('測試失敗: ' + String(error));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已複製到剪貼板",
      description: "API 端點已複製",
    });
  };

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/ai/discover',
      description: 'AI 代理內容發現 API',
      headers: ['User-Agent: AI-Agent/1.0']
    },
    {
      method: 'POST', 
      path: '/api/ai/purchase',
      description: 'AI 代理自動購買 API',
      headers: ['Content-Type: application/json', 'X-AI-Agent: true']
    },
    {
      method: 'GET',
      path: '/api/articles/1',
      description: 'x402 協議測試端點',
      headers: ['User-Agent: AI-Agent/1.0']
    }
  ];

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

      {/* x402 協議狀態 */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">x402 協議狀態</h2>
            <p className="text-gray-600">即時監控和測試 x402 支付協議功能</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>協議狀態</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>HTTP 402 支援</span>
                  <Badge variant="default" className="bg-green-500">已啟用</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI 代理 API</span>
                  <Badge variant="default" className="bg-green-500">運行中</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>USDC 支付</span>
                  <Badge variant="default" className="bg-green-500">Base Sepolia</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>自動化購買</span>
                  <Badge variant="default" className="bg-green-500">可用</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span>即時測試</span>
                </CardTitle>
                <CardDescription>
                  測試 x402 協議的 HTTP 402 回應和支付標頭
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleTestX402} className="w-full">
                  <Globe className="w-4 h-4 mr-2" />
                  測試 HTTP 402 回應
                </Button>
                {testResult && (
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {testResult}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-500" />
                <span>AI 代理 API 端點</span>
              </CardTitle>
              <CardDescription>
                供 AI 代理使用的標準化 API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${endpoint.method} ${window.location.origin}${endpoint.path}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                    <div className="text-xs text-gray-500">
                      <strong>必要標頭:</strong> {endpoint.headers.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
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