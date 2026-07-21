import { NextResponse } from "next/server";
import { getIpAddress } from "../../../lib/ipAddress.js";
export const dynamic = "force-dynamic";

/** Dedupe parallel `/api/geo` hits for the same IP (e.g. Strict Mode, double fetch). */
const inflight = new Map();
/** Short TTL cache so repeat requests do not hammer third-party rate limits. */
const cache = new Map();
const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 300;

function normalizeBaseUrl(value) {
  if (!value) return null;
  return String(value).replace(/\/+$/, "");
}

function getBackendBaseUrl() {
  return normalizeBaseUrl(
    process.env.NEXT_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_BASE_API_URL,
  );
}

function isPrivateOrLoopback(ip) {
  if (!ip) return true;

  const value = ip.replace(/^::ffff:/, "");
  if (value === "::1" || value === "127.0.0.1") return true;
  if (value.startsWith("10.") || value.startsWith("192.168.")) return true;

  const match = value.match(/^172\.(\d+)\./);
  if (match) {
    const octet = parseInt(match[1], 10);
    if (octet >= 16 && octet <= 31) return true;
  }

  return false;
}

function getPublicIpFromHeaders(headers) {
  const candidates = [
    headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    headers.get("x-real-ip"),
    headers.get("cf-connecting-ip"),
    headers.get("true-client-ip"),
  ].filter(Boolean);

  return candidates.find((ip) => !isPrivateOrLoopback(ip)) ?? null;
}

function cacheGet(ip) {
  const row = cache.get(ip);
  if (!row) return null;
  if (Date.now() - row.at > CACHE_TTL_MS) {
    cache.delete(ip);
    return null;
  }
  return row.payload;
}

function cacheSet(ip, payload) {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  cache.set(ip, { at: Date.now(), payload });
}

async function resolveGeoPayload(ip) {
  const base = getBackendBaseUrl();
  if (!base) {
    return {
      countryCode: null,
      currencyCode: null,
      ip,
      source: "failed",
    };
  }

  const url = `${base}/api/geoIp/lookup`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip }),
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        countryCode: null,
        currencyCode: null,
        ip,
        source: "failed",
      };
    }

    const json = await res.json();
    if (json?.success === false) {
      return {
        countryCode: null,
        currencyCode: null,
        ip,
        source: "failed",
      };
    }

    const data = json?.data;
    if (!data) {
      return {
        countryCode: null,
        currencyCode: null,
        ip,
        source: "failed",
      };
    }
    if (data.found === false) {
      return {
        countryCode: null,
        currencyCode: null,
        ip,
        source: "not-found",
      };
    }

    let countryCode =
      typeof data.countryCode === "string"
        ? data.countryCode.trim().toUpperCase()
        : null;
    if (!countryCode && data.country?.isoCode) {
      countryCode = String(data.country.isoCode).trim().toUpperCase();
    }
    if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) {
      countryCode = null;
    }

    let currencyCode =
      typeof data.currencyCode === "string"
        ? data.currencyCode.trim().toUpperCase()
        : null;
    if (currencyCode && !/^[A-Z]{3}$/.test(currencyCode)) {
      currencyCode = null;
    }

    const resolvedIp =
      typeof data.ip === "string" && data.ip.trim() ? data.ip.trim() : ip;

    return {
      countryCode,
      currencyCode,
      ip: resolvedIp,
      source: countryCode ? "backend" : "failed",
    };
  } catch {
    return {
      countryCode: null,
      currencyCode: null,
      ip,
      source: "failed",
    };
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const testIp = url.searchParams.get("ip");

    const vercelCountry = request.headers.get("x-vercel-ip-country");
    if (vercelCountry && /^[A-Za-z]{2}$/.test(vercelCountry)) {
      const ipFromEdge =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        null;
      return NextResponse.json({
        countryCode: vercelCountry.toUpperCase(),
        ip: ipFromEdge,
        source: "edge",
      });
    }

    const headerIp = getPublicIpFromHeaders(request.headers);

    const ip = testIp || headerIp || (await getIpAddress());

    if (isPrivateOrLoopback(ip)) {
      return NextResponse.json({
        countryCode: null,
        ip: null,
        source: "local",
      });
    }

    const cached = cacheGet(ip);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    let pending = inflight.get(ip);
    if (!pending) {
      pending = resolveGeoPayload(ip)
        .then((payload) => {
          cacheSet(ip, payload);
          return payload;
        })
        .finally(() => {
          inflight.delete(ip);
        });
      inflight.set(ip, pending);
    }

    const payload = await pending;
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({
      countryCode: null,
      currencyCode: null,
      error: String(error?.message ?? error),
      source: "error",
    });
  }
}
