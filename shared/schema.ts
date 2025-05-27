import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  usdcBalance: decimal("usdc_balance", { precision: 18, scale: 6 }).default("0"),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  price: decimal("price", { precision: 18, scale: 6 }).notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  authorAvatar: text("author_avatar"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  isLocked: boolean("is_locked").default(true),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  userId: integer("user_id"),
  walletAddress: text("wallet_address"),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  paymentType: text("payment_type").notNull(), // wallet, ai_agent
  agentId: text("agent_id"), // for AI agent payments
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentActivity = pgTable("agent_activity", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  action: text("action").notNull(),
  articleId: integer("article_id"),
  amount: decimal("amount", { precision: 18, scale: 6 }),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const protocolStats = pgTable("protocol_stats", {
  id: serial("id").primaryKey(),
  totalPayments: integer("total_payments").default(0),
  totalUSDC: decimal("total_usdc", { precision: 18, scale: 6 }).default("0"),
  activeAgents: integer("active_agents").default(0),
  totalArticles: integer("total_articles").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertAgentActivitySchema = createInsertSchema(agentActivity).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertAgentActivity = z.infer<typeof insertAgentActivitySchema>;
export type AgentActivity = typeof agentActivity.$inferSelect;
export type ProtocolStats = typeof protocolStats.$inferSelect;
