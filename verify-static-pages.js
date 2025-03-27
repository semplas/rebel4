const fs = require('fs');
const path = require('path');

// List of critical pages that must be in the static build
const criticalPages = [
  '/register',
  '/login',
  '/shop',
  '/admin',
  '/'
];

console.log('Verifying static pages...');

// Check if the out directory exists
if (!fs.existsSync('out')) {
  console.error('❌ The "out" directory does not exist. Run the build first.');
  process.exit(1);
}

// Check each critical page
let missingPages = [];
for (const page of criticalPages) {
  const pagePath = path.join('out', page === '/' ? 'index.html' : `${page}.html`);
  if (!fs.existsSync(pagePath)) {
    missingPages.push(page);
  }
}

if (missingPages.length > 0) {
  console.error('❌ The following critical pages are missing from the static build:');
  missingPages.forEach(page => console.error(`   - ${page}`));
  console.error('Please update your build configuration to include these pages.');
  process.exit(1);
} else {
  console.log('✅ All critical pages are included in the static build.');
}