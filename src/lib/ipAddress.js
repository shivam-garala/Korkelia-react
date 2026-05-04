/**
 * Public IP from ipify.org. Works in the browser and in Node (Route Handlers).
 * Note: on the server this is the deployment egress IP unless the caller is forwarding the real client IP.
 * @returns {Promise<string>}
 */
export async function getIpAddress() {
  try {
    const response = await fetch("https://localhost:5000/api/geoIp/ggg", {
      cache: "no-store",
      mode: "no-cors",
    });
    const data = await response.json();
    console.log("99-0-=090", data);
    return typeof data?.ip === "string" ? data.ip : "";
  } catch (error) {
    console.error("Error fetching IP:", error);
    return "";
  }
}
