const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback IDs in case of database error
const fallbackIds = [
  '1', '2', '3', '4', '5', '40e1f01f-c321-45b5-8e36-638c6f7e34f9'
];

// Create product pages
async function createProductPages() {
  console.log('Creating static product pages...');
  
  try {
    // Fetch all products from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('id, name');
      
    if (error) {
      console.error('Error fetching products:', error);
      console.log('Using fallback product IDs...');
      
      // Use fallback IDs
      const fallbackData = fallbackIds.map(id => ({ id, name: `Product ${id}` }));
      createPages(fallbackData);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No products found, using fallback IDs...');
      const fallbackData = fallbackIds.map(id => ({ id, name: `Product ${id}` }));
      createPages(fallbackData);
      return;
    }
    
    createPages(data);
  } catch (err) {
    console.error('Error creating static product pages:', err);
    
    // Use fallback IDs
    console.log('Using fallback product IDs...');
    const fallbackData = fallbackIds.map(id => ({ id, name: `Product ${id}` }));
    createPages(fallbackData);
  }
}

function createPages(products) {
  // Base HTML template
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product PRODUCT_NAME</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">PRODUCT_NAME</h1>
    <p class="mb-4">This is a static product page for product PRODUCT_ID.</p>
    <a href="/shop" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Back to Shop
    </a>
  </div>
</body>
</html>`;

  // Create directory structure
  const baseDir = path.join('out', 'shop', 'product');
  fs.mkdirSync(baseDir, { recursive: true });
  
  // Create a page for each product ID
  products.forEach(product => {
    const id = String(product.id);
    const name = product.name || `Product ${id}`;
    const productDir = path.join(baseDir, id);
    fs.mkdirSync(productDir, { recursive: true });
    
    const htmlContent = template
      .replace(/PRODUCT_ID/g, id)
      .replace(/PRODUCT_NAME/g, name);
    fs.writeFileSync(path.join(productDir, 'index.html'), htmlContent);
    
    console.log(`  Created page for product ${id} (${name})`);
  });
  
  console.log('Static product pages created successfully!');
}

// Run the function
createProductPages();
