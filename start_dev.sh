#!/bin/bash

# Mini Palantir Gotham Development Startup Script
echo "🚀 Starting Mini Palantir Gotham in development mode..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping all services..."
    jobs -p | xargs kill 2>/dev/null
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Check if backend dependencies are installed
if [ ! -d "backend/venv" ]; then
    echo "❌ Backend not set up. Please run ./setup.sh first."
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend not set up. Please run ./setup.sh first."
    exit 1
fi

echo "✅ Dependencies check passed"

# Start Backend
echo "📦 Starting FastAPI backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Mini Palantir Gotham is running!"
echo ""
echo "📋 Available services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo "   Interactive API: http://localhost:8000/redoc"
echo ""
echo "💡 Tips:"
echo "   - The backend automatically reloads on code changes"
echo "   - The frontend hot-reloads on code changes"
echo "   - Press Ctrl+C to stop all services"
echo ""
echo "🔍 Happy developing!"

# Wait for background processes
wait