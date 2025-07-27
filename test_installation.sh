#!/bin/bash

# Mini Palantir Gotham Installation Test Script
echo "🧪 Testing Mini Palantir Gotham installation..."

# Test 1: Check if Python virtual environment exists
echo "1. Checking Python virtual environment..."
if [ -d "backend/venv" ]; then
    echo "   ✅ Virtual environment found"
else
    echo "   ❌ Virtual environment not found"
    exit 1
fi

# Test 2: Check if Python dependencies are installed
echo "2. Checking Python dependencies..."
cd backend
source venv/bin/activate
if python -c "import fastapi, sqlalchemy, pandas" 2>/dev/null; then
    echo "   ✅ Core Python dependencies installed"
else
    echo "   ❌ Missing Python dependencies"
    exit 1
fi
cd ..

# Test 3: Check if database exists
echo "3. Checking database..."
if [ -f "backend/gotham.db" ]; then
    echo "   ✅ Database file found"
else
    echo "   ⚠️  Database not found (will be created on first run)"
fi

# Test 4: Check if Node.js dependencies are installed
echo "4. Checking Node.js dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "   ✅ Node.js dependencies installed"
else
    echo "   ❌ Node.js dependencies not found"
    exit 1
fi

# Test 5: Test backend startup (quick test)
echo "5. Testing backend startup..."
cd backend
source venv/bin/activate
timeout 10s uvicorn main:app --host 127.0.0.1 --port 8001 &
sleep 5
if curl -s http://127.0.0.1:8001/ > /dev/null; then
    echo "   ✅ Backend starts successfully"
    # Kill the test server
    pkill -f "uvicorn.*8001"
else
    echo "   ❌ Backend failed to start"
    pkill -f "uvicorn.*8001"
    exit 1
fi
cd ..

# Test 6: Check if frontend builds
echo "6. Testing frontend build..."
cd frontend
if npm run build --silent > /dev/null 2>&1; then
    echo "   ✅ Frontend builds successfully"
    rm -rf build
else
    echo "   ❌ Frontend build failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 All tests passed! Mini Palantir Gotham is ready to use."
echo ""
echo "📋 To start the application:"
echo "   ./start_dev.sh"
echo ""
echo "📋 Manual startup:"
echo "   Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "🔍 Your crime intelligence platform is ready for action!"