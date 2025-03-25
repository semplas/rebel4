const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all page files
const pageFiles = glob.sync('src/app/**/page.tsx');

pageFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already processed (doesn't have 'use client')
  if (!content.includes("'use client'")) {
    console.log(`  Already processed or doesn't need updating, skipping.`);
    return;
  }
  
  // Extract the page name from the file path
  const dirName = path.basename(path.dirname(filePath));
  let pageName;
  
  // Handle dynamic route parameters (e.g., [id])
  if (dirName.startsWith('[') && dirName.endsWith(']')) {
    const paramName = dirName.slice(1, -1); // Remove [ and ]
    pageName = paramName.charAt(0).toUpperCase() + paramName.slice(1);
  } else {
    pageName = dirName.charAt(0).toUpperCase() + dirName.slice(1);
  }
  
  // Create the client component file
  const clientComponentPath = path.join(path.dirname(filePath), `${pageName}Page.tsx`);
  
  // Extract the component content (everything after 'use client')
  let componentContent = content.replace("'use client';", "").trim();
  
  // Update component name if needed
  componentContent = componentContent.replace(/export default function \w+Page/, `export default function ${pageName}Page`);
  
  // Add 'use client' directive and style imports to the client component
  const clientComponentContent = `'use client';\n\nimport { useSearchParams } from 'next/navigation';\nimport '../../styles/common.css';\n\n${componentContent}`;
  
  // Create the server component
  const serverComponentContent = `import { Suspense } from 'react';\nimport ${pageName}Page from './${pageName}Page';\n\nexport default function Page() {\n  return (\n    <Suspense fallback={<div>Loading ${dirName.toLowerCase()} page...</div>}>\n      <${pageName}Page />\n    </Suspense>\n  );\n}`;
  
  // Write the files
  fs.writeFileSync(clientComponentPath, clientComponentContent);
  fs.writeFileSync(filePath, serverComponentContent);
  
  console.log(`  Updated to use server/client component pattern.`);
});

console.log('All pages processed!');
