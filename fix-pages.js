const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all page files
const pageFiles = glob.sync('src/app/**/page.tsx');

pageFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the page name from the file path
  const dirName = path.basename(path.dirname(filePath));
  
  // Handle dynamic route parameters (e.g., [id])
  let pageName;
  if (dirName.startsWith('[') && dirName.endsWith(']')) {
    // For dynamic routes like [id], use "Item" or the parameter name without brackets
    const paramName = dirName.slice(1, -1); // Remove [ and ]
    pageName = paramName.charAt(0).toUpperCase() + paramName.slice(1);
  } else {
    pageName = dirName.charAt(0).toUpperCase() + dirName.slice(1);
  }
  
  // Create a new client component
  const newContent = `'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function ${pageName}PageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>${pageName} Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function ${pageName}Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <${pageName}PageContent />
    </Suspense>
  );
}
`;
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, newContent);
  
  console.log(`  Updated with basic client component template.`);
});

console.log('All pages processed!');
