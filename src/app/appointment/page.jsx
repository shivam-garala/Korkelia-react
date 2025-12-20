"use client";

import { useMemo, useState } from "react";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import SelectField from "../../components/ui/SelectField.jsx";
import TextField from "../../components/ui/TextField.jsx";
import fieldStyles from "../../components/ui/Fields.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const initialForm = {
  firstName: "",
  lastName: "",
  country: "",
  email: "",
  phone: "",
  date: "",
  slot: "",
  details: "",
};

export default function AppointmentPage() {
  const { language } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const labels =
    languageKey === "fi"
      ? {
          heading: "VARAA AIKA",
          subtitle: null,
          firstName: "Etunimi",
          lastName: "Sukunimi",
          country: "Maa",
          email: "Sähköpostiosoite",
          phone: "Puhelinnumero (sis. maakoodin)",
          date: "Valitse Päivämäärä",
          slot: "Valitse Aikaväli",
          slotPlaceholder: "Valitse aikaväli",
          details: "Kuvaile koru, josta olet kiinnostunut.",
        }
      : {
          heading: "MAKE AN APPOINTMENT",
          subtitle: null,
          firstName: "First Name",
          lastName: "Last Name",
          country: "Country",
          email: "Email",
          phone: "Phone Number (including country code)",
          date: "Select Date",
          slot: "Select Time Slot",
          slotPlaceholder: "Select a time slot",
          details: "Please describe the jewelry item you are interested in.",
        };
  const [form, setForm] = useState(initialForm);
  const slotOptions = useMemo(
    () => [
      { value: "10-12", label: "10:00 - 12:00" },
      { value: "12-14", label: "12:00 - 14:00" },
      { value: "14-16", label: "14:00 - 16:00" },
      { value: "16-18", label: "16:00 - 18:00" },
    ],
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h1 className={styles.heading}>{labels.heading}</h1>
            {labels.subtitle ? <p className={styles.subtitle}>{labels.subtitle}</p> : null}
          </div>

          <form className={styles.form} action="#" onSubmit={(event) => event.preventDefault()}>
            <div className={styles.formGrid}>
              <TextField
                label={labels.firstName}
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
              />
              <TextField
                label={labels.lastName}
                name="lastName"
                placeholder="Smith"
                value={form.lastName}
                onChange={handleChange}
              />
              <TextField
                label={labels.country}
                name="country"
                placeholder="Finland"
                value={form.country}
                onChange={handleChange}
              />
              <TextField
                label={labels.email}
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                label={labels.phone}
                name="phone"
                placeholder="+358 50 000 0000"
                value={form.phone}
                onChange={handleChange}
              />
              <TextField
                label={labels.date}
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
              <SelectField
                label={labels.slot}
                name="slot"
                placeholder={labels.slotPlaceholder}
                value={form.slot}
                onChange={handleChange}
                options={slotOptions}
              />
              <label className={`${fieldStyles.field} ${styles.fullRow}`}>
                <span className={fieldStyles.label}>{labels.details}</span>
                <textarea
                  className={`${fieldStyles.control} ${styles.textarea}`}
                  name="details"
                  rows={6}
                  value={form.details}
                  onChange={handleChange}
                />
              </label>
            </div>
          </form>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
