import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject
    };

    if (params.templateId) {
      emailData.templateId = params.templateId;
      if (params.dynamicTemplateData) {
        emailData.dynamicTemplateData = params.dynamicTemplateData;
      }
    } else {
      if (params.text) emailData.text = params.text;
      if (params.html) emailData.html = params.html;
    }

    await mailService.send(emailData);
    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendBulkEmail(
  recipients: string[],
  from: string,
  subject: string,
  text?: string,
  html?: string,
  templateId?: string,
  dynamicTemplateData?: any
): Promise<{ success: boolean; failedEmails: string[] }> {
  const failedEmails: string[] = [];
  
  // SendGrid allows up to 1000 recipients per request
  const chunkSize = 1000;
  const chunks = [];
  
  for (let i = 0; i < recipients.length; i += chunkSize) {
    chunks.push(recipients.slice(i, i + chunkSize));
  }
  
  for (const chunk of chunks) {
    try {
      const emailData = {
        to: chunk,
        from: from,
        subject: subject,
        text: text,
        html: html,
        ...(templateId && {
          templateId: templateId,
          dynamicTemplateData: dynamicTemplateData
        })
      };
      
      await mailService.send(emailData);
      console.log(`Bulk email sent to ${chunk.length} recipients`);
    } catch (error) {
      console.error('Bulk email error for chunk:', error);
      failedEmails.push(...chunk);
    }
  }
  
  return {
    success: failedEmails.length === 0,
    failedEmails
  };
}

export async function sendListEmail(
  listId: number,
  from: string,
  subject: string,
  text?: string,
  html?: string,
  templateId?: string,
  dynamicTemplateData?: any
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  // This will be implemented with the storage layer
  return {
    success: true,
    sentCount: 0,
    failedCount: 0
  };
}