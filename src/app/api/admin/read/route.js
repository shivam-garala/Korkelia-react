import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forwardJson, getAdminApiBaseUrl, getBearerAuthHeader } from "../_utils";

export async function GET() {
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/api/admin/read`;

  const jar = await cookies();
  const token = jar.get("authToken")?.value;

  const { response, parsed } = await forwardJson({
    url,
    method: "GET",
    headers: getBearerAuthHeader(token),
  });

  return NextResponse.json(parsed ?? null, { status: response.status });
}

