import { users, articles, payments, agentActivity, protocolStats, type User, type InsertUser, type Article, type InsertArticle, type Payment, type InsertPayment, type AgentActivity, type InsertAgentActivity, type ProtocolStats } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(walletAddress: string, balance: string): Promise<void>;

  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  checkArticleAccess(articleId: number, walletAddress?: string): Promise<boolean>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByWallet(walletAddress: string): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string, txHash?: string): Promise<void>;

  // Agent Activity
  getAgentActivity(limit?: number): Promise<AgentActivity[]>;
  createAgentActivity(activity: InsertAgentActivity): Promise<AgentActivity>;

  // Protocol Stats
  getProtocolStats(): Promise<ProtocolStats>;
  updateProtocolStats(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private payments: Map<number, Payment>;
  private agentActivities: Map<number, AgentActivity>;
  private stats: ProtocolStats = {
    id: 1,
    totalPayments: 0,
    totalUSDC: "0",
    activeAgents: 0,
    totalArticles: 0,
    updatedAt: new Date(),
  };
  private currentUserId: number;
  private currentArticleId: number;
  private currentPaymentId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.payments = new Map();
    this.agentActivities = new Map();
    this.currentUserId = 1;
    this.currentArticleId = 1;
    this.currentPaymentId = 1;
    this.currentActivityId = 1;

    // Initialize with sample articles
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleArticles = [
      {
        title: "The Future of Decentralized Content Creation",
        excerpt: "Exploring how blockchain technology is revolutionizing content monetization and creator economies...",
        content: "Full article content about decentralized content creation...",
        price: "2.50",
        category: "Blockchain",
        author: "Sarah Chen",
        authorAvatar: "https://pixabay.com/get/gdde7e93315ff9d9117a7231766adf45cab0cacbb7862d96c58caeb1d292409f0f77d120ab7c581a8c2259b19e248dc2ed3a4b51777e5ed475f0f53f83275adda_1280.jpg",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isLocked: true,
        createdAt: new Date(),
      },
      {
        title: "Autonomous AI Agents in Web3 Payments",
        excerpt: "How intelligent agents are transforming digital transactions and content consumption patterns...",
        content: "Full article content about AI agents in Web3...",
        price: "1.75",
        category: "AI",
        author: "Alex Rodriguez",
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isLocked: true,
        createdAt: new Date(),
      },
      {
        title: "USDC Payment Rails for Content Platforms",
        excerpt: "Building scalable micropayment infrastructure using stablecoins and smart contracts...",
        content: "Full article content about USDC payment rails...",
        price: "3.00",
        category: "DeFi",
        author: "Emma Thompson",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isLocked: true,
        createdAt: new Date(),
      },
    ];

    sampleArticles.forEach(article => {
      const id = this.currentArticleId++;
      this.articles.set(id, { ...article, id });
    });

    this.stats = {
      id: 1,
      totalPayments: 1247,
      totalUSDC: "12450.00",
      activeAgents: 89,
      totalArticles: this.articles.size,
      updatedAt: new Date(),
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      walletAddress: insertUser.walletAddress || null,
      usdcBalance: insertUser.usdcBalance || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(walletAddress: string, balance: string): Promise<void> {
    const user = await this.getUserByWallet(walletAddress);
    if (user) {
      user.usdcBalance = balance;
      this.users.set(user.id, user);
    }
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const article: Article = { 
      ...insertArticle, 
      id, 
      createdAt: new Date(),
      authorAvatar: insertArticle.authorAvatar || null,
      imageUrl: insertArticle.imageUrl || null,
      isLocked: insertArticle.isLocked ?? null
    };
    this.articles.set(id, article);
    return article;
  }

  async checkArticleAccess(articleId: number, walletAddress?: string): Promise<boolean> {
    if (!walletAddress) return false;
    
    const payments = Array.from(this.payments.values());
    return payments.some(payment => 
      payment.articleId === articleId && 
      payment.walletAddress === walletAddress && 
      payment.status === "completed"
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      createdAt: new Date(),
      walletAddress: insertPayment.walletAddress || null,
      status: insertPayment.status || "pending",
      userId: insertPayment.userId || null,
      txHash: insertPayment.txHash || null,
      agentId: insertPayment.agentId || null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentsByWallet(walletAddress: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => 
      payment.walletAddress === walletAddress
    );
  }

  async updatePaymentStatus(id: number, status: string, txHash?: string): Promise<void> {
    const payment = this.payments.get(id);
    if (payment) {
      payment.status = status;
      if (txHash) payment.txHash = txHash;
      this.payments.set(id, payment);
    }
  }

  async getAgentActivity(limit: number = 10): Promise<AgentActivity[]> {
    const activities = Array.from(this.agentActivities.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
    return activities;
  }

  async createAgentActivity(insertActivity: InsertAgentActivity): Promise<AgentActivity> {
    const id = this.currentActivityId++;
    const activity: AgentActivity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date(),
      articleId: insertActivity.articleId || null,
      amount: insertActivity.amount || null
    };
    this.agentActivities.set(id, activity);
    
    // Keep only last 50 activities to prevent memory bloat
    if (this.agentActivities.size > 50) {
      const oldest = Array.from(this.agentActivities.entries())
        .sort(([,a], [,b]) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())[0];
      this.agentActivities.delete(oldest[0]);
    }
    
    return activity;
  }

  async getProtocolStats(): Promise<ProtocolStats> {
    return this.stats;
  }

  async updateProtocolStats(): Promise<void> {
    const payments = Array.from(this.payments.values()).filter(p => p.status === "completed");
    const totalUSDC = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    this.stats = {
      ...this.stats,
      totalPayments: payments.length,
      totalUSDC: totalUSDC.toFixed(6),
      totalArticles: this.articles.size,
      updatedAt: new Date(),
    };
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(walletAddress: string, balance: string): Promise<void> {
    await db
      .update(users)
      .set({ usdcBalance: balance })
      .where(eq(users.walletAddress, walletAddress));
  }

  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }

  async checkArticleAccess(articleId: number, walletAddress?: string): Promise<boolean> {
    if (!walletAddress) return false;
    
    const [payment] = await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.articleId, articleId),
        eq(payments.walletAddress, walletAddress),
        eq(payments.status, 'completed')
      ));
    
    return !!payment;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPaymentsByWallet(walletAddress: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.walletAddress, walletAddress));
  }

  async updatePaymentStatus(id: number, status: string, txHash?: string): Promise<void> {
    await db
      .update(payments)
      .set({ status, txHash })
      .where(eq(payments.id, id));
  }

  async getAgentActivity(limit: number = 10): Promise<AgentActivity[]> {
    return await db
      .select()
      .from(agentActivity)
      .orderBy(agentActivity.createdAt)
      .limit(limit);
  }

  async createAgentActivity(insertActivity: InsertAgentActivity): Promise<AgentActivity> {
    const [activity] = await db
      .insert(agentActivity)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getProtocolStats(): Promise<ProtocolStats> {
    const [stats] = await db.select().from(protocolStats);
    if (!stats) {
      // Initialize stats if not exists
      const [newStats] = await db
        .insert(protocolStats)
        .values({
          totalPayments: 0,
          totalUSDC: "0.000000",
          activeAgents: 0,
          totalArticles: 0
        })
        .returning();
      return newStats;
    }
    return stats;
  }

  async updateProtocolStats(): Promise<void> {
    // This would be called after payments or other activities
    // For now, we'll keep it simple and update based on current data
    const totalPaymentsResult = await db.select().from(payments);
    const totalArticlesResult = await db.select().from(articles);
    
    const totalPayments = totalPaymentsResult.length;
    const totalArticles = totalArticlesResult.length;
    const totalUSDC = totalPaymentsResult
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
      .toFixed(6);

    // Calculate unique paying users
    const uniquePayingUsers = new Set(
      totalPaymentsResult
        .filter(p => p.status === 'completed' && p.walletAddress)
        .map(p => p.walletAddress!.toLowerCase())
    ).size;

    const [existingStats] = await db.select().from(protocolStats);
    
    if (existingStats) {
      await db
        .update(protocolStats)
        .set({
          totalPayments,
          totalUSDC,
          totalArticles,
          activeAgents: uniquePayingUsers
        })
        .where(eq(protocolStats.id, existingStats.id));
    }
  }
}

export const storage = new DatabaseStorage();
