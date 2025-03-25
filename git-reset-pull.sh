#!/bin/bash

# Reset all local changes
git reset --hard HEAD

# Pull the latest changes from the remote repository
git pull origin $(git branch --show-current)

echo "Local changes have been discarded and the latest changes have been pulled from the remote repository."