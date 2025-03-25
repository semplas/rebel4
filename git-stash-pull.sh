#!/bin/bash

# Stash your local changes
git stash save "Temporary stash before pulling"

# Pull the latest changes from the remote repository
git pull origin $(git branch --show-current)

# Apply your stashed changes back
git stash pop

echo "Changes pulled from remote repository and your local changes have been reapplied."