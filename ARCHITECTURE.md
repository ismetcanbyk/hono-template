# Architecture Documentation

## Overview

This backend service is built with TypeScript, Hono, and Better Auth, following modern clean architecture principles. The codebase is organized into distinct layers with clear separation of concerns.

## Project Structure

```
src/
├── index.ts                    # Application entry point
├── app.ts                      # Application factory
├── server.ts                   # Server lifecycle management
├── config/                     # Configuration layer
│   ├── auth.config.ts         # Authentication configuration
│   ├── database.config.ts     # Database connection management
│   ├── environment.config.ts  # Environment variables validation
│   └── index.ts               # Unified config exports
├── core/                       # Core application logic
│   ├── middlewares/           # Middleware functions
│   │   ├── auth.middleware.ts
│   │   ├── cors.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── metrics.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── security.middleware.ts
│   │   └── index.ts
│   └── types/                 # Type definitions
│       └── app.types.ts
├── routes/                     # Route definitions
│   ├── v1/                    # API version 1
│   │   ├── api.route.ts
│   │   ├── auth.route.ts
│   │   ├── example.route.ts
│   │   └── index.ts
│   ├── health.route.ts
│   └── index.ts
└── schemas/                    # Validation schemas
    └── test.schema.ts
```

## Architecture Layers

### 1. Entry Point Layer (`index.ts`)

The application entry point follows the **Bootstrap Pattern**, orchestrating:
- Database connection initialization
- Authentication configuration
- Application factory instantiation
- Server startup

**Key Features:**
- Async initialization
- Error handling for startup failures
- Clean, sequential bootstrap process

### 2. Application Factory (`app.ts`)

Implements the **Factory Pattern** to create and configure the Hono application instance.

**Middleware Registration Order:**
1. **Metrics** - Prometheus metrics collection
2. **Logger** - Request/response logging (Pino)
3. **Security** - ETag and secure headers
4. **CORS** - Cross-origin resource sharing
5. **Rate Limiting** - Request throttling
6. **Pretty JSON** - JSON response formatting
7. **Authentication** - Session management
8. **Routes** - Application routes
9. **Error Handler** - Global error handling (must be last)

### 3. Server Management (`server.ts`)

Manages server lifecycle with:
- **Graceful Shutdown** - Clean shutdown on signals (SIGINT, SIGTERM)
- **Error Handling** - Uncaught exceptions and unhandled rejections
- **Database Cleanup** - Proper connection closure
- **Logging** - Server status information

### 4. Configuration Layer (`config/`)

Centralized configuration management with:

#### Environment Configuration
- Type-safe environment variables using `@t3-oss/env-core`
- Runtime validation with Zod schemas
- Support for development, production, and test environments

#### Database Configuration
- **Singleton Pattern** for connection management
- Connection pooling (min: 5, max: 10)
- Health check capabilities
- Graceful disconnect

#### Authentication Configuration
- Better Auth integration
- MongoDB adapter
- Email/password authentication
- OAuth providers (Google, Facebook)
- OpenAPI plugin support

### 5. Core Layer (`core/`)

#### Middlewares
Each middleware is separated into its own file for better maintainability:

- **auth.middleware.ts** - Session attachment to context
- **cors.middleware.ts** - CORS policy configuration
- **error-handler.middleware.ts** - Global error handling with specialized handlers for:
  - HTTP exceptions
  - Zod validation errors
  - MongoDB errors (duplicate keys, validation, cast errors)
  - Generic errors
- **logger.middleware.ts** - Pino-based request logging
- **metrics.middleware.ts** - Prometheus metrics
- **rate-limit.middleware.ts** - Request rate limiting
- **security.middleware.ts** - Security headers and ETag

#### Types
Type definitions for application-wide use, including Hono context extensions.

### 6. Routes Layer (`routes/`)

#### API Versioning
Routes are organized by version (v1, v2, etc.) to support:
- Backward compatibility
- Gradual migration
- Clear API evolution

#### Route Organization
- **Health Routes** - Application health checks (liveness, readiness)
- **API Routes** - Business logic endpoints
- **Auth Routes** - Authentication endpoints
- **Example Routes** - Error handling demonstrations

### 7. Schemas Layer (`schemas/`)

Zod schemas for request/response validation:
- Type-safe validation
- Automatic TypeScript type inference
- Consistent error messages

## Design Patterns

