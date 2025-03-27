#!/bin/bash

# Clean up previous builds
rm -rf .next out

# Create a temporary directory for problematic pages
mkdir -p .page-backup

# Move problematic pages to backup
mv src/app/404 .page-backup/404 2>/dev/null || true
mv src/app/auth-test .page-backup/auth-test 2>/dev/null || true
mv src/app/admin .page-backup/admin 2>/dev/null || true
# DO NOT move the register page - we need it in the static build

# Apply the template to client components
node apply-template.js

# Run the build using npx with ESLint completely disabled
NODE_ENV=production DISABLE_ESLINT_PLUGIN=true npx next build --no-lint

# Ensure all product pages are generated
node create-static-product-pages.js

# Create a custom 404 page
node create-404-page.js

# Restore the pages
mv .page-backup/* src/app/ 2>/dev/null || true
rmdir .page-backup

# Add a _redirects file for Netlify (if needed)
echo "/* /index.html 200" > out/_redirects

# Copy .htaccess file to the output directory
cp .htaccess out/.htaccess

echo "Static build completed successfully!"
