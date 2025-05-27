import { Box } from 'lucide-react';
import { Link } from 'wouter';
import { WalletSelector } from './wallet-selector';

export function Header() {

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Box className="text-primary text-2xl" />
              <span className="text-xl font-bold text-neutral">X402 Protocol</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-neutral transition-colors">
              Articles
            </Link>
            <a href="#" className="text-gray-600 hover:text-neutral transition-colors">
              AI Agents
            </a>
            <a href="#" className="text-gray-600 hover:text-neutral transition-colors">
              Protocol
            </a>
            <a href="#" className="text-gray-600 hover:text-neutral transition-colors">
              Docs
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <WalletSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
