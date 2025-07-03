# Database Seeding Guide

This guide explains how to seed your local `potential_crm` database with sample data.

## Prerequisites

1. Make sure your local PostgreSQL database is running
2. Ensure your `.env` file has the correct `DATABASE_URL` pointing to your local database
3. The database schema should be created (run `npm run db:push` if needed)

## Running the Seed Script

To populate your database with sample data, run:

```bash
npm run db:seed
```

## What Gets Seeded

The seed script creates the following sample data:

### Users (3)
- **Admin User**: admin@potentialcrm.com / password123
- **Sales Manager**: sales@potentialcrm.com / password123  
- **Marketing Coordinator**: marketing@potentialcrm.com / password123

### Partners (2)
- Tech Solutions Inc. (Technology Reseller)
- Digital Marketing Pro (Marketing Strategic Partner)

### Companies (4)
- Acme Corporation (Enterprise Manufacturing)
- StartupXYZ (SaaS Startup)
- Global Retail Chain (Large Retail)
- Local Consulting Group (Medium Consulting)

### Contacts (6)
- Various contacts linked to companies and partners
- Different lead types (Customer, Partner)
- Various lead statuses and importance levels

### Deals (4)
- Enterprise deals with different stages
- Various deal values and subscription types
- Linked to contacts and companies

### Tasks (5)
- Follow-up tasks for deals
- Marketing campaign tasks
- Different priorities and due dates

### Activities (4)
- Calls, emails, meetings, and notes
- Linked to contacts, companies, and deals

### Lists (3)
- Enterprise Prospects (dynamic list)
- Partner Referrals (dynamic list)
- Q1 Marketing Campaign (static list)

### Email Templates & Campaigns
- Welcome email template
- Follow-up email template
- Q1 Enterprise Outreach campaign

### Social Media
- LinkedIn account
- Sample social posts
- Social media campaign

### Forms & Quotations
- Contact form with fields
- Quotation template
- Sample quotation

### Invoices
- Sample invoice for enterprise deal

## Default Login Credentials

After seeding, you can log in with any of these accounts:

- **Email**: admin@potentialcrm.com
- **Password**: password123

- **Email**: sales@potentialcrm.com  
- **Password**: password123

- **Email**: marketing@potentialcrm.com
- **Password**: password123

## Customizing the Seed Data

To modify the sample data:

1. Edit the `server/seed.ts` file
2. Modify the data arrays in the `db.insert()` calls
3. Run `npm run db:seed` again

**Note**: The seed script clears existing data before inserting new data. If you want to keep existing data, comment out the `db.delete()` calls at the beginning of the script.

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running on the specified port
- Check that the database `potential_crm` exists

### Schema Issues
- Run `npm run db:push` to ensure the database schema is up to date
- Check that all required tables exist

### Permission Issues
- Ensure your database user has INSERT, UPDATE, DELETE permissions
- Check that the database exists and is accessible

## Resetting the Database

To completely reset your database:

1. Drop and recreate the database:
   ```sql
   DROP DATABASE potential_crm;
   CREATE DATABASE potential_crm;
   ```

2. Push the schema:
   ```bash
   npm run db:push
   ```

3. Seed the data:
   ```bash
   npm run db:seed
   ``` 