import { useParams, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReownWallet } from '@/components/wallet-provider-reown';
import { useAuth } from '@/hooks/use-auth';
import { formatUSDC, checkUSDCPayment } from '@/lib/web3';
import { ArrowLeft, Lock, Calendar, User, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PaymentModal } from '@/components/payment-modal';

interface ArticleData {
  id: number;
  title: string;
  excerpt: string;
  content: string | null;
  price: string;
  category: string;
  author: string;
  authorAvatar?: string;
  imageUrl?: string;
  createdAt: string;
  hasAccess: boolean;
}

export default function Article() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { wallet } = useReownWallet();
  const { isAuthenticated, isLoading: authLoading, login, isLoggingIn, address: authAddress } = useAuth();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [unlockedArticle, setUnlockedArticle] = useState<ArticleData | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  
  const articleId = params.id ? parseInt(params.id) : null;

  // Trigger authentication when user visits article page
  useEffect(() => {
    console.log('Auth check:', { 
      isConnected: wallet.isConnected, 
      isAuthenticated, 
      authLoading, 
      needsAuth,
      walletAddress: wallet.address,
      authAddress: authAddress
    });
    
    // Force authentication if wallet address doesn't match authenticated address
    if (wallet.isConnected && isAuthenticated && authAddress && 
        authAddress.toLowerCase() !== wallet.address?.toLowerCase()) {
      console.log('Address mismatch, forcing re-authentication...');
      // Clear authentication state and force new auth
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      setNeedsAuth(true);
      return;
    }
    
    // Only trigger authentication if we get a 401/402 error when fetching article
    // Don't pre-emptively require authentication
  }, [wallet.isConnected, wallet.address, isAuthenticated, authLoading, authAddress]);

  // Reset auth state when authentication completes
  useEffect(() => {
    if (isAuthenticated && needsAuth) {
      setNeedsAuth(false);
    }
  }, [isAuthenticated, needsAuth]);

  const { data: article, isLoading, error } = useQuery<ArticleData>({
    queryKey: ['/api/articles', articleId, wallet.address],
    queryFn: async () => {
      console.log('Fetching article with wallet:', wallet.address);
      const response = await fetch(`/api/articles/${articleId}?wallet=${wallet.address || ''}`, {
        credentials: 'include',
      });
      
      if (response.status === 402) {
        const errorData = await response.json();
        // Don't trigger SIWE auth for 402 - just show payment option
        return errorData; // Return 402 data to show payment interface
      }
      
      // If we successfully got the article, clear any auth requirements
      if (response.status === 200 && needsAuth) {
        console.log('Successfully got article, clearing needsAuth');
        setNeedsAuth(false);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      
      return response.json();
    },
    enabled: !!articleId && !!wallet.address,
  });

  // Check payment access only after authentication
  const { data: hasPaymentAccess, isLoading: isCheckingPayment } = useQuery({
    queryKey: ['/api/payment-access', articleId, wallet.address],
    queryFn: async () => {
      if (!wallet.address || !article || !isAuthenticated) return false;
      
      // Check payment history directly
      try {
        const response = await fetch(`/api/payments/wallet/${wallet.address}`);
        if (response.ok) {
          const payments = await response.json();
          console.log('Payment history:', payments);
          
          const hasValidPayment = payments.some((payment: any) => 
            payment.articleId === parseInt(String(articleId)) && 
            (payment.status === 'completed' || payment.status === 'success')
          );
          
          if (hasValidPayment) {
            console.log('Access granted - payment found in history');
            return true;
          } else {
            console.log('No valid payment found for this article');
          }
        }
      } catch (error) {
        console.log('Payment check failed:', error);
      }
      
      return false;
    },
    enabled: !!wallet.address && !!article && !!isAuthenticated && !unlockedArticle,
  });

  // Unlock article content if payment verified
  const { data: fullArticle } = useQuery<ArticleData>({
    queryKey: ['/api/articles', articleId, 'unlock'],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.address,
          verificationResult: true,
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unlock article');
      }
      
      return response.json();
    },
    enabled: !!hasPaymentAccess && !unlockedArticle,
  });

  // Update unlocked article when data is fetched
  if (fullArticle && !unlockedArticle) {
    setUnlockedArticle(fullArticle);
  }

  // Skip SIWE authentication for now - payment verification is sufficient
  // Will handle access control through payment verification only

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle payment required error specially to show purchase option
  if (error?.message?.includes('Payment required')) {
    return (
      <>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card>
              <CardContent className="p-8 text-center">
                <Lock className="mx-auto text-4xl text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Article Access Restricted</h2>
                <p className="text-gray-600 mb-6">
                  Payment required: This content requires payment to access
                </p>
                
                {wallet.isConnected && isAuthenticated ? (
                  <div className="mb-6">
                    <Button 
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      Purchase Article ($1.50 USDC)
                    </Button>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-4">Please connect wallet and sign in to purchase</p>
                    {!wallet.isConnected && (
                      <Button 
                        onClick={() => window.location.reload()}
                        className="bg-primary text-white"
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                )}
                
                <Button onClick={() => setLocation('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Articles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <PaymentModal
          article={{
            id: parseInt(articleId?.toString() || '1'),
            title: '被遺忘的 402，如何成為 AI 時代最重要的支付入口？',
            price: '1.50',
          }}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </>
    );
  }
  
  // Handle 402 responses with preview data
  const displayArticle = (article as any)?.preview || article;
  
  if (error && !displayArticle) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <Lock className="mx-auto text-4xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Article Access Restricted</h2>
              <p className="text-gray-600 mb-6">
                {error?.message || 'This article could not be loaded.'}
              </p>
              
              <Button onClick={() => setLocation('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-8 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Button>

          {displayArticle.imageUrl && (
            <img
              src={displayArticle.imageUrl}
              alt={displayArticle.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge
                variant="secondary"
                className={
                  displayArticle.category === 'Blockchain' ? 'bg-primary/10 text-primary' :
                  displayArticle.category === 'AI' ? 'bg-secondary/10 text-secondary' :
                  'bg-accent/10 text-accent'
                }
              >
                {displayArticle.category}
              </Badge>
              <div className="flex items-center space-x-2 text-accent font-semibold">
                <span>{formatUSDC(displayArticle.price)} USDC</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-neutral mb-4">
              {displayArticle.title}
            </h1>

            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{displayArticle.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(displayArticle.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed">
              {displayArticle.excerpt}
            </p>
          </div>

          {/* Show content if article has content (already paid) or unlocked */}
          {article.content || (unlockedArticle && unlockedArticle.content) || (hasPaymentAccess && fullArticle && fullArticle.content) ? (
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-gray-800 leading-7 text-base"
                    style={{ 
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: '1.75',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {article.content || unlockedArticle?.content || fullArticle?.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isCheckingPayment ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">正在檢查區塊鏈付款記錄...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>Premium Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  This article is protected by the X402 protocol. Pay {formatUSDC(article.price)} USDC to unlock the full content.
                </p>
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-primary text-white hover:bg-indigo-700"
                >
                  Unlock Article
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PaymentModal
        article={{
          id: article.id,
          title: article.title,
          price: article.price,
        }}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  );
}
