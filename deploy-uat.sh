#!/bin/bash

set -e  # stop on first error

echo "🚀 Starting UAT deployment (Next.js static)..."

# ---------- CONFIG ----------
BUCKET_NAME="uat-front-build"
DISTRIBUTION_ID="E3GG33N359G9YA"   # <-- replace with real ID
BUILD_DIR="out"

# ---------- CLEAN ----------
echo "🧹 Cleaning old build artifacts..."
rm -rf .next out

# ---------- BUILD ----------
echo "📦 Building Next.js app..."
npm run build

echo "📤 Exporting static site..."
npm run export

# ---------- SAFETY CHECK ----------
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory '$BUILD_DIR' not found. Aborting."
  exit 1
fi

# ---------- DEPLOY ----------
echo "☁️ Syncing to S3..."
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME \
  --delete \
  --exclude "*.save"

# ---------- INVALIDATE ----------
echo "🧹 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  > /dev/null

echo "✅ UAT deployment complete!"
