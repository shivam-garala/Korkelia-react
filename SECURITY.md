# Security Implementation

This document outlines the security measures implemented in the application.

## 1. Robots.txt Configuration

The `robots.txt` file is configured to disallow crawlers from accessing sensitive paths:

```
User-agent: *
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /login
```

**Note:** `robots.txt` is a guideline for crawlers, not a security mechanism. All sensitive routes must be protected by authentication.

## 2. Route Protection

### Protected Routes
The following routes are protected by authentication middleware:

- `/dashboard/*` - Admin dashboard and all sub-routes
- `/admin/*` - Admin pages
- `/api/*` - API endpoints (except public routes like `/api/recaptcha`)

### Middleware Protection
The `middleware.js` file implements route protection:

- **Protected Routes**: Redirects to `/login` if no authentication token is present
- **API Routes**: Returns 401 Unauthorized for protected API routes without authentication
- **Login Route**: Redirects to `/dashboard` if user is already authenticated

### Route Configuration
Protected routes are defined in `src/routes/routes.js` and checked via `isProtectedPath()` function.

## 3. Authentication

### Token-Based Authentication
- Authentication tokens are stored in HTTP-only cookies (`authToken`)
- API routes verify tokens from cookies before processing requests
- Tokens are validated on the backend API

### Client-Side Protection
- Dashboard pages check authentication state using Redux store
- Unauthenticated users are redirected to login page
- Login page redirects authenticated users to dashboard

## 4. Rate Limiting

### Implementation
Rate limiting is implemented in `src/lib/rateLimit.js`:

- **Default Limits**: 100 requests per 15 minutes per IP
- **Login Endpoint**: Stricter limit of 5 requests per 15 minutes
- **In-Memory Storage**: Uses Map for rate limit tracking (consider Redis for production)

### Usage
Apply rate limiting to API routes:

```javascript
import { withRateLimit } from "../../../lib/rateLimit";

export const POST = withRateLimit(handler, {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
});
```

### Rate Limit Headers
Responses include rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds to wait before retrying (when rate limited)

## 5. API Security

### Authentication Required
All API routes under `/api/admin/*` require authentication:
- Token is extracted from cookies
- Token is forwarded to backend API as Bearer token
- Unauthorized requests return 401 status

### Public API Routes
The following routes are publicly accessible:
- `/api/recaptcha/verify` - reCAPTCHA verification

## 6. HTTPS Configuration

### Production Requirements
**IMPORTANT:** Ensure HTTPS is enabled in production:

1. **Next.js Configuration**: Set `NODE_ENV=production`
2. **Hosting Platform**: Configure SSL/TLS certificates
3. **Environment Variables**: Use secure environment variable management
4. **Cookie Security**: Cookies are set with `sameSite: "lax"` for CSRF protection

### Security Headers
Consider adding security headers via `next.config.js` or middleware:
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`

## 7. Best Practices

### Authentication
- ✅ Tokens stored in HTTP-only cookies
- ✅ Server-side token validation
- ✅ Protected routes checked in middleware
- ✅ Client-side authentication state management

### Authorization
- ⚠️ **TODO**: Implement role-based access control (RBAC) if needed
- ⚠️ **TODO**: Add permission checks for specific actions

### Rate Limiting
- ✅ Basic rate limiting implemented
- ⚠️ **TODO**: Consider Redis-based rate limiting for production
- ⚠️ **TODO**: Implement different limits for different endpoints

### Security Headers
- ⚠️ **TODO**: Add security headers middleware
- ⚠️ **TODO**: Configure CSP (Content Security Policy)

### Monitoring
- ⚠️ **TODO**: Implement logging for failed authentication attempts
- ⚠️ **TODO**: Set up monitoring for suspicious activity
- ⚠️ **TODO**: Implement alerting for rate limit violations

## 8. Security Checklist

- [x] Robots.txt configured to disallow sensitive paths
- [x] Protected routes require authentication
- [x] API routes protected by middleware
- [x] Rate limiting implemented for API routes
- [x] Login endpoint has stricter rate limiting
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Role-based access control (if needed)
- [ ] Security monitoring and logging
- [ ] Regular security audits

## 9. Production Deployment

Before deploying to production:

1. **Enable HTTPS**: Ensure SSL/TLS certificates are configured
2. **Environment Variables**: Secure all sensitive environment variables
3. **Rate Limiting**: Consider upgrading to Redis-based rate limiting
4. **Security Headers**: Add security headers middleware
5. **Monitoring**: Set up security monitoring and alerting
6. **Backup**: Ensure regular backups of critical data
7. **Updates**: Keep dependencies updated for security patches

## 10. Incident Response

If a security issue is discovered:

1. Immediately assess the scope and impact
2. Contain the issue (disable affected features if necessary)
3. Notify relevant stakeholders
4. Document the incident
5. Implement fixes and verify
6. Review and improve security measures

---

**Last Updated**: 2025-01-12
**Maintained By**: Development Team

