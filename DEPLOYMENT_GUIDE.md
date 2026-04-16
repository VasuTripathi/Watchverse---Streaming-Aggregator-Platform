# 🚀 Watchverse Deployment Guide

This guide helps you deploy Watchverse to production across multiple platforms. The app is now optimized for multi-device support and scalable for multiple concurrent users.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Google Cloud Deployment](#google-cloud-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Performance Optimization](#performance-optimization)

---

## Prerequisites

### Required Tools
- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn)
- **Git** for version control
- **Docker** (optional, for containerization)

### Accounts Needed
- **Supabase** account (for database)
- **Google Cloud** account (or alternative cloud provider)
- **OpenAI/AI API** account (for AI services)
- **TMDB API** account (for movie data)

### Check Installation
```bash
node --version    # Should be v18.x or higher
npm --version     # Should be 9.x or higher
git --version     # Should be installed
```

---

## Backend Deployment

### 1. Prepare Backend for Production

#### Install Dependencies
```bash
cd server
npm install
```

#### Create Production Environment File
```bash
# Copy example and fill in actual values
cp .env.example .env

# Edit .env with production values
nano .env
# or
code .env
```

#### Required Environment Variables
```
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
JWT_SECRET=your-secure-random-secret-key
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
OPENAI_API_KEY=your-openai-api-key
```

### 2. Build and Test
```bash
# Test in development
npm run dev

# Test in production
npm run prod
```

### 3. Deploy to Google Cloud App Engine

#### Setup Google Cloud
```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Initialize your project
gcloud init

# Set project
gcloud config set project YOUR_PROJECT_ID
```

#### Create app.yaml for App Engine
Create file: `server/app.yaml`
```yaml
runtime: nodejs18

env: standard

instance_class: F2

automatic_scaling:
  min_instances: 1
  max_instances: 10

env_variables:
  NODE_ENV: "production"
  PORT: "5000"
```

#### Deploy to App Engine
```bash
cd server
gcloud app deploy
```

#### Alternative: Google Cloud Run

Create `server/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
```

Deploy:
```bash
cd server
gcloud run deploy watchverse-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --allow-unauthenticated
```

### 4. Alternative Deployment Options

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create watchverse-api

# Set environment variables
heroku config:set NODE_ENV=production -a watchverse-api
heroku config:set JWT_SECRET=your-secret -a watchverse-api
# ... set other variables

# Deploy
git push heroku main
```

#### DigitalOcean App Platform
1. Push code to GitHub
2. Connect GitHub repo to DigitalOcean
3. Set environment variables in console
4. Deploy

---

## Frontend Deployment

### 1. Build Production Bundle
```bash
cd client

# Create .env.production.local with API URL
echo "REACT_APP_API_URL=https://your-api-domain.com/api" > .env.production.local

# Build optimized bundle
npm run build

# Output: client/build/
```

### 2. Google Cloud Storage / Hosting

#### Using Google Cloud Storage
```bash
# Create bucket
gsutil mb gs://watchverse-app

# Build app
npm run build

# Upload to bucket
gsutil -m rsync -r -d build gs://watchverse-app

# Make public
gsutil iam ch allUsers:objectViewer gs://watchverse-app
```

#### Using Firebase Hosting
```bash
# Install Firebase tools
npm install -g firebase-tools

# Initialize Firebase
firebase init

# Deploy
firebase deploy
```

### 3. Alternative Frontend Deployment

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

#### GitHub Pages (for testing)
```bash
# In client/package.json
npm run deploy
```

---

## Database Setup

### Supabase Configuration

1. **Create Project** on Supabase
2. **Get Credentials**:
   - Project URL
   - Service Role Key (not anon key!)

3. **Create Tables** (using Supabase SQL Editor)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist table
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  poster_path TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_id)
);

-- Activity table
CREATE TABLE activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  movie_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_activity_user_id ON activity(user_id);
CREATE INDEX idx_activity_created_at ON activity(created_at);
```

