#!/bin/bash
# ─────────────────────────────────────────────────────────────
# deploy.sh
# Builds the React app and deploys it to S3 + CloudFront.
#
# Usage: ./deploy.sh
#
# Run from the root of your liquidity-dashboard React project.
# Make sure your .env file is up to date before deploying.
# ─────────────────────────────────────────────────────────────

set -e  # exit on any error

# ── Config — update these after terraform apply ───────────────
S3_BUCKET="liquidity-dashboard-frontend"
CLOUDFRONT_ID="EF7F3Q80K6LJR"   # fill in from terraform output: cloudfront_distribution_id
REGION="eu-west-2"

# ── Check CloudFront ID is set ────────────────────────────────
if [ -z "$CLOUDFRONT_ID" ]; then
  echo "Error: CLOUDFRONT_ID is not set in deploy.sh"
  echo "Run: terraform output cloudfront_distribution_id"
  echo "Then paste the value into deploy.sh"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Liquidity Dashboard — Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Step 1: Build ─────────────────────────────────────────────
echo ""
echo "▶  Building React app..."
npm run build

# ── Step 2: Sync to S3 ───────────────────────────────────────
echo ""
echo "▶  Uploading to S3 bucket: $S3_BUCKET"

# Upload everything except index.html with long cache
aws s3 sync build/ s3://$S3_BUCKET \
  --region $REGION \
  --delete \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

# Upload index.html with short cache so deploys propagate quickly
aws s3 cp build/index.html s3://$S3_BUCKET/index.html \
  --region $REGION \
  --cache-control "no-cache, no-store, must-revalidate"

echo "  Upload complete."

# ── Step 3: Invalidate CloudFront cache ──────────────────────
echo ""
echo "▶  Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo "  Cache invalidation in progress (takes ~30 seconds)."

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deployed to: https://dashboard.shubodey.site"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
