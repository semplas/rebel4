const fs = require('fs');
const path = require('path');

// Create product pages
function createProductPages() {
  console.log('Creating static product pages...');
  
  // Product IDs to generate
  const productIds = [1, 2, 3, 4, 5];
  
  // Base HTML template
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product PRODUCT_ID</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Product PRODUCT_ID</h1>
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
  productIds.forEach(id => {
    const productDir = path.join(baseDir, id.toString());
    fs.mkdirSync(productDir, { recursive: true });
    
    const htmlContent = template.replace(/PRODUCT_ID/g, id.toString());
    fs.writeFileSync(path.join(productDir, 'index.html'), htmlContent);
    
    console.log(`  Created page for product ${id}`);
  });
  
  console.log('Static product pages created successfully!');
}

// Run the function
createProductPages();