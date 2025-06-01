import { readFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

async function readExcelFile() {
  try {
    // Read the Excel file as buffer
    const buffer = await readFileAsync('./attached_assets/deals-export-2025-05-30 (1).xlsx');
    
    // Import XLSX dynamically
    const XLSX = await import('xlsx');
    
    // Parse the workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel file contents:');
    console.log(JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

readExcelFile();