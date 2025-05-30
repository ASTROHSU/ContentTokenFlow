import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Unlock } from 'lucide-react';
import { formatUSDC } from '@/lib/web3';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  price: string;
  category: string;
  author: string;
  authorAvatar?: string;
  imageUrl?: string;
}

export function ContentGrid() {

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const handleUnlock = (article: Article) => {
    // Navigate to article page which will handle authentication first
    window.location.href = `/article/${article.id}`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral mb-4">Premium Content</h2>
            <p className="text-gray-600">High-quality articles unlocked by AI agents and human readers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-16 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="flex justify-between">
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral mb-4">精選深度內容</h2>
            <p className="text-gray-600">由 AI 代理和讀者解鎖的高品質區塊鏈分析文章</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles?.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {article.imageUrl && (
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
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
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>x402</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">
                        {formatUSDC(article.price)} USDC
                      </span>
                    </div>
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-neutral mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleUnlock(article)}
                  >
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {article.authorAvatar && (
                        <img 
                          src={article.authorAvatar}
                          alt={article.author}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm text-gray-600">
                        {article.author}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={() => handleUnlock(article)}
                      className="bg-primary text-white hover:bg-indigo-700"
                    >
                      <Unlock className="w-4 h-4 mr-1" />
                      Unlock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
