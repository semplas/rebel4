#!/bin/bash

# Add all changes
git add .

# Commit changes
git commit -m "Fix static build for dynamic routes"

# Force push to the current branch
# This will overwrite remote changes with your local changes
git push --force origin $(git branch --show-current)

echo "Changes pushed to remote repository."