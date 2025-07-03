import { db } from './db';
import { 
  users, 
  contacts, 
  companies, 
  partners, 
  deals, 
  tasks, 
  activities, 
  lists, 
  listContacts,
  quotations,
  quotationTemplates,
  emailTemplates,
  emailCampaigns,
  socialAccounts,
  socialPosts,
  socialCampaigns,
  forms,
  formSubmissions,
  invoices
} from '../shared/schema';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await db.delete(invoices);
    await db.delete(emailCampaigns);
    await db.delete(emailTemplates);
    await db.delete(quotations);
    await db.delete(quotationTemplates);
    await db.delete(socialPosts);
    await db.delete(socialCampaigns);
    await db.delete(socialAccounts);
    await db.delete(formSubmissions);
    await db.delete(forms);
    await db.delete(activities);
    await db.delete(tasks);
    await db.delete(listContacts);
    await db.delete(lists);
    await db.delete(deals);
    await db.delete(contacts);
    await db.delete(companies);
    await db.delete(partners);
    await db.delete(users);

    console.log('✅ Data cleared successfully');

    // Seed Users
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const [adminUser, salesUser, marketingUser] = await db.insert(users).values([
      {
        email: 'admin@potentialcrm.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      },
      {
        email: 'sales@potentialcrm.com',
        password: hashedPassword,
        firstName: 'Sales',
        lastName: 'Manager',
        role: 'user',
        isActive: true
      },
      {
        email: 'marketing@potentialcrm.com',
        password: hashedPassword,
        firstName: 'Marketing',
        lastName: 'Coordinator',
        role: 'user',
        isActive: true
      }
    ]).returning();

    console.log('✅ Users seeded successfully');

    // Seed Partners
    console.log('🤝 Seeding partners...');
    const [partner1, partner2] = await db.insert(partners).values([
      {
        name: 'Tech Solutions Inc.',
        email: 'contact@techsolutions.com',
        contactPerson: 'John Smith',
        phone: '+1-555-0123',
        website: 'https://techsolutions.com',
        industry: 'Technology',
        partnerType: 'Reseller',
        commissionRate: 15,
        status: 'Active',
        notes: 'Primary technology partner',
        userId: adminUser.id
      },
      {
        name: 'Digital Marketing Pro',
        email: 'hello@digitalmarketingpro.com',
        contactPerson: 'Sarah Johnson',
        phone: '+1-555-0456',
        website: 'https://digitalmarketingpro.com',
        industry: 'Marketing',
        partnerType: 'Strategic',
        commissionRate: 20,
        status: 'Active',
        notes: 'Marketing and lead generation partner',
        userId: adminUser.id
      }
    ]).returning();

    console.log('✅ Partners seeded successfully');

    // Seed Companies
    console.log('🏢 Seeding companies...');
    const [company1, company2, company3, company4] = await db.insert(companies).values([
      {
        name: 'Acme Corporation',
        website: 'https://acme.com',
        industry: 'Manufacturing',
        size: 'Enterprise',
        country: 'United States',
        notes: 'Large manufacturing company looking for CRM solution',
        tags: ['enterprise', 'manufacturing', 'high-value'],
        partnerId: partner1.id
      },
      {
        name: 'StartupXYZ',
        website: 'https://startupxyz.com',
        industry: 'SaaS',
        size: 'Small',
        country: 'Canada',
        notes: 'Fast-growing SaaS startup',
        tags: ['startup', 'saas', 'growth'],
        partnerId: partner2.id
      },
      {
        name: 'Global Retail Chain',
        website: 'https://globalretail.com',
        industry: 'Retail',
        size: 'Large',
        country: 'United Kingdom',
        notes: 'International retail chain with 500+ locations',
        tags: ['retail', 'international', 'enterprise']
      },
      {
        name: 'Local Consulting Group',
        website: 'https://localconsulting.com',
        industry: 'Consulting',
        size: 'Medium',
        country: 'Australia',
        notes: 'Regional consulting firm specializing in business transformation',
        tags: ['consulting', 'regional', 'medium-business']
      }
    ]).returning();

    console.log('✅ Companies seeded successfully');

    // Seed Contacts
    console.log('👤 Seeding contacts...');
    const [contact1, contact2, contact3, contact4, contact5, contact6] = await db.insert(contacts).values([
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@acme.com',
        phone: '+1-555-0789',
        country: 'United States',
        jobTitle: 'IT Director',
        companyId: company1.id,
        webinarsAttended: ['CRM Best Practices', 'Digital Transformation'],
        tags: ['decision-maker', 'it', 'enterprise'],
        leadType: 'Customer',
        leadStatus: 'Qualified',
        importance: 'High',
        source: 'Partner Referral',
        sourceDetails: { partnerId: partner1.id, referralDate: '2024-01-15' },
        notes: 'Interested in enterprise CRM solution. Budget approved for Q2.'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@startupxyz.com',
        phone: '+1-555-0321',
        country: 'Canada',
        jobTitle: 'CEO',
        companyId: company2.id,
        webinarsAttended: ['Startup Growth Strategies'],
        tags: ['founder', 'decision-maker', 'startup'],
        leadType: 'Customer',
        leadStatus: 'Proposal',
        importance: 'High',
        source: 'Website',
        sourceDetails: { landingPage: '/pricing', utmSource: 'google' },
        notes: 'Founder looking for scalable CRM. Very interested in automation features.'
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@globalretail.com',
        phone: '+44-20-7123-4567',
        country: 'United Kingdom',
        jobTitle: 'Operations Manager',
        companyId: company3.id,
        tags: ['operations', 'enterprise', 'uk'],
        leadType: 'Customer',
        leadStatus: 'Contacted',
        importance: 'Medium',
        source: 'Cold Outreach',
        notes: 'Managing operations across multiple locations. Needs centralized customer management.'
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@localconsulting.com',
        phone: '+61-2-9876-5432',
        country: 'Australia',
        jobTitle: 'Managing Director',
        companyId: company4.id,
        tags: ['consulting', 'decision-maker', 'australia'],
        leadType: 'Customer',
        leadStatus: 'New',
        importance: 'Medium',
        source: 'LinkedIn',
        sourceDetails: { linkedinCampaign: 'consulting-2024' },
        notes: 'Growing consulting practice needs better client management.'
      },
      {
        firstName: 'Robert',
        lastName: 'Taylor',
        email: 'robert.taylor@techsolutions.com',
        phone: '+1-555-0654',
        country: 'United States',
        jobTitle: 'Sales Director',
        companyId: null,
        tags: ['partner', 'sales'],
        leadType: 'Partner',
        leadStatus: 'Converted',
        importance: 'High',
        source: 'Partner Program',
        notes: 'Key partner contact for Tech Solutions Inc.'
      },
      {
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer.martinez@digitalmarketingpro.com',
        phone: '+1-555-0987',
        country: 'United States',
        jobTitle: 'Marketing Manager',
        companyId: null,
        tags: ['partner', 'marketing'],
        leadType: 'Partner',
        leadStatus: 'Converted',
        importance: 'High',
        source: 'Partner Program',
        notes: 'Primary contact for Digital Marketing Pro partnership.'
      }
    ]).returning();

    console.log('✅ Contacts seeded successfully');

    // Seed Deals
    console.log('💰 Seeding deals...');
    const [deal1, deal2, deal3, deal4] = await db.insert(deals).values([
      {
        title: 'Acme Corporation - Enterprise CRM Implementation',
        value: 50000,
        currency: 'USD',
        contactId: contact1.id,
        companyId: company1.id,
        partnerId: partner1.id,
        stage: 'Negotiation',
        subscriptionType: 'Enterprise',
        startDate: new Date('2024-03-01'),
        expiryDate: new Date('2025-03-01'),
        notes: 'Large enterprise deal. Final contract review in progress.'
      },
      {
        title: 'StartupXYZ - Growth CRM Package',
        value: 12000,
        currency: 'USD',
        contactId: contact2.id,
        companyId: company2.id,
        stage: 'Proposal',
        subscriptionType: 'Professional',
        startDate: new Date('2024-02-15'),
        expiryDate: new Date('2025-02-15'),
        notes: 'Startup package with growth features. Proposal sent, awaiting response.'
      },
      {
        title: 'Global Retail Chain - Multi-location CRM',
        value: 75000,
        currency: 'USD',
        contactId: contact3.id,
        companyId: company3.id,
        stage: 'Qualified',
        subscriptionType: 'Enterprise',
        startDate: null,
        expiryDate: null,
        notes: 'Complex multi-location implementation. Technical requirements being finalized.'
      },
      {
        title: 'Local Consulting Group - Professional CRM',
        value: 8000,
        currency: 'USD',
        contactId: contact4.id,
        companyId: company4.id,
        stage: 'Inquiry',
        subscriptionType: 'Professional',
        startDate: null,
        expiryDate: null,
        notes: 'New inquiry from consulting firm. Initial discovery call scheduled.'
      }
    ]).returning();

    console.log('✅ Deals seeded successfully');

    // Seed Tasks
    console.log('📋 Seeding tasks...');
    await db.insert(tasks).values([
      {
        title: 'Follow up with Acme Corporation',
        description: 'Call Michael Brown to discuss contract terms and implementation timeline',
        dueDate: new Date('2024-01-25'),
        completed: false,
        priority: 'High',
        assignedTo: salesUser.id,
        contactId: contact1.id,
        companyId: company1.id,
        dealId: deal1.id
      },
      {
        title: 'Prepare proposal for StartupXYZ',
        description: 'Create detailed proposal including pricing and feature comparison',
        dueDate: new Date('2024-01-28'),
        completed: false,
        priority: 'High',
        assignedTo: salesUser.id,
        contactId: contact2.id,
        companyId: company2.id,
        dealId: deal2.id
      },
      {
        title: 'Schedule demo for Global Retail',
        description: 'Arrange technical demo for David Wilson and IT team',
        dueDate: new Date('2024-01-30'),
        completed: false,
        priority: 'Medium',
        assignedTo: salesUser.id,
        contactId: contact3.id,
        companyId: company3.id,
        dealId: deal3.id
      },
      {
        title: 'Create marketing campaign for Q1',
        description: 'Develop email campaign targeting consulting firms',
        dueDate: new Date('2024-02-05'),
        completed: false,
        priority: 'Medium',
        assignedTo: marketingUser.id
      },
      {
        title: 'Update partner portal',
        description: 'Add new features to partner portal based on feedback',
        dueDate: new Date('2024-02-10'),
        completed: false,
        priority: 'Low',
        assignedTo: adminUser.id
      }
    ]);

    console.log('✅ Tasks seeded successfully');

    // Seed Activities
    console.log('📝 Seeding activities...');
    await db.insert(activities).values([
      {
        type: 'call',
        title: 'Initial Discovery Call with Acme Corporation',
        description: 'Discussed current CRM pain points and requirements. Budget confirmed at $50k.',
        contactId: contact1.id,
        companyId: company1.id,
        dealId: deal1.id,
        userId: salesUser.id
      },
      {
        type: 'email',
        title: 'Proposal Sent to StartupXYZ',
        description: 'Sent detailed proposal with pricing and feature breakdown.',
        contactId: contact2.id,
        companyId: company2.id,
        dealId: deal2.id,
        userId: salesUser.id
      },
      {
        type: 'meeting',
        title: 'Partner Strategy Meeting',
        description: 'Discussed Q1 partner initiatives and commission structure updates.',
        userId: adminUser.id
      },
      {
        type: 'note',
        title: 'Market Research - Consulting Industry',
        description: 'Identified 50+ consulting firms in target region for outreach campaign.',
        userId: marketingUser.id
      }
    ]);

    console.log('✅ Activities seeded successfully');

    // Seed Lists
    console.log('📋 Seeding lists...');
    const [list1, list2, list3] = await db.insert(lists).values([
      {
        name: 'Enterprise Prospects',
        description: 'High-value enterprise companies with 1000+ employees',
        isDynamic: true,
        criteria: { companySize: 'Enterprise', leadStatus: ['New', 'Contacted', 'Qualified'] }
      },
      {
        name: 'Partner Referrals',
        description: 'Leads generated through partner network',
        isDynamic: true,
        criteria: { source: 'Partner Referral' }
      },
      {
        name: 'Q1 Marketing Campaign',
        description: 'Targets for Q1 email marketing campaign',
        isDynamic: false
      }
    ]).returning();

    console.log('✅ Lists seeded successfully');

    // Seed List Contacts
    console.log('📋 Seeding list contacts...');
    await db.insert(listContacts).values([
      { listId: list1.id, contactId: contact1.id },
      { listId: list1.id, contactId: contact3.id },
      { listId: list2.id, contactId: contact1.id },
      { listId: list3.id, contactId: contact2.id },
      { listId: list3.id, contactId: contact4.id }
    ]);

    console.log('✅ List contacts seeded successfully');

    // Seed Quotation Templates
    console.log('📄 Seeding quotation templates...');
    const [quotationTemplate1] = await db.insert(quotationTemplates).values([
      {
        name: 'Standard Enterprise Package',
        description: 'Standard quotation template for enterprise customers',
        emailSubject: 'Your CRM Solution Quotation - {CompanyName}',
        emailBody: 'Dear {ContactName},\n\nThank you for your interest in our CRM solution. Please find attached your customized quotation.\n\nWe look forward to discussing this further.\n\nBest regards,\n{YourName}',
        termsAndConditions: 'Payment terms: Net 30 days\nImplementation: 4-6 weeks\nSupport: 24/7 enterprise support included'
      }
    ]).returning();

    console.log('✅ Quotation templates seeded successfully');

    // Seed Quotations
    console.log('📄 Seeding quotations...');
    await db.insert(quotations).values([
      {
        title: 'Enterprise CRM Solution - Acme Corporation',
        dealId: deal1.id,
        contactId: contact1.id,
        companyId: company1.id,
        amount: 50000,
        currency: 'USD',
        status: 'Sent',
        validUntil: new Date('2024-02-15'),
        notes: 'Enterprise package with custom integrations',
        emailSent: true,
        emailSentAt: new Date('2024-01-20'),
        items: [
          { description: 'Enterprise CRM License (100 users)', quantity: 1, unitPrice: 30000 },
          { description: 'Custom Integration Development', quantity: 1, unitPrice: 15000 },
          { description: 'Implementation Services', quantity: 1, unitPrice: 5000 }
        ],
        termsAndConditions: 'Payment terms: Net 30 days\nImplementation: 4-6 weeks\nSupport: 24/7 enterprise support included'
      }
    ]);

    console.log('✅ Quotations seeded successfully');

    // Seed Email Templates
    console.log('📧 Seeding email templates...');
    const [emailTemplate1, emailTemplate2] = await db.insert(emailTemplates).values([
      {
        name: 'Welcome Email',
        description: 'Welcome email for new customers',
        subject: 'Welcome to Potential.CRM - {CompanyName}',
        body: 'Dear {ContactName},\n\nWelcome to Potential.CRM! We\'re excited to have you on board.\n\nYour account has been set up and you can start using our platform immediately.\n\nIf you have any questions, please don\'t hesitate to reach out.\n\nBest regards,\nThe Potential.CRM Team',
        fromName: 'Potential.CRM Team',
        fromEmail: 'welcome@potentialcrm.com',
        replyTo: 'support@potentialcrm.com'
      },
      {
        name: 'Follow-up Email',
        description: 'Follow-up email for prospects',
        subject: 'Following up on our conversation - {CompanyName}',
        body: 'Dear {ContactName},\n\nI hope this email finds you well. I wanted to follow up on our recent conversation about your CRM needs.\n\nHave you had a chance to review the information I sent?\n\nI\'d be happy to schedule a call to discuss any questions you might have.\n\nBest regards,\n{YourName}',
        fromName: 'Sales Team',
        fromEmail: 'sales@potentialcrm.com',
        replyTo: 'sales@potentialcrm.com'
      }
    ]).returning();

    console.log('✅ Email templates seeded successfully');

    // Seed Email Campaigns
    console.log('📧 Seeding email campaigns...');
    await db.insert(emailCampaigns).values([
      {
        name: 'Q1 Enterprise Outreach',
        description: 'Email campaign targeting enterprise prospects',
        subject: 'Transform Your Customer Relationships with Potential.CRM',
        body: 'Dear {ContactName},\n\nIs your current CRM holding your business back?\n\nPotential.CRM helps enterprise companies like yours streamline customer management and boost sales.\n\nKey benefits:\n- Centralized customer data\n- Advanced automation\n- Real-time analytics\n- Mobile access\n\nWould you be interested in a 15-minute demo?\n\nBest regards,\n{YourName}',
        fromName: 'Sales Team',
        fromEmail: 'sales@potentialcrm.com',
        replyTo: 'sales@potentialcrm.com',
        status: 'Draft',
        scheduledFor: new Date('2024-02-01T10:00:00Z'),
        listId: list1.id,
        templateId: emailTemplate2.id,
        stats: { sent: 0, opened: 0, clicked: 0 }
      }
    ]);

    console.log('✅ Email campaigns seeded successfully');

    // Seed Social Accounts
    console.log('📱 Seeding social accounts...');
    const [socialAccount1] = await db.insert(socialAccounts).values([
      {
        platform: 'LinkedIn',
        accountName: 'Potential.CRM',
        accountUrl: 'https://linkedin.com/company/potential-crm',
        accessToken: 'sample_token_123',
        refreshToken: 'sample_refresh_token_123',
        tokenExpiry: new Date('2024-12-31'),
        active: true
      }
    ]).returning();

    console.log('✅ Social accounts seeded successfully');

    // Seed Social Posts
    console.log('📱 Seeding social posts...');
    await db.insert(socialPosts).values([
      {
        accountId: socialAccount1.id,
        content: '🚀 Excited to announce our new enterprise features! Transform how you manage customer relationships with Potential.CRM. #CRM #Enterprise #BusinessGrowth',
        mediaUrls: [],
        status: 'Published',
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        engagementStats: { likes: 45, shares: 12, comments: 8 }
      },
      {
        accountId: socialAccount1.id,
        content: '💡 Did you know? Companies using CRM software see an average 29% increase in sales productivity. Ready to boost your team\'s performance? #Sales #Productivity #CRM',
        mediaUrls: [],
        status: 'Scheduled',
        scheduledFor: new Date('2024-01-25T14:00:00Z')
      }
    ]);

    console.log('✅ Social posts seeded successfully');

    // Seed Social Campaigns
    console.log('📱 Seeding social campaigns...');
    await db.insert(socialCampaigns).values([
      {
        name: 'Q1 Brand Awareness Campaign',
        description: 'LinkedIn campaign to increase brand awareness',
        status: 'Active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        targetAudience: { 
          platform: 'LinkedIn',
          demographics: { age: '25-54', jobTitles: ['Manager', 'Director', 'VP', 'CEO'] },
          interests: ['CRM', 'Sales', 'Business Software']
        },
        budget: 5000
      }
    ]);

    console.log('✅ Social campaigns seeded successfully');

    // Seed Forms
    console.log('📝 Seeding forms...');
    await db.insert(forms).values([
      {
        name: 'Contact Us Form',
        description: 'Main contact form for website visitors',
        fields: [
          { name: 'firstName', type: 'text', label: 'First Name', required: true },
          { name: 'lastName', type: 'text', label: 'Last Name', required: true },
          { name: 'email', type: 'email', label: 'Email Address', required: true },
          { name: 'company', type: 'text', label: 'Company Name', required: false },
          { name: 'phone', type: 'tel', label: 'Phone Number', required: false },
          { name: 'message', type: 'textarea', label: 'Message', required: true }
        ],
        listId: list3.id
      }
    ]);

    console.log('✅ Forms seeded successfully');

    // Seed Invoices
    console.log('🧾 Seeding invoices...');
    await db.insert(invoices).values([
      {
        dealId: deal1.id,
        invoiceDate: new Date('2024-01-20'),
        amount: 50000,
        currency: 'USD',
        status: 'Under Processing',
        notes: 'Enterprise CRM implementation invoice'
      }
    ]);

    console.log('✅ Invoices seeded successfully');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary of seeded data:');
    console.log('- Users: 3');
    console.log('- Partners: 2');
    console.log('- Companies: 4');
    console.log('- Contacts: 6');
    console.log('- Deals: 4');
    console.log('- Tasks: 5');
    console.log('- Activities: 4');
    console.log('- Lists: 3');
    console.log('- Quotations: 1');
    console.log('- Email Templates: 2');
    console.log('- Email Campaigns: 1');
    console.log('- Social Accounts: 1');
    console.log('- Social Posts: 2');
    console.log('- Social Campaigns: 1');
    console.log('- Forms: 1');
    console.log('- Invoices: 1');
    
    console.log('\n🔑 Default login credentials:');
    console.log('- Email: admin@potentialcrm.com, Password: password123');
    console.log('- Email: sales@potentialcrm.com, Password: password123');
    console.log('- Email: marketing@potentialcrm.com, Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }); 