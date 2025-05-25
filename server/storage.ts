import { 
  users, contacts, companies, deals, tasks, activities, lists, forms, formSubmissions, listContacts,
  type User, type InsertUser, 
  type Contact, type InsertContact,
  type Company, type InsertCompany,
  type Deal, type InsertDeal,
  type Task, type InsertTask,
  type Activity, type InsertActivity,
  type List, type InsertList,
  type Form, type InsertForm
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: InsertContact): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: InsertCompany): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // Deals
  getDeals(): Promise<Deal[]>;
  getDeal(id: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: InsertDeal): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;

  // Quotations
  getQuotations(): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  getQuotationsByDeal(dealId: number): Promise<Quotation[]>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, quotation: InsertQuotation): Promise<Quotation | undefined>;
  deleteQuotation(id: number): Promise<boolean>;
  markQuotationAsEmailSent(id: number): Promise<Quotation | undefined>;

  // Quotation Templates
  getQuotationTemplates(): Promise<QuotationTemplate[]>;
  getQuotationTemplate(id: number): Promise<QuotationTemplate | undefined>;
  createQuotationTemplate(template: InsertQuotationTemplate): Promise<QuotationTemplate>;
  updateQuotationTemplate(id: number, template: InsertQuotationTemplate): Promise<QuotationTemplate | undefined>;
  deleteQuotationTemplate(id: number): Promise<boolean>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Activities
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Lists
  getLists(): Promise<List[]>;
  getList(id: number): Promise<List | undefined>;
  createList(list: InsertList): Promise<List>;

  // Forms
  getForms(): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;

  // Social Media Accounts
  getSocialAccounts(): Promise<SocialAccount[]>;
  getSocialAccount(id: number): Promise<SocialAccount | undefined>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: number, account: InsertSocialAccount): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: number): Promise<boolean>;

  // Social Media Posts
  getSocialPosts(): Promise<SocialPost[]>;
  getSocialPost(id: number): Promise<SocialPost | undefined>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  updateSocialPost(id: number, post: InsertSocialPost): Promise<SocialPost | undefined>;
  deleteSocialPost(id: number): Promise<boolean>;

  // Social Media Campaigns
  getSocialCampaigns(): Promise<SocialCampaign[]>;
  getSocialCampaign(id: number): Promise<SocialCampaign | undefined>;
  createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign>;
  updateSocialCampaign(id: number, campaign: InsertSocialCampaign): Promise<SocialCampaign | undefined>;
  deleteSocialCampaign(id: number): Promise<boolean>;

  // Dashboard
  getDashboardStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private contactsMap: Map<number, Contact>;
  private companiesMap: Map<number, Company>;
  private dealsMap: Map<number, Deal>;
  private tasksMap: Map<number, Task>;
  private activitiesMap: Map<number, Activity>;
  private listsMap: Map<number, List>;
  private formsMap: Map<number, Form>;
  private quotationsMap: Map<number, Quotation>;
  private quotationTemplatesMap: Map<number, QuotationTemplate>;
  
  private userIdCounter: number;
  private contactIdCounter: number;
  private companyIdCounter: number;
  private dealIdCounter: number;
  private taskIdCounter: number;
  private activityIdCounter: number;
  private listIdCounter: number;
  private formIdCounter: number;
  private quotationIdCounter: number;
  private quotationTemplateIdCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.contactsMap = new Map();
    this.companiesMap = new Map();
    this.dealsMap = new Map();
    this.tasksMap = new Map();
    this.activitiesMap = new Map();
    this.listsMap = new Map();
    this.formsMap = new Map();
    
    this.userIdCounter = 1;
    this.contactIdCounter = 1;
    this.companyIdCounter = 1;
    this.dealIdCounter = 1;
    this.taskIdCounter = 1;
    this.activityIdCounter = 1;
    this.listIdCounter = 1;
    this.formIdCounter = 1;
    
    // Seed some initial data
    this.seedData();
  }

  private seedData() {
    // Seed users
    this.createUser({
      username: "admin",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "admin"
    });

    // Seed activities
    const activityTypes = ["email", "deal", "contact", "meeting", "form"];
    const activityTitles = [
      "Email sent to Sarah Thompson",
      "Deal with Acme Inc. marked as won",
      "New lead Michael Johnson created",
      "Meeting scheduled with Tech Solutions",
      "Form submission from website contact form"
    ];

    for (let i = 0; i < 5; i++) {
      this.createActivity({
        type: activityTypes[i],
        title: activityTitles[i],
        description: `Details for ${activityTitles[i]}`,
        userId: 1,
        contactId: i === 0 ? 1 : undefined,
        companyId: i === 1 ? 1 : undefined,
        dealId: i === 1 ? 1 : undefined
      });
    }

    // Seed tasks
    const taskTitles = [
      "Follow up with GlobalTech about proposal",
      "Prepare presentation for client meeting",
      "Update contact information for Johnson & Co.",
      "Schedule demo with new leads",
      "Review Q3 sales targets"
    ];
    const taskPriorities = ["High", "Medium", "Low", "Medium", "Medium"];
    const dueDates = [
      new Date(),
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 48 * 60 * 60 * 1000),
      new Date(Date.now() + 72 * 60 * 60 * 1000),
      new Date(Date.now() + 120 * 60 * 60 * 1000)
    ];

    for (let i = 0; i < 5; i++) {
      this.createTask({
        title: taskTitles[i],
        description: `Details for ${taskTitles[i]}`,
        dueDate: dueDates[i],
        completed: false,
        priority: taskPriorities[i],
        assignedTo: 1
      });
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contactsMap.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contactsMap.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const now = new Date();
    const newContact: Contact = { 
      ...contact, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.contactsMap.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, contact: InsertContact): Promise<Contact | undefined> {
    const existingContact = this.contactsMap.get(id);
    if (!existingContact) {
      return undefined;
    }
    const now = new Date();
    const updatedContact: Contact = { 
      ...existingContact, 
      ...contact, 
      updatedAt: now 
    };
    this.contactsMap.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contactsMap.delete(id);
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companiesMap.values());
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companiesMap.get(id);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const now = new Date();
    const newCompany: Company = { 
      ...company, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.companiesMap.set(id, newCompany);
    return newCompany;
  }

  async updateCompany(id: number, company: InsertCompany): Promise<Company | undefined> {
    const existingCompany = this.companiesMap.get(id);
    if (!existingCompany) {
      return undefined;
    }
    const now = new Date();
    const updatedCompany: Company = { 
      ...existingCompany, 
      ...company, 
      updatedAt: now 
    };
    this.companiesMap.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companiesMap.delete(id);
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    return Array.from(this.dealsMap.values());
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.dealsMap.get(id);
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const id = this.dealIdCounter++;
    const now = new Date();
    const newDeal: Deal = { 
      ...deal, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.dealsMap.set(id, newDeal);
    return newDeal;
  }

  async updateDeal(id: number, deal: InsertDeal): Promise<Deal | undefined> {
    const existingDeal = this.dealsMap.get(id);
    if (!existingDeal) {
      return undefined;
    }
    const now = new Date();
    const updatedDeal: Deal = { 
      ...existingDeal, 
      ...deal, 
      updatedAt: now 
    };
    this.dealsMap.set(id, updatedDeal);
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.dealsMap.delete(id);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasksMap.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasksMap.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.tasksMap.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasksMap.get(id);
    if (!existingTask) {
      return undefined;
    }
    const now = new Date();
    const updatedTask: Task = { 
      ...existingTask, 
      ...data, 
      updatedAt: now 
    };
    this.tasksMap.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasksMap.delete(id);
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activitiesMap.values());
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const newActivity: Activity = { 
      ...activity, 
      id, 
      createdAt: now
    };
    this.activitiesMap.set(id, newActivity);
    return newActivity;
  }

  // Lists
  async getLists(): Promise<List[]> {
    return Array.from(this.listsMap.values());
  }

  async getList(id: number): Promise<List | undefined> {
    return this.listsMap.get(id);
  }

  async createList(list: InsertList): Promise<List> {
    const id = this.listIdCounter++;
    const now = new Date();
    const newList: List = { 
      ...list, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.listsMap.set(id, newList);
    return newList;
  }

  // Forms
  async getForms(): Promise<Form[]> {
    return Array.from(this.formsMap.values());
  }

  async getForm(id: number): Promise<Form | undefined> {
    return this.formsMap.get(id);
  }

  async createForm(form: InsertForm): Promise<Form> {
    const id = this.formIdCounter++;
    const now = new Date();
    const newForm: Form = { 
      ...form, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.formsMap.set(id, newForm);
    return newForm;
  }

  // Dashboard
  async getDashboardStats(): Promise<any> {
    // In a real application, this would be calculated from real data
    return {
      totalLeads: 1482,
      openDeals: 64,
      revenue: "$89,421",
      conversionRate: "24.8%",
      topSources: [
        { source: "Website", count: 534 },
        { source: "Referral", count: 392 },
        { source: "Social Media", count: 287 },
        { source: "Email", count: 184 },
        { source: "Other", count: 85 }
      ]
    };
  }
}

import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateContact(id: number, contact: InsertContact): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact || undefined;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db
      .delete(contacts)
      .where(eq(contacts.id, id));
    return true; // In Drizzle, delete doesn't return anything useful to check
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db
      .insert(companies)
      .values(company)
      .returning();
    return newCompany;
  }

  async updateCompany(id: number, company: InsertCompany): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(company)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany || undefined;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db
      .delete(companies)
      .where(eq(companies.id, id));
    return true;
  }

  async getDeals(): Promise<Deal[]> {
    return await db.select().from(deals);
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal || undefined;
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db
      .insert(deals)
      .values(deal)
      .returning();
    return newDeal;
  }

  async updateDeal(id: number, deal: InsertDeal): Promise<Deal | undefined> {
    const [updatedDeal] = await db
      .update(deals)
      .set(deal)
      .where(eq(deals.id, id))
      .returning();
    return updatedDeal || undefined;
  }

  async deleteDeal(id: number): Promise<boolean> {
    const result = await db
      .delete(deals)
      .where(eq(deals.id, id));
    return true;
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id));
    return true;
  }

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getLists(): Promise<List[]> {
    return await db.select().from(lists);
  }

  async getList(id: number): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.id, id));
    return list || undefined;
  }

  async createList(list: InsertList): Promise<List> {
    const [newList] = await db
      .insert(lists)
      .values(list)
      .returning();
    return newList;
  }

  async getForms(): Promise<Form[]> {
    return await db.select().from(forms);
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form || undefined;
  }

  async createForm(form: InsertForm): Promise<Form> {
    const [newForm] = await db
      .insert(forms)
      .values(form)
      .returning();
    return newForm;
  }

  async getSocialAccounts(): Promise<SocialAccount[]> {
    return await db.select().from(socialAccounts);
  }

  async getSocialAccount(id: number): Promise<SocialAccount | undefined> {
    const [account] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
    return account || undefined;
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const [newAccount] = await db
      .insert(socialAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateSocialAccount(id: number, account: InsertSocialAccount): Promise<SocialAccount | undefined> {
    const [updatedAccount] = await db
      .update(socialAccounts)
      .set(account)
      .where(eq(socialAccounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    const result = await db
      .delete(socialAccounts)
      .where(eq(socialAccounts.id, id));
    return true;
  }

  async getSocialPosts(): Promise<SocialPost[]> {
    return await db.select().from(socialPosts);
  }

  async getSocialPost(id: number): Promise<SocialPost | undefined> {
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, id));
    return post || undefined;
  }

  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const [newPost] = await db
      .insert(socialPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async updateSocialPost(id: number, post: InsertSocialPost): Promise<SocialPost | undefined> {
    const [updatedPost] = await db
      .update(socialPosts)
      .set(post)
      .where(eq(socialPosts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async deleteSocialPost(id: number): Promise<boolean> {
    const result = await db
      .delete(socialPosts)
      .where(eq(socialPosts.id, id));
    return true;
  }

  async getSocialCampaigns(): Promise<SocialCampaign[]> {
    return await db.select().from(socialCampaigns);
  }

  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> {
    const [campaign] = await db.select().from(socialCampaigns).where(eq(socialCampaigns.id, id));
    return campaign || undefined;
  }

  async createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign> {
    const [newCampaign] = await db
      .insert(socialCampaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async updateSocialCampaign(id: number, campaign: InsertSocialCampaign): Promise<SocialCampaign | undefined> {
    const [updatedCampaign] = await db
      .update(socialCampaigns)
      .set(campaign)
      .where(eq(socialCampaigns.id, id))
      .returning();
    return updatedCampaign || undefined;
  }

  async deleteSocialCampaign(id: number): Promise<boolean> {
    const result = await db
      .delete(socialCampaigns)
      .where(eq(socialCampaigns.id, id));
    return true;
  }

  async getDashboardStats(): Promise<any> {
    // This would ideally use more complex queries to aggregate data
    // For now, we'll return mock data similar to what we had in MemStorage
    return {
      totalLeads: 1482,
      openDeals: 64,
      revenue: "$89,421",
      conversionRate: "24.8%"
    };
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
