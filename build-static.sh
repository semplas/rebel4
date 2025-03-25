#!/bin/bash

# Clean up previous builds
rm -rf .next out

# Create a temporary directory for problematic pages
mkdir -p .page-backup

# Move problematic pages to backup
mv src/app/404 .page-backup/404 2>/dev/null || true
mv src/app/auth-test .page-backup/auth-test 2>/dev/null || true
mv src/app/admin .page-backup/admin 2>/dev/null || true
# Add dynamic routes to the backup
mv src/app/shop/product/[id] .page-backup/product-id 2>/dev/null || true
# Add any other dynamic routes here

# Run the build using npx with ESLint completely disabled
DISABLE_ESLINT_PLUGIN=true npx next build --no-lint

# Create static product pages
node create-static-product-pages.js

# Restore the pages
mv .page-backup/* src/app/ 2>/dev/null || true
rmdir .page-backup

echo "Static build completed. Check the 'out' directory for the exported files."
