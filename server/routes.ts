import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
      const { message, signature } = siweVerifySchema.parse(req.body);
      
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });
      
      if (fields.data.address.toLowerCase() === CREATOR_ADDRESS.toLowerCase()) {
        req.session.authenticated = true;
        req.session.address = fields.data.address;
        res.json({ success: true, address: fields.data.address });
      } else {
        res.status(403).json({ message: "Unauthorized address" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid signature" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.authenticated = false;
    req.session.address = undefined;
    res.json({ success: true });
  });

  app.get("/api/auth/status", (req, res) => {
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

  // Get single article
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      const walletAddress = req.query.wallet as string;
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Return article with wallet address for client-side blockchain verification
      res.json({
        ...article,
        hasAccess: false, // Will be checked on client-side via blockchain
        content: null, // Will be revealed after blockchain verification
        walletAddress: walletAddress || null,
      });
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
      
      // Check if user exists, create if not
      let user = await storage.getUserByWallet(walletAddress);
      if (!user) {
        user = await storage.createUser({
          username: walletAddress.slice(0, 10),
          password: "wallet_auth",
          walletAddress,
          usdcBalance: balance || "0",
        });
      } else if (balance) {
        await storage.updateUserBalance(walletAddress, balance);
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

  // Check payment access for an article
  app.get("/api/payments/check", async (req, res) => {
    try {
      const articleId = parseInt(req.query.articleId as string);
      const walletAddress = req.query.walletAddress as string;
      
      console.log(`Payment check request: articleId=${articleId}, walletAddress=${walletAddress}`);
      
      if (!articleId || !walletAddress) {
        console.log(`Missing parameters: articleId=${!!articleId}, walletAddress=${!!walletAddress}`);
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Check if user has any successful payment for this article
      const userPayments = await storage.getPaymentsByWallet(walletAddress);
      console.log(`Found ${userPayments.length} payments for wallet ${walletAddress}`);
      console.log('Payments:', userPayments.map(p => ({ id: p.id, articleId: p.articleId, status: p.status })));
      
      const hasPayment = userPayments.some(payment => 
        payment.articleId === articleId && 
        (payment.status === 'completed' || payment.status === 'success')
      );

      console.log(`Payment check result for wallet ${walletAddress}, article ${articleId}: ${hasPayment}`);
      res.json({ hasAccess: hasPayment });
    } catch (error) {
      console.error('Payment check error:', error);
      res.status(500).json({ message: "Failed to check payment access", error: error.message });
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
