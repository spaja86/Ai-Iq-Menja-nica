# Deployment Guide

This guide covers deploying the Crypto Exchange frontend to various platforms.

## Table of Contents

- [Production Build](#production-build)
- [Environment Configuration](#environment-configuration)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Docker](#docker)
  - [Nginx](#nginx)

## Production Build

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set production environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with production API URLs
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. The production build will be in the `dist/` directory.

## Environment Configuration

Create a `.env` file with the following variables:

```env
VITE_API_URL=https://api.yourexchange.com/api
VITE_WS_URL=wss://api.yourexchange.com/ws
```

**Important:** All environment variables must be prefixed with `VITE_` to be accessible in the application.

## Deployment Platforms

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Configure environment variables in Vercel dashboard or via CLI:
   ```bash
   vercel env add VITE_API_URL production
   vercel env add VITE_WS_URL production
   ```

4. For automatic deployments, connect your GitHub repository in the Vercel dashboard.

### Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. Configure environment variables in Netlify dashboard under Site settings > Build & deploy > Environment.

**netlify.toml** (optional):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### AWS S3 + CloudFront

1. Build the application:
   ```bash
   npm run build
   ```

2. Create an S3 bucket:
   ```bash
   aws s3 mb s3://your-exchange-frontend
   ```

3. Upload build files:
   ```bash
   aws s3 sync dist/ s3://your-exchange-frontend --delete
   ```

4. Configure S3 bucket for static website hosting:
   ```bash
   aws s3 website s3://your-exchange-frontend --index-document index.html --error-document index.html
   ```

5. Create CloudFront distribution:
   - Origin: Your S3 bucket
   - Default root object: index.html
   - Error pages: Configure 404 to redirect to index.html (for SPA routing)

6. Configure SSL certificate with AWS Certificate Manager

7. Update DNS to point to CloudFront distribution

### Docker

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

**Build and run:**
```bash
docker build -t crypto-exchange-frontend .
docker run -p 80:80 crypto-exchange-frontend
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:8000/api
      - VITE_WS_URL=ws://backend:8000/ws
    depends_on:
      - backend
```

### Nginx

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy build files to web server:
   ```bash
   scp -r dist/* user@server:/var/www/exchange
   ```

3. Nginx configuration (`/etc/nginx/sites-available/exchange`):
   ```nginx
   server {
       listen 80;
       server_name exchange.com www.exchange.com;
       root /var/www/exchange;
       index index.html;

       # Enable gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 10240;
       gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

       # SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # API proxy
       location /api {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       # WebSocket proxy
       location /ws {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "Upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

4. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/exchange /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. Configure SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d exchange.com -d www.exchange.com
   ```

## Performance Optimization

### Code Splitting

The application uses React Router for automatic code splitting. Consider implementing additional lazy loading:

```typescript
import { lazy, Suspense } from 'react';

const Trade = lazy(() => import('./pages/Trade'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Route path="/trade" element={<Trade />} />
    </Suspense>
  );
}
```

### CDN Configuration

- Serve static assets from CDN
- Configure cache headers appropriately
- Use HTTP/2 or HTTP/3
- Enable Brotli compression

### Service Worker (Optional)

For offline support, consider adding a service worker using Vite PWA plugin:

```bash
npm install vite-plugin-pwa -D
```

## Monitoring

### Error Tracking

Consider integrating error tracking services:
- Sentry
- LogRocket
- Bugsnag

### Analytics

Add analytics for user behavior:
- Google Analytics
- Mixpanel
- Amplitude

## Security Checklist

- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set appropriate CSP headers
- [ ] Enable HSTS
- [ ] Configure rate limiting
- [ ] Regular security updates
- [ ] Environment variables not committed to repo
- [ ] Secure WebSocket connections (WSS)

## Troubleshooting

### White Screen on Deployment

- Check browser console for errors
- Verify API URLs are correct
- Ensure all environment variables are set
- Check nginx/server configuration for SPA routing

### API Connection Issues

- Verify CORS settings on backend
- Check API URL configuration
- Ensure backend is accessible from frontend server
- Verify SSL certificates if using HTTPS

### WebSocket Connection Failures

- Ensure WebSocket URL uses correct protocol (ws:// or wss://)
- Check proxy configuration for WebSocket upgrade headers
- Verify backend WebSocket support
- Check firewall rules

## Rollback Strategy

1. Keep previous build artifacts
2. Use versioned deployments
3. Implement blue-green deployment
4. Have rollback scripts ready

```bash
# Example rollback
aws s3 sync s3://backup-bucket/v1.0.0/ s3://your-exchange-frontend --delete
```

## Health Checks

Create a health check endpoint or use the root path to verify deployment:

```bash
curl -I https://exchange.com
```

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_WS_URL: ${{ secrets.WS_URL }}
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://your-bucket --delete
```

## Support

For deployment issues:
- Check logs in deployment platform
- Review nginx/server error logs
- Contact DevOps team
- Create issue on GitHub repository
