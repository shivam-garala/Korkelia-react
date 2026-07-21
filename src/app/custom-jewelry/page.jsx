import { permanentRedirect } from "next/navigation";
import { resolveStaticPageLocale } from "../../lib/resolveStaticPageLocale.js";

export default async function CustomJewelryRedirect() {
  const locale = await resolveStaticPageLocale();
  permanentRedirect(`/${locale}/custom-jewelry`);
}
