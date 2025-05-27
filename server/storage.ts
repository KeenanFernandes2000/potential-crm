import { 
  users, contacts, companies, deals, tasks, activities, lists, forms, formSubmissions, listContacts,
  quotations, quotationTemplates, socialAccounts, socialPosts, socialCampaigns,
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
  type SocialPost, type InsertSocialPost,
  type SocialCampaign, type InsertSocialCampaign,
  type EmailTemplate, type InsertEmailTemplate,
  type EmailCampaign, type InsertEmailCampaign,
  type EmailCampaignRecipient, type InsertEmailCampaignRecipient,
  type Partner, type InsertPartner
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
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

  // Partners
  getPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: InsertPartner): Promise<Partner | undefined>;
  deletePartner(id: number): Promise<boolean>;

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
  updateForm(id: number, form: InsertForm): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  getFormSubmissions(formId: number): Promise<any[]>;
  createFormSubmission(submission: { formId: number; data: any; sourceInfo: any; contactId: number | null }): Promise<any>;

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
  
  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: InsertEmailTemplate): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  
  // Email Campaigns
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  getEmailCampaign(id: number): Promise<EmailCampaign | undefined>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: number, campaign: InsertEmailCampaign): Promise<EmailCampaign | undefined>;
  deleteEmailCampaign(id: number): Promise<boolean>;
  
  // Email Campaign Recipients
  getEmailCampaignRecipients(campaignId: number): Promise<EmailCampaignRecipient[]>;
  addContactToEmailCampaign(campaignId: number, contactId: number): Promise<EmailCampaignRecipient>;
  addContactListToEmailCampaign(campaignId: number, listId: number): Promise<EmailCampaignRecipient[]>;
  
  // Email Sending
  sendEmailCampaign(campaignId: number): Promise<boolean>;
  sendQuotationEmail(quotationId: number): Promise<boolean>;
  sendEmailToList(listId: number, subject: string, body: string, fromName: string, fromEmail: string): Promise<boolean>;
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
  private emailTemplatesMap: Map<number, EmailTemplate>;
  private emailCampaignsMap: Map<number, EmailCampaign>;
  private emailCampaignRecipientsMap: Map<number, EmailCampaignRecipient[]>;
  
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
  private emailTemplateIdCounter: number;
  private emailCampaignIdCounter: number;
  private emailCampaignRecipientIdCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.contactsMap = new Map();
    this.companiesMap = new Map();
    this.dealsMap = new Map();
    this.tasksMap = new Map();
    this.activitiesMap = new Map();
    this.listsMap = new Map();
    this.formsMap = new Map();
    this.quotationsMap = new Map();
    this.quotationTemplatesMap = new Map();
    this.emailTemplatesMap = new Map();
    this.emailCampaignsMap = new Map();
    this.emailCampaignRecipientsMap = new Map();
    
    this.userIdCounter = 1;
    this.contactIdCounter = 1;
    this.companyIdCounter = 1;
    this.dealIdCounter = 1;
    this.taskIdCounter = 1;
    this.activityIdCounter = 1;
    this.listIdCounter = 1;
    this.formIdCounter = 1;
    this.quotationIdCounter = 1;
    this.quotationTemplateIdCounter = 1;
    this.emailTemplateIdCounter = 1;
    this.emailCampaignIdCounter = 1;
    this.emailCampaignRecipientIdCounter = 1;
    
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
    
    // Seed email templates
    this.createEmailTemplate({
      name: "Welcome Email",
      subject: "Welcome to Our Service",
      body: "<h1>Welcome!</h1><p>Dear {{contactName}},</p><p>Thank you for joining our platform. We're excited to have you on board!</p>",
      category: "Onboarding",
      description: "Initial welcome email for new customers"
    });
    
    this.createEmailTemplate({
      name: "Follow-up Email",
      subject: "Following up on our conversation",
      body: "<h1>Hello Again!</h1><p>Dear {{contactName}},</p><p>I wanted to follow up on our previous conversation about our services.</p>",
      category: "Sales",
      description: "Follow-up email after initial contact"
    });
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

  // Partners
  private partnersMap = new Map<number, Partner>();
  private partnerIdCounter = 1;

  async getPartners(): Promise<Partner[]> {
    return Array.from(this.partnersMap.values());
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    return this.partnersMap.get(id);
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const id = this.partnerIdCounter++;
    const now = new Date();
    const newPartner: Partner = { 
      ...partner, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.partnersMap.set(id, newPartner);
    return newPartner;
  }

  async updatePartner(id: number, partner: InsertPartner): Promise<Partner | undefined> {
    const existingPartner = this.partnersMap.get(id);
    if (!existingPartner) {
      return undefined;
    }
    const now = new Date();
    const updatedPartner: Partner = { 
      ...existingPartner, 
      ...partner, 
      updatedAt: now 
    };
    this.partnersMap.set(id, updatedPartner);
    return updatedPartner;
  }

  async deletePartner(id: number): Promise<boolean> {
    return this.partnersMap.delete(id);
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
  
  async updateForm(id: number, form: InsertForm): Promise<Form | undefined> {
    const existingForm = this.formsMap.get(id);
    if (!existingForm) {
      return undefined;
    }
    
    const updatedForm: Form = {
      ...existingForm,
      ...form,
      id,
      updatedAt: new Date()
    };
    
    this.formsMap.set(id, updatedForm);
    return updatedForm;
  }
  
  async deleteForm(id: number): Promise<boolean> {
    const exists = this.formsMap.has(id);
    if (exists) {
      this.formsMap.delete(id);
      // Also delete any submissions associated with this form
      this.formSubmissionsMap = new Map(
        Array.from(this.formSubmissionsMap.entries())
          .filter(([_, submission]) => submission.formId !== id)
      );
    }
    return exists;
  }
  
  // Form Submissions
  private formSubmissionIdCounter = 1;
  private formSubmissionsMap = new Map<number, any>();
  
  async getFormSubmissions(formId: number): Promise<any[]> {
    return Array.from(this.formSubmissionsMap.values())
      .filter(submission => submission.formId === formId);
  }
  
  async createFormSubmission(submission: { formId: number; data: any; sourceInfo: any; contactId: number | null }): Promise<any> {
    const id = this.formSubmissionIdCounter++;
    const now = new Date();
    
    const newSubmission = {
      id,
      formId: submission.formId,
      data: submission.data,
      sourceInfo: submission.sourceInfo,
      contactId: submission.contactId,
      createdAt: now
    };
    
    this.formSubmissionsMap.set(id, newSubmission);
    return newSubmission;
  }

  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    return Array.from(this.quotationsMap.values());
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    return this.quotationsMap.get(id);
  }

  async getQuotationsByDeal(dealId: number): Promise<Quotation[]> {
    return Array.from(this.quotationsMap.values()).filter(
      quotation => quotation.dealId === dealId
    );
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const id = this.quotationIdCounter++;
    const now = new Date();
    const newQuotation: Quotation = { 
      ...quotation, 
      id, 
      createdAt: now, 
      updatedAt: now,
      emailSent: false,
      emailSentAt: null,
      validUntil: quotation.validUntil ? new Date(quotation.validUntil) : null,
      status: "Draft"
    };
    this.quotationsMap.set(id, newQuotation);
    return newQuotation;
  }

  async updateQuotation(id: number, quotation: InsertQuotation): Promise<Quotation | undefined> {
    const existingQuotation = this.quotationsMap.get(id);
    if (!existingQuotation) {
      return undefined;
    }
    const now = new Date();
    const updatedQuotation: Quotation = { 
      ...existingQuotation, 
      ...quotation, 
      updatedAt: now,
      validUntil: quotation.validUntil ? new Date(quotation.validUntil) : existingQuotation.validUntil
    };
    this.quotationsMap.set(id, updatedQuotation);
    return updatedQuotation;
  }

  async deleteQuotation(id: number): Promise<boolean> {
    return this.quotationsMap.delete(id);
  }

  async markQuotationAsEmailSent(id: number): Promise<Quotation | undefined> {
    const quotation = this.quotationsMap.get(id);
    if (!quotation) {
      return undefined;
    }
    const now = new Date();
    const updatedQuotation: Quotation = { 
      ...quotation, 
      emailSent: true,
      emailSentAt: now,
      updatedAt: now
    };
    this.quotationsMap.set(id, updatedQuotation);
    return updatedQuotation;
  }

  // Quotation Templates
  async getQuotationTemplates(): Promise<QuotationTemplate[]> {
    return Array.from(this.quotationTemplatesMap.values());
  }

  async getQuotationTemplate(id: number): Promise<QuotationTemplate | undefined> {
    return this.quotationTemplatesMap.get(id);
  }

  async createQuotationTemplate(template: InsertQuotationTemplate): Promise<QuotationTemplate> {
    const id = this.quotationTemplateIdCounter++;
    const now = new Date();
    const newTemplate: QuotationTemplate = { 
      ...template, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.quotationTemplatesMap.set(id, newTemplate);
    return newTemplate;
  }

  async updateQuotationTemplate(id: number, template: InsertQuotationTemplate): Promise<QuotationTemplate | undefined> {
    const existingTemplate = this.quotationTemplatesMap.get(id);
    if (!existingTemplate) {
      return undefined;
    }
    const now = new Date();
    const updatedTemplate: QuotationTemplate = { 
      ...existingTemplate, 
      ...template, 
      updatedAt: now 
    };
    this.quotationTemplatesMap.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteQuotationTemplate(id: number): Promise<boolean> {
    return this.quotationTemplatesMap.delete(id);
  }

  // Social Media
  async getSocialAccounts(): Promise<SocialAccount[]> {
    // Placeholder implementation
    return [];
  }

  async getSocialAccount(id: number): Promise<SocialAccount | undefined> {
    // Placeholder implementation
    return undefined;
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    // Placeholder implementation
    return {
      id: 1,
      platform: "Twitter",
      username: account.username,
      displayName: account.displayName,
      accessToken: account.accessToken,
      accessTokenSecret: account.accessTokenSecret,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateSocialAccount(id: number, account: InsertSocialAccount): Promise<SocialAccount | undefined> {
    // Placeholder implementation
    return {
      id,
      platform: "Twitter",
      username: account.username,
      displayName: account.displayName,
      accessToken: account.accessToken,
      accessTokenSecret: account.accessTokenSecret,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    // Placeholder implementation
    return true;
  }

  async getSocialPosts(): Promise<SocialPost[]> {
    // Placeholder implementation
    return [];
  }

  async getSocialPost(id: number): Promise<SocialPost | undefined> {
    // Placeholder implementation
    return undefined;
  }

  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    // Placeholder implementation
    return {
      id: 1,
      platform: "Twitter",
      content: post.content,
      status: "Draft",
      scheduledDate: post.scheduledDate ? new Date(post.scheduledDate) : null,
      accountId: post.accountId,
      createdAt: new Date(),
      updatedAt: new Date(),
      mediaUrls: post.mediaUrls || [],
      externalPostId: null,
      postUrl: null,
      error: null
    };
  }

  async updateSocialPost(id: number, post: InsertSocialPost): Promise<SocialPost | undefined> {
    // Placeholder implementation
    return {
      id,
      platform: "Twitter",
      content: post.content,
      status: "Draft",
      scheduledDate: post.scheduledDate ? new Date(post.scheduledDate) : null,
      accountId: post.accountId,
      createdAt: new Date(),
      updatedAt: new Date(),
      mediaUrls: post.mediaUrls || [],
      externalPostId: null,
      postUrl: null,
      error: null
    };
  }

  async deleteSocialPost(id: number): Promise<boolean> {
    // Placeholder implementation
    return true;
  }

  async getSocialCampaigns(): Promise<SocialCampaign[]> {
    // Placeholder implementation
    return [];
  }

  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> {
    // Placeholder implementation
    return undefined;
  }

  async createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign> {
    // Placeholder implementation
    return {
      id: 1,
      name: campaign.name,
      description: campaign.description || null,
      startDate: campaign.startDate ? new Date(campaign.startDate) : null,
      endDate: campaign.endDate ? new Date(campaign.endDate) : null,
      status: "Planned",
      platforms: campaign.platforms || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateSocialCampaign(id: number, campaign: InsertSocialCampaign): Promise<SocialCampaign | undefined> {
    // Placeholder implementation
    return {
      id,
      name: campaign.name,
      description: campaign.description || null,
      startDate: campaign.startDate ? new Date(campaign.startDate) : null,
      endDate: campaign.endDate ? new Date(campaign.endDate) : null,
      status: "Planned",
      platforms: campaign.platforms || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteSocialCampaign(id: number): Promise<boolean> {
    // Placeholder implementation
    return true;
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
        { source: "Email", count: 164 },
        { source: "Event", count: 105 }
      ],
      recentActivities: []
    };
  }
  
  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplatesMap.values());
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    return this.emailTemplatesMap.get(id);
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.emailTemplateIdCounter++;
    const now = new Date();
    const newTemplate: EmailTemplate = { 
      ...template, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.emailTemplatesMap.set(id, newTemplate);
    return newTemplate;
  }

  async updateEmailTemplate(id: number, template: InsertEmailTemplate): Promise<EmailTemplate | undefined> {
    const existingTemplate = this.emailTemplatesMap.get(id);
    if (!existingTemplate) {
      return undefined;
    }
    const now = new Date();
    const updatedTemplate: EmailTemplate = { 
      ...existingTemplate, 
      ...template, 
      updatedAt: now 
    };
    this.emailTemplatesMap.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    return this.emailTemplatesMap.delete(id);
  }

  // Email Campaigns
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return Array.from(this.emailCampaignsMap.values());
  }

  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> {
    return this.emailCampaignsMap.get(id);
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const id = this.emailCampaignIdCounter++;
    const now = new Date();
    const newCampaign: EmailCampaign = { 
      ...campaign, 
      id, 
      createdAt: now, 
      updatedAt: now,
      sentAt: null,
      status: "Draft"
    };
    this.emailCampaignsMap.set(id, newCampaign);
    return newCampaign;
  }

  async updateEmailCampaign(id: number, campaign: InsertEmailCampaign): Promise<EmailCampaign | undefined> {
    const existingCampaign = this.emailCampaignsMap.get(id);
    if (!existingCampaign) {
      return undefined;
    }
    const now = new Date();
    const updatedCampaign: EmailCampaign = { 
      ...existingCampaign, 
      ...campaign, 
      updatedAt: now 
    };
    this.emailCampaignsMap.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteEmailCampaign(id: number): Promise<boolean> {
    return this.emailCampaignsMap.delete(id);
  }

  // Email Campaign Recipients
  async getEmailCampaignRecipients(campaignId: number): Promise<EmailCampaignRecipient[]> {
    return this.emailCampaignRecipientsMap.get(campaignId) || [];
  }

  async addContactToEmailCampaign(campaignId: number, contactId: number): Promise<EmailCampaignRecipient> {
    const id = this.emailCampaignRecipientIdCounter++;
    const recipient: EmailCampaignRecipient = {
      id,
      campaignId,
      contactId,
      status: "Draft",
      sentAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Initialize the array if it doesn't exist
    if (!this.emailCampaignRecipientsMap.has(campaignId)) {
      this.emailCampaignRecipientsMap.set(campaignId, []);
    }

    const recipients = this.emailCampaignRecipientsMap.get(campaignId)!;
    recipients.push(recipient);
    
    return recipient;
  }

  async addContactListToEmailCampaign(campaignId: number, listId: number): Promise<EmailCampaignRecipient[]> {
    // In a real implementation, this would get contacts from a list
    // For now, we'll create a few dummy recipients
    const recipients: EmailCampaignRecipient[] = [];
    
    // Create 3 dummy recipients
    for (let i = 0; i < 3; i++) {
      const recipient = await this.addContactToEmailCampaign(campaignId, i + 1);
      recipients.push(recipient);
    }
    
    return recipients;
  }

  // Email Sending Functions
  async sendEmailCampaign(campaignId: number): Promise<boolean> {
    const campaign = this.emailCampaignsMap.get(campaignId);
    if (!campaign) {
      return false;
    }
    
    // Update campaign status
    const updatedCampaign: EmailCampaign = {
      ...campaign,
      status: "Sent",
      sentAt: new Date(),
      updatedAt: new Date()
    };
    
    this.emailCampaignsMap.set(campaignId, updatedCampaign);
    
    // Update recipient statuses
    const recipients = this.emailCampaignRecipientsMap.get(campaignId) || [];
    const updatedRecipients = recipients.map(recipient => ({
      ...recipient,
      status: "Sent",
      sentAt: new Date(),
      updatedAt: new Date()
    }));
    
    this.emailCampaignRecipientsMap.set(campaignId, updatedRecipients);
    
    return true;
  }

  async sendQuotationEmail(quotationId: number): Promise<boolean> {
    const quotation = this.quotationsMap.get(quotationId);
    if (!quotation) {
      return false;
    }
    
    // Update quotation status
    const updatedQuotation: Quotation = {
      ...quotation,
      emailSent: true,
      emailSentAt: new Date(),
      status: "Sent",
      updatedAt: new Date()
    };
    
    this.quotationsMap.set(quotationId, updatedQuotation);
    
    return true;
  }

  async sendEmailToList(listId: number, subject: string, body: string, fromName: string, fromEmail: string): Promise<boolean> {
    // In a real implementation, this would send emails to contacts in a list
    // For this MemStorage implementation, we'll just return success
    return true;
  }
}

// Use this in the app
import { eq } from "drizzle-orm";
import { db } from "./db";

export class DatabaseStorage implements IStorage {
  // Forms
  async getForms(): Promise<Form[]> {
    return await db.select().from(forms);
  }

  async getForm(id: number): Promise<Form | undefined> {
    const results = await db.select().from(forms).where(eq(forms.id, id));
    return results[0];
  }

  async createForm(form: InsertForm): Promise<Form> {
    const results = await db.insert(forms).values(form).returning();
    return results[0];
  }
  
  async updateForm(id: number, form: InsertForm): Promise<Form | undefined> {
    const results = await db.update(forms)
      .set({
        ...form,
        updatedAt: new Date()
      })
      .where(eq(forms.id, id))
      .returning();
    return results[0];
  }
  
  async deleteForm(id: number): Promise<boolean> {
    const results = await db.delete(forms).where(eq(forms.id, id)).returning();
    return results.length > 0;
  }
  
  // Form Submissions
  async getFormSubmissions(formId: number): Promise<any[]> {
    return await db.select().from(formSubmissions).where(eq(formSubmissions.formId, formId));
  }
  
  async createFormSubmission(submission: { formId: number; data: any; sourceInfo: any; contactId: number | null }): Promise<any> {
    const results = await db.insert(formSubmissions).values(submission).returning();
    return results[0];
  }
  
  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates);
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: number, template: InsertEmailTemplate): Promise<EmailTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set(template)
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }

  // Email Campaigns
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns);
  }

  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return campaign;
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [newCampaign] = await db.insert(emailCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateEmailCampaign(id: number, campaign: InsertEmailCampaign): Promise<EmailCampaign | undefined> {
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set(campaign)
      .where(eq(emailCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteEmailCampaign(id: number): Promise<boolean> {
    await db.delete(emailCampaigns).where(eq(emailCampaigns.id, id));
    return true;
  }

  // Email Campaign Recipients
  async getEmailCampaignRecipients(campaignId: number): Promise<EmailCampaignRecipient[]> {
    return await db
      .select()
      .from(emailCampaignRecipients)
      .where(eq(emailCampaignRecipients.campaignId, campaignId));
  }

  async addContactToEmailCampaign(campaignId: number, contactId: number): Promise<EmailCampaignRecipient> {
    const [recipient] = await db
      .insert(emailCampaignRecipients)
      .values({
        campaignId,
        contactId,
        status: "Draft"
      })
      .returning();
    return recipient;
  }

  async addContactListToEmailCampaign(campaignId: number, listId: number): Promise<EmailCampaignRecipient[]> {
    // Get all contacts from the list
    const listContactRecords = await db.select().from(listContacts).where(eq(listContacts.listId, listId));
    
    // Add each contact to the campaign
    const recipients: EmailCampaignRecipient[] = [];
    
    for (const lc of listContactRecords) {
      try {
        const [recipient] = await db
          .insert(emailCampaignRecipients)
          .values({
            campaignId,
            contactId: lc.contactId,
            status: "Draft"
          })
          .returning();
        
        recipients.push(recipient);
      } catch (error) {
        console.error(`Failed to add contact ${lc.contactId} to campaign ${campaignId}:`, error);
        // Continue with the next contact
      }
    }
    
    return recipients;
  }

  // Email Sending Functions
  // These methods primarily update the database status
  // The actual email sending is handled by the email service
  async sendEmailCampaign(campaignId: number): Promise<boolean> {
    try {
      const [updatedCampaign] = await db
        .update(emailCampaigns)
        .set({
          status: "Sent",
          sentAt: new Date()
        })
        .where(eq(emailCampaigns.id, campaignId))
        .returning();
      
      // If we successfully updated the campaign, consider it sent
      return !!updatedCampaign;
    } catch (error) {
      console.error("Error updating campaign status:", error);
      return false;
    }
  }

  async sendQuotationEmail(quotationId: number): Promise<boolean> {
    try {
      const [updatedQuotation] = await db
        .update(quotations)
        .set({
          emailSent: true,
          emailSentAt: new Date(),
          status: "Sent"
        })
        .where(eq(quotations.id, quotationId))
        .returning();
      
      return !!updatedQuotation;
    } catch (error) {
      console.error("Error updating quotation email status:", error);
      return false;
    }
  }

  async sendEmailToList(listId: number, subject: string, body: string, fromName: string, fromEmail: string): Promise<boolean> {
    // This method doesn't need to update the database since it's a one-time action
    // The actual email sending is handled by the email service
    return true;
  }
}

// Get the right storage based on environment
export const storage = process.env.NODE_ENV === "production" 
  ? new DatabaseStorage() 
  : new MemStorage();