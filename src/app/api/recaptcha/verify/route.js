const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(request) {
  const secret = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return jsonResponse({ success: false, error: "missing-secret" }, 500);
  }

  let token = "";
  try {
    const payload = await request.json();
    token = payload?.token ?? "";
  } catch (error) {
    token = "";
  }

  if (!token) {
    return jsonResponse({ success: false, error: "missing-token" }, 400);
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return jsonResponse({ success: false, error: "verify-request-failed" }, 502);
    }

    return jsonResponse({
      success: Boolean(data?.success),
      score: data?.score ?? null,
      action: data?.action ?? null,
      errorCodes: data?.["error-codes"] ?? [],
    });
  } catch (error) {
    return jsonResponse({ success: false, error: "verify-request-error" }, 502);
  }
}
