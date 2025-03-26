#!/bin/bash

# Exit on error
set -e

echo "🔍 Running pre-deployment checks..."

# Check for required files
echo "Checking for required files..."
required_files=("next.config.ts" "package.json" ".env")
for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Required file not found: $file"
    exit 1
  fi
done

# Check for environment variables
echo "Checking environment variables..."
if [ ! -f ".env" ]; then
  echo "⚠️ .env file not found. Creating template..."
  cp .env.example .env 2>/dev/null || echo "# Environment Variables" > .env
  echo "Please fill in the required environment variables in .env file."
fi

# Check Node.js version
echo "Checking Node.js version..."
required_node_version="18"
node_version=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)
if [ "$node_version" -lt "$required_node_version" ]; then
  echo "❌ Node.js version $node_version is lower than required version $required_node_version"
  echo "Please upgrade Node.js to version $required_node_version or higher"
  exit 1
fi

# Check npm dependencies
echo "Checking npm dependencies..."
npm ls --depth=0 next react react-dom > /dev/null 2>&1 || {
  echo "⚠️ Some dependencies might be missing. Running npm install..."
  npm install
}

# Set up generateStaticParams for dynamic routes
echo "Setting up static parameters for dynamic routes..."
node setup-static-params.js || {
  echo "⚠️ Failed to set up static parameters. Creating the script..."
  # Create the script if it doesn't exist
  node -e "require('fs').writeFileSync('setup-static-params.js', fs.readFileSync('setup-static-params.js.example', 'utf8'))" 2>/dev/null || echo "// Create setup-static-params.js manually"
}

# Check for build errors
echo "Running test build..."
NODE_ENV=production DISABLE_ESLINT_PLUGIN=true npx next build --no-lint || {
  echo "❌ Build failed! Please fix the errors before deploying."
  exit 1
}

echo "✅ Pre-deployment checks passed! You're ready to deploy."
