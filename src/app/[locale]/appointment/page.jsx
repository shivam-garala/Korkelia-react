import { notFound } from "next/navigation";
import AppointmentClient from "../../appointment/AppointmentClient.tsx";
import en from "../../../i18n/en.json";
import fi from "../../../i18n/fi.json";

const SUPPORTED_LOCALES = new Set(["en", "fi"]);
const dictionaries = { en, fi };

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isFi = locale === "fi";
  return {
    title: isFi ? "Varaa aika | Korkeila Helsinki" : "Make an Appointment | Korkeila Helsinki",
    description: isFi
      ? "Varaa henkilökohtainen tapaaminen tai virtuaalinen konsultaatio Korkeila Helsingin kanssa."
      : "Book a personal appointment or virtual consultation with Korkeila Helsinki.",
    alternates: {
      canonical: `/${locale}/appointment`,
      languages: {
        en: "/en/appointment",
        fi: "/fi/appointment",
        "x-default": "/en/appointment",
      },
    },
  };
}

export default async function LocalizedAppointmentPage({ params }) {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.has(locale)) notFound();
  const brandDescription = (dictionaries[locale] ?? dictionaries.en).footer.homeBrandDescription;
  return <AppointmentClient locale={locale} brandDescription={brandDescription} />;
}
