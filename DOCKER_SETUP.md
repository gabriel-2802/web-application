# 🐳 Production-Ready Zero-Trust Docker Environment

This Docker setup implements **zero-trust container security** for a full-stack application: **Spring Boot 17** backend, **React 18 + Vite** frontend, and **PostgreSQL 16** database.

## 🔐 Zero-Trust Architecture

### Network Isolation (Dual-Network Model)

```
┌─────────────────────────────────────────────────────────────┐
│                    HOST (Port 80/443)                       │
├─────────────────────────────────────────────────────────────┤
│                 DMZ Network (172.20.0.0/16)                 │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │  Frontend (Nginx)    │〰️〰️〰️〰️〰️│  Backend (Spring)   │  │
│  │  Port: 80 → Host     │  (Proxy)  │  Port: 8080 (Int)  │  │
│  │  Users: nginx:1001   │         │  Users: appuser    │  │
│  └──────────────────────┘         └──────────────────────┘  │
│                                              │               │
│                                              │               │
│                 Data Network (172.21.0.0/16)│               │
│                                    ┌─────────▼───────────┐   │
│                                    │  Database (PG 16)   │   │
│                                    │  Port: 5432 (Int)   │   │
│                                    │  Users: postgres    │   │
│                                    └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

✅ Frontend → Backend: ✓ Allowed (DMZ-net)
✅ Backend → Database: ✓ Allowed (Data-net)
❌ Frontend → Database: ✗ Blocked (no shared network)
❌ External → Backend:  ✗ Blocked (no port exposure)
❌ External → Database: ✗ Blocked (no port exposure)
```

## 🚀 Quick Start

### Build & Start Everything
```bash
make docker-build       # Build all images
make docker-up          # Start all containers
make docker-logs        # View logs in real-time
```

### Access Application
- **Frontend**: http://localhost
- **Nginx (Int)**: Backend routes `/api/` to internal `http://backend:8080`

### Stop Everything
```bash
make docker-down        # Stop and remove containers
```

## 📋 Makefile Commands

### Build & Run
```bash
make docker-build              # Build all images (no cache)
make docker-build-cache        # Build with cache (faster)
make docker-up                 # Start all containers (detached)
make docker-down               # Stop & remove containers
make docker-restart            # Restart all containers
```

### Logs & Monitoring
```bash
make docker-logs               # Tail all containers
make docker-logs-backend       # Tail backend logs
make docker-logs-frontend      # Tail frontend/Nginx logs
make docker-logs-db            # Tail database logs
make docker-ps                 # List running containers
make docker-status             # Show container status
make docker-health             # Show health check status
```

### Security Verification
```bash
make docker-verify-security    # Run all security checks
make docker-verify-networks    # Verify network isolation
make docker-verify-ports       # Verify port exposure
make docker-verify-users       # Verify non-root users
make docker-inspect-networks   # Show network topology
```

### Container Access
```bash
make docker-shell-backend      # Bash shell → Backend
make docker-shell-frontend     # Shell → Frontend (Nginx)
make docker-shell-db          # psql → Database
make db_cli                    # Alias for docker-shell-db
```

### Configuration & Validation
```bash
make docker-validate           # Validate docker-compose.yml
make docker-show-config        # Show resolved config
make docker-show-env           # Display .env variables
make docker-env-prod           # Generate .env.prod with secrets
```

### Cleanup
```bash
make docker-clean              # Remove containers & volumes
make docker-prune              # Remove unused images/networks
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database
DB_USER=postgresadmin
DB_PASSWORD=StrongPassword123!
DB_NAME=my_pq_db

# JWT Security (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key
JWT_EXPIRATION=2592000000

# Mail Configuration
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@yourdomain.com

# Frontend
REACT_APP_API_URL=http://localhost
FRONTEND_URL=http://localhost/verify-email
FRONTEND_PORT=80
```

### Spring Boot Configuration

The backend uses **environment variable injection** via `application-prod.properties`:

```properties
# Uses ${VAR_NAME} syntax to match .env keys
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
app.jwt.secret=${APP_JWT_SECRET}
app.frontend.url=${APP_FRONTEND_URL}
# ... etc
```

### Frontend Configuration

React/Vite consumes API URL via build-time environment variable:

```typescript
// Injected at build stage from REACT_APP_API_URL
const API_BASE = process.env.REACT_APP_API_URL;
```

Runtime proxy is handled by **Nginx** in `frontend.Dockerfile`:

```nginx
location /api/ {
    proxy_pass http://backend:8080/;
    # Internal communication - backend DNS resolution
}
```

## 🏗️ Dockerfile Overview

### backend.Dockerfile
- **Build**: Maven 3 + Eclipse Temurin (Java 25)
- **Runtime**: JRE Alpine (lightweight)
- **User**: `appuser:1001` (non-root)
- **Health Check**: Spring Boot Actuator (`/actuator/health`)
- **Signals**: dumb-init for proper shutdown
- **Optimization**: Multi-stage build, layer caching with `pom.xml`

### frontend.Dockerfile
- **Build**: Node 20 Alpine + npm
- **Runtime**: Nginx 1.27 Alpine
- **User**: `nginx:1001` (non-root)
- **Config**: Custom Nginx with security headers, gzip, SPA routing
- **Health Check**: HTTP `GET /index.html`
- **Optimization**: Multi-stage, excludes node_modules in final image

