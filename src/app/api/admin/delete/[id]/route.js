import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forwardJson, getAdminApiBaseUrl, getBearerAuthHeader } from "../../_utils";

export async function DELETE(_request, context) {
  const id = context?.params?.id;
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/api/admin/delete/${encodeURIComponent(id)}`;

  const jar = await cookies();
  const token = jar.get("authToken")?.value;

  const { response, parsed } = await forwardJson({
    url,
    method: "DELETE",
    headers: getBearerAuthHeader(token),
  });

  return NextResponse.json(parsed ?? null, { status: response.status });
}

export async function POST(_request, context) {
  return DELETE(_request, context);
}

