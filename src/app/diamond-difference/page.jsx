import { permanentRedirect } from "next/navigation";
import { resolveStaticPageLocale } from "../../lib/resolveStaticPageLocale.js";

export default async function DiamondDifferenceRedirect() {
  const locale = await resolveStaticPageLocale();
  permanentRedirect(`/${locale}/diamond-difference`);
}
