import { Header } from '@/components/header';
import { ContentGrid } from '@/components/content-grid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BarChart3, PlusCircle, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 簡潔的標題區域 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral mb-2">區塊勢 for AI</h1>
              <p className="text-gray-600">說鬼話的區塊鏈內容</p>
            </div>
            
            {/* 快速導航按鈕 */}
            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>查看統計</span>
                </Button>
              </Link>
              
              <Link href="/creator">
                <Button className="flex items-center space-x-2 bg-primary text-white hover:bg-indigo-700">
                  <PlusCircle className="w-4 h-4" />
                  <span>創作者登入</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 快速導航卡片 */}
      <div className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral">協議儀表板</h3>
                      <p className="text-sm text-gray-600">查看 AI 代理活動和平台統計</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/creator">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral">創作者工作室</h3>
                      <p className="text-sm text-gray-600">新增文章並管理你的內容</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* 文章內容區域 */}
      <div className="py-8">
        <ContentGrid />
      </div>
    </div>
  );
}
