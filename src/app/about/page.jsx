import { permanentRedirect } from "next/navigation";
import { resolveStaticPageLocale } from "../../lib/resolveStaticPageLocale.js";

export default async function AboutRedirect() {
  const locale = await resolveStaticPageLocale();
  permanentRedirect(`/${locale}/about`);
}
