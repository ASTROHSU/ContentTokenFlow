import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useReownWallet } from './wallet-provider-reown';
import { useAuth } from '@/hooks/use-auth';
import { formatAddress, formatUSDC } from '@/lib/web3';
import { Wallet, Coins, ChevronDown, Gift, Shield } from 'lucide-react';

export function WalletSelector() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { wallet, connectWallet, disconnectWallet } = useReownWallet();
  const { isAuthenticated, login, logout, isLoggingIn } = useAuth();

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
                {!isAuthenticated && (
                  <div className="pt-2 border-t">
                    <Button
                      onClick={() => {
                        login();
                        setShowWalletModal(false);
                      }}
                      disabled={isLoggingIn}
                      className="w-full flex items-center space-x-2"
                      variant="secondary"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{isLoggingIn ? '認證中...' : '創作者認證'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              {isAuthenticated && (
                <Button
                  onClick={() => {
                    logout();
                    setShowWalletModal(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  登出創作者
                </Button>
              )}
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
            </div>
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
        onClick={connectWallet}
        disabled={wallet.isConnecting}
        className="bg-primary text-white hover:bg-indigo-700 flex items-center space-x-2"
      >
        <Wallet className="w-4 h-4" />
        <span>
          {wallet.isConnecting ? '連接中...' : '連接錢包'}
        </span>
      </Button>
    </div>
  );
}