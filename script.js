
// Bulk import script using Supabase JavaScript client
// Run this in Node.js or modify for browser use

import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
NEXT_PUBLIC_SUPABASE_URL='https://xwbpgwkjskxshczllawv.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3YnBnd2tqc2t4c2hjemxsYXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTc1NzcsImV4cCI6MjA2NjY5MzU3N30.WtiVEd8QbeQYIVurzNfjtK-O55xrEqxd76hx38g4TWE'

// Replace with your actual Supabase URL and anon key
const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function bulkImportToSupabase() {
    try {
        // Read and parse the CSV
        const csvContent = await window.fs.readFile('export2_fixed.csv', { encoding: 'utf8' });
        const parsed = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true // Convert strings to appropriate types
        });
        
        console.log(`Preparing to import ${parsed.data.length} rows...`);
        
        // Process data to handle null values properly
        const processedData = parsed.data.map(row => {
            const cleanRow = {};
            for (const [key, value] of Object.entries(row)) {
                // Convert empty strings back to null for proper database insertion
                cleanRow[key] = value === '' ? null : value;
            }
            
            // Remove the auto-generated id column if it exists in CSV
            // since it's handled by the database
            delete cleanRow.id;
            
            return cleanRow;
        });
        
        // Insert in batches to avoid request size limits
        const batchSize = 100;
        const totalBatches = Math.ceil(processedData.length / batchSize);
        
        for (let i = 0; i < totalBatches; i++) {
            const startIndex = i * batchSize;
            const endIndex = Math.min(startIndex + batchSize, processedData.length);
            const batch = processedData.slice(startIndex, endIndex);
            
            console.log(`Inserting batch ${i + 1}/${totalBatches} (rows ${startIndex + 1}-${endIndex})...`);
            
            const { data, error } = await supabase
                .from('synchrodata')
                .insert(batch);
            
            if (error) {
                console.error(`Error in batch ${i + 1}:`, error);
                return;
            }
            
            console.log(`✅ Batch ${i + 1} completed successfully`);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('🎉 All data imported successfully!');
        
    } catch (error) {
        console.error('Import failed:', error);
    }
}

// Usage instructions:
console.log(`
USAGE INSTRUCTIONS:
1. Install Supabase client: npm install @supabase/supabase-js
2. Replace 'your-supabase-url' and 'your-supabase-anon-key' with your actual values
3. Run this script in Node.js environment
4. Make sure your CSV file is accessible via the file path
`);

// Uncomment to run:
// bulkImportToSupabase();