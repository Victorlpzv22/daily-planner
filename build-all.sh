#!/bin/bash
# Build script for Daily Planner Desktop App
# This script builds both the server and client into a distributable package

set -e  # Exit on error

echo "=========================================="
echo "🏗️  Building Daily Planner Desktop App"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER_DIR="$SCRIPT_DIR/server"
CLIENT_DIR="$SCRIPT_DIR/client"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check dependencies
print_step "Checking dependencies..."

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

echo "  ✓ Python 3: $(python3 --version)"
echo "  ✓ npm: $(npm --version)"
echo ""

# Step 2: Install server dependencies
print_step "Installing server dependencies..."
cd "$SERVER_DIR"

if [ ! -d "venv" ]; then
    print_warning "Virtual environment not found, creating one..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "  ✓ Server dependencies installed"
echo ""

# Step 3: Build server executable
print_step "Building server executable with PyInstaller..."
python3 build_server.py

if [ ! -f "dist/daily-planner-server" ]; then
    print_error "Server executable not created!"
    exit 1
fi

echo "  ✓ Server executable created"
echo ""

# Step 4: Install client dependencies
print_step "Installing client dependencies..."
cd "$CLIENT_DIR"

if [ ! -d "node_modules" ]; then
    npm install
else
    echo "  ✓ Dependencies already installed (skipping)"
fi
echo ""

# Step 5: Build React app
print_step "Building React application..."
npm run build

if [ ! -d "build" ]; then
    print_error "React build failed!"
    exit 1
fi

echo "  ✓ React app built"
echo ""

# Step 6: Package with Electron
print_step "Packaging with Electron Builder..."
echo ""

# Determine platform
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="mac"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    PLATFORM="win"
else
    PLATFORM="linux"
fi

# Build for current platform
case "$PLATFORM" in
    linux)
        npm run dist:linux
        ;;
    mac)
        npm run electron-build -- --mac
        ;;
    win)
        npm run dist:win
        ;;
esac

echo ""
echo "=========================================="
echo "✨ Build Complete!"
echo "=========================================="
echo ""
echo "📦 Distributable packages created in:"
echo "   $CLIENT_DIR/dist/"
echo ""

# List created files
if [ -d "dist" ]; then
    echo "📋 Created files:"
    ls -lh dist/ | grep -v "^d" | awk '{print "   " $9 " (" $5 ")"}'
fi

echo ""
echo "🚀 You can now distribute these packages!"
echo ""
