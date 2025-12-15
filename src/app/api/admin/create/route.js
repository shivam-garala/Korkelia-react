import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forwardJson, getAdminApiBaseUrl, getBearerAuthHeader, readJsonBody } from "../_utils";

export async function POST(request) {
  const body = await readJsonBody(request);
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/api/admin/create`;

  const jar = await cookies();
  const token = jar.get("authToken")?.value;

  const { response, parsed } = await forwardJson({
    url,
    method: "POST",
    body: body ?? {},
    headers: getBearerAuthHeader(token),
  });

  return NextResponse.json(parsed ?? null, { status: response.status });
}

