const fs = require('fs');
const path = require('path');
const glob = require('glob');

// The template to apply
const template = `'use client';

import { Suspense } from 'react';
IMPORTS

// Component that uses useSearchParams and other client hooks
function PAGE_NAMEContent() {
  // Original component code
  COMPONENT_CODE
}

// Main page component with Suspense
export default function PAGE_NAME() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PAGE_NAMEContent />
    </Suspense>
  );
}
`;

// Find all page files
const pageFiles = glob.sync('src/app/**/page.tsx');

pageFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already processed
  if (content.includes('Suspense fallback={<div>Loading...</div>}')) {
    console.log(`  Already processed, skipping.`);
    return;
  }
  
  // Extract the page name from the file path
  const pageName = path.basename(path.dirname(filePath));
  const pageNameCapitalized = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  
  // Extract imports
  const importRegex = /import .+?;/gs;
  const imports = content.match(importRegex) || [];
  
  // Extract component code (everything after imports)
  let componentCode = content;
  imports.forEach(imp => {
    componentCode = componentCode.replace(imp, '');
  });
  
  // Remove 'use client' directive if present
  componentCode = componentCode.replace(/'use client';?\s*/g, '');
  
  // Remove export default function declaration
  componentCode = componentCode.replace(/export default function .+?\(\) {/g, '');
  
  // Apply the template
  let newContent = template
    .replace(/PAGE_NAME/g, pageNameCapitalized + 'Page')
    .replace('IMPORTS', imports.join('\n'))
    .replace('COMPONENT_CODE', componentCode);
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, newContent);
  
  console.log(`  Updated successfully.`);
});

console.log('All pages processed!');
