-- Add email verification fields to users table
ALTER TABLE "users" ADD COLUMN "email_verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN "email_verification_expires" TIMESTAMP(3);

-- Create OAuth accounts table
CREATE TABLE "oauth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint for provider + provider_account_id
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_account_id_key" ON "oauth_accounts"("provider", "provider_account_id");

-- Add index on user_id
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- Add index on email_verification_token for faster lookups
CREATE INDEX "users_email_verification_token_idx" ON "users"("email_verification_token");

-- Add foreign key constraint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;