import { NextResponse } from "next/server";
import { extractToken, forwardJson, getAdminApiBaseUrl, readJsonBody } from "../_utils";
import { rateLimit } from "../../../lib/rateLimit";

export async function POST(request) {
  // Apply stricter rate limiting to login endpoint (5 requests per 15 minutes)
  const rateLimitResult = rateLimit(request, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (rateLimitResult?.status === 429) {
    return NextResponse.json(
      rateLimitResult.body,
      {
        status: rateLimitResult.status,
        headers: {
          "Content-Type": "application/json",
          ...rateLimitResult.headers,
        },
      }
    );
  }

  const body = await readJsonBody(request);
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/admin/login`;

  const { response, parsed } = await forwardJson({
    url,
    method: "POST",
    body: body ?? {},
  });

  if (!response.ok) {
    const errorResponse = NextResponse.json(parsed ?? { message: "Login failed." }, { status: response.status });
    // Add rate limit headers to error response
    if (rateLimitResult?.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
    }
    return errorResponse;
  }

  const token = extractToken(parsed);
  const successResponse = NextResponse.json({ ...(parsed ?? {}), token }, { status: 200 });
  
  // Add rate limit headers to success response
  if (rateLimitResult?.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      successResponse.headers.set(key, value);
    });
  }
  
  return successResponse;
}

