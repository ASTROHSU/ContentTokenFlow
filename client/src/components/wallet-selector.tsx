import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useWalletConnect } from './walletconnect-provider';
import { formatAddress, formatUSDC } from '@/lib/web3';
import { Wallet, Coins, ChevronDown, Gift } from 'lucide-react';

export function WalletSelector() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { wallet, connectWalletConnect, disconnectWallet } = useWalletConnect();

  const handleFaucetUSDC = () => {
    window.open('https://faucet.circle.com/', '_blank');
  };

  const handleFaucetETH = () => {
    window.open('https://console.optimism.io/faucet', '_blank');
  };

  if (wallet.isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-2 bg-accent/10 px-3 py-2 rounded-lg">
          <Coins className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">
            {formatUSDC(wallet.balance)} USDC
          </span>
        </div>

        <Button
          onClick={handleFaucetUSDC}
          variant="outline"
          size="sm"
          className="hidden md:flex items-center space-x-1"
        >
          <Gift className="w-3 h-3" />
          <span className="text-xs">領取 USDC</span>
        </Button>

        <Button
          onClick={handleFaucetETH}
          variant="outline"
          size="sm"
          className="hidden md:flex items-center space-x-1"
        >
          <Gift className="w-3 h-3" />
          <span className="text-xs">領取 ETH</span>
        </Button>
        
        <Button
          onClick={() => setShowWalletModal(true)}
          className="bg-primary text-white hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>{formatAddress(wallet.address!)}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>

        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>錢包資訊</DialogTitle>
            </DialogHeader>
            
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">錢包類型:</span>
                  <span className="font-medium">WalletConnect</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">地址:</span>
                  <span className="font-mono text-sm">{formatAddress(wallet.address!)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">USDC 餘額:</span>
                  <span className="font-medium text-accent">{formatUSDC(wallet.balance)}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => {
                disconnectWallet();
                setShowWalletModal(false);
              }}
              variant="outline"
              className="w-full"
            >
              斷開連接
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleFaucetUSDC}
        variant="outline"
        size="sm"
        className="hidden md:flex items-center space-x-1"
      >
        <Gift className="w-3 h-3" />
        <span className="text-xs">領取 USDC</span>
      </Button>

      <Button
        onClick={handleFaucetETH}
        variant="outline"
        size="sm"
        className="hidden md:flex items-center space-x-1"
      >
        <Gift className="w-3 h-3" />
        <span className="text-xs">領取 ETH</span>
      </Button>

      <Button
        onClick={() => setShowWalletModal(true)}
        disabled={wallet.isConnecting}
        className="bg-primary text-white hover:bg-indigo-700 flex items-center space-x-2"
      >
        <Wallet className="w-4 h-4" />
        <span>
          {wallet.isConnecting ? '連接中...' : '連接錢包'}
        </span>
      </Button>

      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>選擇錢包</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                connectWalletConnect();
                setShowWalletModal(false);
              }}
            >
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">WalletConnect</h3>
                  <p className="text-sm text-gray-600">連接手機錢包或其他錢包</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>支援網路:</strong> Base Sepolia 測試網
              </p>
              <p className="text-xs text-blue-600">
                請確保你的錢包已連接至 Base Sepolia 測試網路
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}