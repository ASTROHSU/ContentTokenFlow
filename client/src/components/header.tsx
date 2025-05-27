import { Button } from '@/components/ui/button';
import { useWalletContext } from './wallet-provider';
import { formatAddress, formatUSDC } from '@/lib/web3';
import { Box, Wallet, Coins } from 'lucide-react';
import { Link } from 'wouter';

export function Header() {
  const { wallet, connectWallet, disconnectWallet } = useWalletContext();

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
            <Button
              onClick={wallet.isConnected ? disconnectWallet : connectWallet}
              disabled={wallet.isConnecting}
              className="bg-primary text-white hover:bg-indigo-700 flex items-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>
                {wallet.isConnecting
                  ? 'Connecting...'
                  : wallet.isConnected
                  ? formatAddress(wallet.address!)
                  : 'Connect Wallet'}
              </span>
            </Button>
            
            {wallet.isConnected && (
              <div className="hidden md:flex items-center space-x-2 bg-accent/10 px-3 py-2 rounded-lg">
                <Coins className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">
                  {formatUSDC(wallet.balance)} USDC
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
