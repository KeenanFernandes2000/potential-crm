import XLSX from 'xlsx';
import { db } from './server/database.js';
import { deals, contacts, companies, partners } from './shared/schema.js';

async function importDeals() {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./attached_assets/deals-export-2025-05-30 (1).xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Found', data.length, 'deals to import:');
    console.log(JSON.stringify(data, null, 2));
    
    // Import each deal
    for (const row of data) {
      const dealData = {
        title: row['Deal Name'] || row.title || 'Untitled Deal',
        value: parseFloat(String(row['Value'] || row.value || '0').replace(/[^\d.-]/g, '')) || null,
        currency: row['Currency'] || row.currency || 'USD',
        stage: row['Stage'] || row.stage || 'Inquiry',
        notes: row['Notes'] || row.notes || null,
        startDate: row['Start Date'] ? new Date(row['Start Date']) : null,
        expiryDate: row['Expiry Date'] ? new Date(row['Expiry Date']) : null,
        subscriptionType: row['Subscription Type'] || row.subscriptionType || null,
        contactId: null, // We'll need to match these manually
        companyId: null, // We'll need to match these manually
        partnerId: null  // We'll need to match these manually
      };
      
      console.log('Importing deal:', dealData);
      
      const [newDeal] = await db.insert(deals).values(dealData).returning();
      console.log('Created deal with ID:', newDeal.id);
    }
    
    console.log('Deal import completed successfully!');
    
  } catch (error) {
    console.error('Error importing deals:', error);
  } finally {
    process.exit(0);
  }
}

importDeals();