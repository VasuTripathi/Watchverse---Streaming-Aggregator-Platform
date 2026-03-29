Watchverse — Streaming Aggregator Platform

Watchverse is a full-stack streaming aggregator that helps users discover movies, manage watchlists, and authenticate securely.

Link :- https://vasutripathi.github.io/Watchverse---Streaming-Aggregator-Platform/

React frontend (client)

Node/Express backend (server)
Supabase for user + watchlist storage
Features

User registration and login
JWT authentication + protected routes
Browse movies with search
Movie detail view
Add/remove watchlist
View and manage personal watchlist
Tech Stack

Frontend:

React
React Router
Context API (Auth context)
Fetch API / axios (in api.js)

Backend:

Node.js, Express
JWT auth (authController, authMiddleware)

Folder layout:

client/src/pages/*, components/*, context/*
server/models/*, routes/*, controllers/*, middleware/*

Quick Start

1. Clone
2. Backend
3. Frontend
client now likely at http://localhost:3000, backend at http://localhost:5000.

REACT_APP_API_URL=http://localhost:5000

Available Scripts

client

npm start
npm run build
npm test
server
npm start
npm run dev (if using nodemon)
API Endpoints
Auth
POST /api/v1/auth/register
POST /api/v1/auth/login

Watchlist

POST /api/v1/watchlist (auth)
GET /api/v1/watchlist (auth)
DELETE /api/v1/watchlist/:id (auth)

Recommended Improvements

Add unit/integration tests (Jest, React Testing Library, supertest)
Add error UI (toast/alerts)
Add pagination + sorting
Add “shared list”, “rating”, “recommendation”
Deploy with Netlify/Vercel + Heroku/Azure/GCP

Contribution
Fork
Feature branch
PR with details
Review + merge

Contact

Project: Watchverse
Email:- tripathivasu7@gmail.com
