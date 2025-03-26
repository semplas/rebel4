#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment to cPanel..."

# 1. Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf .next out
rm -rf node_modules/.cache

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci || npm install

# 3. Set up generateStaticParams for dynamic routes
echo "🔧 Setting up static parameters for dynamic routes..."
node setup-static-params.js

# 4. Create a production build
echo "🔨 Creating production build..."
NODE_ENV=production DISABLE_ESLINT_PLUGIN=true npx next build --no-lint

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Aborting deployment."
  exit 1
fi

# 5. Ensure the out directory exists
if [ ! -d "out" ]; then
  echo "❌ 'out' directory not found! Build failed."
  exit 1
fi

# 6. Create a zip file for upload
echo "🗜️ Creating zip file for upload..."
zip -r build.zip out

# 7. Upload to cPanel using FTP (you'll need to configure these variables)
echo "📡 Uploading to cPanel..."
echo "Please enter your cPanel FTP credentials:"
read -p "FTP Host: " FTP_HOST
read -p "FTP Username: " FTP_USER
read -p "FTP Password: " -s FTP_PASS
echo ""
read -p "Remote directory (e.g., public_html): " REMOTE_DIR

# Upload using curl
echo "Uploading build.zip to cPanel..."
curl -T build.zip ftp://$FTP_HOST/$REMOTE_DIR/ --user $FTP_USER:$FTP_PASS

if [ $? -ne 0 ]; then
  echo "❌ Upload failed! Please check your credentials and try again."
  exit 1
fi

# 8. Extract the zip file on the server (this requires SSH access or cPanel file manager)
echo "🔓 To complete deployment:"
echo "1. Log in to your cPanel account"
echo "2. Navigate to File Manager"
echo "3. Go to $REMOTE_DIR directory"
echo "4. Extract the build.zip file"
echo "5. Ensure your .htaccess file is properly configured"

echo "✅ Deployment package prepared and uploaded successfully!"
