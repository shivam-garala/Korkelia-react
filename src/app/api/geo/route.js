import { NextResponse } from "next/server";
import { getIpAddress } from "../../../lib/ipAddress.js";
export const dynamic = "force-dynamic";

/** Dedupe parallel `/api/geo` hits for the same IP (e.g. Strict Mode, double fetch). */
const inflight = new Map();
/** Short TTL cache so repeat requests do not hammer third-party rate limits. */
const cache = new Map();
const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 300;

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


async function resolveGeoPayload(encoded, ip) {
  let countryCode = null;
  let source = "ipapi";
  let currencyCode = null;

  const geoRes = await fetch(`https://ipapi.co/${encoded}/json/`, {
    cache: "no-store",
  });

  if (geoRes.ok) {
    const geo = await geoRes.json();
    if (!geo?.error) {
      const code = geo?.country_code;
      const currency = geo?.currency ?? geo?.Currency;
      currencyCode =
        typeof currency === "string" ? currency.trim().toUpperCase() : null;
      countryCode = typeof code === "string" ? code.toUpperCase() : null;
    }
  }

  if (!countryCode) {
    const ipApiRes = await fetch(
      `http://ip-api.com/json/${encoded}?fields=status,message,countryCode,currency`,
      { cache: "no-store" },
    );
    if (ipApiRes.ok) {
      const data = await ipApiRes.json();
      if (data?.status === "success") {
        const code = data?.countryCode;
        const cur = data?.currency;
        if (typeof code === "string" && /^[A-Za-z]{2}$/.test(code)) {
          countryCode = code.toUpperCase();
          source = "ip-api";
        }
        if (typeof cur === "string" && /^[A-Za-z]{3}$/.test(cur)) {
          currencyCode = cur.trim().toUpperCase();
        }
      }
    }
  }

  if (!countryCode) {
    const fbRes = await fetch(
      `https://get.geojs.io/v1/ip/geo/${encoded}.json`,
      { cache: "no-store" },
    );
    if (fbRes.ok) {
      const data = await fbRes.json();
      const code = data?.country_code;
      countryCode = typeof code === "string" ? code.toUpperCase() : null;
      source = "geojs";
    }
  }

  return {
    countryCode,
    currencyCode,
    ip,
    source: countryCode ? source : "failed",
  };
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

    const headerIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip");

    const ip = testIp || headerIp || (await getIpAddress());

    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return NextResponse.json({
        countryCode: null,
        ip: null,
        source: "local",
      });
    }

    const encoded = encodeURIComponent(ip);

    const cached = cacheGet(ip);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    let pending = inflight.get(ip);
    if (!pending) {
      pending = resolveGeoPayload(encoded, ip)
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
