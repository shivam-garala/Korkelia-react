import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forwardJson, getAdminApiBaseUrl, getBearerAuthHeader, readJsonBody } from "../../_utils";

export async function PUT(request, context) {
  const id = context?.params?.id;
  const body = await readJsonBody(request);
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/api/admin/update/${encodeURIComponent(id)}`;

  const jar = await cookies();
  const token = jar.get("authToken")?.value;

  const { response, parsed } = await forwardJson({
    url,
    method: "PUT",
    body: body ?? {},
    headers: getBearerAuthHeader(token),
  });

  return NextResponse.json(parsed ?? null, { status: response.status });
}

export async function POST(request, context) {
  return PUT(request, context);
}