### 1. Factory Pattern
- **Application Factory** (`createApp`) - Creates configured Hono instances
- **Route Factories** - Creates route groups with dependencies

### 2. Singleton Pattern
- **Database Manager** - Single database connection instance
- **Configuration** - Single environment configuration

### 3. Dependency Injection
- Routes receive auth instance via factory functions
- Middleware factories accept dependencies as parameters

### 4. Separation of Concerns
- Configuration separated from business logic
- Middleware isolated into individual files
- Routes organized by domain and version

## API Versioning Strategy

### Current Version: v1
- Base path: `/api/v1`
- All v1 endpoints are under this prefix

### Adding New Versions
1. Create new folder: `src/routes/v2/`
2. Copy and modify existing routes
3. Register in main routes: `routes.route("/api/v2", createV2Routes(auth))`
4. Maintain v1 for backward compatibility

## Error Handling

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: string,        // Error code (e.g., "VALIDATION_ERROR")
    message: string,     // Human-readable message
    details?: unknown   // Additional error details (dev only)
  },
  timestamp: string     // ISO 8601 timestamp
}
```

### Error Types
- **HTTP Exceptions** - Status-specific errors (401, 403, 404, etc.)
- **Validation Errors** - Zod schema validation failures
- **Database Errors** - MongoDB-specific errors
- **Generic Errors** - Catch-all for unexpected errors

## Health Checks

### Endpoints
- `GET /health` - Overall health status with dependency checks
- `GET /health/liveness` - Kubernetes liveness probe
- `GET /health/readiness` - Kubernetes readiness probe

### Response Format
```typescript
{
  status: "healthy" | "unhealthy" | "alive" | "ready",
  timestamp: string,
  checks?: {
    database: "connected" | "disconnected"
  }
}
```

## Metrics

Prometheus metrics available at `GET /metrics`:
- Request count
- Request duration
- Response status codes
- Active connections

## Security Features

1. **Secure Headers** - XSS, clickjacking, MIME-sniffing protection
2. **CORS** - Configurable cross-origin policies
3. **Rate Limiting** - IP-based request throttling
4. **ETag** - Efficient caching
5. **Authentication** - Session-based auth with Better Auth

## Development Workflow

### Adding a New Route
1. Create route file in `src/routes/v1/feature.route.ts`
2. Define Hono router with typed context
3. Add validation schemas in `src/schemas/`
4. Register in `src/routes/v1/index.ts`

### Adding Middleware
1. Create file in `src/core/middlewares/feature.middleware.ts`
2. Export middleware function
3. Export from `src/core/middlewares/index.ts`
4. Register in `src/app.ts` middleware chain

### Adding Configuration
1. Add environment variable to `src/config/environment.config.ts`
2. Use validated config via `import { env } from "@/config"`

## Best Practices

1. **Always use factories** - Pass dependencies explicitly
2. **Type everything** - Leverage TypeScript for safety
3. **Validate early** - Use Zod schemas for all inputs
4. **Fail fast** - Validate environment on startup
5. **Log appropriately** - Use console.info/warn/error (not console.log)
6. **Handle errors gracefully** - Use typed error responses
7. **Version your APIs** - Plan for evolution
8. **Document your code** - JSDoc comments for public APIs

## Testing Strategy

### Unit Tests
- Test individual functions and middleware
- Mock dependencies
- Focus on business logic

### Integration Tests
- Test route handlers end-to-end
- Use test database
- Verify response formats

### E2E Tests
- Test complete user flows
- Test authentication
- Test error scenarios

## Deployment

### Environment Variables Required
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=mongodb://...
BETTER_AUTH_SECRET=<32+ char secret>
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
FACEBOOK_CLIENT_ID=<optional>
FACEBOOK_CLIENT_SECRET=<optional>
```

### Health Check Endpoints
Configure your load balancer/orchestrator:
- **Liveness**: `GET /health/liveness`
- **Readiness**: `GET /health/readiness`

### Graceful Shutdown
The server handles SIGINT and SIGTERM signals:
1. Stop accepting new connections
2. Complete in-flight requests
3. Close database connections
4. Exit cleanly

## Monitoring

### Metrics Collection
Integrate Prometheus to scrape `/metrics` endpoint

### Log Aggregation
Configure Pino transports for:
- CloudWatch
- Elasticsearch
- Datadog
- Other log aggregation services

### Alerts
Set up alerts for:
- High error rates
- Database connection failures
- Rate limit triggers
- Health check failures

