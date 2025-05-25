import { MailService } from '@sendgrid/mail';
import { storage } from '../storage';
import { Contact, Quotation } from '@shared/schema';

// Initialize SendGrid with the API key
if (!process.env.SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY || '');

// Basic email sending function with variable replacement
async function sendEmail(to: string, from: string, subject: string, html: string, variables: Record<string, string> = {}): Promise<boolean> {
  try {
    // Replace all variables in the format {{variableName}} with their values
    let processedHtml = html;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, value);
    });
    
    await mailService.send({
      to,
      from,
      subject,
      html: processedHtml,
    });
    
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Function to send an email campaign to all recipients
export async function sendEmailCampaign(campaignId: number): Promise<boolean> {
  try {
    // Get the campaign details
    const campaign = await storage.getEmailCampaign(campaignId);
    if (!campaign) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return false;
    }
    
    // Get the email template
    const template = await storage.getEmailTemplate(campaign.templateId);
    if (!template) {
      console.error(`Template with ID ${campaign.templateId} not found`);
      return false;
    }
    
    // Get all recipients for this campaign
    const recipients = await storage.getEmailCampaignRecipients(campaignId);
    if (recipients.length === 0) {
      console.error(`No recipients found for campaign ${campaignId}`);
      return false;
    }
    
    // Send email to each recipient
    let successCount = 0;
    
    for (const recipient of recipients) {
      // Get the contact details for variable replacement
      const contact = await storage.getContact(recipient.contactId);
      if (!contact) {
        console.error(`Contact with ID ${recipient.contactId} not found`);
        continue;
      }
      
      // Prepare variables for replacement
      const variables = prepareContactVariables(contact);
      
      // Add campaign-specific variables
      variables.campaignName = campaign.name;
      variables.campaignDescription = campaign.description || '';
      
      // Send the email
      const success = await sendEmail(
        contact.email,
        campaign.fromEmail,
        template.subject,
        template.body,
        variables
      );
      
      if (success) {
        successCount++;
      }
    }
    
    // Update campaign status in database
    await storage.sendEmailCampaign(campaignId);
    
    // Return true if at least one email was sent successfully
    return successCount > 0;
  } catch (error) {
    console.error('Error sending email campaign:', error);
    return false;
  }
}

// Function to send a quotation email
export async function sendQuotationEmail(quotationId: number): Promise<boolean> {
  try {
    // Get the quotation details
    const quotation = await storage.getQuotation(quotationId);
    if (!quotation) {
      console.error(`Quotation with ID ${quotationId} not found`);
      return false;
    }
    
    // Get the contact details
    const contact = await storage.getContact(quotation.contactId);
    if (!contact) {
      console.error(`Contact with ID ${quotation.contactId} not found`);
      return false;
    }
    
    // Format the quotation items into an HTML table
    const itemsHtml = quotation.items ? formatQuotationItemsTable(quotation) : '';
    
    // Prepare variables for replacement
    const variables = prepareContactVariables(contact);
    
    // Add quotation-specific variables
    variables.quotationNumber = quotation.id.toString();
    variables.quotationTitle = quotation.title;
    variables.quotationAmount = quotation.amount.toString();
    variables.quotationCurrency = quotation.currency || 'USD';
    variables.quotationDate = new Date(quotation.createdAt).toLocaleDateString();
    variables.quotationValidUntil = quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A';
    variables.quotationItems = itemsHtml;
    variables.quotationTerms = quotation.termsAndConditions || '';
    
    // Default email content if no template is specified
    let subject = `Quotation #${quotation.id}: ${quotation.title}`;
    let body = `
      <h2>Quotation #${quotation.id}: ${quotation.title}</h2>
      <p>Dear {{contactName}},</p>
      <p>Thank you for your interest in our services. Please find the requested quotation details below:</p>
      <p><strong>Amount:</strong> {{quotationCurrency}} {{quotationAmount}}</p>
      <p><strong>Valid Until:</strong> {{quotationValidUntil}}</p>
      
      {{quotationItems}}
      
      <h3>Terms and Conditions</h3>
      <p>{{quotationTerms}}</p>
      
      <p>Please let us know if you have any questions or would like to proceed with this quotation.</p>
      <p>Best regards,<br>Your Company Name</p>
    `;
    
    // If there's a quotation template specified, use it instead
    if (quotation.templateId) {
      const template = await storage.getQuotationTemplate(quotation.templateId);
      if (template) {
        subject = template.emailSubject;
        body = template.emailBody;
      }
    }
    
    // Get the user who's sending the email (for from address)
    // For now, use a default sender
    const fromEmail = "crm@yourcompany.com";
    const fromName = "CRM System";
    
    // Send the email
    const success = await sendEmail(
      contact.email,
      `${fromName} <${fromEmail}>`,
      subject,
      body,
      variables
    );
    
    // Update quotation status in database if email was sent successfully
    if (success) {
      await storage.sendQuotationEmail(quotationId);
    }
    
    return success;
  } catch (error) {
    console.error('Error sending quotation email:', error);
    return false;
  }
}

