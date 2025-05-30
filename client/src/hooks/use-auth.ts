import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiweMessage } from 'siwe';
import { useReownWallet } from '@/components/wallet-provider-reown';
import { useToast } from './use-toast';

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
      if (!wallet.isConnected || !wallet.address) {
        throw new Error('請先連接錢包');
      }

      // Normalize address to lowercase for consistency
      const normalizedAddress = wallet.address.toLowerCase();

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: normalizedAddress,
        statement: 'Sign in to access premium content',
        uri: window.location.origin,
        version: '1',
        chainId: 84532, // Base Sepolia
        nonce: Math.random().toString(36).substring(2, 15),
        issuedAt: new Date().toISOString(),
      });

      const messageString = message.prepareMessage();

      // Request signature using WalletConnect provider
      if (!(window as any).ethereum) {
        throw new Error('請確保錢包已連接');
      }

      const signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [messageString, normalizedAddress],
      });

      // Verify with backend
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageString,
          signature,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '認證失敗');
      }

      return response.json();
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