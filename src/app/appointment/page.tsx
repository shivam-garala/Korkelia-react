"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
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

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, parameters: Record<string, unknown>) => number;
      reset: (optWidgetId?: number) => void;
    };
  }
}

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

const isWeekendDay = (date) => {
  if (!date) return false;
  const weekday = date.getDay();
  return weekday === 0;
};

const isPastDay = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);
  return candidate < today;
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
          email: "Sähköposti",
          phone: "Puhelinnumero (sis. maakoodin)",
          appointmentDate: "Valitse paiva",
          appointmentDatePlaceholder: "Valitse paiva",
          appointmentSlot: "Valitse aikavali",
          appointmentSlotPlaceholder: "Valitse aikavali",
          captchaLabel: "Captcha",
          captchaRequired: "Captcha on pakollinen.",
          captchaFailed: "Captcha tarkistus epaonnistui.",
          captchaLoadFailed: "Captcha lataus epaonnistui.",
          captchaMissingKey: "Captcha ei ole asetettu.",
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
          phone: "Phone Number (Including Country Code)",
          appointmentDate: "Select Date",
          appointmentDatePlaceholder: "Select a date",
          appointmentSlot: "Select Time Slot",
          appointmentSlotPlaceholder: "Select a time slot",
          captchaLabel: "Captcha",
          captchaRequired: "Captcha is required.",
          captchaFailed: "Captcha verification failed.",
          captchaLoadFailed: "Captcha failed to load. Please refresh.",
          captchaMissingKey: "Captcha is not configured.",
          details: "Please describe the jewelry item you are interested in",
          submit: "Submit",
        };
  const weekendMessage =
    languageKey === "fi"
      ? "Sunnuntai ei ole varattavissa."
      : "Sunday is not available.";
  const pastDateMessage =
    languageKey === "fi"
      ? "Vain tulevat paivat ovat saatavilla."
      : "Only future dates are available.";
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [slotOptions, setSlotOptions] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaLoadError, setRecaptchaLoadError] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

  const resetRecaptcha = () => {
    if (typeof window === "undefined") return;
    if (window.grecaptcha && typeof window.grecaptcha.reset === "function") {
      const widgetId = recaptchaWidgetId.current;
      if (typeof widgetId === "number") {
        window.grecaptcha.reset(widgetId);
      } else {
        window.grecaptcha.reset();
      }
    }
    setRecaptchaToken("");
  };

  const renderRecaptcha = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!siteKey || !recaptchaRef.current) return;
    if (!window.grecaptcha || typeof window.grecaptcha.render !== "function") return;
    if (recaptchaWidgetId.current !== null) return;
    try {
      recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        callback: (token) => setRecaptchaToken(token),
        "expired-callback": () => setRecaptchaToken(""),
        "error-callback": () => setRecaptchaToken(""),
      });
      setRecaptchaLoadError(false);
    } catch (error) {
      setRecaptchaLoadError(true);
    }
  }, [setRecaptchaLoadError, setRecaptchaToken, siteKey]);

  useEffect(() => {
    renderRecaptcha();
  }, [renderRecaptcha]);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;
    const tryRender = () => {
      if (cancelled || recaptchaWidgetId.current !== null) return;
      if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
        renderRecaptcha();
        return;
      }
      attempts += 1;
      if (attempts >= maxAttempts) {
        setRecaptchaLoadError(true);
        return;
      }
      setTimeout(tryRender, 200);
    };
    tryRender();
    return () => {
      cancelled = true;
    };
  }, [renderRecaptcha, siteKey]);

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
    if (isPastDay(date)) {
      toast.error(pastDateMessage);
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
    if (!appointmentDateValue) {
      toast.error(weekendMessage);
      return;
    }
    if (isPastDay(appointmentDateValue)) {
      toast.error(pastDateMessage);
      return;
    }
    if (isWeekendDay(appointmentDateValue)) {
      toast.error(weekendMessage);
      return;
    }
    if (!siteKey) {
      toast.error(labels.captchaMissingKey);
      return;
    }
    if (!recaptchaToken) {
      toast.error(labels.captchaRequired);
      return;
    }
    setSubmitting(true);
    let captchaValid = false;
    try {
      const verifyResponse = await fetch("/api/recaptcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recaptchaToken }),
      });
      const verifyData = await verifyResponse.json();
      captchaValid = verifyResponse.ok && Boolean(verifyData?.success);
    } catch (error) {
      captchaValid = false;
    }
    if (!captchaValid) {
      toast.error(labels.captchaFailed);
      resetRecaptcha();
      setSubmitting(false);
      return;
    }
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
        recaptcha_token: recaptchaToken,
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
      resetRecaptcha();
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
      resetRecaptcha();
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
                  filterDate={(date) => !isWeekendDay(date) && !isPastDay(date)}
                  minDate={new Date()}
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
              <div className={`${styles.recaptchaRow} ${styles.fullRow}`}>
                <div className={styles.recaptchaHeader}>
                  <span className={fieldStyles.label}>{labels.captchaLabel}</span>
                </div>
                {siteKey ? (
                  recaptchaLoadError ? (
                    <p className={styles.recaptchaError}>{labels.captchaLoadFailed}</p>
                  ) : (
                    <div className={styles.recaptchaWidget} ref={recaptchaRef} />
                  )
                ) : (
                  <p className={styles.recaptchaError}>{labels.captchaMissingKey}</p>
                )}
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
      {siteKey ? (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={renderRecaptcha}
          onReady={renderRecaptcha}
          onError={() => setRecaptchaLoadError(true)}
        />
      ) : null}
      <SiteFooter />
    </div>
  );
}
