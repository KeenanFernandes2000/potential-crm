import { 
  users, contacts, companies, deals, tasks, activities, lists, forms, formSubmissions, listContacts,
  socialAccounts, socialPosts, socialCampaigns, campaignPosts, quotations, quotationTemplates,
  type User, type InsertUser, 
  type Contact, type InsertContact,
  type Company, type InsertCompany,
  type Deal, type InsertDeal,
  type Task, type InsertTask,
  type Activity, type InsertActivity,
  type List, type InsertList,
  type Form, type InsertForm,
  type Quotation, type InsertQuotation,
  type QuotationTemplate, type InsertQuotationTemplate,
  type SocialAccount, type InsertSocialAccount,
  type SocialPost, type InsertSocialPost,
  type SocialCampaign, type InsertSocialCampaign
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    const result = await db.select().from(quotations);
    return result;
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const result = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
    return result[0];
  }

  async getQuotationsByDeal(dealId: number): Promise<Quotation[]> {
    const result = await db.select().from(quotations).where(eq(quotations.dealId, dealId));
    return result;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const result = await db.insert(quotations).values(quotation).returning();
    return result[0];
  }

  async updateQuotation(id: number, quotation: InsertQuotation): Promise<Quotation | undefined> {
    const result = await db.update(quotations).set(quotation).where(eq(quotations.id, id)).returning();
    return result[0];
  }

  async deleteQuotation(id: number): Promise<boolean> {
    const result = await db.delete(quotations).where(eq(quotations.id, id)).returning();
    return result.length > 0;
  }

  async markQuotationAsEmailSent(id: number): Promise<Quotation | undefined> {
    const now = new Date();
    const result = await db.update(quotations)
      .set({ 
        emailSent: true, 
        emailSentAt: now,
        updatedAt: now
      })
      .where(eq(quotations.id, id))
      .returning();
    return result[0];
  }
  
  // Quotation Templates
  async getQuotationTemplates(): Promise<QuotationTemplate[]> {
    const result = await db.select().from(quotationTemplates);
    return result;
  }

  async getQuotationTemplate(id: number): Promise<QuotationTemplate | undefined> {
    const result = await db.select().from(quotationTemplates).where(eq(quotationTemplates.id, id)).limit(1);
    return result[0];
  }

  async createQuotationTemplate(template: InsertQuotationTemplate): Promise<QuotationTemplate> {
    const result = await db.insert(quotationTemplates).values(template).returning();
    return result[0];
  }

  async updateQuotationTemplate(id: number, template: InsertQuotationTemplate): Promise<QuotationTemplate | undefined> {
    const result = await db.update(quotationTemplates).set(template).where(eq(quotationTemplates.id, id)).returning();
    return result[0];
  }

  async deleteQuotationTemplate(id: number): Promise<boolean> {
    const result = await db.delete(quotationTemplates).where(eq(quotationTemplates.id, id)).returning();
    return result.length > 0;
  }
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: number, contact: InsertContact): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return true; // In PostgreSQL with Drizzle, if no error is thrown, the operation was successful
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: InsertCompany): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(company)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    await db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    return db.select().from(deals);
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db.insert(deals).values(deal).returning();
    return newDeal;
  }

  async updateDeal(id: number, deal: InsertDeal): Promise<Deal | undefined> {
    const [updatedDeal] = await db
      .update(deals)
      .set(deal)
      .where(eq(deals.id, id))
      .returning();
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    await db.delete(deals).where(eq(deals.id, id));
    return true;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.timestamp));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Lists
  async getLists(): Promise<List[]> {
    return db.select().from(lists);
  }

  async getList(id: number): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.id, id));
    return list;
  }

  async createList(list: InsertList): Promise<List> {
    const [newList] = await db.insert(lists).values(list).returning();
    return newList;
  }

  // Forms
  async getForms(): Promise<Form[]> {
    return db.select().from(forms);
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async createForm(form: InsertForm): Promise<Form> {
    const [newForm] = await db.insert(forms).values(form).returning();
    return newForm;
  }

  // Social Media Accounts
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return db.select().from(socialAccounts);
  }

  async getSocialAccount(id: number): Promise<SocialAccount | undefined> {
    const [account] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
    return account;
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const [newAccount] = await db.insert(socialAccounts).values(account).returning();
    return newAccount;
  }

  async updateSocialAccount(id: number, account: InsertSocialAccount): Promise<SocialAccount | undefined> {
    const [updatedAccount] = await db
      .update(socialAccounts)
      .set(account)
      .where(eq(socialAccounts.id, id))
      .returning();
    return updatedAccount;
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
    return true;
  }

  // Social Media Posts
  async getSocialPosts(): Promise<SocialPost[]> {
    return db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt));
  }

  async getSocialPost(id: number): Promise<SocialPost | undefined> {
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, id));
    return post;
  }

  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const [newPost] = await db.insert(socialPosts).values(post).returning();
    return newPost;
  }

  async updateSocialPost(id: number, post: InsertSocialPost): Promise<SocialPost | undefined> {
    const [updatedPost] = await db
      .update(socialPosts)
      .set(post)
      .where(eq(socialPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteSocialPost(id: number): Promise<boolean> {
    await db.delete(socialPosts).where(eq(socialPosts.id, id));
    return true;
  }

  // Social Media Campaigns
  async getSocialCampaigns(): Promise<SocialCampaign[]> {
    return db.select().from(socialCampaigns);
  }

  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> {
    const [campaign] = await db.select().from(socialCampaigns).where(eq(socialCampaigns.id, id));
    return campaign;
  }

  async createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign> {
    const [newCampaign] = await db.insert(socialCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateSocialCampaign(id: number, campaign: InsertSocialCampaign): Promise<SocialCampaign | undefined> {
    const [updatedCampaign] = await db
      .update(socialCampaigns)
      .set(campaign)
      .where(eq(socialCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteSocialCampaign(id: number): Promise<boolean> {
    await db.delete(socialCampaigns).where(eq(socialCampaigns.id, id));
    return true;
  }

  // Dashboard
  async getDashboardStats(): Promise<any> {
    // In a real implementation, this would use aggregation queries
    // For now, we'll just return static data as a placeholder
    return {
      totalLeads: 1482,
      openDeals: 64,
      revenue: "$89,421",
      conversionRate: "24.8%"
    };
  }
}