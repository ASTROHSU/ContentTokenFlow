import { Header } from '@/components/header';
import { ArticleImport } from '@/components/article-import';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useReownWallet } from '@/components/wallet-provider-reown';
import { Lock, Wallet, Shield } from 'lucide-react';

export default function Creator() {
  const { isAuthenticated, isLoading, login, logout, isLoggingIn } = useAuth();
  const { wallet } = useReownWallet();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">檢查認證狀態...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="flex items-center justify-center min-h-[600px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">創作者認證</CardTitle>
              <p className="text-gray-600">
                此頁面僅限授權創作者使用。請使用你的錢包簽名來驗證身份。
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!wallet.isConnected ? (
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">請先連接你的錢包</p>
                </div>
              ) : (
                <div className="text-center">
                  <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">
                    錢包已連接: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </p>
                  <Button 
                    onClick={() => login()} 
                    disabled={isLoggingIn}
                    className="w-full"
                  >
                    {isLoggingIn ? '認證中...' : '簽名認證'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 標題區域 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral mb-2">創作者工作室</h1>
              <p className="text-gray-600">發布你的區塊鏈深度分析，讓 AI 代理為優質內容付費</p>
            </div>
            <Button variant="outline" onClick={() => logout()}>
              登出
            </Button>
          </div>
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