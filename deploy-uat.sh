#!/bin/bash
set -e

echo "🚀 UAT Deploy Started"

# ---------- CONFIG ----------
BRANCH="main"
ENV_BUCKET="uat-system-files"
ENV_PREFIX="env/frontend"
ENV_FILE=".env"
PM2_APP="uat-front"

# ---------- GIT RESET ----------
echo "🧹 Resetting local git state..."
git fetch origin
git reset --hard origin/$BRANCH
git clean -fd

# ---------- FETCH ENV ----------
echo "🔐 Fetching environment file from S3..."
aws s3 cp "s3://$ENV_BUCKET/$ENV_PREFIX/$ENV_FILE" "$ENV_FILE"

if [ ! -s "$ENV_FILE" ]; then
  echo "❌ .env file missing or empty"
  exit 1
fi

# ---------- CLEAN BUILD ----------
echo "🧹 Cleaning old build artifacts..."
rm -rf .next node_modules/.cache

# ---------- BUILD ----------
echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building Next.js (SSR)..."
npm run build

# ---------- PM2 ----------
echo "♻️ Reloading PM2 app..."
pm2 reload "$PM2_APP" || pm2 start npm --name "$PM2_APP" -- run start

echo "✅ UAT Deploy Completed Successfully"