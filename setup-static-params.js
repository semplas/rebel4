const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create generateStaticParams for product pages
console.log('Setting up generateStaticParams for dynamic routes...');

// Product page static params
const productStaticParamsContent = `
// This file is auto-generated to provide static params for Next.js static site generation
import { createClient } from '@supabase/supabase-js';

export async function generateStaticParams() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Fetch all product IDs from the database
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      // Fallback to some default IDs in case of error
      return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '40e1f01f-c321-45b5-8e36-638c6f7e34f9' }
      ];
    }
    
    // Map products to the format expected by generateStaticParams
    return products.map(product => ({
      id: product.id.toString()
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    // Fallback to some default IDs in case of error
    return [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '40e1f01f-c321-45b5-8e36-638c6f7e34f9' }
    ];
  }
}
`;

// Define all dynamic routes that need static params
const dynamicRoutes = [
  {
    path: path.join('src', 'app', 'shop', 'product', '[id]'),
    content: productStaticParamsContent
  }
  // Add other dynamic routes here as needed
];

// Process each dynamic route
dynamicRoutes.forEach(route => {
  if (fs.existsSync(route.path)) {
    // Write the generateStaticParams.js file
    fs.writeFileSync(
      path.join(route.path, 'generateStaticParams.js'),
      route.content
    );
    
    // Update the page.tsx file to export generateStaticParams
    const pagePath = path.join(route.path, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let pageContent = fs.readFileSync(pagePath, 'utf8');
      
      // Check if generateStaticParams is already imported
      if (!pageContent.includes('import { generateStaticParams }')) {
        // Add import statement
        pageContent = `import { generateStaticParams } from './generateStaticParams';\n${pageContent}`;
        
        // Export generateStaticParams
        if (!pageContent.includes('export { generateStaticParams }')) {
          // Find the last export statement
          const lastExportIndex = pageContent.lastIndexOf('export');
          if (lastExportIndex !== -1) {
            // Insert after the last export
            const parts = [
              pageContent.slice(0, lastExportIndex),
              pageContent.slice(lastExportIndex)
            ];
            pageContent = parts[0] + 'export { generateStaticParams };\n\n' + parts[1];
          } else {
            // Add at the end of the file
            pageContent += '\n\nexport { generateStaticParams };\n';
          }
        }
        
        // Write the updated content back
        fs.writeFileSync(pagePath, pageContent);
        console.log(`Updated ${pagePath} with generateStaticParams`);
      } else {
        console.log(`${pagePath} already has generateStaticParams`);
      }
    } else {
      console.error(`Page file not found: ${pagePath}`);
    }
  } else {
    console.error(`Dynamic route directory not found: ${route.path}`);
  }
});

console.log('Successfully set up generateStaticParams for dynamic routes');
