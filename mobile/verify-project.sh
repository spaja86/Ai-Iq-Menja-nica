#!/bin/bash

echo "🔍 Verifying Crypto Exchange Mobile App Structure..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - MISSING"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ - MISSING"
        return 1
    fi
}

echo "📁 Checking Directories..."
check_dir "screens"
check_dir "navigation"
check_dir "hooks"
check_dir "services"
check_dir "types"
check_dir "components"
check_dir "utils"
check_dir "contexts"
echo ""

echo "📄 Checking Core Files..."
check_file "App.tsx"
check_file "package.json"
check_file "app.json"
check_file "tsconfig.json"
check_file "babel.config.js"
echo ""

echo "📱 Checking Screens..."
check_file "screens/LoginScreen.tsx"
check_file "screens/DashboardScreen.tsx"
check_file "screens/TradeScreen.tsx"
check_file "screens/WalletScreen.tsx"
check_file "screens/SettingsScreen.tsx"
echo ""

echo "🔧 Checking Services & Hooks..."
check_file "services/api.ts"
check_file "hooks/useAuth.ts"
check_file "hooks/useApi.ts"
check_file "navigation/AppNavigator.tsx"
echo ""

echo "📚 Checking Types..."
check_file "types/index.ts"
check_file "types/env.d.ts"
echo ""

echo "🛠️ Checking Utilities..."
check_file "utils/helpers.ts"
check_file "utils/constants.ts"
check_file "utils/theme.ts"
check_file "utils/notifications.ts"
echo ""

echo "🎨 Checking Components..."
check_file "components/LoadingSpinner.tsx"
check_file "components/EmptyState.tsx"
echo ""

echo "📖 Checking Documentation..."
check_file "README.md"
check_file "QUICKSTART.md"
check_file "DEVELOPMENT.md"
check_file "PROJECT_SUMMARY.md"
check_file "CHANGELOG.md"
echo ""

echo "⚙️ Checking Configuration..."
check_file ".env.example"
check_file ".gitignore"
check_file ".eslintrc.json"
check_file ".prettierrc"
check_file "jest.config.json"
echo ""

# Count files
TOTAL_TS=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)
TOTAL_FILES=$(find . -type f | grep -v node_modules | grep -v ".git" | wc -l)

echo "📊 Statistics:"
echo "  Total TypeScript files: $TOTAL_TS"
echo "  Total files: $TOTAL_FILES"
echo ""

echo -e "${GREEN}✅ Project structure verification complete!${NC}"
echo ""
echo "🚀 Next Steps:"
echo "  1. Run 'npm install' to install dependencies"
echo "  2. Copy '.env.example' to '.env' and configure"
echo "  3. Run 'npm start' to start development server"
echo "  4. Read QUICKSTART.md for detailed setup"
echo ""
