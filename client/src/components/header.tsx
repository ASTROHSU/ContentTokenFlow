import { Box } from 'lucide-react';
import { Link } from 'wouter';
import { WalletSelector } from './wallet-selector';
import { useReownWallet } from './wallet-provider-reown';

export function Header() {
  const { wallet } = useReownWallet();
  
  // Check if connected wallet is the authorized creator
  const isCreator = wallet.isConnected && 
    wallet.address?.toLowerCase() === '0x36F322fC85B24aB13263CFE9217B28f8E2b38381'.toLowerCase();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">區</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-neutral">區塊勢 for AI</span>
                <span className="text-xs text-gray-500">說鬼話的區塊鏈內容</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-neutral transition-colors">
              文章
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-neutral transition-colors">
              關於
            </Link>

            {isCreator && (
              <Link href="/creator" className="text-gray-600 hover:text-neutral transition-colors">
                創作者
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <WalletSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
