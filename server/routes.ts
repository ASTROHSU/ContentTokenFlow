import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { blockchainVerifier } from "./blockchain-verifier";
import { insertPaymentSchema, insertAgentActivitySchema, insertArticleSchema } from "@shared/schema";
import { z } from "zod";
import { SiweMessage } from "siwe";

const connectWalletSchema = z.object({
  walletAddress: z.string(),
  balance: z.string().optional(),
});

const processPaymentSchema = insertPaymentSchema.extend({
  articleId: z.number(),
  walletAddress: z.string(),
  amount: z.string(),
  paymentType: z.enum(["wallet", "ai_agent"]),
});

const siweVerifySchema = z.object({
  message: z.string(),
  signature: z.string(),
});

// Authorized creator address
const CREATOR_ADDRESS = "0x36F322fC85B24aB13263CFE9217B28f8E2b38381";

export async function registerRoutes(app: Express): Promise<Server> {
  // SIWE Authentication
  app.post("/api/auth/verify", async (req, res) => {
    try {
      console.log('SIWE verification request body:', req.body);
      const { message, signature } = siweVerifySchema.parse(req.body);
      
      console.log('SIWE message received:', message);
      console.log('SIWE signature received:', signature);
      
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });
      
      // Normalize address to lowercase for consistency
      const normalizedAddress = fields.data.address.toLowerCase();
      
      // Allow any wallet address to authenticate
      req.session.authenticated = true;
      req.session.address = normalizedAddress;
      console.log('SIWE verification successful for address:', normalizedAddress);
      res.json({ success: true, address: normalizedAddress });
    } catch (error) {
      console.error('SIWE verification error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      res.status(400).json({ message: "Invalid signature" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.authenticated = false;
    req.session.address = undefined;
    res.json({ success: true });
  });

  app.get("/api/auth/status", (req, res) => {
    // Clear authentication if wallet address in query doesn't match session
    const walletAddress = req.query.wallet as string;
    
    if (walletAddress && req.session.address && 
        walletAddress.toLowerCase() !== req.session.address) {
      req.session.authenticated = false;
      req.session.address = undefined;
    }
    
    res.json({ 
      authenticated: !!req.session.authenticated,
      address: req.session.address 
    });
  });

  // Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Create new article (requires authentication)
  app.post("/api/articles", async (req, res) => {
    if (!req.session.authenticated) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(articleData);
      await storage.updateProtocolStats();
      res.json(article);
    } catch (error) {
      res.status(400).json({ message: "Invalid article data" });
    }
  });

  // Get single article with x402 protocol support
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      const walletAddress = req.query.wallet as string;
      const isAIAgent = req.headers['user-agent']?.includes('AI-Agent') || req.headers['x-ai-agent'];
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check if user has paid for access or is the creator
      const isCreator = walletAddress?.toLowerCase() === '0x36F322fC85B24aB13263CFE9217B28f8E2b38381'.toLowerCase();
      let hasAccess = isCreator;
      
      // For non-creators, verify payment through blockchain
      if (!isCreator && walletAddress) {
        console.log(`Verifying blockchain payment for wallet: ${walletAddress}`);
        // Always check blockchain first for security
        hasAccess = await blockchainVerifier.checkArticleAccessWithBlockchain(storage, id, walletAddress);
        console.log(`Blockchain verification result: ${hasAccess}`);
      }
      
      if (!hasAccess) {
        // Return x402 Payment Required response with proper headers
        res.status(402);
        res.set({
          'X-Payment-Required': 'true',
          'X-Payment-Amount': article.price,
          'X-Payment-Currency': 'USDC',
          'X-Payment-Recipient': '0x36F322fC85B24aB13263CFE9217B28f8E2b38381',
          'X-Payment-Network': 'base-sepolia',
          'X-Content-Type': 'premium-article',
          'X-AI-Accessible': isAIAgent ? 'true' : 'false',
          'X-Payment-Endpoint': '/api/payments'
        });
        
        return res.json({
          error: 'Payment Required',
          code: 402,
          message: 'This content requires payment to access',
          payment: {
            amount: article.price,
            currency: 'USDC',
            recipient: '0x36F322fC85B24aB13263CFE9217B28f8E2b38381',
            network: 'base-sepolia',
            paymentEndpoint: '/api/payments',
            unlockEndpoint: `/api/articles/${id}/unlock`
          },
          preview: {
            ...article,
            content: article.excerpt,
            hasAccess: false,
          }
        });
      } else {
        // Return full article for authenticated users
        res.json({
          ...article,
          hasAccess: true,
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Get article content after blockchain verification
  app.post("/api/articles/:id/unlock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { walletAddress, verificationResult } = req.body;
      
      if (!verificationResult) {
        return res.status(403).json({ message: "Blockchain verification required" });
      }

      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Return full article content
      res.json({
        ...article,
        hasAccess: true,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlock article" });
    }
  });

  // Connect wallet
  app.post("/api/wallet/connect", async (req, res) => {
    try {
      const { walletAddress, balance } = connectWalletSchema.parse(req.body);
      
      // Normalize address to lowercase for consistency
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if user exists, create if not
      let user = await storage.getUserByWallet(normalizedAddress);
      if (!user) {
        user = await storage.createUser({
          username: normalizedAddress.slice(0, 10),
          password: "wallet_auth",
          walletAddress: normalizedAddress,
          usdcBalance: balance || "0",
        });
      } else if (balance) {
        await storage.updateUserBalance(normalizedAddress, balance);
      }

      res.json({ user, connected: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid wallet connection data" });
    }
  });

  // Process payment
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = processPaymentSchema.parse(req.body);
      
      // Create payment record
      const payment = await storage.createPayment(paymentData);
      
      // Simulate payment processing
      setTimeout(async () => {
        const txHash = "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4);
        await storage.updatePaymentStatus(payment.id, "completed", txHash);
        await storage.updateProtocolStats();
        
        // Add agent activity if it's an AI payment
        if (paymentData.paymentType === "ai_agent") {
          await storage.createAgentActivity({
            agentId: paymentData.agentId || "Agent_" + Math.random().toString(36).substr(2, 6),
            action: `Payment ${paymentData.amount} USDC → Article #${paymentData.articleId}`,
            articleId: paymentData.articleId,
            amount: paymentData.amount,
            status: "completed",
          });
        }
      }, 2000);

      res.json({ payment, status: "processing" });
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Sync stats with blockchain data
  app.post("/api/admin/sync-blockchain-stats", async (req, res) => {
    try {
      console.log('Syncing stats with blockchain data...');
      
      // Get all USDC transactions to the recipient address
      const transactions = await blockchainVerifier.getUSDCTransactions();
      
      // Filter for 1.5 USDC payments (1500000 in wei, USDC has 6 decimals)
      const validPayments = transactions.filter(tx => tx.value === '1500000');
      
      // Get unique paying addresses (excluding creator)
      const uniquePayingAddresses = new Set(
        validPayments
          .map(tx => tx.from.toLowerCase())
          .filter(addr => addr !== '0x36f322fc85b24ab13263cfe9217b28f8e2b38381')
      );
      
      const realStats = {
        totalPayments: validPayments.length,
        totalUSDC: (validPayments.length * 1.5).toFixed(6),
        activeAgents: uniquePayingAddresses.size,
        totalArticles: 1
      };
      
      // Update protocol stats
      await storage.updateProtocolStats();
      
      res.json({
        success: true,
        blockchainData: {
          totalTransactions: transactions.length,
          validPayments: validPayments.length,
          uniquePayingUsers: uniquePayingAddresses.size,
          totalUSDC: realStats.totalUSDC
        },
        updatedStats: realStats
      });
    } catch (error) {
      console.error('Blockchain sync error:', error);
      res.status(500).json({ error: 'Failed to sync with blockchain' });
    }
  });

  // AI Agent Discovery API - List available content
  app.get("/api/ai/discover", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      const agentData = articles.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        price: article.price,
        author: article.author,
        createdAt: article.createdAt,
        paymentRequired: true,
        accessEndpoint: `/api/articles/${article.id}`,
        paymentEndpoint: '/api/ai/purchase'
      }));
      
      res.set({
        'X-AI-Content-Count': articles.length.toString(),
        'X-Payment-Currency': 'USDC',
        'X-Payment-Network': 'base-sepolia'
      });
      
      res.json({
        platform: 'blocktrend-ai',
        contentType: 'premium-articles',
        totalItems: articles.length,
        currency: 'USDC',
        network: 'base-sepolia',
        items: agentData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content for AI" });
    }
  });

  // AI Agent Purchase API - Automated payment for AI agents
  app.post("/api/ai/purchase", async (req, res) => {
    try {
      const { articleId, agentId, agentWallet, metadata } = req.body;
      
      if (!articleId || !agentId || !agentWallet) {
        return res.status(400).json({ 
          message: "Missing required fields: articleId, agentId, agentWallet" 
        });
      }
      
      const article = await storage.getArticle(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Check if already purchased
      const hasAccess = await storage.checkArticleAccess(articleId, agentWallet);
      if (hasAccess) {
        return res.status(200).json({
          message: "Content already purchased",
          accessEndpoint: `/api/articles/${articleId}?wallet=${agentWallet}`
        });
      }
      
      // Create payment record for AI agent
      const payment = await storage.createPayment({
        articleId,
        walletAddress: agentWallet,
        amount: article.price,
        paymentType: 'ai_agent',
        status: 'completed',
        agentId,
        txHash: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      
      // Create agent activity record
      await storage.createAgentActivity({
        agentId,
        action: 'purchase_content',
        articleId,
        amount: article.price,
        status: 'completed'
      });
      
      await storage.updateProtocolStats();
      
      res.json({
        success: true,
        payment,
        message: "Content purchased successfully",
        accessEndpoint: `/api/articles/${articleId}?wallet=${agentWallet}`,
        content: {
          id: article.id,
          title: article.title,
          content: article.content,
          metadata: {
            category: article.category,
            author: article.author,
            createdAt: article.createdAt,
            purchaseTimestamp: new Date().toISOString(),
            agentMetadata: metadata
          }
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process AI agent purchase" });
    }
  });

  // Get payment status
  app.get("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payments = Array.from((storage as any).payments.values());
      const payment = payments.find((p: any) => p.id === id);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  // Get user payments
  app.get("/api/payments/wallet/:address", async (req, res) => {
    try {
      const walletAddress = req.params.address;
      const payments = await storage.getPaymentsByWallet(walletAddress);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Check payment access for an article (database + blockchain verification)
  app.get("/api/payments/check", async (req, res) => {
    try {
      const articleId = parseInt(req.query.articleId as string);
      const walletAddress = req.query.walletAddress as string;
      const minimumAmount = req.query.amount as string;
      
      console.log(`Payment check request: articleId=${articleId}, walletAddress=${walletAddress}`);
      
      if (!articleId || !walletAddress) {
        console.log(`Missing parameters: articleId=${!!articleId}, walletAddress=${!!walletAddress}`);
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // First check database payments
      const userPayments = await storage.getPaymentsByWallet(walletAddress);
      console.log(`Found ${userPayments.length} payments for wallet ${walletAddress}`);
      
      const hasDbPayment = userPayments.some(payment => 
        payment.articleId === articleId && 
        (payment.status === 'completed' || payment.status === 'success')
      );

      if (hasDbPayment) {
        console.log('Access granted via database payment record');
        return res.json({ hasAccess: true, source: 'database' });
      }

      // Fallback to blockchain verification using Basescan API
      if (minimumAmount && process.env.BASESCAN_API_KEY) {
        try {
          const recipientAddress = '0x36F322fC85B24aB13263CFE9217B28f8E2b38381';
          const usdcContract = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
          
          const basescanUrl = `https://api-sepolia.basescan.org/api` +
            `?module=account` +
            `&action=tokentx` +
            `&contractaddress=${usdcContract}` +
            `&address=${walletAddress}` +
            `&startblock=0` +
            `&endblock=latest` +
            `&sort=desc` +
            `&apikey=${process.env.BASESCAN_API_KEY}`;
          
          const response = await fetch(basescanUrl);
          const data = await response.json();
          
          if (data.status === '1' && data.result && data.result.length > 0) {
            const minimumAmountWei = BigInt(parseFloat(minimumAmount) * 1000000);
            
            for (const tx of data.result) {
              if (tx.to.toLowerCase() === recipientAddress.toLowerCase()) {
                const transferAmount = BigInt(tx.value);
                if (transferAmount >= minimumAmountWei) {
                  console.log('Access granted via blockchain verification');
                  return res.json({ hasAccess: true, source: 'blockchain' });
                }
              }
            }
          }
        } catch (blockchainError) {
          console.log('Blockchain verification failed:', blockchainError);
        }
      }

      console.log(`No valid payment found for wallet ${walletAddress}, article ${articleId}`);
      res.json({ hasAccess: false });
    } catch (error) {
      console.error('Payment check error:', error);
      res.status(500).json({ message: "Failed to check payment access" });
    }
  });

  // Get agent activity
  app.get("/api/agent-activity", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getAgentActivity(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent activity" });
    }
  });

  // Simulate agent activity
  app.post("/api/agent-activity/simulate", async (req, res) => {
    try {
      const agentNames = ['Agent_Alpha_7x9', 'Agent_Beta_3k1', 'Agent_Gamma_9m2', 'Agent_Delta_5n7', 'Agent_Epsilon_2k8'];
      const actions = [
        'Scanning content library...',
        'Evaluating content relevance...',
        'Analyzing payment history...',
        'Content preference updated',
      ];

      const agentId = agentNames[Math.floor(Math.random() * agentNames.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];

      const activity = await storage.createAgentActivity({
        agentId,
        action,
        status: "active",
      });

      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate agent activity" });
    }
  });

  // Get protocol stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getProtocolStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // HTTP 402 endpoint for payment required
  app.get("/api/articles/:id/content", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const walletAddress = req.query.wallet as string;
      
      if (!walletAddress) {
        return res.status(401).json({ message: "Wallet address required" });
      }

      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const hasAccess = await storage.checkArticleAccess(id, walletAddress);
      if (!hasAccess) {
        // HTTP 402 Payment Required
        return res.status(402).json({ 
          message: "Payment required to access this content",
          price: article.price,
          currency: "USDC",
          protocol: "x402",
        });
      }

      res.json({ content: article.content });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
