'use client';

import Dropdown from "../Home/Dropdown.jsx";
import { useI18n } from "../../providers/I18nProvider.jsx";

export default function LanguageDropdown() {
  const { language, setLanguage, t } = useI18n();

  return (
    <Dropdown
      ariaLabel={t("common.language")}
      leadingIcon="globe"
      value={language}
      onChange={setLanguage}
      options={[
        { value: "en", label: "English" },
        { value: "fi", label: "Finish" }
      ]}
    />
  );
}

