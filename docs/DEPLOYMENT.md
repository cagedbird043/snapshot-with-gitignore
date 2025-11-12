# 🚀 Deployment Guide

This guide covers different ways to deploy Snapshot With Gitignore.

## Table of Contents

- [GitHub Pages](#github-pages)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [Docker](#docker)
- [Static Hosting](#static-hosting)

---

## GitHub Pages

### Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

#### Setup Steps:

1. **Enable GitHub Pages**
    - Go to your repository Settings
    - Navigate to Pages section
    - Source: Select "GitHub Actions"

2. **Push to main branch**

    ```bash
    git push origin main
    ```

3. **Wait for deployment**
    - Check the Actions tab
    - Wait for the CI/CD workflow to complete
    - Your site will be live at: `https://<username>.github.io/snapshot-with-gitignore/`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

---

## Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cagedbird043/snapshot-with-gitignore)

### Manual Deployment

1. **Install Vercel CLI**

    ```bash
    npm install -g vercel
    ```

2. **Deploy**

    ```bash
    vercel
    ```

3. **Production Deployment**
    ```bash
    vercel --prod
    ```

### Configuration

Create `vercel.json`:

```json
{
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite"
}
```

---

## Netlify

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cagedbird043/snapshot-with-gitignore)

### Manual Deployment

1. **Install Netlify CLI**

    ```bash
    npm install -g netlify-cli
    ```

2. **Build**

    ```bash
    npm run build
    ```

3. **Deploy**
    ```bash
    netlify deploy --prod --dir=dist
    ```

### Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Docker

### Build Docker Image

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Build and Run

```bash
# Build image
docker build -t snapshot-with-gitignore .

# Run container
docker run -d -p 8080:80 snapshot-with-gitignore

# Visit http://localhost:8080
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
    app:
        build: .
        ports:
            - '8080:80'
        restart: unless-stopped
```

Run:

```bash
docker-compose up -d
```

---

## Static Hosting

Deploy to any static hosting service:

### AWS S3 + CloudFront

```bash
# Build
npm run build

# Install AWS CLI
# Configure AWS credentials

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Azure Static Web Apps

```bash
# Install Azure CLI
az login

# Create static web app
az staticwebapp create \
  --name snapshot-with-gitignore \
  --resource-group your-resource-group \
  --location "East US" \
  --source https://github.com/cagedbird043/snapshot-with-gitignore \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

### Google Cloud Storage

```bash
# Build
npm run build

# Install gcloud CLI
# Configure gcloud

# Upload to GCS
gsutil -m rsync -r -d dist gs://your-bucket-name

# Make public
gsutil iam ch allUsers:objectViewer gs://your-bucket-name
```

---

## Environment Variables

For production deployments, you may want to set:

```bash
# .env.production
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

---

## Performance Optimization

### Before Deployment

1. **Analyze bundle size**

    ```bash
    npm run build
    npx vite-bundle-visualizer
    ```

2. **Optimize images**
    - Compress images
    - Use WebP format
    - Add lazy loading

3. **Enable caching**
    - Configure CDN caching
    - Set appropriate cache headers

### Post-Deployment

1. **Monitor performance**
    - Use Lighthouse
    - Check Core Web Vitals
    - Monitor error rates

2. **Setup monitoring**
    - Use Sentry for error tracking
    - Setup analytics (optional)
    - Monitor uptime

---

## Custom Domain

### GitHub Pages

1. Add `CNAME` file to `public/` directory:

    ```
    yourdomain.com
    ```

2. Configure DNS:
    ```
    Type: CNAME
    Name: www
    Value: <username>.github.io
    ```

### Vercel/Netlify

1. Go to domain settings
2. Add your custom domain
3. Follow DNS configuration instructions

---

## SSL/HTTPS

Most platforms provide automatic SSL:

- **GitHub Pages**: Automatic
- **Vercel**: Automatic
- **Netlify**: Automatic
- **Docker**: Use Let's Encrypt + nginx

For custom SSL with Docker:

```bash
# Install certbot
certbot certonly --webroot -w /usr/share/nginx/html -d yourdomain.com

# Update nginx config to use SSL
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 16+

# Try building locally
npm run build
```

### 404 Errors

- Check `base` path in `vite.config.ts`
- Ensure proper routing configuration
- Check server configuration for SPA

### Performance Issues

- Enable compression (gzip/brotli)
- Use CDN
- Optimize images
- Split code chunks

---

## Rollback

### GitHub Pages

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Vercel/Netlify

- Use dashboard to rollback to previous deployment

### Docker

```bash
# Tag previous image as latest
docker tag snapshot-with-gitignore:previous snapshot-with-gitignore:latest
docker push snapshot-with-gitignore:latest
```

---

## Security Checklist

Before deploying:

- [ ] No API keys in code
- [ ] Environment variables properly set
- [ ] Dependencies updated
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] CORS configured (if needed)
- [ ] Rate limiting (if needed)
- [ ] Monitoring enabled

---

## Need Help?

- 📖 [Read the documentation](../README.md)
- 🐛 [Report issues](https://github.com/cagedbird043/snapshot-with-gitignore/issues)
- 💬 [Ask questions](https://github.com/cagedbird043/snapshot-with-gitignore/discussions)

---

<div align="center">

**Happy Deploying! 🚀**

</div>
