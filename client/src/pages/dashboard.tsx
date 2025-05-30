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

      {/* AI 代理體驗區 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI 代理體驗區</h2>
            <p className="text-gray-600">
              了解 AI 代理如何與我們的平台互動，以及為什麼需要 x402 協議
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  <span>AI 代理需要什麼？</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">標準化的內容發現方式</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">明確的付費資訊和價格</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">程式化的購買流程</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">結構化的內容格式 (JSON)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">無需人工介入的自動化</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-orange-500" />
                  <span>傳統網站的限制</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">需要註冊帳號和密碼</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">圖形驗證碼和 reCAPTCHA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">複雜的多步驟付款流程</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">依賴瀏覽器和 Cookie</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">內容格式對 AI 不友善</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">AI 代理互動流程示範</CardTitle>
              <CardDescription className="text-center">
                以下是一個典型的 AI 代理如何與我們的平台互動
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">內容發現</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <code className="text-sm">GET /api/ai/discover</code>
                      <p className="text-xs text-gray-600 mt-1">AI 代理獲取可用內容清單和價格資訊</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">嘗試訪問內容</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <code className="text-sm">GET /api/articles/1</code>
                      <p className="text-xs text-gray-600 mt-1">收到 HTTP 402 回應和付款要求</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">自動化購買</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <code className="text-sm">POST /api/ai/purchase</code>
                      <p className="text-xs text-gray-600 mt-1">AI 代理自動完成購買並獲得內容</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">內容處理</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">AI 代理獲得結構化 JSON 內容，可立即進行分析、總結或整合</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">為什麼 x402 協議很重要？</h3>
                <p className="text-blue-800 text-sm">
                  x402 協議讓 AI 代理能夠像人類一樣自由地購買網路內容，打破了傳統付費牆的限制。
                  這開啟了一個全新的經濟模式：AI 代理成為內容消費者，為優質內容創作者帶來新的收入來源。
                  未來，AI 代理可能會成為許多網站最大的付費用戶群體。
                </p>
              </div>
            </div>
          </div>
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