import { 
  users, contacts, companies, deals, tasks, activities, lists, forms, formSubmissions, listContacts,
  socialAccounts, socialPosts, socialCampaigns, campaignPosts, quotations, quotationTemplates,
  emailTemplates, emailCampaigns, emailCampaignRecipients, partners,
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
  type Partner, type InsertPartner,
  type SocialPost, type InsertSocialPost,
  type SocialCampaign, type InsertSocialCampaign,
  type EmailTemplate, type InsertEmailTemplate,
  type EmailCampaign, type InsertEmailCampaign,
  type EmailCampaignRecipient, type InsertEmailCampaignRecipient
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User authentication methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: number, contact: InsertContact): Promise<Contact | undefined> {
    const [updatedContact] = await db.update(contacts).set(contact).where(eq(contacts.id, id)).returning();
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return result[0];
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: InsertCompany): Promise<Company | undefined> {
    const [updatedCompany] = await db.update(companies).set(company).where(eq(companies.id, id)).returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return result[0];
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [newPartner] = await db.insert(partners).values(partner).returning();
    return newPartner;
  }

  async updatePartner(id: number, partner: InsertPartner): Promise<Partner | undefined> {
    const [updatedPartner] = await db.update(partners).set(partner).where(eq(partners.id, id)).returning();
    return updatedPartner;
  }

  async deletePartner(id: number): Promise<boolean> {
    const result = await db.delete(partners).where(eq(partners.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    return await db.select().from(deals);
  }

  async getDealsByPartner(partnerId: number): Promise<Deal[]> {
    return await db.select().from(deals).where(eq(deals.partnerId, partnerId));
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    const result = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
    return result[0];
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db.insert(deals).values(deal).returning();
    return newDeal;
  }

  async updateDeal(id: number, deal: InsertDeal): Promise<Deal | undefined> {
    const [updatedDeal] = await db.update(deals).set(deal).where(eq(deals.id, id)).returning();
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    const result = await db.delete(deals).where(eq(deals.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.createdAt));
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

  async updateForm(id: number, form: InsertForm): Promise<Form | undefined> {
    const [updatedForm] = await db.update(forms).set(form).where(eq(forms.id, id)).returning();
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getFormSubmissions(formId: number): Promise<any[]> {
    return db.select().from(formSubmissions).where(eq(formSubmissions.formId, formId));
  }

  async createFormSubmission(submission: any): Promise<any> {
    const [newSubmission] = await db.insert(formSubmissions).values(submission).returning();
    return newSubmission;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const contactCount = await db.select({ count: sql`count(*)` }).from(contacts);
    const dealCount = await db.select({ count: sql`count(*)` }).from(deals);
    
    return {
      totalLeads: contactCount[0]?.count || 0,
      openDeals: dealCount[0]?.count || 0,
      revenue: "$0",
      conversionRate: "0%",
      topSources: [],
      recentActivities: []
    };
  }

  // Email template methods (basic implementations)
  async getEmailTemplates(): Promise<EmailTemplate[]> { return []; }
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> { return undefined; }
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> { throw new Error("Not implemented"); }
  async updateEmailTemplate(id: number, template: InsertEmailTemplate): Promise<EmailTemplate | undefined> { return undefined; }
  async deleteEmailTemplate(id: number): Promise<boolean> { return false; }

  // Email campaign methods (basic implementations)
  async getEmailCampaigns(): Promise<EmailCampaign[]> { return []; }
  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> { return undefined; }
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> { throw new Error("Not implemented"); }
  async updateEmailCampaign(id: number, campaign: InsertEmailCampaign): Promise<EmailCampaign | undefined> { return undefined; }
  async deleteEmailCampaign(id: number): Promise<boolean> { return false; }

  // Email campaign recipient methods (basic implementations)
  async getEmailCampaignRecipients(campaignId: number): Promise<EmailCampaignRecipient[]> { return []; }
  async addContactToEmailCampaign(campaignId: number, contactId: number): Promise<EmailCampaignRecipient> { throw new Error("Not implemented"); }
  async addContactListToEmailCampaign(campaignId: number, listId: number): Promise<EmailCampaignRecipient[]> { return []; }

  // Email sending methods (basic implementations)
  async sendEmailCampaign(campaignId: number): Promise<boolean> { return true; }
  async sendQuotationEmail(quotationId: number): Promise<boolean> { return true; }
  async sendEmailToList(listId: number, subject: string, body: string, fromName: string, fromEmail: string): Promise<boolean> { return true; }

  // Social account methods (basic implementations)
  async getSocialAccounts(): Promise<SocialAccount[]> { return []; }
  async getSocialAccount(id: number): Promise<SocialAccount | undefined> { return undefined; }
  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> { throw new Error("Not implemented"); }
  async updateSocialAccount(id: number, account: InsertSocialAccount): Promise<SocialAccount | undefined> { return undefined; }
  async deleteSocialAccount(id: number): Promise<boolean> { return false; }

  // Social post methods (basic implementations)
  async getSocialPosts(): Promise<SocialPost[]> { return []; }
  async getSocialPost(id: number): Promise<SocialPost | undefined> { return undefined; }
  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> { throw new Error("Not implemented"); }
  async updateSocialPost(id: number, post: InsertSocialPost): Promise<SocialPost | undefined> { return undefined; }
  async deleteSocialPost(id: number): Promise<boolean> { return false; }

  // Social campaign methods (basic implementations)
  async getSocialCampaigns(): Promise<SocialCampaign[]> { return []; }
  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> { return undefined; }
  async createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign> { throw new Error("Not implemented"); }
  async updateSocialCampaign(id: number, campaign: InsertSocialCampaign): Promise<SocialCampaign | undefined> { return undefined; }
  async deleteSocialCampaign(id: number): Promise<boolean> { return false; }

  // Quotation methods (basic implementations)
  async getQuotations(): Promise<Quotation[]> { return []; }
  async getQuotation(id: number): Promise<Quotation | undefined> { return undefined; }
  async getQuotationsByDeal(dealId: number): Promise<Quotation[]> { return []; }
  async createQuotation(quotation: InsertQuotation): Promise<Quotation> { throw new Error("Not implemented"); }
  async updateQuotation(id: number, quotation: InsertQuotation): Promise<Quotation | undefined> { return undefined; }
  async deleteQuotation(id: number): Promise<boolean> { return false; }
  async markQuotationAsEmailSent(id: number): Promise<Quotation | undefined> { return undefined; }

  // Quotation template methods (basic implementations)
  async getQuotationTemplates(): Promise<QuotationTemplate[]> { return []; }
  async getQuotationTemplate(id: number): Promise<QuotationTemplate | undefined> { return undefined; }
  async createQuotationTemplate(template: InsertQuotationTemplate): Promise<QuotationTemplate> { throw new Error("Not implemented"); }
  async updateQuotationTemplate(id: number, template: InsertQuotationTemplate): Promise<QuotationTemplate | undefined> { return undefined; }
  async deleteQuotationTemplate(id: number): Promise<boolean> { return false; }
}