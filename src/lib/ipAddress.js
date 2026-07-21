/**
 * Public IP from server-side providers.
 * Note: on the server this is the deployment egress IP unless the caller is forwarding the real client IP.
 * @returns {Promise<string>}
 */
export async function getIpAddress() {
  if (typeof window !== "undefined") {
    return "";
  }

  const endpoints = ["https://api.ipify.org?format=json", "https://api64.ipify.org?format=json", "https://ipapi.co/json/"];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (typeof data?.ip === "string") {
        return data.ip;
      }
    } catch (error) {
      if (endpoint === endpoints.at(-1)) {
        console.error("Error fetching IP:", error);
      }
    }
  }

  return "";
}
