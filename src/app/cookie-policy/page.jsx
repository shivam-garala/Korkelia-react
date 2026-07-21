import { permanentRedirect } from "next/navigation";

export default function CookiePolicyRedirect() {
  permanentRedirect("/en/cookie-policy");
}
