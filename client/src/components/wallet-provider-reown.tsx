import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  isConnecting: boolean;
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function ReownWalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0.00',
    isConnecting: false,
  });
  
  const { toast } = useToast();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
    token: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  });

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    try {
      await open();
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "連接失敗",
        description: "錢包連接時發生錯誤，請重試。",
        variant: "destructive",
      });
    } finally {
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast({
      title: "錢包已斷開連接",
      description: "你的錢包已成功斷開連接。",
    });
  };

  // 監聽錢包狀態變化
  useEffect(() => {
    if (isConnected && address) {
      const balanceStr = balance ? (Number(balance.formatted)).toFixed(2) : '0.00';
      const normalizedAddress = address.toLowerCase();
      
      setWallet({
        isConnected: true,
        address: normalizedAddress,
        balance: balanceStr,
        isConnecting: false,
      });

      // 發送連接資訊到後端
      fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: normalizedAddress, balance: balanceStr }),
        credentials: 'include',
      }).catch(console.error);

      toast({
        title: "錢包連接成功！",
        description: `已連接錢包 ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } else {
      setWallet({
        isConnected: false,
        address: null,
        balance: '0.00',
        isConnecting: false,
      });
    }
  }, [isConnected, address, balance, toast]);

  return (
    <WalletContext.Provider value={{
      wallet,
      connectWallet,
      disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useReownWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useReownWallet must be used within a ReownWalletProvider');
  }
  return context;
}