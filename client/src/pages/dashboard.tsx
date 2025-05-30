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
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [stepResults, setStepResults] = useState<{[key: number]: any}>({});
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

  const handleStepClick = async (stepNumber: number) => {
    // 如果點擊的是已經展開的步驟，則收闔
    if (activeStep === stepNumber) {
      setActiveStep(null);
      return;
    }
    
    setActiveStep(stepNumber);
    
    try {
      let result;
      
      switch (stepNumber) {
        case 1: // 內容發現
          const discoverResponse = await fetch('/api/ai/discover', {
            headers: { 'User-Agent': 'AI-Agent/Demo' }
          });
          result = await discoverResponse.json();
          break;
          
        case 2: // 嘗試訪問內容
          const accessResponse = await fetch('/api/articles/1', {
            headers: { 'User-Agent': 'AI-Agent/Demo' }
          });
          const headers = {};
          accessResponse.headers.forEach((value, key) => {
            if (key.startsWith('x-payment') || key === 'content-type') {
              headers[key] = value;
            }
          });
          result = {
            status: accessResponse.status,
            statusText: accessResponse.statusText,
            headers,
            body: await accessResponse.json()
          };
          break;
          
        case 3: // 自動化購買
          const purchaseResponse = await fetch('/api/ai/purchase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-AI-Agent': 'true',
              'User-Agent': 'AI-Agent/Demo'
            },
            body: JSON.stringify({
              articleId: 1,
              agentId: 'DemoAI_Agent',
              agentWallet: '0xDemo' + Math.random().toString(16).substr(2, 36),
              metadata: {
                purpose: 'demonstration',
                timestamp: new Date().toISOString()
              }
            })
          });
          result = await purchaseResponse.json();
          break;
          
        case 4: // 內容處理
          result = {
            message: "AI 代理獲得完整的 JSON 格式內容，包含：",
            structure: {
              id: "文章 ID",
              title: "文章標題",
              content: "完整文章內容（可進行分析、總結、翻譯等處理）",
              metadata: {
                category: "分類標籤",
                author: "作者資訊",
                purchaseTimestamp: "購買時間戳",
                agentMetadata: "AI 代理的執行記錄"
              }
            },
            capabilities: [
              "自動摘要和關鍵字提取",
              "多語言翻譯和本地化",
              "主題分類和內容標籤",
              "與其他數據源的交叉分析",
              "結構化知識圖譜建構"
            ]
          };
          break;
      }
      
      setStepResults(prev => ({
        ...prev,
        [stepNumber]: result
      }));
      
    } catch (error) {
      setStepResults(prev => ({
        ...prev,
        [stepNumber]: { error: String(error) }
      }));
    }
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
          <h1 className="text-3xl font-bold text-neutral mb-2">關於區塊勢 for AI</h1>
          <p className="text-gray-600">了解我們如何同時為人類和 AI 代理提供內容服務</p>
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
                  <Button
                    variant={activeStep === 1 ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                    onClick={() => handleStepClick(1)}
                  >
                    <span className="text-sm font-bold">1</span>
                  </Button>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">內容發現</h4>
                    <div className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                         onClick={() => handleStepClick(1)}>
                      <code className="text-sm">GET /api/ai/discover</code>
                      <p className="text-xs text-gray-600 mt-1">點擊查看 AI 代理如何獲取內容清單</p>
                    </div>
                    {stepResults[1] && activeStep === 1 && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-900 mb-2">API 回應：</h5>
                        <pre className="text-xs text-blue-800 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(stepResults[1], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Button
                    variant={activeStep === 2 ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                    onClick={() => handleStepClick(2)}
                  >
                    <span className="text-sm font-bold">2</span>
                  </Button>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">嘗試訪問內容</h4>
                    <div className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                         onClick={() => handleStepClick(2)}>
                      <code className="text-sm">GET /api/articles/1</code>
                      <p className="text-xs text-gray-600 mt-1">點擊查看 HTTP 402 回應和付款要求</p>
                    </div>
                    {stepResults[2] && activeStep === 2 && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h5 className="font-semibold text-yellow-900 mb-2">HTTP 402 回應：</h5>
                        <div className="text-xs text-yellow-800">
                          <div className="font-bold">狀態：{stepResults[2].status} {stepResults[2].statusText}</div>
                          <div className="mt-2 font-semibold">x402 標頭：</div>
                          <pre className="overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(stepResults[2].headers, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Button
                    variant={activeStep === 3 ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                    onClick={() => handleStepClick(3)}
                  >
                    <span className="text-sm font-bold">3</span>
                  </Button>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">自動化購買</h4>
                    <div className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                         onClick={() => handleStepClick(3)}>
                      <code className="text-sm">POST /api/ai/purchase</code>
                      <p className="text-xs text-gray-600 mt-1">點擊查看 AI 代理如何自動完成購買</p>
                    </div>
                    {stepResults[3] && activeStep === 3 && (
                      <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <h5 className="font-semibold text-purple-900 mb-2">購買成功回應：</h5>
                        <pre className="text-xs text-purple-800 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(stepResults[3], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Button
                    variant={activeStep === 4 ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                    onClick={() => handleStepClick(4)}
                  >
                    <span className="text-sm font-bold">4</span>
                  </Button>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">內容處理</h4>
                    <div className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                         onClick={() => handleStepClick(4)}>
                      <p className="text-xs text-gray-600">點擊了解 AI 代理如何處理獲得的內容</p>
                    </div>
                    {stepResults[4] && activeStep === 4 && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="font-semibold text-green-900 mb-2">內容處理能力：</h5>
                        <div className="text-xs text-green-800">
                          <p className="mb-2">{stepResults[4].message}</p>
                          <div className="mb-3">
                            <strong>數據結構：</strong>
                            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(stepResults[4].structure, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <strong>AI 處理能力：</strong>
                            <ul className="mt-1 ml-4 list-disc">
                              {stepResults[4].capabilities.map((capability: string, index: number) => (
                                <li key={index}>{capability}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
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