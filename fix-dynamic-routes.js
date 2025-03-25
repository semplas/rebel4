const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all dynamic route page files (containing brackets in the path)
const dynamicPageFiles = glob.sync('src/app/**/[[]*/page.tsx');

dynamicPageFiles.forEach(filePath => {
  console.log(`Processing dynamic route: ${filePath}...`);
  
  // Extract the directory path and parameter name
  const dirPath = path.dirname(filePath);
  const dirName = path.basename(dirPath);
  const paramName = dirName.slice(1, -1); // Remove [ and ]
  
  // Create a separate file for generateStaticParams
  const staticParamsFile = path.join(dirPath, 'generateStaticParams.js');
  
  // Skip if the file already exists
  if (fs.existsSync(staticParamsFile)) {
    console.log(`  generateStaticParams.js already exists, skipping.`);
    return;
  }
  
  // Create the content for the generateStaticParams file
  const staticParamsContent = `// This file contains the generateStaticParams function for the ${dirName} route

export async function generateStaticParams() {
  // Return an array of params to generate static pages for
  return [
    { ${paramName}: '1' },
    { ${paramName}: '2' },
    { ${paramName}: '3' },
    { ${paramName}: '4' },
    { ${paramName}: '5' },
    // Add more IDs as needed
  ];
}
`;
  
  // Write the file
  fs.writeFileSync(staticParamsFile, staticParamsContent);
  
  console.log(`  Created generateStaticParams.js file.`);
  
  // Read the page file content
  let pageContent = fs.readFileSync(filePath, 'utf8');
  
  // Remove any existing generateStaticParams function
  pageContent = pageContent.replace(/\/\/ This function is required for static export with dynamic routes[\s\S]*?export async function generateStaticParams\(\)[\s\S]*?\}\s*/, '');
  
  // Write the updated page content
  fs.writeFileSync(filePath, pageContent);
});

console.log('All dynamic routes processed!');