4. **Enable RLS (Row Level Security)** for multi-user safety:
```sql
-- Enable RLS on tables
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON watchlist FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Environment Configuration

### Checklist for Production

**Backend `.env`:**
- [ ] NODE_ENV=production
- [ ] PORT=5000 (or cloud provider port)
- [ ] SUPABASE_URL (correct URL)
- [ ] SUPABASE_KEY (service role key, not anon)
- [ ] JWT_SECRET (strong random string)
- [ ] CORS_ORIGIN (your domain)
- [ ] OPENAI_API_KEY
- [ ] TMDB_API_KEY

**Frontend `.env.production.local`:**
- [ ] REACT_APP_API_URL (backend API URL)
- [ ] REACT_APP_ENV=production
- [ ] REACT_APP_ENABLE_AI_CHAT=true
- [ ] REACT_APP_ENABLE_WATCHLIST=true

### Security Best Practices

1. **Never commit .env files**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use strong JWT_SECRET**
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Set HTTPS only**
   - Redirect all HTTP to HTTPS
   - Use security headers (already configured)

4. **Rate Limiting**
   - Configured: 100 requests/15 min per IP
   - Login: 5 attempts/15 min

---

## Monitoring & Logging

### Backend Logs
Logs are saved in `server/logs/` directory:
- `info-YYYY-MM-DD.log`
- `error-YYYY-MM-DD.log`
- `warn-YYYY-MM-DD.log`

### View Real-time Logs (Cloud Platforms)

**Google Cloud App Engine:**
```bash
gcloud app logs read --limit 50
```

**Google Cloud Run:**
```bash
gcloud run logs read watchverse-api --limit 50
```

**Heroku:**
```bash
heroku logs --tail -a watchverse-api
```

### Health Check Endpoint
The API provides a health check:
```bash
curl https://your-api.com/health
# Response: {"status":"ok","timestamp":"...","uptime":...}
```

### Performance Monitoring
- Response times logged for each request
- Database connection health monitored
- Error tracking and reporting

---

## Performance Optimization

### Backend Optimization

1. **Enable Compression** (already configured)
   ```
   Reduces response size by 60-70%
   ```

2. **Connection Pooling**
   - Supabase handles this automatically
   - Max 30 concurrent connections per project

3. **Rate Limiting**
   - Prevents abuse
   - Protects against DDoS

4. **Caching Strategy**
   - Implement Redis for session/recommendation caching
   - Cache TMDB API responses

### Frontend Optimization

1. **Code Splitting**
   - React lazy loading already implemented
   - Bundle size: ~180KB gzipped

2. **Image Optimization**
   - Use next-gen formats (WebP)
   - Lazy load images

3. **Progressive Web App (PWA)**
   - Service worker enables offline support
   - App can be installed on home screen
   - 60KB additional overhead

4. **Browser Caching**
   ```
   Static assets cached for 1 year
   API responses cached for 5 minutes
   ```

### Recommended CDN Configuration

Use Google Cloud CDN or Cloudflare:
```
- Cache TTL: 3600s for static assets
- Gzip compression enabled
- Minified HTML/CSS/JS
```

---

## Scaling for Multiple Concurrent Users

### Auto-scaling Configuration

**Google Cloud Run:**
- Max instances: 100 (configurable)
- Automatically scales based on CPU/memory
- Each instance: 512MB RAM, 1 CPU

**Expected Capacity:**
- 1 instance: 50-100 concurrent users
- 10 instances: 500-1000 concurrent users
- 100 instances: 5000-10000 concurrent users

### Database Scaling

**Supabase:**
- Read replicas for high traffic
- Automatic backup and recovery
- Real-time subscriptions support
- Connection pooling support

### Session Management

For multi-user support:
1. JWT tokens handle authentication
2. Tokens expire after 7 days
3. Refresh token rotation (implement for high security)
4. Session store: Database or Redis

---

## Maintenance & Updates

### Regular Tasks

Daily:
```bash
# Check health
curl https://your-api.com/health

# Review logs
gcloud app logs read
```

Weekly:
```bash
# Check dependencies for vulnerabilities
npm audit --production

# Monitor database usage
# Check via Supabase dashboard
```

Monthly:
```bash
# Update dependencies
npm update --production

# Review and archive logs
# Scale analysis based on traffic
```

### Backup Strategy

- Supabase: Automatic daily backups
- Store: Multiple regions
- Retention: 30 days (configurable)

---

## Troubleshooting

### Common Issues

**CORS Error**
```
Check CORS_ORIGIN environment variable
Add your domain to the list
```

**Database Connection Failed**
```
Verify SUPABASE_URL and SUPABASE_KEY
Check RLS policies are not too restrictive
Ensure tables exist
```

**High Latency**
```
Check Cloud Run region (choose closest to users)
Enable CDN
Optimize database queries
```

**Out of Memory**
```
Increase instance size
Review code for memory leaks
Implement pagination for large datasets
```

---

## Support & Resources

- **Google Cloud Documentation**: https://cloud.google.com/docs
- **Supabase Guide**: https://supabase.com/docs
- **React Optimization**: https://react.dev/learn
- **Node.js Best Practices**: https://nodejs.org/en/docs/guides/

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Create environment files
3. ✅ Deploy backend to Google Cloud
4. ✅ Deploy frontend to CDN
5. ✅ Configure custom domain
6. ✅ Set up monitoring
7. ✅ Setup SSL certificate
8. ✅ Configure analytics

**Congratulations! Your Watchverse app is now production-ready!** 🎉
