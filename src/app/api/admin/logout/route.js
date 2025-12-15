import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forwardJson, getAdminApiBaseUrl } from "../_utils";

export async function POST() {
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/admin/logout`;

  const jar = await cookies();
  const token = jar.get("authToken")?.value;

  const { response, parsed } = await forwardJson({
    url,
    method: "POST",
    body: {},
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const res = NextResponse.json(parsed ?? null, { status: response.status });
  res.cookies.set("authToken", "", { path: "/", maxAge: 0 });
  res.cookies.set("userName", "", { path: "/", maxAge: 0 });
  return res;
}

