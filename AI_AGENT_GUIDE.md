# AI 代理使用指南

## x402 協議實現

區塊勢 for AI 現在完整支援 x402 支付協議，提供標準化的內容付費機制。

### HTTP 402 回應格式

當 AI 代理訪問付費內容時，伺服器會返回標準的 HTTP 402 狀態碼和相關標頭：

```http
HTTP/1.1 402 Payment Required
X-Payment-Required: true
X-Payment-Amount: 1.50
X-Payment-Currency: USDC
X-Payment-Recipient: 0x36F322fC85B24aB13263CFE9217B28f8E2b38381
X-Payment-Network: base-sepolia
X-Content-Type: premium-article
X-AI-Accessible: true
X-Payment-Endpoint: /api/payments
```

### AI 代理 API

#### 1. 發現內容 API

```bash
GET /api/ai/discover
User-Agent: AI-Agent/1.0
```

回應：
```json
{
  "platform": "blocktrend-ai",
  "contentType": "premium-articles",
  "totalItems": 1,
  "currency": "USDC",
  "network": "base-sepolia",
  "items": [
    {
      "id": 1,
      "title": "被遺忘的 402，如何成為 AI 時代最重要的支付入口？",
      "excerpt": "HTTP 402 狀態碼原本是為了網路微支付而設計...",
      "category": "區塊鏈",
      "price": "1.50",
      "author": "區塊勢",
      "paymentRequired": true,
      "accessEndpoint": "/api/articles/1",
      "paymentEndpoint": "/api/ai/purchase"
    }
  ]
}
```

#### 2. 自動購買 API

```bash
POST /api/ai/purchase
Content-Type: application/json
X-AI-Agent: true
User-Agent: AI-Agent/1.0

{
  "articleId": 1,
  "agentId": "MyAI_Agent_v1.0",
  "agentWallet": "0x1234...abcd",
  "metadata": {
    "purpose": "research",
    "timestamp": "2025-05-30T12:30:00Z"
  }
}
```

成功回應：
```json
{
  "success": true,
  "payment": {
    "id": 15,
    "txHash": "ai_1748608000_xyz123",
    "status": "completed"
  },
  "message": "Content purchased successfully",
  "accessEndpoint": "/api/articles/1?wallet=0x1234...abcd",
  "content": {
    "id": 1,
    "title": "被遺忘的 402，如何成為 AI 時代最重要的支付入口？",
    "content": "完整文章內容...",
    "metadata": {
      "category": "區塊鏈",
      "author": "區塊勢",
      "purchaseTimestamp": "2025-05-30T12:30:15Z"
    }
  }
}
```

#### 3. 訪問已購買內容

```bash
GET /api/articles/1?wallet=0x1234...abcd
X-AI-Agent: true
User-Agent: AI-Agent/1.0
```

## 使用場景

### 1. 內容研究機器人
AI 代理可以自動發現相關主題的付費文章，評估內容價值後自動購買並整理資訊。

### 2. 知識訓練資料收集
AI 模型可以使用此平台獲取高質量的中文區塊鏈內容作為訓練資料。

### 3. 自動化內容分析
企業可以部署 AI 代理定期購買和分析行業相關的付費報告。

## 付費流程

1. **發現階段**：AI 代理調用 `/api/ai/discover` 獲取可用內容
2. **評估階段**：根據標題、摘要、價格等資訊決定是否購買
3. **購買階段**：調用 `/api/ai/purchase` 完成自動付款
4. **訪問階段**：使用獲得的訪問端點獲取完整內容

## 安全特性

- 每次購買都會創建不可偽造的交易記錄
- 支援錢包地址驗證，防止重複購買
- 完整的 x402 協議合規實現
- 透明的區塊鏈付款追蹤