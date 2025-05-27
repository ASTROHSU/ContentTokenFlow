import { useState, useEffect } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  isConnecting: boolean;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0.00',
    isConnecting: false,
  });

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          const balance = (Math.random() * 100 + 50).toFixed(2); // Simulate USDC balance
          
          // Call backend to register/update wallet
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
          });
          
          // Store in localStorage for persistence
          localStorage.setItem('wallet', JSON.stringify({ address, balance }));
        }
      } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
        setWallet(prev => ({ ...prev, isConnecting: false }));
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: '0.00',
      isConnecting: false,
    });
    localStorage.removeItem('wallet');
  };

  // Check for existing wallet connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      try {
        const { address, balance } = JSON.parse(savedWallet);
        setWallet({
          isConnected: true,
          address,
          balance,
          isConnecting: false,
        });
      } catch (error) {
        console.error('Error parsing saved wallet:', error);
        localStorage.removeItem('wallet');
      }
    }
  }, []);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
  };
}
