import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  isConnecting: boolean;
  walletType: 'metamask' | 'walletconnect' | null;
}

interface WalletContextType {
  wallet: WalletState;
  connectMetaMask: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletConnectProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0.00',
    isConnecting: false,
    walletType: null,
  });
  const { toast } = useToast();

  // MetaMask 連接
  const connectMetaMask = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          const balance = (Math.random() * 100 + 50).toFixed(2);
          
          await fetch('/api/wallet/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address, balance }),
            credentials: 'include',
          });
          
          setWallet({
            isConnected: true,
            address,
            balance,
            isConnecting: false,
            walletType: 'metamask',
          });
          
          localStorage.setItem('wallet', JSON.stringify({ address, balance, type: 'metamask' }));
          
          toast({
            title: "MetaMask 連接成功！",
            description: `已連接錢包 ${address.slice(0, 6)}...${address.slice(-4)}`,
          });
        }
      } else {
        toast({
          title: "未安裝 MetaMask",
          description: "請先安裝 MetaMask 瀏覽器擴展。",
          variant: "destructive",
        });
        setWallet(prev => ({ ...prev, isConnecting: false }));
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      toast({
        title: "連接失敗",
        description: "MetaMask 連接時發生錯誤，請重試。",
        variant: "destructive",
      });
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  // WalletConnect 連接
  const connectWalletConnect = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // 模擬 WalletConnect 連接流程
      // 在實際應用中，你需要設定 WalletConnect 的 projectId
      const simulatedAddress = '0x' + Math.random().toString(16).substr(2, 40);
      const balance = (Math.random() * 100 + 50).toFixed(2);
      
      await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: simulatedAddress, balance }),
        credentials: 'include',
      });
      
      setWallet({
        isConnected: true,
        address: simulatedAddress,
        balance,
        isConnecting: false,
        walletType: 'walletconnect',
      });
      
      localStorage.setItem('wallet', JSON.stringify({ 
        address: simulatedAddress, 
        balance, 
        type: 'walletconnect' 
      }));
      
      toast({
        title: "WalletConnect 連接成功！",
        description: `已連接錢包 ${simulatedAddress.slice(0, 6)}...${simulatedAddress.slice(-4)}`,
      });
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      toast({
        title: "連接失敗",
        description: "WalletConnect 連接時發生錯誤，請重試。",
        variant: "destructive",
      });
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: '0.00',
      isConnecting: false,
      walletType: null,
    });
    localStorage.removeItem('wallet');
    
    toast({
      title: "錢包已斷開連接",
      description: "你的錢包已成功斷開連接。",
    });
  };

  // 檢查本地儲存的錢包連接
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      try {
        const { address, balance, type } = JSON.parse(savedWallet);
        setWallet({
          isConnected: true,
          address,
          balance,
          isConnecting: false,
          walletType: type || 'metamask',
        });
      } catch (error) {
        console.error('Error parsing saved wallet:', error);
        localStorage.removeItem('wallet');
      }
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      wallet,
      connectMetaMask,
      connectWalletConnect,
      disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletConnect() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletConnect must be used within a WalletConnectProvider');
  }
  return context;
}