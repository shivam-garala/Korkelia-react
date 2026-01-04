import { NextResponse } from "next/server";

function normalizeBaseUrl(value) {
  if (!value) return null;
  return String(value).replace(/\/+$/, "");
}

function getApiBaseUrl() {
  const baseUrl = normalizeBaseUrl(
    process.env.NEXT_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_BASE_API_URL
  );
  if (!baseUrl) {
    throw new Error(
      "Missing env var NEXT_BASE_API_URL (or NEXT_PUBLIC_API_URL / NEXT_PUBLIC_BASE_API_URL)"
    );
  }
  return baseUrl;
}

async function forwardJson({ url, method }) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const raw = await response.text();
  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = raw ? { message: raw } : null;
  }

  return { response, parsed };
}

export async function GET(_request, context) {
  const id = context?.params?.id;
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/product/readOne/${encodeURIComponent(id)}`;

  const { response, parsed } = await forwardJson({
    url,
    method: "GET",
  });

  return NextResponse.json(parsed ?? null, { status: response.status });
}
