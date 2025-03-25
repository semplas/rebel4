#!/bin/bash

# Pull the latest changes from the remote repository
git pull origin $(git branch --show-current)

echo "Changes pulled from remote repository."