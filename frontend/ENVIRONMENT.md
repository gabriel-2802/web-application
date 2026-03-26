# Environment Configuration Guide

This frontend application uses environment variables to configure API endpoints, allowing the same Docker image to run across different environments (development, staging, production) without rebuilding.

## Environment Variables

### Available Variables

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| `REACT_APP_API_BASE_URL` | API server base URL | `http://localhost:8080` | `https://api.example.com` |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | `dsrpbikhn` |
| `REACT_APP_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | - | `blog_images` |

## Development

### Running Locally

1. **Using npm directly** (uses `.env.local`):
```bash
npm install
npm start
```

The application will connect to `http://localhost:8080` by default.

2. **Using Docker Compose**:
```bash
docker-compose up
```

## Staging Environment

### Update `.env.staging`
Replace `https://api-staging.example.com` with your actual staging API URL:

```bash
REACT_APP_API_BASE_URL=https://api-staging.example.com
```

### Build and Run
```bash
docker build -t frontend:staging .
docker run -e REACT_APP_API_BASE_URL=https://api-staging.example.com \
           -e REACT_APP_CLOUDINARY_CLOUD_NAME=dsrpbikhn \
           -e REACT_APP_CLOUDINARY_UPLOAD_PRESET=blog_images \
           -p 3000:3000 \
           frontend:staging
```

## Production Environment

### Update `.env.production`
Replace `https://api.example.com` with your actual production API URL:

```bash
REACT_APP_API_BASE_URL=https://api.example.com
```

### Build and Run
```bash
docker build -t frontend:latest .
docker run -e REACT_APP_API_BASE_URL=https://api.example.com \
           -e REACT_APP_CLOUDINARY_CLOUD_NAME=dsrpbikhn \
           -e REACT_APP_CLOUDINARY_UPLOAD_PRESET=blog_images \
           -p 3000:3000 \
           frontend:latest
```

## Docker Compose Multi-Environment

Create an `.env` file at the project root for Docker Compose:

```bash
# .env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_CLOUDINARY_CLOUD_NAME=dsrpbikhn
REACT_APP_CLOUDINARY_UPLOAD_PRESET=blog_images
```

Then run:
```bash
docker-compose up
```

To override for specific environments:
```bash
REACT_APP_API_BASE_URL=https://api-staging.example.com docker-compose up
```

## Kubernetes Deployment

Create a ConfigMap for environment variables:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  REACT_APP_API_BASE_URL: "https://api.example.com"
  REACT_APP_CLOUDINARY_CLOUD_NAME: "dsrpbikhn"
  REACT_APP_CLOUDINARY_UPLOAD_PRESET: "blog_images"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: frontend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: frontend-config
```

## Key Benefits

✅ **Single Docker Image**: Build once, run anywhere
✅ **No Rebuild Required**: Change environment without rebuilding
✅ **CI/CD Friendly**: Easy to integrate with deployment pipelines
✅ **Security**: Store sensitive URLs in secure vaults (GitHub Secrets, Azure Key Vault, etc.)
✅ **Local Development**: Simple `.env.local` for development

## Important Notes

- **Development**: Uses `.env.local` when running `npm start`
- **Production Builds**: Variables are baked into the JavaScript at build time when using `npm run build`
- **Runtime Variables**: To change variables at runtime (in Docker), you need to rebuild or use a different approach (see Docker section)
- **Git**: Add `.env.local` to `.gitignore` — never commit local credentials
