"use client";

import { useEffect, useState } from "react";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import SelectField from "../../components/ui/SelectField.jsx";
import TextField from "../../components/ui/TextField.jsx";
import fieldStyles from "../../components/ui/Fields.module.css";
import axiosClient from "../../lib/axiosClient.js";
import { toast } from "react-toastify";
import { useI18n } from "../../providers/I18nProvider.jsx";
import DatePicker from "react-datepicker";
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
  captcha: "",
};

const generateCaptcha = (length = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < length; i += 1) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }
  return text;
};

const isWeekendDay = (date) => {
  if (!date) return false;
  const weekday = date.getDay();
  return weekday === 0 || weekday === 6;
};

const parseDateValue = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateValue = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AppointmentPage() {
  const { language } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const languageId = language === "fi" ? "2" : "1";
  const labels =
    languageKey === "fi"
      ? {
          heading: "VARAA AIKA",
          subtitle: null,
          firstName: "Etunimi",
          lastName: "Sukunimi",
          country: "Maa",
          email: "Sahkopostiosoite",
          phone: "Puhelinnumero",
          appointmentDate: "Valitse paiva",
          appointmentDatePlaceholder: "Valitse paiva",
          appointmentSlot: "Valitse aikavali",
          appointmentSlotPlaceholder: "Valitse aikavali",
          captchaLabel: "Varmennekoodi",
          captchaInput: "Syota koodi",
          captchaPlaceholder: "Kirjoita koodi",
          captchaRefresh: "Paivita",
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
          phone: "Phone Number",
          appointmentDate: "Select Date",
          appointmentDatePlaceholder: "Select a date",
          appointmentSlot: "Select Time Slot",
          appointmentSlotPlaceholder: "Select a time slot",
          captchaLabel: "Captcha",
          captchaInput: "Enter Captcha",
          captchaPlaceholder: "Type the text",
          captchaRefresh: "Refresh",
          details: "Please describe the jewelry item you are interested in",
          submit: "Submit",
        };
  const weekendMessage =
    languageKey === "fi"
      ? "Lauantai ja sunnuntai eivat ole varattavissa."
      : "Saturday and Sunday are not available.";
  const captchaErrorMessage =
    languageKey === "fi"
      ? "Varmennekoodi ei vastaa. Yrita uudelleen."
      : "Captcha does not match. Please try again.";
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [slotOptions, setSlotOptions] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState("");

  const regenerateCaptcha = () => {
    setCaptchaText(generateCaptcha());
    setForm((prev) => ({ ...prev, captcha: "" }));
  };

  useEffect(() => {
    regenerateCaptcha();
  }, []);

  useEffect(() => {
    let active = true;
    const loadSlots = async () => {
      setSlotLoading(true);
      try {
        const { data } = await axiosClient.get(
          `/api/appointment/timeslots?language_id=${encodeURIComponent(languageId)}`
        );
        const slots = data?.data ?? data ?? [];
        if (!Array.isArray(slots) || !slots.length) {
          if (active) {
            setSlotOptions([]);
            setForm((prev) => ({ ...prev, appointmentSlot: "" }));
          }
          return;
        }
        const hasSelectedFlag = slots.some(
          (slot) =>
            slot &&
            typeof slot === "object" &&
            Object.prototype.hasOwnProperty.call(slot, "is_selected")
        );
        const selectedSlots = hasSelectedFlag
          ? slots.filter((slot) => {
              const value = slot?.is_selected;
              return value === true || value === 1 || value === "1" || value === "true";
            })
          : slots;
        const normalized = selectedSlots
          .map((slot) => {
            if (slot && typeof slot === "object") {
              return (
                slot.time_slot ??
                slot.slot ??
                slot.label ??
                slot.value ??
                slot.name ??
                ""
              );
            }
            return slot;
          })
          .map((slot) => String(slot).trim())
          .filter(Boolean)
          .map((slot) => ({ value: slot, label: slot }));
        const nextOptions = normalized;
        if (active) {
          setSlotOptions(nextOptions);
          setForm((prev) =>
            nextOptions.some((opt) => opt.value === prev.appointmentSlot)
              ? prev
              : { ...prev, appointmentSlot: "" }
          );
        }
      } catch (error) {
        if (active) {
          setSlotOptions([]);
          setForm((prev) => ({ ...prev, appointmentSlot: "" }));
        }
        const message =
          error?.response?.data?.message ??
          error?.response?.data?.error ??
          (languageKey === "fi"
            ? "Aikavalien lataus epaonnistui."
            : "Failed to load time slots.");
        toast.error(message);
        console.error("Appointment slots load error", error);
      } finally {
        if (active) setSlotLoading(false);
      }
    };
    loadSlots();
    return () => {
      active = false;
    };
  }, [languageKey, languageId]);
  const selectedDate = parseDateValue(form.appointmentDate);
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (date) => {
    if (!date) {
      setForm((prev) => ({ ...prev, appointmentDate: "" }));
      return;
    }
    if (isWeekendDay(date)) {
      toast.error(weekendMessage);
      setForm((prev) => ({ ...prev, appointmentDate: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, appointmentDate: formatDateValue(date) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const appointmentDateValue = parseDateValue(form.appointmentDate);
    if (!appointmentDateValue || isWeekendDay(appointmentDateValue)) {
      toast.error(weekendMessage);
      return;
    }
    const normalizedCaptcha = form.captcha.trim().toUpperCase();
    const expectedCaptcha = captchaText.trim().toUpperCase();
    if (!expectedCaptcha || normalizedCaptcha !== expectedCaptcha) {
      toast.error(captchaErrorMessage);
      regenerateCaptcha();
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
      const { data } = await axiosClient.post(
        `/api/appointment/create?language_id=${encodeURIComponent(languageId)}`,
        payload
      );
      const message =
        data?.message ??
        (languageKey === "fi"
          ? "Ajanvaraus lahetetty onnistuneesti."
          : "Appointment submitted successfully.");
      toast.success(message);
      setForm(initialForm);
      regenerateCaptcha();
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
                placeholder={labels.firstName}
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
              />
              <TextField
                label={labels.lastName}
                name="lastName"
                placeholder={labels.lastName}
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
              />
              <TextField
                label={labels.country}
                name="country"
                placeholder={labels.country}
                required
                autoComplete="country-name"
                value={form.country}
                onChange={handleChange}
              />
              <TextField
                label={labels.email}
                name="email"
                type="email"
                placeholder={labels.email}
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                label={labels.phone}
                name="phone"
                placeholder={labels.phone}
                required
                autoComplete="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={handleChange}
              />
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>{labels.appointmentDate}</span>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  placeholderText={labels.appointmentDatePlaceholder}
                  dateFormat="yyyy-MM-dd"
                  filterDate={(date) => !isWeekendDay(date)}
                  className={fieldStyles.control}
                  wrapperClassName={styles.datePickerWrapper}
                  popperClassName={styles.datePickerPopper}
                  calendarClassName={styles.datePickerCalendar}
                  popperPlacement="bottom-start"
                  portalId="react-datepicker-portal"
                  required
                  onChangeRaw={(event) => event.preventDefault()}
                />
              </label>
              <SelectField
                label={labels.appointmentSlot}
                name="appointmentSlot"
                placeholder={labels.appointmentSlotPlaceholder}
                required
                disabled={slotLoading || !slotOptions.length}
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
              <div className={`${styles.captchaRow} ${styles.fullRow}`}>
                <div className={styles.captchaHeader}>
                  <span className={fieldStyles.label}>{labels.captchaLabel}</span>
                  <button
                    className={styles.captchaRefresh}
                    type="button"
                    onClick={regenerateCaptcha}
                  >
                    {labels.captchaRefresh}
                  </button>
                </div>
                <div className={styles.captchaCodeRow}>
                  <div>
                    <div
                      className={`${fieldStyles.control} ${styles.captchaCode}`}
                      aria-live="polite"
                    >
                      {captchaText}
                    </div>
                  </div>
                  <div>
                    <TextField
                      label=""
                      name="captcha"
                      placeholder={labels.captchaPlaceholder}
                      required
                      value={form.captcha}
                      onChange={handleChange}
                      inputClassName={styles.captchaInput}
                      style={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeft: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
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
