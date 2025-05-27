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
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral">內容管理</h2>
              <p className="text-gray-600">匯入你的文章並設定為付費內容</p>
            </div>
            <ArticleImport />
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
