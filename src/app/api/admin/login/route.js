import { NextResponse } from "next/server";
import { extractToken, forwardJson, getAdminApiBaseUrl, readJsonBody } from "../_utils";

export async function POST(request) {
  const body = await readJsonBody(request);
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/admin/login`;

  const { response, parsed } = await forwardJson({
    url,
    method: "POST",
    body: body ?? {},
  });

  if (!response.ok) {
    return NextResponse.json(parsed ?? { message: "Login failed." }, { status: response.status });
  }

  const token = extractToken(parsed);
  return NextResponse.json({ ...(parsed ?? {}), token }, { status: 200 });
}

