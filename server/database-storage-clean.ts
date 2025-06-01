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
  private db = db;

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

  async updateList(id: number, list: InsertList): Promise<List | undefined> {
    const [updatedList] = await db.update(lists).set({
      ...list,
      updatedAt: new Date(),
    }).where(eq(lists.id, id)).returning();
    return updatedList;
  }

  async deleteList(id: number): Promise<boolean> {
    const result = await db.delete(lists).where(eq(lists.id, id));
    return (result.rowCount || 0) > 0;
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
    const allContacts = await db.select().from(contacts);
    const allDeals = await db.select().from(deals);
    const allCompanies = await db.select().from(companies);
    const allActivities = await db.select().from(activities).orderBy(sql`created_at DESC`).limit(5);
    
    const totalLeads = allContacts.length;
    const totalDealsCount = allDeals.length;
    
    // Count open deals (not closed)
    const openDealsCount = allDeals.filter(deal => 
      deal.stage && !['Closed Won', 'Won', 'Closed Lost', 'Lost'].includes(deal.stage)
    ).length;
    
    // Count closed won deals
    const closedWonDeals = allDeals.filter(deal => 
      deal.stage && ['Closed Won', 'Won'].includes(deal.stage)
    );
    const closedWonCount = closedWonDeals.length;
    
    // Calculate total revenue from closed won deals
    const revenue = closedWonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    
    // Calculate conversion rate (closed won / total deals)
    const conversionRate = totalDealsCount > 0 ? ((closedWonCount / totalDealsCount) * 100).toFixed(1) : "0";
    
    // Format revenue
    const formattedRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(revenue);

    // Calculate pipeline stages
    const stageMapping = {
      'Inquiry': 'New Leads',
      'Lead': 'New Leads',
      'Qualified': 'Qualified',
      'Proposal': 'Proposal',
      'Negotiation': 'Negotiation',
      'Won': 'Closed Won',
      'Closed Won': 'Closed Won'
    };

    const stageCounts: Record<string, number> = {
      'New Leads': 0,
      'Qualified': 0,
      'Proposal': 0,
      'Negotiation': 0,
      'Closed Won': 0
    };

    // Count deals by stage
    allDeals.forEach(deal => {
      const stage = deal.stage;
      if (stage && stageMapping[stage as keyof typeof stageMapping]) {
        const mappedStage = stageMapping[stage as keyof typeof stageMapping];
        stageCounts[mappedStage]++;
      } else {
        // Default unmapped stages to New Leads
        stageCounts['New Leads']++;
      }
    });

    // Calculate percentages
    const pipelineStages = Object.entries(stageCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalDealsCount > 0 ? Math.round((count / totalDealsCount) * 100) : 0,
      isLast: name === 'Negotiation',
      isWon: name === 'Closed Won'
    }));

    // Calculate Direct vs Partner funnel values based on company-partner relationship
    const directDeals: any[] = [];
    const partnerDeals: any[] = [];

    allDeals.forEach(deal => {
      if (deal.companyId) {
        // Find the company for this deal
        const company = allCompanies.find(c => c.id === deal.companyId);
        if (company && company.partnerId) {
          // Deal is through a partner (company has a partner)
          partnerDeals.push(deal);
        } else {
          // Direct deal (company has no partner or no company)
          directDeals.push(deal);
        }
      } else {
        // No company assigned, treat as direct deal
        directDeals.push(deal);
      }
    });

    // Calculate total funnel values (all open deals + closed won)
    const directFunnelValue = directDeals
      .filter(deal => !['Closed Lost', 'Lost'].includes(deal.stage || ''))
      .reduce((sum, deal) => sum + (deal.value || 0), 0);
    
    const partnerFunnelValue = partnerDeals
      .filter(deal => !['Closed Lost', 'Lost'].includes(deal.stage || ''))
      .reduce((sum, deal) => sum + (deal.value || 0), 0);

    const totalFunnelValue = directFunnelValue + partnerFunnelValue;

    const formattedDirectFunnelValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(directFunnelValue);

    const formattedPartnerFunnelValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(partnerFunnelValue);

    const formattedTotalFunnelValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(totalFunnelValue);

    return {
      totalLeads,
      openDeals: openDealsCount,
      revenue: formattedRevenue,
      conversionRate: `${conversionRate}%`,
      pipelineStages,
      recentActivities: allActivities,
      funnelBreakdown: {
        direct: {
          value: directFunnelValue,
          formatted: formattedDirectFunnelValue,
          percentage: totalFunnelValue > 0 ? Math.round((directFunnelValue / totalFunnelValue) * 100) : 0
        },
        partner: {
          value: partnerFunnelValue,
          formatted: formattedPartnerFunnelValue,
          percentage: totalFunnelValue > 0 ? Math.round((partnerFunnelValue / totalFunnelValue) * 100) : 0
        },
        total: {
          value: totalFunnelValue,
          formatted: formattedTotalFunnelValue
        }
      }
    };
  }

  // Email template methods
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const result = await db.select().from(emailTemplates);
    return result;
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return result[0];
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const result = await db.insert(emailTemplates).values(template).returning();
    return result[0];
  }

  async updateEmailTemplate(id: number, template: InsertEmailTemplate): Promise<EmailTemplate | undefined> {
    const result = await db.update(emailTemplates).set({
      ...template,
      updatedAt: new Date(),
    }).where(eq(emailTemplates.id, id)).returning();
    return result[0];
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Email campaign methods
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    const result = await db.select().from(emailCampaigns);
    return result;
  }

  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> {
    const result = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return result[0];
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const result = await db.insert(emailCampaigns).values(campaign).returning();
    return result[0];
  }

  async updateEmailCampaign(id: number, campaign: InsertEmailCampaign): Promise<EmailCampaign | undefined> {
    const result = await db.update(emailCampaigns).set({
      ...campaign,
      updatedAt: new Date(),
    }).where(eq(emailCampaigns.id, id)).returning();
    return result[0];
  }

  async deleteEmailCampaign(id: number): Promise<boolean> {
    const result = await db.delete(emailCampaigns).where(eq(emailCampaigns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Email campaign recipient methods
  async getEmailCampaignRecipients(campaignId: number): Promise<EmailCampaignRecipient[]> {
    const result = await db.select().from(emailCampaignRecipients).where(eq(emailCampaignRecipients.campaignId, campaignId));
    return result;
  }

  async addContactToEmailCampaign(campaignId: number, contactId: number): Promise<EmailCampaignRecipient> {
    const result = await db.insert(emailCampaignRecipients).values({
      campaignId,
      contactId,
      status: "Draft"
    }).returning();
    return result[0];
  }

  async addContactListToEmailCampaign(campaignId: number, listId: number): Promise<EmailCampaignRecipient[]> {
    // Get all contacts in the list
    const listContactsResult = await db.select().from(listContacts).where(eq(listContacts.listId, listId));
    
    const recipients: EmailCampaignRecipient[] = [];
    for (const listContact of listContactsResult) {
      const result = await db.insert(emailCampaignRecipients).values({
        campaignId,
        contactId: listContact.contactId,
        status: "Draft"
      }).returning();
      recipients.push(result[0]);
    }
    
    return recipients;
  }

  // Email sending methods
  async sendEmailCampaign(campaignId: number): Promise<boolean> {
    try {
      const { sendEmail, sendBulkEmail } = await import("./email");
      
      // Get campaign details
      const campaign = await this.getEmailCampaign(campaignId);
      if (!campaign) return false;

      // Get recipients
      const recipients = await this.getEmailCampaignRecipients(campaignId);
      if (recipients.length === 0) return false;

      // Get contact emails
      const contactEmails: string[] = [];
      for (const recipient of recipients) {
        const contact = await this.getContact(recipient.contactId);
        if (contact?.email) {
          contactEmails.push(contact.email);
        }
      }

      if (contactEmails.length === 0) return false;

      // Send bulk email
      const result = await sendBulkEmail(
        contactEmails,
        campaign.fromEmail,
        campaign.subject,
        campaign.body || undefined,
        campaign.body || undefined
      );

      // Update campaign status
      await db.update(emailCampaigns).set({
        status: "Sent",
        sentAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(emailCampaigns.id, campaignId));

      // Update recipient statuses
      await db.update(emailCampaignRecipients).set({
        status: result.success ? "Sent" : "Failed",
        sentAt: new Date(),
      }).where(eq(emailCampaignRecipients.campaignId, campaignId));

      return result.success;
    } catch (error) {
      console.error("Error sending email campaign:", error);
      return false;
    }
  }

  async sendQuotationEmail(quotationId: number): Promise<boolean> {
    try {
      const { sendEmail } = await import("./email");
      
      // Get quotation details
      const quotation = await this.getQuotation(quotationId);
      if (!quotation) return false;

      // Get deal and company details
      const deal = quotation.dealId ? await this.getDeal(quotation.dealId) : null;
      const company = quotation.companyId ? await this.getCompany(quotation.companyId) : null;

      if (!company?.email && !deal?.contactEmail) return false;

      const recipientEmail = company?.email || deal?.contactEmail || "";
      
      // Create email content
      const subject = `Quotation #${quotation.id} - ${quotation.title}`;
      const htmlContent = `
        <h2>Quotation: ${quotation.title}</h2>
        <p><strong>Amount:</strong> ${quotation.currency} ${quotation.amount}</p>
        <p><strong>Valid Until:</strong> ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}</p>
        ${quotation.description ? `<p><strong>Description:</strong> ${quotation.description}</p>` : ''}
        <p>Thank you for your business!</p>
      `;

      const result = await sendEmail({
        to: recipientEmail,
        from: "noreply@yourcompany.com", // You can make this configurable
        subject,
        html: htmlContent
      });

      if (result) {
        await this.markQuotationAsEmailSent(quotationId);
      }

      return result;
    } catch (error) {
      console.error("Error sending quotation email:", error);
      return false;
    }
  }

  async sendEmailToList(listId: number, subject: string, body: string, fromName: string, fromEmail: string): Promise<boolean> {
    try {
      const { sendBulkEmail } = await import("./email");
      
      // Get all contacts in the list
      const listContactsResult = await db.select().from(listContacts).where(eq(listContacts.listId, listId));
      
      const contactEmails: string[] = [];
      for (const listContact of listContactsResult) {
        const contact = await this.getContact(listContact.contactId);
        if (contact?.email) {
          contactEmails.push(contact.email);
        }
      }

      if (contactEmails.length === 0) return false;

      const result = await sendBulkEmail(
        contactEmails,
        fromEmail,
        subject,
        body // text content
      );

      return result.success;
    } catch (error) {
      console.error("Error sending email to list:", error);
      return false;
    }
  }

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

  // Quotation methods
  async getQuotations(): Promise<Quotation[]> {
    const result = await db.select().from(quotations);
    return result;
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const result = await db.select().from(quotations).where(eq(quotations.id, id));
    return result[0];
  }

  async getQuotationsByDeal(dealId: number): Promise<Quotation[]> {
    const result = await db.select().from(quotations).where(eq(quotations.dealId, dealId));
    return result;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const result = await db.insert(quotations).values({
      ...quotation,
      validUntil: quotation.validUntil ? new Date(quotation.validUntil) : null,
    }).returning();
    return result[0];
  }

  async updateQuotation(id: number, quotation: InsertQuotation): Promise<Quotation | undefined> {
    const result = await db.update(quotations).set({
      ...quotation,
      validUntil: quotation.validUntil ? new Date(quotation.validUntil) : null,
      updatedAt: new Date(),
    }).where(eq(quotations.id, id)).returning();
    return result[0];
  }

  async deleteQuotation(id: number): Promise<boolean> {
    const result = await db.delete(quotations).where(eq(quotations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async markQuotationAsEmailSent(id: number): Promise<Quotation | undefined> {
    const result = await db.update(quotations).set({
      emailSent: true,
      emailSentAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(quotations.id, id)).returning();
    return result[0];
  }

  // Quotation template methods (basic implementations)
  async getQuotationTemplates(): Promise<QuotationTemplate[]> { return []; }
  async getQuotationTemplate(id: number): Promise<QuotationTemplate | undefined> { return undefined; }
  async createQuotationTemplate(template: InsertQuotationTemplate): Promise<QuotationTemplate> { throw new Error("Not implemented"); }
  async updateQuotationTemplate(id: number, template: InsertQuotationTemplate): Promise<QuotationTemplate | undefined> { return undefined; }
  async deleteQuotationTemplate(id: number): Promise<boolean> { return false; }
}