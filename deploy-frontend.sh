#!/bin/bash
# Sentinel Frontend Deployment Helper
# Use this to configure frontend for Vercel deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Sentinel Frontend Deployment Setup       ║${NC}"
echo -e "${GREEN}║  Vercel Configuration                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}Error: Please run this script from the frontend directory${NC}"
    exit 1
fi

# Get backend URL
read -p "Enter your backend API URL (e.g., https://sentinel-backend-xxxxx.run.app): " API_URL
read -p "Enter Sentry DSN (optional, press Enter to skip): " SENTRY_DSN

# Create .env.production.local
cat > .env.production.local << EOF
VITE_API_URL=$API_URL
VITE_WS_URL=${API_URL/http/ws}
${SENTRY_DSN:+VITE_SENTRY_DSN=$SENTRY_DSN}
EOF

echo -e "\n${GREEN}✓ Created .env.production.local${NC}"

# Verify build
echo -e "\n${YELLOW}Building frontend...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
else
    echo -e "${YELLOW}Build failed. Check errors above.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Next steps:${NC}"
echo "1. Commit changes: git add . && git commit -m 'Configure for production deployment'"
echo "2. Push to GitHub: git push origin main"
echo "3. Import to Vercel: https://vercel.com/new"
echo "4. Set environment variables in Vercel:"
echo "   - VITE_API_URL=$API_URL"
echo "   - VITE_WS_URL=${API_URL/http/ws}"
echo "${SENTRY_DSN:+   - VITE_SENTRY_DSN=$SENTRY_DSN}"
echo "5. Deploy!"

cat > /tmp/vercel-env-template.txt << EOF
# Copy these to Vercel environment variables in project settings

VITE_API_URL=$API_URL
VITE_WS_URL=${API_URL/http/ws}
${SENTRY_DSN:+VITE_SENTRY_DSN=$SENTRY_DSN}
EOF

echo -e "\n${GREEN}✓ Environment variables saved to /tmp/vercel-env-template.txt${NC}"
