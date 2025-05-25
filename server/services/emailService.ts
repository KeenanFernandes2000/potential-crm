import { MailService } from '@sendgrid/mail';
import { EmailCampaign, EmailCampaignRecipient, Contact, Quotation, QuotationTemplate, EmailTemplate } from '@shared/schema';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { listContacts } from '@shared/schema';

// Initialize mail service
const mailService = new MailService();

// This will be set if the API key is provided
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string;
  bcc?: string;
}

interface BulkEmailParams {
  to: string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Send an email using SendGrid
 * @param params Email parameters (to, from, subject, text/html)
 * @returns Boolean indicating if email was sent successfully
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not set - email sending is disabled');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from, // This must be a verified sender in SendGrid
      subject: params.subject,
      text: params.text,
      html: params.html,
      cc: params.cc,
      bcc: params.bcc
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Send bulk emails using SendGrid
 * @param params Bulk email parameters with arrays of recipients
 * @returns Boolean indicating if emails were sent successfully
 */
export async function sendBulkEmails(params: BulkEmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not set - email sending is disabled');
    return false;
  }

  try {
    // Convert recipient arrays to individual emails for SendGrid
    const emails = params.to.map(recipient => ({
      to: recipient,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
      cc: params.cc,
      bcc: params.bcc
    }));

    // Send all emails
    await mailService.send(emails);
    return true;
  } catch (error) {
    console.error('SendGrid bulk email error:', error);
    return false;
  }
}

/**
 * Send an email campaign to all recipients
 * @param campaignId ID of the email campaign
 * @returns Boolean indicating if campaign was sent successfully
 */
export async function sendEmailCampaign(campaignId: number): Promise<boolean> {
  try {
    // Get campaign details
    const campaign = await storage.getEmailCampaign(campaignId);
    if (!campaign) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return false;
    }

    // Get campaign recipients
    const recipients = await storage.getEmailCampaignRecipients(campaignId);
    if (!recipients || recipients.length === 0) {
      console.error(`No recipients found for campaign with ID ${campaignId}`);
      return false;
    }

    // Get contacts for all recipients
    const contacts: Contact[] = [];
    for (const recipient of recipients) {
      const contact = await storage.getContact(recipient.contactId);
      if (contact) {
        contacts.push(contact);
      }
    }

    if (contacts.length === 0) {
      console.error(`No valid contacts found for campaign with ID ${campaignId}`);
      return false;
    }

    // Prepare email content
    const emailAddresses = contacts.map(contact => contact.email);
    
    // Send the bulk email
    const result = await sendBulkEmails({
      to: emailAddresses,
      from: `${campaign.fromName} <${campaign.fromEmail}>`,
      subject: campaign.subject,
      html: campaign.body
    });

    if (result) {
      // Update campaign status
      await storage.updateEmailCampaign(campaignId, {
        ...campaign,
        status: "Sent",
        sentAt: new Date()
      });
    }

    return result;
  } catch (error) {
    console.error('Email campaign sending error:', error);
    return false;
  }
}

/**
 * Send an email to all contacts in a list
 * @param listId ID of the contact list
 * @param subject Email subject
 * @param body Email body (HTML)
 * @param fromName Sender name
 * @param fromEmail Sender email
 * @returns Boolean indicating if emails were sent successfully
 */
export async function sendEmailToList(
  listId: number, 
  subject: string, 
  body: string, 
  fromName: string, 
  fromEmail: string
): Promise<boolean> {
  try {
    // First, get the list to ensure it exists
    const list = await storage.getList(listId);
    if (!list) {
      console.error(`List with ID ${listId} not found`);
      return false;
    }

    // Get contacts from list (assuming there's a function to get contacts by list)
    const contacts = await getContactsFromList(listId);
    if (!contacts || contacts.length === 0) {
      console.error(`No contacts found in list with ID ${listId}`);
      return false;
    }

    // Prepare email content
    const emailAddresses = contacts.map(contact => contact.email);
    
    // Send the bulk email
    return await sendBulkEmails({
      to: emailAddresses,
      from: `${fromName} <${fromEmail}>`,
      subject: subject,
      html: body
    });
  } catch (error) {
    console.error('List email sending error:', error);
    return false;
  }
}

/**
 * Helper function to get contacts from a list
 * @param listId ID of the list
 * @returns Array of contacts in the list
 */
async function getContactsFromList(listId: number): Promise<Contact[]> {
  try {
    // Get all contacts
    const allContacts = await storage.getContacts();
    
    // Get list-contact relationships from the junction table
    const listContactRecords = await db.select().from(listContacts).where(eq(listContacts.listId, listId));
    
    // Match contacts from the list
    const contacts: Contact[] = [];
    for (const lc of listContactRecords) {
      const contact = allContacts.find(c => c.id === lc.contactId);
      if (contact) {
        contacts.push(contact);
      }
    }
    
    return contacts;
  } catch (error) {
    console.error('Error getting contacts from list:', error);
    return [];
  }
}

/**
 * Format a quotation email with company details
 * @param quotation The quotation object
 * @param contact Contact information
 * @param companyName Company name
 * @param emailTemplate Email template to use
 * @returns Formatted HTML email
 */
export function formatQuotationEmail(
  quotation: any,
  contact: any,
  companyName: string,
  emailTemplate: any
): string {
  // Create a simple HTML email template with placeholders
  const itemsHtml = quotation.items
    .map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${quotation.currency} ${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${quotation.currency} ${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    `)
    .join('');

  // Replace placeholders in the email template
  let emailBody = emailTemplate.emailBody
    .replace(/{{contactName}}/g, `${contact.firstName} ${contact.lastName}`)
    .replace(/{{companyName}}/g, companyName)
    .replace(/{{quotationTitle}}/g, quotation.title)
    .replace(/{{quotationNumber}}/g, quotation.id)
    .replace(/{{validUntil}}/g, quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A')
    .replace(/{{amount}}/g, `${quotation.currency} ${quotation.amount.toFixed(2)}`)
    .replace(/{{items}}/g, `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 8px; text-align: left;">Description</th>
            <th style="padding: 8px; text-align: center;">Quantity</th>
            <th style="padding: 8px; text-align: right;">Unit Price</th>
            <th style="padding: 8px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">${quotation.currency} ${quotation.amount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `)
    .replace(/{{termsAndConditions}}/g, quotation.termsAndConditions || emailTemplate.termsAndConditions || '');

  // Add a wrapper for better email client compatibility
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      ${emailBody}
    </div>
  `;
}