### db.Dockerfile
- **Base**: PostgreSQL 16 Alpine
- **User**: `postgres` (built-in)
- **Health Check**: `pg_isready` (standard PostgreSQL check)
- **Port**: 5432 (internal only, not exposed)
- **Init**: Flyway migrations mounted at `/docker-entrypoint-initdb.d`

## 🔒 Security Features

### 1. **Non-Root Users**
```
✓ Backend runs as appuser:1001
✓ Frontend runs as nginx:1001
✓ Database runs as postgres:99 (built-in, non-root)
```

### 2. **Network Isolation**
```
✓ Frontend isolated on dmz-net (172.20.0.0/16)
  - Can communicate with Backend
  - Cannot reach Database
✓ Database isolated on data-net (172.21.0.0/16)
  - Backend is on both networks (gateway)
  - Frontend cannot access
✓ Custom bridge networks (not host network mode)
```

### 3. **Port Exposure**
```
✓ Port 80/443: Frontend only (public entry point)
✓ Port 8080: Backend (internal, no host binding)
✓ Port 5432: Database (internal, no host binding)
```

### 4. **Security Headers**
```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### 5. **Signal Handling**
```
✓ All services use dumb-init
✓ Graceful shutdown on SIGTERM
✓ JSON/Exec form for ENTRYPOINT (PID 1 signals)
```

### 6. **Health Checks**
```yaml
Backend:    wget --spider http://localhost:8080/actuator/health
Frontend:   wget --spider http://localhost/index.html
Database:   pg_isready -U user -d dbname
```

## 🧪 Testing & Verification

### Run All Security Checks
```bash
make docker-verify-security
```

### Check Network Isolation
```bash
make docker-inspect-networks
# Lists containers on each network, verifies no frontend-to-database route
```

### Test Container Connectivity
```bash
make docker-test-connectivity
# Backend → Database (nc postgres 5432)
# Frontend → Backend (wget http://backend:8080/health)
```

### Check Health Status
```bash
make docker-health
# Shows health check results for all containers
```

## 📊 Container Architecture

### Services
| Service | Image | User | Network | Ports |
|---------|-------|------|---------|-------|
| **backend** | eclipse-temurin:25-jre-alpine | appuser:1001 | dmz-net, data-net | 8080 (internal) |
| **frontend** | nginx:1.27-alpine | nginx:1001 | dmz-net | 80 (published) |
| **postgres** | postgres:16-alpine | postgres | data-net | 5432 (internal) |

### Volumes
| Volume | Mount | Purpose |
|--------|-------|---------|
| `postgres_data` | `/var/lib/postgresql/data` | Database persistence |
| `backend/target/.../migration` | `/docker-entrypoint-initdb.d` | Flyway migrations (ro) |

## 🐛 Troubleshooting

### Container won't start
```bash
make docker-logs              # Check error messages
make docker-status            # Verify health checks
```

### Backend can't reach database
```bash
make docker-shell-backend
# Inside container:
nc -vz postgres 5432          # Test DNS resolution
```

### Frontend shows API errors
```bash
make docker-shell-frontend
# Inside container:
wget http://backend:8080/     # Test backend access
curl http://backend:8080/actuator/health
```

### Network misconfiguration
```bash
make docker-inspect-networks  # Verify routing
docker network ls             # List all networks
docker network inspect <name> # Inspect specific network
```

## 🚀 Production Deployment

### Pre-Deploy Checklist
```bash
# 1. Validate configuration
make docker-validate

# 2. Run security checks
make docker-verify-security

# 3. Generate secure .env
make docker-env-prod
# Edit .env with production secrets

# 4. Build with production secrets
make docker-build

# 5. Verify all checks pass
make docker-verify-security
make docker-test-connectivity
```

### Scaling & High Availability
- Use Docker Compose override files for multi-instance setup
- Add reverse proxy/load balancer (HAProxy, Traefik)
- Implement container orchestration (Kubernetes)
- Store secrets in external vault (AWS Secrets Manager, HashiCorp Vault)

### Monitoring & Logging
```bash
# Container logs
docker logs <container>

# System metrics
docker stats

# Full stack logs
docker-compose logs --follow
```

## 📝 Notes

### Why No External Access to Backend/Database?
**Zero-Trust Principle**: Minimize attack surface by restricting network paths.
- Frontend is the only public entry point
- All API requests routed through Nginx reverse proxy
- Backend authenticates and authorizes all requests
- Database only accepts authenticated backend connections
- If frontend is compromised, attacker cannot directly access database

### Why Dual Networks?
- **DMZ-net**: Frontend communicates with business logic (Backend)
- **Data-net**: Backend communicates with data store (Database)
- Frontend isolated from data storage → limits lateral movement

### Flyway Migrations
Migrations run automatically on database startup:
```bash
# File structure
backend/target/classes/db/migration/
├── V1__Initial_Schema.sql
├── V2__Add_Email_Verification.sql
├── V3__Add_Feedback_Table.sql
└── ...

# Mounted as read-only into /docker-entrypoint-initdb.d
```

## 🆘 Support

For issues, check:
1. Logs: `make docker-logs`
2. Health: `make docker-status`
3. Networks: `make docker-inspect-networks`
4. Config: `make docker-show-config`
