import { NextResponse } from "next/server";
import { forwardJson, getAdminApiBaseUrl, readJsonBody } from "../_utils";

export async function POST(request) {
  const body = await readJsonBody(request);
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/admin/token`;

  const { response, parsed } = await forwardJson({
    url,
    method: "POST",
    body: body ?? {},
    headers: {
      Authorization: request.headers.get("authorization") ?? "",
    },
  });

  return NextResponse.json(parsed ?? null, { status: response.status });
}

