import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReownWallet } from '@/components/wallet-provider-reown';
import { formatUSDC, checkUSDCPayment } from '@/lib/web3';
import { ArrowLeft, Lock, Calendar, User } from 'lucide-react';
import { useState } from 'react';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [unlockedArticle, setUnlockedArticle] = useState<ArticleData | null>(null);
  
  const articleId = params.id ? parseInt(params.id) : null;

  const { data: article, isLoading, error } = useQuery<ArticleData>({
    queryKey: ['/api/articles', articleId],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}?wallet=${wallet.address || ''}`, {
        credentials: 'include',
      });
      
      if (response.status === 402) {
        const errorData = await response.json();
        throw new Error(`Payment required: ${errorData.message}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      
      return response.json();
    },
    enabled: !!articleId,
  });

  // Check blockchain payment status
  const { data: hasBlockchainAccess, isLoading: isCheckingPayment } = useQuery({
    queryKey: ['/api/blockchain-access', articleId, wallet.address],
    queryFn: async () => {
      if (!wallet.address || !article) return false;
      
      const recipientAddress = '0x36F322fC85B24aB13263CFE9217B28f8E2b38381';
      return await checkUSDCPayment(wallet.address, recipientAddress, article.price);
    },
    enabled: !!wallet.address && !!article && !unlockedArticle,
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
    enabled: !!hasBlockchainAccess && !unlockedArticle,
  });

  // Update unlocked article when data is fetched
  if (fullArticle && !unlockedArticle) {
    setUnlockedArticle(fullArticle);
  }

  if (isLoading) {
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

  if (error || !article) {
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

          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge
                variant="secondary"
                className={
                  article.category === 'Blockchain' ? 'bg-primary/10 text-primary' :
                  article.category === 'AI' ? 'bg-secondary/10 text-secondary' :
                  'bg-accent/10 text-accent'
                }
              >
                {article.category}
              </Badge>
              <div className="flex items-center space-x-2 text-accent font-semibold">
                <span>{formatUSDC(article.price)} USDC</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-neutral mb-4">
              {article.title}
            </h1>

            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Show content if unlocked via blockchain verification */}
          {unlockedArticle && unlockedArticle.content ? (
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
                    {unlockedArticle.content}
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
