'use client';

import Dropdown from "../Home/Dropdown.jsx";
import { useI18n } from "../../providers/I18nProvider.jsx";

export default function LanguageDropdown({ triggerClassName }) {
  const { language, setLanguage, t } = useI18n();
  const languageLabels =
    language === "fi"
      ? { en: "englanti", fi: "suomi" }
      : { en: "English", fi: "Finnish" };

  return (
    <Dropdown
      ariaLabel={t("common.language")}
      leadingIcon="globe"
      value={language}
      onChange={setLanguage}
      triggerClassName={triggerClassName}
      options={[
        {
          value: "en",
          label: languageLabels.en,
          icon: "/icons/uk.svg",
          iconAlt: "United Kingdom flag",
        },
        {
          value: "fi",
          label: languageLabels.fi,
          icon: "/icons/finland.svg",
          iconAlt: "Finland flag",
        },
      ]}
    />
  );
}
