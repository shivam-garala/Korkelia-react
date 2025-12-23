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
  appointment: "",
  details: "",
};

const getOrdinalSuffix = (day) => {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatDateLabel = (date) => {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  return `${day}${getOrdinalSuffix(day)} ${month} | ${weekday}`;
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
          email: "Sahkopostiosoite",
          phone: "Puhelinnumero (sis. maakoodin)",
          appointment: "Varaa aikaikkuna",
          appointmentPlaceholder: "Valitse paiva ja aikavali",
          details: "Kuvaile koru, josta olet kiinnostunut",
          submit: "Laheta",
        }
      : {
          heading: "MAKE AN APPOINTMENT",
          subtitle: null,
          firstName: "First Name",
          lastName: "Last Name",
          country: "Country",
          email: "Email",
          phone: "Phone Number (With Country Code)",
          appointment: "Book a time slot",
          appointmentPlaceholder: "Select a Date & Time Slot",
          details: "Please describe the jewelry item you are interested in",
          submit: "Submit",
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
  const dateOptions = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        value: date.toISOString().slice(0, 10),
        label: formatDateLabel(date),
      };
    });
  }, []);
  const appointmentOptions = useMemo(
    () =>
      dateOptions.flatMap((date) =>
        slotOptions.map((slot) => ({
          value: `${date.value}|${slot.value}`,
          label: `${date.label} | ${slot.label}`,
        }))
      ),
    [dateOptions, slotOptions]
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
            <h2 className={styles.heading}>{labels.heading}</h2>
            {labels.subtitle ? <p className={styles.subtitle}>{labels.subtitle}</p> : null}
          </div>

          <form className={styles.form} action="#" onSubmit={(event) => event.preventDefault()}>
            <div className={styles.formGrid}>
              <TextField
                label={labels.firstName}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
              <TextField
                label={labels.lastName}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
              <TextField
                label={labels.country}
                name="country"
                value={form.country}
                onChange={handleChange}
              />
              <TextField
                label={labels.email}
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                label={labels.phone}
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <SelectField
                label={labels.appointment}
                name="appointment"
                placeholder={labels.appointmentPlaceholder}
                value={form.appointment}
                onChange={handleChange}
                options={appointmentOptions}
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
            <div className={styles.actions}>
              <button type="submit" className={styles.submitButton}>
                {labels.submit}
              </button>
            </div>
          </form>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
