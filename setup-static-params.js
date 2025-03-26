const fs = require('fs');
const path = require('path');

// Define the content for generateStaticParams.js
const staticParamsContent = `
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateStaticParams() {
  // Hardcoded IDs to ensure we always have something
  const fallbackIds = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '40e1f01f-c321-45b5-8e36-638c6f7e34f9' }
  ];
  
  try {
    // Fetch all product IDs from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('id');
      
    if (error) {
      console.error('Error fetching product IDs:', error);
      return fallbackIds;
    }
    
    // Map the data to the expected format
    const params = data.map(product => ({
      id: String(product.id)
    }));
    
    return params.length > 0 ? params : fallbackIds;
  } catch (err) {
    console.error('Failed to generate static params:', err);
    return fallbackIds;
  }
}
`;

// Path to the product page directory
const productPageDir = path.join('src', 'app', 'shop', 'product', '[id]');

// Ensure the directory exists
if (fs.existsSync(productPageDir)) {
  // Write the generateStaticParams.js file
  fs.writeFileSync(
    path.join(productPageDir, 'generateStaticParams.js'),
    staticParamsContent
  );
  
  // Update the page.tsx file to export generateStaticParams
  const pagePath = path.join(productPageDir, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check if generateStaticParams is already imported
    if (!pageContent.includes('import { generateStaticParams }')) {
      // Add import statement
      pageContent = `import { generateStaticParams } from './generateStaticParams';\n${pageContent}`;
    }
    
    // Check if generateStaticParams is already exported
    if (!pageContent.includes('export { generateStaticParams }')) {
      // Add export statement after imports
      const importEndIndex = pageContent.lastIndexOf('import');
      const importEndLineIndex = pageContent.indexOf('\n', importEndIndex);
      
      if (importEndLineIndex !== -1) {
        pageContent = 
          pageContent.substring(0, importEndLineIndex + 1) + 
          '\n// Export generateStaticParams for static site generation\nexport { generateStaticParams };\n' + 
          pageContent.substring(importEndLineIndex + 1);
      } else {
        // If we can't find the end of imports, just add it at the beginning
        pageContent = `// Export generateStaticParams for static site generation\nexport { generateStaticParams };\n${pageContent}`;
      }
    }
    
    // Write the updated content back
    fs.writeFileSync(pagePath, pageContent);
  }
  
  console.log('Successfully set up generateStaticParams for product pages');
} else {
  console.error('Product page directory not found:', productPageDir);
}