import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiweMessage } from 'siwe';
import { useReownWallet } from '@/components/wallet-provider-reown';
import { useToast } from './use-toast';

// Convert address to EIP-55 checksum format
function toChecksumAddress(address: string): string {
  if (!address) return address;
  
  const addr = address.toLowerCase().replace('0x', '');
  const hash = Array.from(addr).map((char, i) => {
    const code = char.charCodeAt(0);
    if (code >= 48 && code <= 57) return char; // 0-9
    if (code >= 97 && code <= 102) { // a-f
      // Simple checksum: uppercase if char position is even
      return i % 2 === 0 ? char.toUpperCase() : char;
    }
    return char;
  }).join('');
  
  return '0x' + hash;
}

interface AuthStatus {
  authenticated: boolean;
  address?: string;
}

export function useAuth() {
  const { wallet } = useReownWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authStatus, isLoading } = useQuery<AuthStatus>({
    queryKey: ['/api/auth/status', wallet.address],
    queryFn: async () => {
      const params = wallet.address ? `?wallet=${wallet.address}` : '';
      const response = await fetch(`/api/auth/status${params}`, {
        credentials: 'include',
      });
      return response.json();
    },
    enabled: true,
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('開始 SIWE 登入流程...');
        
        if (!wallet.isConnected || !wallet.address) {
          throw new Error('請先連接錢包');
        }

        console.log('錢包已連接，地址:', wallet.address);

        // Convert to EIP-55 checksum format for SIWE
        const siweAddress = toChecksumAddress(wallet.address);
        const normalizedAddress = wallet.address.toLowerCase(); // For backend consistency

        // Create SIWE message
        console.log('創建 SIWE 訊息...');
        let message: SiweMessage;
        try {
          message = new SiweMessage({
            domain: window.location.host,
            address: siweAddress, // Use EIP-55 format
            statement: 'Sign in to access premium content',
            uri: window.location.origin,
            version: '1',
            chainId: 84532, // Base Sepolia
            nonce: Math.random().toString(36).substring(2, 15),
            issuedAt: new Date().toISOString(),
          });
          console.log('SIWE 訊息物件創建成功');
        } catch (siweError: any) {
          console.error('SIWE 訊息創建失敗:', siweError);
          throw new Error(`SIWE 訊息創建失敗: ${siweError?.message || String(siweError)}`);
        }

        const messageString = message.prepareMessage();
        console.log('SIWE 訊息已創建:', messageString);

        // Request signature using WalletConnect provider
        if (!(window as any).ethereum) {
          throw new Error('請確保錢包已連接 - 找不到 ethereum 提供者');
        }

        console.log('請求錢包簽名...');
        const signature = await (window as any).ethereum.request({
          method: 'personal_sign',
          params: [messageString, normalizedAddress],
        });

        console.log('簽名完成:', signature);

        // Verify with backend
        console.log('發送驗證請求到後端...');
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageString,
            signature,
          }),
          credentials: 'include',
        });

        console.log('後端響應狀態:', response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error('後端驗證失敗:', error);
          throw new Error(error.message || '認證失敗');
        }

        const result = await response.json();
        console.log('驗證成功:', result);
        return result;
      } catch (error) {
        console.error('SIWE 登入過程中發生錯誤:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      const isCreator = wallet.address?.toLowerCase() === '0x36F322fC85B24aB13263CFE9217B28f8E2b38381'.toLowerCase();
      toast({
        title: "登入成功",
        description: isCreator ? "歡迎回來！你現在可以管理文章了。" : "歡迎回來！你現在可以閱讀文章了。",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "登入失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      toast({
        title: "已登出",
        description: "你已安全登出系統。",
      });
    },
  });

  return {
    isAuthenticated: authStatus?.authenticated || false,
    isLoading,
    address: authStatus?.address,
    authStatus,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}