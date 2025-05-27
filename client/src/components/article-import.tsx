import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  price: string;
  category: string;
  author: string;
  authorAvatar?: string;
  imageUrl?: string;
}

export function ArticleImport() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    price: '',
    category: '',
    author: '',
    authorAvatar: '',
    imageUrl: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price).toFixed(6),
          isLocked: true,
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create article');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "文章新增成功！",
        description: "你的文章已經加入平台並設定為付費內容。",
      });
      setOpen(false);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        price: '',
        category: '',
        author: '',
        authorAvatar: '',
        imageUrl: '',
      });
    },
    onError: (error) => {
      toast({
        title: "新增失敗",
        description: "文章新增時發生錯誤，請檢查所有欄位。",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt || !formData.content || !formData.price || !formData.category || !formData.author) {
      toast({
        title: "請填寫所有必填欄位",
        description: "標題、摘要、內容、價格、分類和作者都是必填項目。",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast({
        title: "價格格式錯誤",
        description: "請輸入有效的價格數字。",
        variant: "destructive",
      });
      return;
    }

    createArticleMutation.mutate(formData);
  };

  const categories = ['Blockchain', 'AI', 'DeFi', 'Web3', 'NFT', 'DAO', 'Metaverse', 'Gaming'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-white hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          新增文章
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-accent" />
            <span>匯入你的文章</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">文章標題 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="輸入文章標題"
                required
              />
            </div>
            <div>
              <Label htmlFor="author">作者 *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="作者姓名"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">分類 *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇文章分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">價格 (USDC) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="例如: 2.50"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">文章摘要 *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="簡短描述文章內容，吸引讀者..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">文章內容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="輸入完整的文章內容..."
              rows={8}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imageUrl">封面圖片 URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="authorAvatar">作者頭像 URL</Label>
              <Input
                id="authorAvatar"
                value={formData.authorAvatar}
                onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <Card className="bg-light-gray">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Upload className="w-4 h-4" />
                <span>
                  文章將自動設定為付費內容，讀者需要支付 USDC 才能解鎖完整內容。
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={createArticleMutation.isPending}
              className="bg-accent text-white hover:bg-emerald-700"
            >
              {createArticleMutation.isPending ? '新增中...' : '新增文章'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}