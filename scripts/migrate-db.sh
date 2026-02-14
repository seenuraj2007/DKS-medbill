#!/bin/bash

# DKS StockAlert Database Migration Script
# This script applies database migrations using Prisma

echo "rocket DKS StockAlert Database Migration"
echo "======================================"
echo ""

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "file_folder Loading environment from .env.local"
    # Export variables from .env.local, handling quoted values
    set -a
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$line" ]] && continue
        
        # Extract variable name and value
        var_name=$(echo "$line" | cut -d'=' -f1)
        var_value=$(echo "$line" | cut -d'=' -f2-)
        
        # Remove surrounding quotes from value
        var_value="${var_value%\"}"
        var_value="${var_value#\"}"
        var_value="${var_value%\'}"
        var_value="${var_value#\'}"
        
        # Export the variable
        export "$var_name"="$var_value"
    done < .env.local
    set +a
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "x Error: DATABASE_URL environment variable is not set"
    echo "Please set it in .env.local or export it first:"
    echo "  export DATABASE_URL='your-database-url'"
    exit 1
fi

echo "clipboard Migration: Add email verification and OAuth support"
echo ""

# Run Prisma db push to sync schema
echo "plug Connecting to database and syncing schema..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo "white_check_mark Migration completed successfully!"
    echo ""
    echo "New fields added to users table:"
    echo "  - email_verification_token"
    echo "  - email_verification_expires"
    echo ""
    echo "New table created:"
    echo "  - oauth_accounts (for Google OAuth)"
    echo ""
    echo "Next steps:"
    echo "  1. Add JWT_SECRET to .env.local"
    echo "  2. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for OAuth"
    echo "  3. Run 'npm run dev' to start the application"
else
    echo ""
    echo "x Migration failed!"
    echo "Please check your DATABASE_URL and try again."
    exit 1
fi
