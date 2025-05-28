import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum definitions
export const leadTypeEnum = pgEnum('lead_type', ['Customer', 'Partner', 'Vendor', 'Investor']);
export const leadStatusEnum = pgEnum('lead_status', ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost']);
export const importanceEnum = pgEnum('importance', ['High', 'Medium', 'Low']);
export const dealStageEnum = pgEnum('deal_stage', ['Inquiry', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']);
export const platformEnum = pgEnum('platform', ['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok']);
export const postStatusEnum = pgEnum('post_status', ['Draft', 'Scheduled', 'Published', 'Failed']);
export const campaignStatusEnum = pgEnum('campaign_status', ['Active', 'Paused', 'Completed', 'Planned']);
export const quotationStatusEnum = pgEnum('quotation_status', ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']);
export const emailStatusEnum = pgEnum('email_status', ['Draft', 'Scheduled', 'Sent', 'Failed']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country"),
  jobTitle: text("job_title"),
  companyId: integer("company_id").references(() => companies.id),
  webinarsAttended: text("webinars_attended").array(),
  tags: text("tags").array(),
  leadType: text("lead_type"),
  leadStatus: text("lead_status").default("New"),
  importance: text("importance").default("Medium"),
  source: text("source"),
  sourceDetails: json("source_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partners table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  website: text("website"),
  industry: text("industry"),
  partnerType: text("partner_type"), // e.g., "Reseller", "Technology", "Strategic"
  commissionRate: integer("commission_rate"), // percentage
  status: text("status").default("Active"), // Active, Inactive, Suspended
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id), // Link to user account
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  size: text("size"),
  country: text("country"),
  notes: text("notes"),
  tags: text("tags").array(),
  partnerId: integer("partner_id").references(() => partners.id), // Link to partner
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deals table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  value: integer("value"),
  currency: text("currency").default("USD"),
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  partnerId: integer("partner_id").references(() => partners.id), // Link to partner
  stage: text("stage").default("Inquiry"),
  subscriptionType: text("subscription_type"),
  startDate: timestamp("start_date"),
  expiryDate: timestamp("expiry_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lists table
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isDynamic: boolean("is_dynamic").default(false),
  criteria: json("criteria"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// List Contacts (junction table)
export const listContacts = pgTable("list_contacts", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => lists.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  priority: text("priority").default("Medium"),
  assignedTo: integer("assigned_to").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  dealId: integer("deal_id").references(() => deals.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // email, call, meeting, note, etc.
  title: text("title").notNull(),
  description: text("description"),
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  dealId: integer("deal_id").references(() => deals.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forms table
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fields: json("fields").notNull(),
  listId: integer("list_id").references(() => lists.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Form Submissions table
export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => forms.id).notNull(),
  data: json("data").notNull(),
  sourceInfo: json("source_info"),
  contactId: integer("contact_id").references(() => contacts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Media tables
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  platform: platformEnum("platform").notNull(),
  accountName: text("account_name").notNull(),
  accountUrl: text("account_url").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry", { mode: 'date' }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => socialAccounts.id).notNull(),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(),
  status: postStatusEnum("status").default("Draft"),
  scheduledFor: timestamp("scheduled_for", { mode: 'date' }),
  publishedAt: timestamp("published_at", { mode: 'date' }),
  engagementStats: json("engagement_stats"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialCampaigns = pgTable("social_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: campaignStatusEnum("status").default("Planned"),
  startDate: timestamp("start_date", { mode: 'date' }),
  endDate: timestamp("end_date", { mode: 'date' }),
  targetAudience: json("target_audience"),
  budget: integer("budget"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignPosts = pgTable("campaign_posts", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => socialCampaigns.id).notNull(),
  postId: integer("post_id").references(() => socialPosts.id).notNull(),
});

// Quotations table
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  companyId: integer("company_id").references(() => companies.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("USD"),
  status: quotationStatusEnum("status").default("Draft"),
  validUntil: timestamp("valid_until"),
  notes: text("notes"),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  items: json("items").notNull(),  // Array of line items with descriptions, quantities, unit prices
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotation Templates
export const quotationTemplates = pgTable("quotation_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  emailSubject: text("email_subject").notNull(),
  emailBody: text("email_body").notNull(),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Campaigns
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  replyTo: text("reply_to"),
  status: emailStatusEnum("status").default("Draft"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  listId: integer("list_id").references(() => lists.id),
  templateId: integer("template_id").references(() => emailTemplates.id),
  stats: json("stats")  // For tracking opens, clicks, etc.
});

// Email Campaign Recipients 
export const emailCampaignRecipients = pgTable("email_campaign_recipients", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => emailCampaigns.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  status: emailStatusEnum("status").default("Draft"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  error: text("error"), // For storing error messages if sending fails
});

// Schema validations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
});

export const insertListSchema = createInsertSchema(lists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dueDate: z.union([z.date(), z.string()]).optional(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  engagementStats: true,
  publishedAt: true,
});

export const insertSocialCampaignSchema = createInsertSchema(socialCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emailSentAt: true,
}).extend({
  validUntil: z.string().nullable().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
});

export const insertQuotationTemplateSchema = createInsertSchema(quotationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  stats: true,
});

export const insertEmailCampaignRecipientSchema = createInsertSchema(emailCampaignRecipients).omit({
  id: true,
  sentAt: true,
  openedAt: true,
  clickedAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export type InsertList = z.infer<typeof insertListSchema>;
export type List = typeof lists.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;

export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;

export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;

export type InsertSocialCampaign = z.infer<typeof insertSocialCampaignSchema>;
export type SocialCampaign = typeof socialCampaigns.$inferSelect;

export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

export type InsertQuotationTemplate = z.infer<typeof insertQuotationTemplateSchema>;
export type QuotationTemplate = typeof quotationTemplates.$inferSelect;

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;

export type InsertEmailCampaignRecipient = z.infer<typeof insertEmailCampaignRecipientSchema>;
export type EmailCampaignRecipient = typeof emailCampaignRecipients.$inferSelect;

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;
