import { MailService } from '@sendgrid/mail';

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
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
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