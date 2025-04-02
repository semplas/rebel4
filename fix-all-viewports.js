const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Finding all files with metadata exports...');

// Find all files that might contain metadata exports
const files = glob.sync('src/app/**/*.{js,jsx,ts,tsx}');

let fixedCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if file contains metadata with viewport
  if (content.includes('export const metadata') && 
      content.includes('viewport:') && 
      !content.includes('export const viewport')) {
    
    console.log(`Fixing viewport in ${file}`);
    
    // Extract viewport properties
    const viewportMatch = content.match(/viewport:\s*{([^}]*)}/);
    if (!viewportMatch) return;
    
    const viewportContent = viewportMatch[1].trim();
    
    // Create new content with separate viewport export
    let newContent = content.replace(/viewport:\s*{[^}]*},?/g, '');
    
    // Add viewport export after metadata
    if (!newContent.includes('export const viewport')) {
      const viewportExport = `\nexport const viewport = {\n  ${viewportContent}\n};\n`;
      
      // Find where to insert the viewport export (after metadata)
      const metadataEndMatch = newContent.match(/export const metadata[^;]*};/);
      if (metadataEndMatch) {
        const insertPosition = newContent.indexOf(metadataEndMatch[0]) + metadataEndMatch[0].length;
        newContent = newContent.slice(0, insertPosition) + viewportExport + newContent.slice(insertPosition);
      } else {
        // If we can't find the end of metadata, just append to the end
        newContent += viewportExport;
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(file, newContent);
    fixedCount++;
  }
});

console.log(`✅ Fixed viewport metadata in ${fixedCount} files.`);