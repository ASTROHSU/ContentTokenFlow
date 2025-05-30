#!/usr/bin/env python3
"""
AI 代理示範腳本
模擬一個 AI 代理如何與區塊勢 for AI 平台互動
"""

import requests
import json
import time
import random
import string

class AIAgent:
    def __init__(self, agent_id, base_url="http://localhost:5000"):
        self.agent_id = agent_id
        self.base_url = base_url
        self.wallet_address = self.generate_wallet_address()
        self.headers = {
            'User-Agent': f'AI-Agent/{agent_id}',
            'X-AI-Agent': 'true',
            'Content-Type': 'application/json'
        }
        
    def generate_wallet_address(self):
        """生成一個模擬的錢包地址"""
        return "0x" + ''.join(random.choices(string.hexdigits.lower(), k=40))
    
    def discover_content(self):
        """發現平台上的可用內容"""
        print(f"🤖 {self.agent_id}: 正在發現內容...")
        
        try:
            response = requests.get(
                f"{self.base_url}/api/ai/discover",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 發現 {data['totalItems']} 篇文章")
                print(f"📊 平台: {data['platform']}")
                print(f"💰 支付貨幣: {data['currency']} (網路: {data['network']})")
                return data['items']
            else:
                print(f"❌ 發現內容失敗: {response.status_code}")
                return []
                
        except requests.RequestException as e:
            print(f"❌ 網路錯誤: {e}")
            return []
    
    def evaluate_content(self, articles):
        """評估內容價值（簡單的評估邏輯）"""
        print(f"🤖 {self.agent_id}: 正在評估內容價值...")
        
        for article in articles:
            print(f"\n📝 文章: {article['title']}")
            print(f"💰 價格: {article['price']} USDC")
            print(f"📁 分類: {article['category']}")
            print(f"✍️ 作者: {article['author']}")
            print(f"📄 摘要: {article['excerpt'][:100]}...")
            
            # 簡單的評估邏輯：價格合理就購買
            price = float(article['price'])
            if price <= 2.0:  # 低於 2 USDC 就購買
                print(f"✅ 評估結果: 值得購買")
                return article
            else:
                print(f"❌ 評估結果: 價格過高")
        
        return None
    
    def purchase_content(self, article):
        """購買內容"""
        print(f"🤖 {self.agent_id}: 正在購買內容...")
        
        purchase_data = {
            "articleId": article['id'],
            "agentId": self.agent_id,
            "agentWallet": self.wallet_address,
            "metadata": {
                "purpose": "content_analysis",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "articleTitle": article['title'],
                "evaluationScore": random.uniform(0.7, 1.0)
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/ai/purchase",
                headers=self.headers,
                json=purchase_data
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 購買成功!")
                print(f"💳 交易哈希: {data['payment']['txHash']}")
                print(f"📄 內容長度: {len(data['content']['content'])} 字元")
                return data
            else:
                print(f"❌ 購買失敗: {response.status_code}")
                print(response.text)
                return None
                
        except requests.RequestException as e:
            print(f"❌ 網路錯誤: {e}")
            return None
    
    def analyze_content(self, content_data):
        """分析已購買的內容"""
        print(f"🤖 {self.agent_id}: 正在分析內容...")
        
        content = content_data['content']['content']
        
        # 簡單的內容分析
        word_count = len(content)
        keywords = ['AI', '代理', '402', '支付', '區塊鏈', 'HTTP']
        found_keywords = [kw for kw in keywords if kw in content]
        
        print(f"📊 分析結果:")
        print(f"   - 字數: {word_count}")
        print(f"   - 關鍵字: {', '.join(found_keywords)}")
        print(f"   - 相關性評分: {len(found_keywords) / len(keywords) * 100:.1f}%")
        
        return {
            "word_count": word_count,
            "keywords": found_keywords,
            "relevance_score": len(found_keywords) / len(keywords)
        }
    
    def run_full_cycle(self):
        """執行完整的 AI 代理週期"""
        print(f"🚀 啟動 AI 代理: {self.agent_id}")
        print(f"💼 錢包地址: {self.wallet_address}")
        print("=" * 60)
        
        # 1. 發現內容
        articles = self.discover_content()
        if not articles:
            print("❌ 沒有發現任何內容，結束執行")
            return
        
        # 2. 評估內容
        selected_article = self.evaluate_content(articles)
        if not selected_article:
            print("❌ 沒有找到值得購買的內容，結束執行")
            return
        
        # 3. 購買內容
        purchase_result = self.purchase_content(selected_article)
        if not purchase_result:
            print("❌ 購買失敗，結束執行")
            return
        
        # 4. 分析內容
        analysis = self.analyze_content(purchase_result)
        
        print("\n" + "=" * 60)
        print(f"🎉 {self.agent_id} 任務完成!")
        print(f"📈 最終評分: {analysis['relevance_score'] * 100:.1f}%")

def main():
    """主函數"""
    print("🤖 AI 代理示範程式")
    print("模擬 AI 代理與區塊勢 for AI 平台的互動")
    print("=" * 60)
    
    # 創建多個 AI 代理
    agents = [
        AIAgent("ContentAnalyzer_v1.0"),
        AIAgent("ResearchBot_v2.1"),
        AIAgent("KnowledgeHarvester_v1.5")
    ]
    
    # 隨機選擇一個代理執行任務
    selected_agent = random.choice(agents)
    selected_agent.run_full_cycle()

if __name__ == "__main__":
    main()