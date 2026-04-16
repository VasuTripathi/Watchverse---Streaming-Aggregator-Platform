#!/bin/bash

# 🚀 Watchverse Setup and Run Script
# This script helps set up and run Watchverse for development and production

set -e

echo "🎬 Welcome to Watchverse Setup!"
echo "================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# Menu
echo -e "\n${YELLOW}What would you like to do?${NC}"
echo "1. Setup development environment"
echo "2. Run development server & client"
echo "3. Build for production"
echo "4. Run production build"
echo "5. Deploy to Google Cloud"
echo "6. View logs"
echo "q. Quit"
read -p "Enter choice [1-6, q]: " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Setting up development environment...${NC}"
        
        # Setup backend
        echo -e "\n${YELLOW}Setting up backend...${NC}"
        cd server
        if [ ! -f .env ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Created .env file${NC}"
            echo -e "${RED}⚠️  Please edit server/.env with your actual values${NC}"
        fi
        npm install
        cd ..
        echo -e "${GREEN}✅ Backend setup complete${NC}"
        
        # Setup frontend
        echo -e "\n${YELLOW}Setting up frontend...${NC}"
        cd client
        if [ ! -f .env.local ]; then
            cp .env.example .env.local
            echo -e "${GREEN}✅ Created .env.local file${NC}"
            echo -e "${RED}⚠️  Please edit client/.env.local with your API URL${NC}"
        fi
        npm install
        cd ..
        echo -e "${GREEN}✅ Frontend setup complete${NC}"
        
        echo -e "\n${GREEN}✅ Setup complete! Next steps:${NC}"
        echo "1. Edit server/.env with your actual values"
        echo "2. Edit client/.env.local with your API URL"
        echo "3. Run './setup.sh' and choose option 2 to start development"
        ;;
        
    2)
        echo -e "\n${YELLOW}Starting development servers...${NC}"
        
        # Check if setup is complete
        if [ ! -f server/.env ]; then
            echo -e "${RED}❌ server/.env not found. Run setup first.${NC}"
            exit 1
        fi
        
        if [ ! -f client/.env.local ]; then
            echo -e "${RED}❌ client/.env.local not found. Run setup first.${NC}"
            exit 1
        fi
        
        # Start backend in background
        echo -e "${YELLOW}Starting backend on port 5000...${NC}"
        cd server
        npm run dev &
        BACKEND_PID=$!
        cd ..
        sleep 3
        
        # Start frontend
        echo -e "${YELLOW}Starting frontend on port 3000...${NC}"
        echo -e "${GREEN}✅ Backend running (PID: $BACKEND_PID)${NC}"
        echo -e "${GREEN}✅ Open http://localhost:3000 in your browser${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
        
        cd client
        npm start
        
        # Cleanup
        kill $BACKEND_PID 2>/dev/null || true
        ;;
        
    3)
        echo -e "\n${YELLOW}Building for production...${NC}"
        
        # Build client
        echo -e "\n${YELLOW}Building React frontend...${NC}"
        cd client
        echo "REACT_APP_API_URL=https://your-api-domain.com/api" > .env.production.local
        npm run build
        cd ..
        echo -e "${GREEN}✅ Frontend build complete: client/build/${NC}"
        
        # Backend is ready to run with npm start
        echo -e "${YELLOW}Backend ready. No build required for Node.js${NC}"
        echo -e "${GREEN}✅ All builds complete!${NC}"
        ;;
        
    4)
        echo -e "\n${YELLOW}Running production build...${NC}"
        
        if [ ! -f server/.env ]; then
            echo -e "${RED}❌ server/.env not found${NC}"
            exit 1
        fi
        
        if [ ! -d client/build ]; then
            echo -e "${YELLOW}Frontend build not found. Building...${NC}"
            cd client
            npm run build
            cd ..
        fi
        
        echo -e "${YELLOW}Starting server in production mode...${NC}"
        cd server
        NODE_ENV=production npm start
        ;;
        
    5)
        echo -e "\n${YELLOW}Deploying to Google Cloud...${NC}"
        
        if ! command -v gcloud &> /dev/null; then
            echo -e "${RED}❌ Google Cloud SDK not found${NC}"
            echo "Please install: https://cloud.google.com/sdk/docs/install"
            exit 1
        fi
        
        echo -e "${YELLOW}Checking Google Cloud authentication...${NC}"
        if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
            echo -e "${YELLOW}Logging into Google Cloud...${NC}"
            gcloud auth login
        fi
        
        read -p "Enter your Google Cloud Project ID: " PROJECT_ID
        gcloud config set project $PROJECT_ID
        
        echo -e "\n${YELLOW}Building and deploying backend...${NC}"
        cd server
        gcloud app deploy
        cd ..
        
        echo -e "\n${YELLOW}Building and deploying frontend...${NC}"
        cd client
        npm run build
        # Deploy to Cloud Storage or Firebase Hosting
        echo -e "${YELLOW}Frontend build ready in client/build/${NC}"
        echo -e "${YELLOW}Use: gsutil -m rsync -r -d build gs://watchverse-app${NC}"
        echo -e "${YELLOW}Or use: firebase deploy${NC}"
        cd ..
        
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        ;;
        
    6)
        echo -e "\n${YELLOW}Viewing logs...${NC}"
        
        if [ -d "server/logs" ]; then
            echo -e "\n${YELLOW}Recent errors:${NC}"
            tail -20 server/logs/error-*.log 2>/dev/null || echo "No error logs"
            
            echo -e "\n${YELLOW}Recent info:${NC}"
            tail -20 server/logs/info-*.log 2>/dev/null || echo "No info logs"
        else
            echo -e "${YELLOW}No logs directory found${NC}"
        fi
        ;;
        
    q)
        echo "Goodbye!"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
