import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useReownWallet } from './wallet-provider-reown';
import { formatUSDC, processUSDCPayment } from '@/lib/web3';
import { Lock, Wallet, Bot, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface Article {
  id: number;
  title: string;
  price: string;
}

interface PaymentModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentResult {
  txHash: string;
  gasFee: string;
}

export function PaymentModal({ article, isOpen, onClose }: PaymentModalProps) {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { wallet } = useReownWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const paymentMutation = useMutation({
    mutationFn: async (paymentType: 'wallet' | 'ai_agent') => {
      let result: PaymentResult;
      
      if (paymentType === 'wallet') {
        if (!wallet.isConnected) {
          throw new Error('Wallet not connected');
        }
        // Process real USDC payment on blockchain
        result = await processUSDCPayment(article.price, wallet.address!);
      } else {
        // For AI agent payments, simulate the transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        result = {
          txHash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'success',
          gasUsed: '21000',
          gasFee: '0.001',
        };
      }
      
      // Send payment to backend
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          walletAddress: wallet.address || 'ai_agent_wallet',
          amount: article.price,
          paymentType,
          status: 'pending',
          agentId: paymentType === 'ai_agent' ? `Agent_${Math.random().toString(36).substr(2, 6)}` : undefined,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const payment = await response.json();
      return { ...payment, txHash: result.txHash, gasFee: result.gasFee };
    },
    onSuccess: (data) => {
      setPaymentResult({
        txHash: data.txHash,
        gasFee: data.gasFee,
      });
      setShowSuccess(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-activity'] });
      
      toast({
        title: "Payment Successful!",
        description: "Your content has been unlocked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePayment = (type: 'wallet' | 'ai_agent') => {
    if (type === 'wallet' && !wallet.isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }
    paymentMutation.mutate(type);
  };

  const handleReadArticle = () => {
    onClose();
    setShowSuccess(false);
    setPaymentResult(null);
    setLocation(`/article/${article.id}`);
  };

  const handleClose = () => {
    onClose();
    setShowSuccess(false);
    setPaymentResult(null);
  };

  if (showSuccess && paymentResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <Check className="text-white text-2xl" />
            </div>
            <DialogTitle className="text-2xl font-bold">Payment Successful!</DialogTitle>
            <p className="text-gray-600">Your content has been unlocked and is ready to read.</p>
          </DialogHeader>

          <Card className="bg-light-gray">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Hash:</span>
                  <span className="font-mono text-primary">{paymentResult.txHash.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-accent">{formatUSDC(article.price)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Fee:</span>
                  <span className="text-gray-600">${paymentResult.gasFee}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button onClick={handleReadArticle} className="w-full bg-accent text-white hover:bg-emerald-700">
              Start Reading
            </Button>
            <Button variant="ghost" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <Lock className="mx-auto text-4xl text-primary mb-4" />
          <DialogTitle className="text-2xl font-bold">Unlock Premium Content</DialogTitle>
          <p className="text-gray-600">This article requires payment to access</p>
        </DialogHeader>

        <Card className="bg-light-gray">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Article:</span>
                <span className="text-sm text-gray-600 text-right max-w-48 truncate">
                  {article.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Price:</span>
                <span className="text-accent font-bold">
                  {formatUSDC(article.price)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Protocol:</span>
                <span className="text-primary font-mono text-sm">HTTP 402 + X402</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button
            onClick={() => handlePayment('wallet')}
            disabled={paymentMutation.isPending}
            className="w-full bg-primary text-white hover:bg-indigo-700 flex items-center justify-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>
              {paymentMutation.isPending ? 'Processing...' : 'Pay with Connected Wallet'}
            </span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or simulate AI payment</span>
            </div>
          </div>

          <Button
            onClick={() => handlePayment('ai_agent')}
            disabled={paymentMutation.isPending}
            variant="outline"
            className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white flex items-center justify-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>Simulate AI Agent Payment</span>
          </Button>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
