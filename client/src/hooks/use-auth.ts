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
    queryKey: ['/api/auth/status'],
    enabled: true,
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!wallet.isConnected || !wallet.address) {
        throw new Error('請先連接錢包');
      }

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: wallet.address,
        statement: 'Sign in to access premium content',
        uri: window.location.origin,
        version: '1',
        chainId: 84532, // Base Sepolia
        nonce: Math.random().toString(36).substring(2, 15),
        issuedAt: new Date().toISOString(),
      });

      const messageString = message.prepareMessage();

      // Request signature from wallet
      const signature = await (window.ethereum as any).request({
        method: 'personal_sign',
        params: [messageString, wallet.address],
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
      toast({
        title: "登入成功",
        description: "歡迎回來！你現在可以管理文章了。",
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
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}