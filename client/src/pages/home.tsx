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

      {/* 平台介紹 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">一個網站，兩種體驗</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              區塊勢 for AI 不只是給人類看的內容平台，更是全球首個完整支援 x402 協議的 AI 代理友善網站
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">給人類的體驗</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">瀏覽精選內容</h4>
                    <p className="text-gray-600">查看文章標題、摘要和價格</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">連接加密錢包</h4>
                    <p className="text-gray-600">使用 WalletConnect 安全登入</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">USDC 微額付款</h4>
                    <p className="text-gray-600">在 Base Sepolia 網路上快速付款</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">解鎖完整內容</h4>
                    <p className="text-gray-600">立即閱讀付費文章全文</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">給 AI 代理的體驗</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-purple-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">自動內容發現</h4>
                    <p className="text-gray-600">透過 /api/ai/discover 端點獲取內容清單</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">HTTP 402 協議</h4>
                    <p className="text-gray-600">接收標準支付要求和錢包地址</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">自動化購買</h4>
                    <p className="text-gray-600">透過 /api/ai/purchase 完成交易</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-purple-600 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">即時內容訪問</h4>
                    <p className="text-gray-600">取得 JSON 格式的完整文章內容</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* x402 協議說明 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">什麼是 x402 協議？</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              x402 是由 Coinbase、Anthropic 等公司共同推出的網路原生支付協議，讓 AI 代理能夠自動購買網路內容
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚫</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">過去的問題</h3>
              <p className="text-gray-600">
                AI 代理無法處理複雜的註冊流程、圖形驗證碼、多步驟付款。傳統付費牆只為人類設計。
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">x402 解決方案</h3>
              <p className="text-gray-600">
                標準化的 HTTP 402 回應告訴 AI「需要付費」，包含價格、錢包地址、支付端點等所有必要資訊。
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI 友善設計</h3>
              <p className="text-gray-600">
                AI 代理可以程式化地發現內容、評估價值、完成付款、獲取資料，無需人工介入。
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">HTTP 402 回應示例</h3>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="text-red-600 font-bold">HTTP/1.1 402 Payment Required</div>
              <div className="text-blue-600">X-Payment-Required: true</div>
              <div className="text-blue-600">X-Payment-Amount: 1.500000</div>
              <div className="text-blue-600">X-Payment-Currency: USDC</div>
              <div className="text-blue-600">X-Payment-Recipient: 0x36F322fC85B24aB13263CFE9217B28f8E2b38381</div>
              <div className="text-blue-600">X-Payment-Network: base-sepolia</div>
              <div className="text-blue-600">X-Payment-Endpoint: /api/payments</div>
            </div>
            <p className="text-gray-600 mt-4 text-center">
              AI 代理看到這個回應就知道：需要付 1.5 USDC 到指定錢包地址，然後就能獲取內容
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
