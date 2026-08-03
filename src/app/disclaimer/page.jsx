import { permanentRedirect } from "next/navigation";

export default function DisclaimerRedirect() {
  permanentRedirect("/en/disclaimer");
}
