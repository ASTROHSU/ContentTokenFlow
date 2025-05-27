import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { ProtocolStats } from '@/components/protocol-stats';
import { ContentGrid } from '@/components/content-grid';
import { AIAgentSimulator } from '@/components/ai-agent-simulator';
import { ArticleImport } from '@/components/article-import';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ProtocolStats />
      
      {/* 文章管理區域 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral">創作者工作室</h2>
              <p className="text-gray-600 mt-2">發布你的區塊鏈深度分析，讓 AI 代理為優質內容付費</p>
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
      
      <ContentGrid />
      <AIAgentSimulator />
      
      {/* Footer */}
      <footer className="bg-neutral text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-cube text-primary text-2xl"></i>
                <span className="text-xl font-bold">X402 Protocol</span>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing content monetization through blockchain payments and AI agents.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-discord"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Articles</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Agents</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Create Content</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Protocol</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integration Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bug Reports</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2024 X402 Protocol. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-gray-400 text-sm">Testnet Active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
