# Hono Backend Template

A modern, production-ready backend template built with TypeScript, Hono, and Better Auth. Features clean architecture, comprehensive error handling, and built-in observability.

## ✨ Features

- 🚀 **Fast & Lightweight** - Built on Hono, one of the fastest web frameworks
- 🔐 **Authentication** - Better Auth with email/password and OAuth support
- 📊 **Observability** - Prometheus metrics, Pino logging, health checks
- 🛡️ **Security** - Rate limiting, CORS, secure headers, input validation
- 🏗️ **Clean Architecture** - Separation of concerns, dependency injection
- 🔄 **API Versioning** - Built-in support for versioned APIs
- ✅ **Type Safety** - End-to-end TypeScript with strict checks
- 🧪 **Production Ready** - Graceful shutdown, error handling, validation

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 4.4+
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=mongodb://localhost:27017/your-database

# Authentication
BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📚 Available Endpoints

### Core Endpoints
- `GET /` - API information
- `GET /health` - Health check with database status
- `GET /health/liveness` - Kubernetes liveness probe
- `GET /health/readiness` - Kubernetes readiness probe
- `GET /metrics` - Prometheus metrics

### API v1
- `POST /api/v1/validate-schema` - Test endpoint with validation
- `POST /api/v1/auth/*` - Authentication endpoints (Better Auth)
- `GET /api/v1/examples/*` - Example error handling endpoints

## 🏗️ Project Structure

```
src/
├── index.ts                    # Application entry point
├── app.ts                      # Application factory
├── server.ts                   # Server lifecycle management
├── config/                     # Configuration layer
│   ├── auth.config.ts         # Authentication setup
│   ├── database.config.ts     # Database connection
│   ├── environment.config.ts  # Environment validation
│   └── index.ts
├── core/                       # Core application logic
│   ├── middlewares/           # Middleware functions
│   └── types/                 # Type definitions
├── routes/                     # Route definitions
│   ├── v1/                    # API version 1
│   └── health.route.ts
└── schemas/                    # Validation schemas
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run linter
npm run format       # Format code
```

## 🛡️ Security Features

- **Rate Limiting** - 100 requests per 15 minutes per IP/token
- **CORS** - Configurable cross-origin policies
- **Secure Headers** - Protection against common vulnerabilities
- **Input Validation** - Zod schema validation on all inputs
- **Authentication** - Session-based auth with Better Auth
- **Error Sanitization** - Sensitive data hidden in production

## 📊 Monitoring

### Metrics
Prometheus metrics are available at `/metrics`:
- HTTP request duration
- Request count by method/status
- Active connections
- Custom business metrics

### Logging
Structured JSON logging with Pino:
- Request/response logging
- Error logging with stack traces
- Database operation logging
- Configurable log levels

### Health Checks
- `/health` - Overall application health
- `/health/liveness` - Is the app running?
- `/health/readiness` - Is the app ready to serve traffic?

## 🔐 Authentication

This template uses [Better Auth](https://better-auth.com/) with:
- Email/password authentication
- Google OAuth (optional)
- Facebook OAuth (optional)
- Session management
- OpenAPI documentation

### Auth Endpoints
- `POST /api/v1/auth/sign-up` - Register new user
- `POST /api/v1/auth/sign-in` - Login
- `POST /api/v1/auth/sign-out` - Logout
- `GET /api/v1/auth/session` - Get current session

## 🧪 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Error types handled:
- **Validation Errors** - Zod schema validation failures
- **HTTP Exceptions** - 4xx/5xx errors with proper status codes
- **Database Errors** - MongoDB-specific errors
- **Generic Errors** - Unexpected errors with stack traces (dev only)

## 🚢 Deployment

### Environment Variables

Ensure all required environment variables are set:
- `NODE_ENV` - Set to `production`
- `DATABASE_URL` - MongoDB connection string
- `BETTER_AUTH_SECRET` - Secure random string (32+ characters)
- `PORT` - Server port (default: 3000)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Kubernetes

Health check configuration:
```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/readiness
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## 📖 API Documentation

API documentation is auto-generated via Better Auth's OpenAPI plugin. Access it at:
- Development: `http://localhost:3000/api/v1/auth/openapi`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linter and tests
5. Submit a pull request

## 📝 License

MIT License - feel free to use this template for your projects!

## 🙏 Acknowledgments

Built with:
- [Hono](https://hono.dev/) - Fast web framework
- [Better Auth](https://better-auth.com/) - Authentication
- [Zod](https://zod.dev/) - Schema validation
- [Pino](https://getpino.io/) - Logging
- [Prometheus](https://prometheus.io/) - Metrics

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Happy coding! 🚀**
