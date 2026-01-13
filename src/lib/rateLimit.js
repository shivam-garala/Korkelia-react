/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

const rateLimitStore = new Map();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Maximum requests per window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Get client identifier from request
 */
function getClientId(request) {
  // Try to get IP from various headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = forwarded?.split(",")[0]?.trim() || realIp || cfConnectingIp || "unknown";
  return ip;
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit middleware for API routes
 * @param {Request} request - The incoming request
 * @param {Object} options - Rate limit options
 * @returns {Object|null} - Returns error response object if rate limited, null otherwise
 */
export function rateLimit(request, options = {}) {
  const config = { ...RATE_LIMIT_CONFIG, ...options };
  const clientId = getClientId(request);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean up expired entries periodically (every 1000 requests)
  if (Math.random() < 0.001) {
    cleanupExpiredEntries();
  }

  const key = `ratelimit:${clientId}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null; // Not rate limited
  }

  // Increment count
  record.count += 1;

  if (record.count > config.maxRequests) {
    // Rate limited
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(config.maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
      },
      body: {
        message: "Too many requests. Please try again later.",
        retryAfter,
      },
    };
  }

  // Update store
  rateLimitStore.set(key, record);

  // Return rate limit headers
  return {
    status: null, // Not rate limited
    headers: {
      "X-RateLimit-Limit": String(config.maxRequests),
      "X-RateLimit-Remaining": String(config.maxRequests - record.count),
      "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
    },
  };
}

/**
 * Rate limit wrapper for API route handlers
 * @param {Function} handler - The route handler function
 * @param {Object} options - Rate limit options
 * @returns {Function} - Wrapped handler with rate limiting
 */
export function withRateLimit(handler, options = {}) {
  return async (request, context) => {
    const rateLimitResult = rateLimit(request, options);
    
    if (rateLimitResult?.status === 429) {
      return new Response(
        JSON.stringify(rateLimitResult.body),
        {
          status: rateLimitResult.status,
          headers: {
            "Content-Type": "application/json",
            ...rateLimitResult.headers,
          },
        }
      );
    }

    // Call the original handler
    const response = await handler(request, context);
    
    // Add rate limit headers to response
    if (rateLimitResult?.headers) {
      const headers = new Headers(response.headers);
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  };
}

