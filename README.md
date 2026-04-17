# Blog App

A full-stack blog application with React frontend and Spring Boot backend.

## Quick Start

### Using Makefile (Recommended)

**Start the application:**
```bash
make docker-up
```

**Build images:**
```bash
make docker-build
```

**Stop the application:**
```bash
make docker-down
```

**View logs:**
```bash
make docker-logs          # all services
make docker-logs-backend  # backend only
make docker-logs-frontend # frontend only
make docker-logs-db       # database only
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: Internal only 
- **Database**: PostgreSQL (internal)

## Access & Usage

- **Application**: http://localhost:3000
- **Register**: Create a new user account
- **Admin Registration Code**: `282828282` (use this code when registering to create an admin account)

## Project Structure

- `backend/` - Spring Boot application (Java)
- `frontend/` - React TypeScript application
- `docker-compose.yml` - Multi-container setup
- `Makefile` - Convenient build commands
