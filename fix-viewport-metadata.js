const fs = require('fs');
const path = require('path');

// List of directories to check for metadata.js or page.js files
const directories = [
  'src/app',
  'src/app/about',
  'src/app/shop',
  'src/app/login',
  'src/app/checkout',
  'src/app/admin',
  'src/app/_not-found'
];

console.log('Fixing viewport metadata in Next.js app...');

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  // Check for metadata.js file
  const metadataPath = path.join(dir, 'metadata.js');
  if (fs.existsSync(metadataPath)) {
    let content = fs.readFileSync(metadataPath, 'utf8');
    
    // Check if content has viewport in metadata
    if (content.includes('viewport') && !content.includes('export const viewport')) {
      // Extract viewport from metadata
      const viewportMatch = content.match(/viewport:\s*{([^}]*)}/);
      if (viewportMatch) {
        const viewportContent = viewportMatch[1];
        
        // Remove viewport from metadata
        content = content.replace(/viewport:\s*{([^}]*)},?/, '');
        
        // Add viewport export
        content += `\n\nexport const viewport = {${viewportContent}};\n`;
        
        // Write updated content
        fs.writeFileSync(metadataPath, content);
        console.log(`Updated viewport in ${metadataPath}`);
      }
    }
  }
  
  // Check for page.js/tsx file with metadata export
  ['page.js', 'page.tsx'].forEach(pageFile => {
    const pagePath = path.join(dir, pageFile);
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Check if content has metadata export with viewport
      if (content.includes('export const metadata') && 
          content.includes('viewport') && 
          !content.includes('export const viewport')) {
        
        // Extract viewport from metadata
        const viewportMatch = content.match(/viewport:\s*{([^}]*)}/);
        if (viewportMatch) {
          const viewportContent = viewportMatch[1];
          
          // Remove viewport from metadata
          content = content.replace(/viewport:\s*{([^}]*)},?/, '');
          
          // Add viewport export after metadata export
          const metadataEndIndex = content.indexOf('export const metadata') + 
                                  content.substring(content.indexOf('export const metadata')).indexOf('};') + 2;
          
          const beforeMetadata = content.substring(0, metadataEndIndex);
          const afterMetadata = content.substring(metadataEndIndex);
          
          content = beforeMetadata + '\n\nexport const viewport = {' + viewportContent + '};' + afterMetadata;
          
          // Write updated content
          fs.writeFileSync(pagePath, content);
          console.log(`Updated viewport in ${pagePath}`);
        }
      }
    }
  });
});

console.log('Viewport metadata fixes completed!');