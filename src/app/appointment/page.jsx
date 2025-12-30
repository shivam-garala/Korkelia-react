"use client";

import { useMemo, useState } from "react";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import SelectField from "../../components/ui/SelectField.jsx";
import TextField from "../../components/ui/TextField.jsx";
import fieldStyles from "../../components/ui/Fields.module.css";
import axiosClient from "../../lib/axiosClient.js";
import { toast } from "react-toastify";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const initialForm = {
  firstName: "",
  lastName: "",
  country: "",
  email: "",
  phone: "",
  appointmentDate: "",
  appointmentSlot: "",
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
          email: "Sahkopostiosoite",
          phone: "Puhelinnumero (sis. maakoodin)",
          appointmentDate: "Valitse paiva",
          appointmentDatePlaceholder: "Valitse paiva",
          appointmentSlot: "Valitse aikavali",
          appointmentSlotPlaceholder: "Valitse aikavali",
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
          appointmentDate: "Select Date",
          appointmentDatePlaceholder: "Select a date",
          appointmentSlot: "Select Time Slot",
          appointmentSlotPlaceholder: "Select a time slot",
          details: "Please describe the jewelry item you are interested in",
          submit: "Submit",
        };
  const weekendMessage =
    languageKey === "fi"
      ? "Lauantai ja sunnuntai eivat ole varattavissa."
      : "Saturday and Sunday are not available.";
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const slotOptions = useMemo(
    () => [
      { value: "10:00 AM - 12:00 PM", label: "10:00 AM - 12:00 PM" },
      { value: "12:00 PM - 2:00 PM", label: "12:00 PM - 2:00 PM" },
      { value: "2:00 PM - 4:00 PM", label: "2:00 PM - 4:00 PM" },
      { value: "4:00 PM - 6:00 PM", label: "4:00 PM - 6:00 PM" },
    ],
    []
  );
  const isWeekendDate = (value) => {
    if (!value) return false;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return false;
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "appointmentDate" && isWeekendDate(value)) {
      setForm((prev) => ({ ...prev, appointmentDate: "" }));
      toast.error(weekendMessage);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (isWeekendDate(form.appointmentDate)) {
      toast.error(weekendMessage);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        country: form.country.trim(),
        email: form.email.trim(),
        phone_number: form.phone.trim(),
        date: form.appointmentDate,
        time_slot: form.appointmentSlot,
        description: form.details.trim(),
      };
      const { data } = await axiosClient.post("/api/appointment/create", payload);
      const message =
        data?.message ??
        (languageKey === "fi"
          ? "Ajanvaraus lahetetty onnistuneesti."
          : "Appointment submitted successfully.");
      setForm(initialForm);
    } catch (error) {
      const data = error?.response?.data ?? null;
      const message =
        data?.message ??
        data?.error ??
        (languageKey === "fi"
          ? "Ajanvaraus epaonnistui. Yrita uudelleen."
          : "Appointment booking failed. Please try again.");
      toast.error(message);
      console.error("Appointment submit error", error);
    } finally {
      setSubmitting(false);
    }
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

          <form className={styles.form} action="#" onSubmit={handleSubmit}>
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
              <TextField
                label={labels.appointmentDate}
                name="appointmentDate"
                type="date"
                value={form.appointmentDate}
                onChange={handleChange}
              />
              <SelectField
                label={labels.appointmentSlot}
                name="appointmentSlot"
                placeholder={labels.appointmentSlotPlaceholder}
                value={form.appointmentSlot}
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
            <div className={styles.actions}>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                {submitting ? (languageKey === "fi" ? "Lahetaan..." : "Submitting...") : labels.submit}
              </button>
            </div>
          </form>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
