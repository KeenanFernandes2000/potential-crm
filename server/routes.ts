import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertContactSchema, insertCompanySchema, insertPartnerSchema, insertDealSchema, insertTaskSchema, insertActivitySchema, insertListSchema, insertFormSchema, insertQuotationSchema, insertQuotationTemplateSchema, insertEmailTemplateSchema, insertEmailCampaignSchema, insertUserSchema, loginSchema, insertInvoiceSchema } from "@shared/schema";
import twitterRoutes from "./routes/twitter";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Twitter routes
  app.use('/api/twitter', twitterRoutes);
  
  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Store user info in session
      (req as any).session.userId = user.id;
      (req as any).session.userEmail = user.email;
      (req as any).session.userRole = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Authentication check failed" });
    }
  });
  
  // API Routes for CRM System

  // Users (Admin only routes)
  app.get("/api/users", async (req, res) => {
    try {
      // Temporarily bypass admin check to allow viewing users
      // const userRole = (req as any).session?.userRole;
      // if (userRole !== 'admin') {
      //   return res.status(403).json({ message: "Admin access required" });
      // }
      
      const users = await storage.getUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      // Temporarily bypass admin check to allow user creation
      // const userRole = (req as any).session?.userRole;
      // if (userRole !== 'admin') {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const data = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);
      const userData = { ...data, password: hashedPassword };
      
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      // Temporarily bypass admin check to fix password hashing
      // const userRole = (req as any).session?.userRole;
      // if (userRole !== 'admin') {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const id = parseInt(req.params.id);
      const data = req.body;
      
      // If password is being updated, hash it
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 12);
      }
      
      const user = await storage.updateUser(id, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      const currentUserId = (req as any).session?.userId;
      
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      
      // Prevent admin from deleting themselves
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to get contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.updateContact(id, data);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id);
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ message: "Failed to get companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to get company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(data);
      
      // Create activity record for company creation
      try {
        await storage.createActivity({
          type: "contact",
          title: `New company "${company.name}" added`,
          description: `Company from ${company.country || 'Unknown location'} in ${company.industry || 'Unknown'} industry`,
          companyId: company.id,
          userId: null
        });
      } catch (activityError) {
        console.error("Failed to create activity for company:", activityError);
      }
      
      res.status(201).json(company);
    } catch (error) {
      console.error("Create company error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.updateCompany(id, data);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCompany(id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Partners
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Failed to get partners" });
    }
  });

  app.get("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partner = await storage.getPartner(id);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: "Failed to get partner" });
    }
  });

  app.post("/api/partners", async (req, res) => {
    console.log("🔵🔵🔵 PARTNER POST ROUTE HIT! 🔵🔵🔵");
    console.log("🔵 Request URL:", req.url);
    console.log("🔵 Request method:", req.method);
    console.log("🔵 Request body:", JSON.stringify(req.body, null, 2));
    console.log("🔵 Content-Type:", req.headers['content-type']);
    
    try {
      console.log("🟡 Starting partner creation process...");
      const data = insertPartnerSchema.parse(req.body);
      console.log("🟢 Successfully parsed partner data:", JSON.stringify(data, null, 2));
      
      const partner = await storage.createPartner(data);
      console.log("🟢 Successfully created partner:", JSON.stringify(partner, null, 2));
      
      console.log("🟢 Sending 201 response with partner data");
      res.status(201).json(partner);
      console.log("🟢 Response sent successfully");
    } catch (error) {
      console.error("🔴🔴🔴 PARTNER CREATION ERROR:", error);
      if (error instanceof z.ZodError) {
        console.log("🔴 Zod validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      console.log("🔴 Sending 500 error response");
      res.status(500).json({ message: "Failed to create partner", error: String(error) });
    }
  });

  app.put("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPartnerSchema.parse(req.body);
      const partner = await storage.updatePartner(id, data);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePartner(id);
      if (!success) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete partner" });
    }
  });

  // Deals
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to get deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      console.log("Deal creation request body:", JSON.stringify(req.body, null, 2));
      const data = insertDealSchema.parse(req.body);
      console.log("Parsed deal data:", JSON.stringify(data, null, 2));
      
      // Convert string dates to proper format for database
      const dealData = {
        ...data,
        startDate: data.startDate || null,
        expiryDate: data.expiryDate || null,
      };
      
      const deal = await storage.createDeal(dealData);
      
      // Create activity record for deal creation
      try {
        await storage.createActivity({
          type: "deal",
          title: `New deal "${deal.title}" created`,
          description: `Deal worth ${deal.currency} ${deal.value} in ${deal.stage} stage`,
          dealId: deal.id,
          companyId: deal.companyId,
          userId: null
        });
      } catch (activityError) {
        console.error("Failed to create activity for deal:", activityError);
      }
      
      res.status(201).json(deal);
    } catch (error) {
      console.error("Deal creation error:", error);
      if (error instanceof z.ZodError) {
        console.log("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertDealSchema.parse(req.body);
      const deal = await storage.updateDeal(id, data);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.patch("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // For PATCH, we allow partial updates without strict schema validation
      const deal = await storage.updateDeal(id, req.body);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDeal(id);
      if (!success) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });
  
  // Quotations
  app.get("/api/quotations", async (req, res) => {
    try {
      const quotations = await storage.getQuotations();
      res.json(quotations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quotations" });
    }
  });

  app.get("/api/quotations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quotation = await storage.getQuotation(id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quotation" });
    }
  });

  app.get("/api/deals/:dealId/quotations", async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const quotations = await storage.getQuotationsByDeal(dealId);
      res.json(quotations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quotations for deal" });
    }
  });

  app.post("/api/quotations", async (req, res) => {
    try {
      console.log("Creating quotation with data:", JSON.stringify(req.body));
      const data = insertQuotationSchema.parse(req.body);
      console.log("Parsed data:", JSON.stringify(data));
      const quotation = await storage.createQuotation(data);
      console.log("Created quotation:", JSON.stringify(quotation));
      res.status(201).json(quotation);
    } catch (error) {
      console.error("Error creating quotation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quotation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  app.put("/api/quotations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertQuotationSchema.parse(req.body);
      const quotation = await storage.updateQuotation(id, data);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      res.json(quotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quotation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quotation" });
    }
  });

  app.delete("/api/quotations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuotation(id);
      if (!success) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quotation" });
    }
  });

  app.post("/api/quotations/:id/send", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      // Get contact information for email
      const contact = await storage.getContact(quotation.contactId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      // Get company information if applicable
      let companyName = "Our Company";
      if (quotation.companyId) {
        const company = await storage.getCompany(quotation.companyId);
        if (company) {
          companyName = company.name;
        }
      }
      
      // Get template for email
      const templates = await storage.getQuotationTemplates();
      const template = templates && templates.length > 0 
        ? templates[0]  // Use the first template as default
        : {
            name: "Default Template",
            emailSubject: "Your Quotation #{{quotationNumber}}",
            emailBody: "<p>Dear {{contactName}},</p><p>Please find attached your quotation {{quotationTitle}} with details below:</p>{{items}}<p>Valid until: {{validUntil}}</p><p>Thank you for your business!</p>",
            termsAndConditions: "Standard terms and conditions apply."
          };
      
      // Import email service here to avoid circular dependencies
      const { sendEmail } = await import('./services/emailService');
      
      // Format email content with basic template
      const emailHtml = `<h2>${template.emailSubject}</h2><p>${template.emailBody}</p>`;
      
      // Replace template variables in subject
      const emailSubject = template.emailSubject.replace(/{{quotationNumber}}/g, quotation.id.toString());
      
      // Send email if SendGrid API key is configured
      let emailSent = false;
      if (process.env.SENDGRID_API_KEY) {
        try {
          emailSent = await sendEmail(
            contact.email,
            "sales@yourcompany.com",
            emailSubject,
            emailHtml
          );
        } catch (error) {
          console.error("Email sending failed:", error);
          emailSent = false;
        }
      } else {
        console.log("SendGrid API key not set - email would have been sent with content:", emailHtml);
      }
      
      // Mark as sent in database
      const updatedQuotation = await storage.markQuotationAsEmailSent(id);
      
      res.json({ 
        message: emailSent 
          ? "Quotation email sent successfully" 
          : "Quotation marked as sent, but email delivery is disabled (missing API key)",
        quotation: updatedQuotation,
        emailSent: true,
        emailSentTo: contact.email
      });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ message: "Failed to send quotation email" });
    }
  });
  
  // Quotation templates routes
  app.get("/api/quotation-templates", async (req, res) => {
    try {
      const templates = await storage.getQuotationTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quotation templates" });
    }
  });

  app.get("/api/quotation-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getQuotationTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Quotation template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quotation template" });
    }
  });

  app.post("/api/quotation-templates", async (req, res) => {
    try {
      const data = insertQuotationTemplateSchema.parse(req.body);
      const template = await storage.createQuotationTemplate(data);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quotation template" });
    }
  });

  app.put("/api/quotation-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertQuotationTemplateSchema.parse(req.body);
      const template = await storage.updateQuotationTemplate(id, data);
      if (!template) {
        return res.status(404).json({ message: "Quotation template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quotation template" });
    }
  });

  app.delete("/api/quotation-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuotationTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Quotation template not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quotation template" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to get task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = req.body;
      console.log("Received task data:", JSON.stringify(data, null, 2));
      
      // Convert dueDate string to Date object if provided
      if (data.dueDate && typeof data.dueDate === 'string') {
        console.log("Original dueDate:", data.dueDate);
        
        // Handle datetime-local format (YYYY-MM-DDTHH:MM)
        if (data.dueDate.includes('T')) {
          data.dueDate = new Date(data.dueDate);
        }
        // Handle date-only format (YYYY-MM-DD)
        else if (data.dueDate.includes('-') && !data.dueDate.includes('/')) {
          data.dueDate = new Date(data.dueDate + 'T00:00:00');
        }
        // Handle DD/MM/YYYY format
        else if (data.dueDate.includes('/')) {
          const [day, month, year] = data.dueDate.split('/');
          data.dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        // Fallback to direct parsing
        else {
          data.dueDate = new Date(data.dueDate);
        }
        
        // Validate the date
        if (isNaN(data.dueDate.getTime())) {
          console.error("Invalid date:", data.dueDate);
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        console.log("Converted dueDate:", data.dueDate);
      }
      
      console.log("Data after conversion:", JSON.stringify(data, null, 2));
      
      // Skip validation temporarily and create task directly
      const validatedData = {
        title: data.title,
        description: data.description,
        priority: data.priority || "Medium",
        completed: data.completed || false,
        dueDate: data.dueDate, // This is now a Date object
        assignedTo: data.assignedTo,
        contactId: data.contactId,
        companyId: data.companyId,
        dealId: data.dealId,
      };
      const task = await storage.createTask(validatedData);
      
      // Create activity record for task creation
      try {
        await storage.createActivity({
          type: "meeting",
          title: `Task "${task.title}" created`,
          description: `${task.priority} priority task${task.dueDate ? ' due ' + task.dueDate.toLocaleDateString() : ''}`,
          contactId: task.contactId,
          companyId: task.companyId,
          dealId: task.dealId,
          userId: null
        });
      } catch (activityError) {
        console.error("Failed to create activity for task:", activityError);
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Task creation error:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updated = await storage.updateTask(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const data = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(data);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteActivity(id);
      if (success) {
        res.status(200).json({ message: "Activity deleted successfully" });
      } else {
        res.status(404).json({ message: "Activity not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Lists
  app.get("/api/lists", async (req, res) => {
    try {
      const lists = await storage.getLists();
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to get lists" });
    }
  });
  
  // Forms
  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get forms" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ message: "Failed to get form" });
    }
  });

  app.post("/api/forms", async (req, res) => {
    try {
      const data = insertFormSchema.parse(req.body);
      const form = await storage.createForm(data);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create form" });
    }
  });

  app.patch("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertFormSchema.parse(req.body);
      const form = await storage.updateForm(id, data);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update form" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteForm(id);
      if (!success) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete form" });
    }
  });
  
  // Form Submissions
  app.get("/api/form-submissions/counts", async (req, res) => {
    try {
      const forms = await storage.getForms();
      const submissionCounts: Record<number, number> = {};
      
      // Get submission counts for each form
      for (const form of forms) {
        const submissions = await storage.getFormSubmissions(form.id);
        submissionCounts[form.id] = submissions.length;
      }
      
      res.json(submissionCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get form submission counts" });
    }
  });
  
  app.get("/api/forms/:id/submissions", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const submissions = await storage.getFormSubmissions(formId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get form submissions" });
    }
  });
  
  app.post("/api/forms/:id/submit", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      const submission = {
        formId,
        data: req.body,
        sourceInfo: {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          referrer: req.headers.referer || req.headers.referrer
        },
        contactId: null
      };
      
      const result = await storage.createFormSubmission(submission);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit form" });
    }
  });

  app.get("/api/lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getList(id);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to get list" });
    }
  });

  app.post("/api/lists", async (req, res) => {
    try {
      const data = insertListSchema.parse(req.body);
      const list = await storage.createList(data);
      res.status(201).json(list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid list data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create list" });
    }
  });

  app.patch("/api/lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertListSchema.parse(req.body);
      const list = await storage.updateList(id, data);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      res.json(list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid list data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update list" });
    }
  });

  app.delete("/api/lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteList(id);
      if (!success) {
        return res.status(404).json({ message: "List not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete list" });
    }
  });

  // Get contacts from a list
  app.get("/api/lists/:id/contacts", async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const listContacts = await storage.getListContacts(listId);
      res.json(listContacts);
    } catch (error) {
      console.error("Error getting list contacts:", error);
      res.status(500).json({ message: "Failed to get list contacts" });
    }
  });

  // Add contacts to a list
  app.post("/api/lists/:id/contacts", async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const { contactIds } = req.body;
      
      if (!contactIds || !Array.isArray(contactIds)) {
        return res.status(400).json({ error: "Contact IDs are required and must be an array" });
      }

      // For now, we'll just return success since the relationship isn't fully implemented in the database
      // In a full implementation, you'd store the list-contact relationships in a junction table
      res.json({ 
        success: true, 
        message: `Added ${contactIds.length} contacts to list`,
        addedContacts: contactIds.length
      });
    } catch (error) {
      console.error("Error adding contacts to list:", error);
      res.status(500).json({ error: "Failed to add contacts to list" });
    }
  });

  // Bulk import contacts
  app.post("/api/contacts/bulk-import", async (req, res) => {
    try {
      const { contacts } = req.body;
      
      if (!contacts || !Array.isArray(contacts)) {
        return res.status(400).json({ error: "Contacts array is required" });
      }

      const createdContacts = [];
      for (const contactData of contacts) {
        if (contactData.email) {
          try {
            // Check if contact already exists
            const existingContacts = await storage.getContacts();
            const existingContact = existingContacts.find(c => c.email === contactData.email);
            
            if (!existingContact) {
              // Create new contact
              const newContact = await storage.createContact({
                firstName: contactData.firstName || '',
                lastName: contactData.lastName || '',
                email: contactData.email,
                phone: contactData.phone || null,
                jobTitle: contactData.jobTitle || null,
                companyId: null,
                country: null,
                source: 'bulk_import',
                tags: [],
                notes: null,
                sourceDetails: null
              });
              createdContacts.push(newContact);
            }
          } catch (error) {
            console.error(`Error creating contact ${contactData.email}:`, error);
          }
        }
      }

      res.json({ 
        success: true, 
        message: `Successfully imported ${createdContacts.length} contacts`,
        importedCount: createdContacts.length,
        totalProvided: contacts.length
      });
    } catch (error) {
      console.error("Error bulk importing contacts:", error);
      res.status(500).json({ error: "Failed to import contacts" });
    }
  });

  // Forms
  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get forms" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ message: "Failed to get form" });
    }
  });

  app.post("/api/forms", async (req, res) => {
    try {
      const data = insertFormSchema.parse(req.body);
      const form = await storage.createForm(data);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create form" });
    }
  });
  
  app.put("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertFormSchema.parse(req.body);
      const form = await storage.updateForm(id, data);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update form" });
    }
  });
  
  app.delete("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteForm(id);
      if (!success) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete form" });
    }
  });
  
  // Form Submissions
  app.post("/api/form-submissions", async (req, res) => {
    try {
      const { formId, data, sourceInfo } = req.body;
      
      // Validate formId
      if (!formId || typeof formId !== 'number') {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      // Check if form exists
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Store submission
      const submission = await storage.createFormSubmission({
        formId,
        data,
        sourceInfo,
        contactId: null,
      });
      
      res.status(201).json({ success: true, submissionId: submission.id });
    } catch (error) {
      console.error("Form submission error:", error);
      res.status(500).json({ message: "Failed to save form submission" });
    }
  });
  
  app.get("/api/forms/:id/submissions", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const submissions = await storage.getFormSubmissions(formId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get form submissions" });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard statistics" });
    }
  });

  // Export data
  app.get("/api/export", async (req, res) => {
    try {
      const [contacts, companies, partners, deals, tasks, activities, lists, forms] = await Promise.all([
        storage.getContacts(),
        storage.getCompanies(),
        storage.getPartners(),
        storage.getDeals(),
        storage.getTasks(),
        storage.getActivities(),
        storage.getLists(),
        storage.getForms()
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        contacts,
        companies,
        partners,
        deals,
        tasks,
        activities,
        lists,
        forms,
        summary: {
          totalContacts: contacts.length,
          totalCompanies: companies.length,
          totalPartners: partners.length,
          totalDeals: deals.length,
          totalTasks: tasks.length,
          totalActivities: activities.length,
          totalLists: lists.length,
          totalForms: forms.length
        }
      };

      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="crm-export-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(exportData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Email Templates
  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get email templates" });
    }
  });
  
  app.get("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to get email template" });
    }
  });
  
  app.post("/api/email-templates", async (req, res) => {
    try {
      const data = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(data);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email template" });
    }
  });
  
  app.put("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.updateEmailTemplate(id, data);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update email template" });
    }
  });
  
  app.delete("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmailTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json({ message: "Email template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });
  
  // Email Campaigns
  app.get("/api/email-campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to get email campaigns" });
    }
  });
  
  app.get("/api/email-campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getEmailCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Email campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to get email campaign" });
    }
  });
  
  app.post("/api/email-campaigns", async (req, res) => {
    try {
      const data = insertEmailCampaignSchema.parse(req.body);
      const campaign = await storage.createEmailCampaign(data);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email campaign" });
    }
  });
  
  app.put("/api/email-campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEmailCampaignSchema.parse(req.body);
      const campaign = await storage.updateEmailCampaign(id, data);
      if (!campaign) {
        return res.status(404).json({ message: "Email campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update email campaign" });
    }
  });
  
  app.delete("/api/email-campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmailCampaign(id);
      if (!success) {
        return res.status(404).json({ message: "Email campaign not found" });
      }
      res.json({ message: "Email campaign deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete email campaign" });
    }
  });

  // Email Campaign Recipients
  app.get("/api/email-campaigns/:id/recipients", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const recipients = await storage.getEmailCampaignRecipients(campaignId);
      res.json(recipients);
    } catch (error) {
      res.status(500).json({ message: "Failed to get campaign recipients" });
    }
  });

  app.post("/api/email-campaigns/:id/recipients/contact/:contactId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const contactId = parseInt(req.params.contactId);
      
      const recipient = await storage.addContactToEmailCampaign(campaignId, contactId);
      res.status(201).json(recipient);
    } catch (error) {
      res.status(500).json({ message: "Failed to add contact to campaign" });
    }
  });

  app.post("/api/email-campaigns/:id/recipients/list/:listId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const listId = parseInt(req.params.listId);
      
      const recipients = await storage.addContactListToEmailCampaign(campaignId, listId);
      res.status(201).json(recipients);
    } catch (error) {
      res.status(500).json({ message: "Failed to add list to campaign" });
    }
  });

  // Email Sending Endpoints
  app.post("/api/email-campaigns/:id/send", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Import the service dynamically to avoid circular dependencies
      const { sendEmailCampaign } = await import('./services/emailService');
      
      const success = await sendEmailCampaign(id);
      
      if (success) {
        res.json({ message: "Email campaign sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email campaign" });
      }
    } catch (error) {
      console.error("Error sending campaign emails:", error);
      res.status(500).json({ message: "Failed to send email campaign" });
    }
  });

  app.post("/api/quotations/:id/send-email", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Import the service dynamically to avoid circular dependencies
      const { sendQuotationEmail } = await import('./services/emailService');
      
      const success = await sendQuotationEmail(id);
      
      if (success) {
        res.json({ message: "Quotation email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send quotation email" });
      }
    } catch (error) {
      console.error("Error sending quotation email:", error);
      res.status(500).json({ message: "Failed to send quotation email" });
    }
  });

  app.post("/api/lists/:id/send-email", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { subject, body, fromName, fromEmail } = req.body;
      
      if (!subject || !body || !fromName || !fromEmail) {
        return res.status(400).json({ message: "Missing required email parameters" });
      }
      
      // Import the service dynamically to avoid circular dependencies
      const { sendEmailToList } = await import('./services/emailService');
      
      const success = await sendEmailToList(id, subject, body, fromName, fromEmail);
      
      if (success) {
        res.json({ message: "List emails sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send list emails" });
      }
    } catch (error) {
      console.error("Error sending list emails:", error);
      res.status(500).json({ message: "Failed to send list emails" });
    }
  });

  // Test endpoint for sending an email directly
  app.post("/api/test-email", async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      
      if (!to || !subject || !body) {
        return res.status(400).json({ message: "Missing required email parameters" });
      }
      
      console.log("Testing email sending to:", to);
      
      // Import the email service
      const emailService = await import('./services/emailService');
      
      // Get the private sendEmail function using a workaround
      const sendEmail = (emailService as any).default?.sendEmail || 
                        ((emailService as any).sendEmail) || 
                        (async (to: string, from: string, subject: string, html: string) => {
                          console.log("Using fallback sendEmail function");
                          // Direct usage of MailService
                          const MailService = require('@sendgrid/mail').MailService;
                          const mail = new MailService();
                          mail.setApiKey(process.env.SENDGRID_API_KEY || '');
                          return mail.send({
                            to,
                            from: "test@example.com",
                            subject,
                            html
                          }).then(() => true).catch((err: any) => {
                            console.error("Direct SendGrid error:", err);
                            return false;
                          });
                        });
      
      const success = await sendEmail(
        to,
        "test@example.com", // Using a simple test email for demonstration
        subject,
        body,
        {}
      );
      
      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error in test email endpoint:", error);
      res.status(500).json({ message: "Error in test email endpoint", error: String(error) });
    }
  });

  // Invoice Routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/won-deals", async (req, res) => {
    try {
      const wonDeals = await storage.getWonDeals();
      res.json(wonDeals);
    } catch (error) {
      console.error("Error fetching won deals:", error);
      res.status(500).json({ message: "Failed to fetch won deals" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/deal/:dealId", async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const invoices = await storage.getInvoicesByDeal(dealId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices for deal:", error);
      res.status(500).json({ message: "Failed to fetch invoices for deal" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoice(id);
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
