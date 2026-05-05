/**
 * Public IP from ipify.org with backend fallback.
 * Note: on the server this is the deployment egress IP unless the caller is forwarding the real client IP.
 * @returns {Promise<string>}
 */
export async function getIpAddress() {
  const endpoints = [
    "https://api.ipify.org?format=json",
    "https://ipapi.co/json/",
    "https://api.my-ip.io/ip.json",
    "https://api.ip.sb/jsonip",
    'https://checkip.amazonaws.com',
  ];
  const errors = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
      });

      if (!response.ok) {
        errors.push(new Error(`Failed to fetch IP from ${endpoint}: ${response.status}`));
        continue;
      }

      const data = await response.json();
      if (typeof data?.ip === "string") {
        return data.ip;
      }
    } catch (error) {
      errors.push(error);
    }
  }

  console.error("Error fetching IP:", errors);
  return "";
}
