#!/bin/bash

# Mini Palantir Gotham Setup Script
echo "🔍 Setting up Mini Palantir Gotham..."

# Check if Python 3.8+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.8+ is required but not installed."
    exit 1
fi

# Check if Node.js 16+ is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 16+ is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run data ingestion
echo "🔄 Running data ingestion..."
python nyc_ingest.py

echo "✅ Backend setup complete"

# Go back to root directory
cd ..

# Setup Frontend
echo "🎨 Setting up frontend..."
cd frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

# Go back to root directory
cd ..

echo ""
echo "🎉 Mini Palantir Gotham setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. Open your browser to:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔍 Happy crime intelligence analyzing!"