// Function to send emails to a list of contacts
export async function sendEmailToList(listId: number, subject: string, body: string, fromName: string, fromEmail: string): Promise<boolean> {
  try {
    // Get the list details
    const list = await storage.getList(listId);
    if (!list) {
      console.error(`List with ID ${listId} not found`);
      return false;
    }
    
    // Get all contacts in the list
    const listContacts = await storage.getListContacts(listId);
    if (listContacts.length === 0) {
      console.error(`No contacts found for list ${listId}`);
      return false;
    }
    
    // Send email to each contact
    let successCount = 0;
    
    for (const listContact of listContacts) {
      // Get the contact details for variable replacement
      const contact = await storage.getContact(listContact.contactId);
      if (!contact) {
        console.error(`Contact with ID ${listContact.contactId} not found`);
        continue;
      }
      
      // Prepare variables for replacement
      const variables = prepareContactVariables(contact);
      
      // Add list-specific variables
      variables.listName = list.name;
      variables.listDescription = list.description || '';
      
      // Send the email
      const success = await sendEmail(
        contact.email,
        `${fromName} <${fromEmail}>`,
        subject,
        body,
        variables
      );
      
      if (success) {
        successCount++;
      }
    }
    
    // Return true if at least one email was sent successfully
    return successCount > 0;
  } catch (error) {
    console.error('Error sending list emails:', error);
    return false;
  }
}

// Helper function to prepare contact variables for email templates
function prepareContactVariables(contact: Contact): Record<string, string> {
  return {
    contactName: `${contact.firstName} ${contact.lastName}`,
    contactFirstName: contact.firstName,
    contactLastName: contact.lastName,
    contactEmail: contact.email,
    contactPhone: contact.phone || '',
    contactCountry: contact.country || '',
    contactJobTitle: contact.jobTitle || '',
    contactCompany: contact.companyName || '',
  };
}

// Helper function to format quotation items into an HTML table
function formatQuotationItemsTable(quotation: Quotation): string {
  if (!quotation.items || quotation.items.length === 0) {
    return '';
  }
  
  let tableHtml = `
    <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="text-align: left;">Description</th>
          <th style="text-align: right;">Quantity</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let grandTotal = 0;
  
  quotation.items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice;
    grandTotal += itemTotal;
    
    tableHtml += `
      <tr>
        <td style="text-align: left;">${item.description}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right;">${(item.unitPrice).toFixed(2)}</td>
        <td style="text-align: right;">${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });
  
  tableHtml += `
      </tbody>
      <tfoot>
        <tr style="background-color: #f2f2f2; font-weight: bold;">
          <td colspan="3" style="text-align: right;">Grand Total:</td>
          <td style="text-align: right;">${grandTotal.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
  
  return tableHtml;
}