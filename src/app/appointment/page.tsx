import { permanentRedirect } from "next/navigation";
import { resolveStaticPageLocale } from "../../lib/resolveStaticPageLocale.js";

export default async function AppointmentRedirect() {
  const locale = await resolveStaticPageLocale();
  permanentRedirect(`/${locale}/appointment`);
}
