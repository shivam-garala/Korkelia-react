import { permanentRedirect } from "next/navigation";
import { resolveStaticPageLocale } from "../../lib/resolveStaticPageLocale.js";

export default async function ContactRedirect() {
  const locale = await resolveStaticPageLocale();
  permanentRedirect(`/${locale}/contact`);
}
