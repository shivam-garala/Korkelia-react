"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import SelectField from "../../components/ui/SelectField.jsx";
import TextField from "../../components/ui/TextField.jsx";
import Button from "../../components/ui/Button.jsx";
import fieldStyles from "../../components/ui/Fields.module.css";
import axiosClient from "../../lib/axiosClient.js";
import { toast } from "react-toastify";
import { useI18n } from "../../providers/I18nProvider.jsx";
import DatePicker from "react-datepicker";
import styles from "./page.module.css";
// test comment
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
  phoneCode: "",
  email: "",
  phone: "",
  appointmentDate: "",
  appointmentSlot: "",
  details: "",
  appointmentType: "",
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

const normalizeSlotSelection = (value, options) => {
  if (!value) return "";
  const validValues = options.map((opt) => String(opt.value));
  return validValues.includes(String(value)) ? String(value) : "";
};

const STORE_TIMEZONE = "Europe/Helsinki";

const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
  AF: "Asia/Kabul",          AG: "America/Antigua",     AL: "Europe/Tirane",
  AM: "Asia/Yerevan",        AO: "Africa/Luanda",       AR: "America/Argentina/Buenos_Aires",
  AT: "Europe/Vienna",       AU: "Australia/Sydney",    AZ: "Asia/Baku",
  BA: "Europe/Sarajevo",     BB: "America/Barbados",    BD: "Asia/Dhaka",
  BE: "Europe/Brussels",     BF: "Africa/Ouagadougou",  BG: "Europe/Sofia",
  BH: "Asia/Bahrain",        BI: "Africa/Bujumbura",    BJ: "Africa/Porto-Novo",
  BN: "Asia/Brunei",         BO: "America/La_Paz",      BR: "America/Sao_Paulo",
  BS: "America/Nassau",      BT: "Asia/Thimphu",        BW: "Africa/Gaborone",
  BY: "Europe/Minsk",        BZ: "America/Belize",      CA: "America/Toronto",
  CD: "Africa/Kinshasa",     CF: "Africa/Bangui",       CG: "Africa/Brazzaville",
  CH: "Europe/Zurich",       CI: "Africa/Abidjan",      CL: "America/Santiago",
  CM: "Africa/Douala",       CN: "Asia/Shanghai",       CO: "America/Bogota",
  CR: "America/Costa_Rica",  CU: "America/Havana",      CV: "Atlantic/Cape_Verde",
  CY: "Asia/Nicosia",        CZ: "Europe/Prague",       DE: "Europe/Berlin",
  DJ: "Africa/Djibouti",     DK: "Europe/Copenhagen",   DO: "America/Santo_Domingo",
  DZ: "Africa/Algiers",      EC: "America/Guayaquil",   EE: "Europe/Tallinn",
  EG: "Africa/Cairo",        ER: "Africa/Asmara",       ES: "Europe/Madrid",
  ET: "Africa/Addis_Ababa",  FI: "Europe/Helsinki",     FJ: "Pacific/Fiji",
  FR: "Europe/Paris",        GA: "Africa/Libreville",   GB: "Europe/London",
  GD: "America/Grenada",     GE: "Asia/Tbilisi",        GH: "Africa/Accra",
  GM: "Africa/Banjul",       GN: "Africa/Conakry",      GQ: "Africa/Malabo",
  GR: "Europe/Athens",       GT: "America/Guatemala",   GW: "Africa/Bissau",
  GY: "America/Guyana",      HN: "America/Tegucigalpa", HR: "Europe/Zagreb",
  HT: "America/Port-au-Prince", HU: "Europe/Budapest",  ID: "Asia/Jakarta",
  IE: "Europe/Dublin",       IL: "Asia/Jerusalem",      IN: "Asia/Kolkata",
  IQ: "Asia/Baghdad",        IR: "Asia/Tehran",         IS: "Atlantic/Reykjavik",
  IT: "Europe/Rome",         JM: "America/Jamaica",     JO: "Asia/Amman",
  JP: "Asia/Tokyo",          KE: "Africa/Nairobi",      KG: "Asia/Bishkek",
  KH: "Asia/Phnom_Penh",    KI: "Pacific/Tarawa",      KM: "Indian/Comoro",
  KN: "America/St_Kitts",   KP: "Asia/Pyongyang",      KR: "Asia/Seoul",
  KW: "Asia/Kuwait",         KZ: "Asia/Almaty",         LA: "Asia/Vientiane",
  LB: "Asia/Beirut",         LC: "America/St_Lucia",    LI: "Europe/Vaduz",
  LK: "Asia/Colombo",        LR: "Africa/Monrovia",     LS: "Africa/Maseru",
  LT: "Europe/Vilnius",      LU: "Europe/Luxembourg",   LV: "Europe/Riga",
  LY: "Africa/Tripoli",      MA: "Africa/Casablanca",   MC: "Europe/Monaco",
  MD: "Europe/Chisinau",     ME: "Europe/Podgorica",    MG: "Indian/Antananarivo",
  MK: "Europe/Skopje",       ML: "Africa/Bamako",       MM: "Asia/Rangoon",
  MN: "Asia/Ulaanbaatar",    MR: "Africa/Nouakchott",   MT: "Europe/Malta",
  MU: "Indian/Mauritius",    MV: "Indian/Maldives",     MW: "Africa/Blantyre",
  MX: "America/Mexico_City", MY: "Asia/Kuala_Lumpur",   MZ: "Africa/Maputo",
  NA: "Africa/Windhoek",     NE: "Africa/Niamey",       NG: "Africa/Lagos",
  NI: "America/Managua",     NL: "Europe/Amsterdam",    NO: "Europe/Oslo",
  NP: "Asia/Kathmandu",      NR: "Pacific/Nauru",       NZ: "Pacific/Auckland",
  OM: "Asia/Muscat",         PA: "America/Panama",      PE: "America/Lima",
  PG: "Pacific/Port_Moresby",PH: "Asia/Manila",         PK: "Asia/Karachi",
  PL: "Europe/Warsaw",       PT: "Europe/Lisbon",       PW: "Pacific/Palau",
  PY: "America/Asuncion",    QA: "Asia/Qatar",          RO: "Europe/Bucharest",
  RS: "Europe/Belgrade",     RU: "Europe/Moscow",       RW: "Africa/Kigali",
  SA: "Asia/Riyadh",         SB: "Pacific/Guadalcanal", SC: "Indian/Mahe",
  SD: "Africa/Khartoum",     SE: "Europe/Stockholm",    SG: "Asia/Singapore",
  SI: "Europe/Ljubljana",    SK: "Europe/Bratislava",   SL: "Africa/Freetown",
  SM: "Europe/San_Marino",   SN: "Africa/Dakar",        SO: "Africa/Mogadishu",
  SR: "America/Paramaribo",  SS: "Africa/Juba",         ST: "Africa/Sao_Tome",
  SV: "America/El_Salvador", SY: "Asia/Damascus",       SZ: "Africa/Mbabane",
  TD: "Africa/Ndjamena",     TG: "Africa/Lome",         TH: "Asia/Bangkok",
  TJ: "Asia/Dushanbe",       TL: "Asia/Dili",           TM: "Asia/Ashgabat",
  TN: "Africa/Tunis",        TO: "Pacific/Tongatapu",   TR: "Europe/Istanbul",
  TT: "America/Port_of_Spain", TV: "Pacific/Funafuti",  TZ: "Africa/Dar_es_Salaam",
  UA: "Europe/Kiev",         UG: "Africa/Kampala",      US: "America/New_York",
  UY: "America/Montevideo",  UZ: "Asia/Tashkent",       VA: "Europe/Vatican",
  VC: "America/St_Vincent",  VE: "America/Caracas",     VN: "Asia/Ho_Chi_Minh",
  VU: "Pacific/Efate",       WS: "Pacific/Apia",        YE: "Asia/Aden",
  ZA: "Africa/Johannesburg", ZM: "Africa/Lusaka",       ZW: "Africa/Harare",
  AE: "Asia/Dubai",          UK: "Europe/London",
};

function convertSlotTime(timeStr: string, targetTz: string): string {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeStr;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;

  const now = new Date();
  const y = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const ref = new Date(
    `${y}-${mo}-${d}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`
  );

  const hkParts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(ref);
  const hkH = parseInt(hkParts.find((p) => p.type === "hour")!.value);
  const hkM = parseInt(hkParts.find((p) => p.type === "minute")!.value);
  const diffMs = (h * 60 + m - (hkH * 60 + hkM)) * 60000;
  const corrected = new Date(ref.getTime() + diffMs);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: targetTz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(corrected);
}

function convertSlotLabel(slotStr: string, targetTz: string): string {
  if (!targetTz || targetTz === STORE_TIMEZONE) return slotStr;
  const parts = slotStr.split(" to ");
  if (parts.length !== 2) return slotStr;
  try {
    const localStart = convertSlotTime(parts[0], targetTz);
    const localEnd = convertSlotTime(parts[1], targetTz);
    return `${localStart} to ${localEnd}`;
  } catch {
    return slotStr;
  }
}

function getTimezoneLabel(tz: string): string {
  try {
    const now = new Date();
    // Short abbreviation e.g. "EET", "IST", "GMT+3"
    const abbrParts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(now);
    const abbr = abbrParts.find((p) => p.type === "timeZoneName")?.value ?? tz;

    // Compute UTC offset in minutes by comparing formatted local time to UTC
    const utcStr = now.toLocaleString("en-US", { timeZone: "UTC" });
    const tzStr = now.toLocaleString("en-US", { timeZone: tz });
    const offsetMinutes = (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 60000;
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absMin = Math.abs(offsetMinutes);
    const hours = Math.floor(absMin / 60);
    const minutes = absMin % 60;
    const offset = `UTC ${sign} ${hours}:${minutes.toString().padStart(2, "0")}`;

    return `${abbr}, ${offset}`;
  } catch {
    return "EET, UTC + 2:00";
  }
}

export default function AppointmentPage() {
  const { language, t } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const languageId = language === "fi" ? "2" : "1";

  const [selectedCountryTz, setSelectedCountryTz] = useState<string>("");
  const [countryIsoMap, setCountryIsoMap] = useState<Record<string, string>>({});
  const [selectedSlotDisplayLabel, setSelectedSlotDisplayLabel] = useState<string>("");

  const timezoneLabel = useMemo(() => {
    if (!selectedCountryTz || selectedCountryTz === STORE_TIMEZONE) return "EET, UTC + 2:00";
    return getTimezoneLabel(selectedCountryTz);
  }, [selectedCountryTz]);

  const labels =
    languageKey === "fi"
      ? {
          heading: "VARAA AIKA",
          subtitle: null,
          firstName: "Etunimi",
          lastName: "Sukunimi",
          country: "Maa",
          countryLoadFailed: "Maiden lataus epaonnistui.",
          email: "Sähköposti",
          phone: "Puhelinnumero",
          appointmentDate: "Valitse paiva",
          appointmentDatePlaceholder: "Valitse paiva",
          appointmentSlot: `Valitse aikavali (Aikavyöhyke: ${timezoneLabel})`,
          appointmentSlotPlaceholder: "Valitse aikavali",
          captchaLabel: "Captcha",
          captchaRequired: "Captcha on pakollinen.",
          captchaFailed: "Captcha tarkistus epaonnistui.",
          captchaLoadFailed: "Captcha lataus epaonnistui.",
          captchaMissingKey: "Captcha ei ole asetettu.",
          details: "Kuvaile koru, josta olet kiinnostunut",
          submit: "Laheta",
          appointmentType: "Tapaamisen tyyppi",
          appointmentTypePlaceholder: "Valitse tyyppi",
          storeAppointment: "Myymäläkäynti",
          virtualAppointment: "Virtuaalinen tapaaminen",
        }
      : {
          heading: "MAKE AN APPOINTMENT",
          subtitle: null,
          firstName: "First Name",
          lastName: "Last Name",
          country: "Country",
          countryLoadFailed: "Failed to load countries.",
          email: "Email",
          phone: "Phone Number",
          appointmentDate: "Select Date",
          appointmentDatePlaceholder: "Select a date",
          appointmentSlot: `Select Time Slot (Timezone: ${timezoneLabel})`,
          appointmentSlotPlaceholder: "Select a time slot",
          captchaLabel: "Captcha",
          captchaRequired: "Captcha is required.",
          captchaFailed: "Captcha verification failed.",
          captchaLoadFailed: "Captcha failed to load. Please refresh.",
          captchaMissingKey: "Captcha is not configured.",
          details: "Please describe the jewelry item you are interested in",
          submit: "Submit",
          appointmentType: "Appointment Type",
          appointmentTypePlaceholder: "Select type",
          storeAppointment: "Store Appointment",
          virtualAppointment: "Virtual Appointment",
        };
  const weekendMessage =
    languageKey === "fi"
      ? "Sunnuntai ei ole varattavissa."
      : "Sunday is not available.";
  const pastDateMessage =
    languageKey === "fi"
      ? "Vain tulevat paivat ovat saatavilla."
      : "Only future dates are available.";
  const disabledDateMessage =
    languageKey === "fi"
      ? "Valittu paiva ei ole saatavilla."
      : "Selected date is not available.";
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryPhoneMap, setCountryPhoneMap] = useState<Record<string, string>>({});
  const [countryLoading, setCountryLoading] = useState(false);
  const [slotOptions, setSlotOptions] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [disabledDates, setDisabledDates] = useState<string[]>([]);
  const [disabledSlotsByDate, setDisabledSlotsByDate] = useState<Record<string, string[]>>({});
  const [disabledLoading, setDisabledLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaLoadError, setRecaptchaLoadError] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const appointmentTypeOptions = [
  { value: "store", label: labels.storeAppointment },
  { value: "virtual", label: labels.virtualAppointment },
];
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
    const loadCountries = async () => {
      setCountryLoading(true);
      try {
        const { data } = await axiosClient.get("/api/appointment/countries");
        const countries = data?.data ?? data ?? [];
        if (!Array.isArray(countries) || !countries.length) {
          if (active) {
            setCountryOptions([]);
            setCountryPhoneMap({});
            setForm((prev) => ({ ...prev, country: "", phoneCode: "" }));
          }
          return;
        }
        const normalized = countries
          .map((country) => {
            if (country && typeof country === "object") {
              const label =
                country.name ??
                country.country ??
                country.label ??
                country.title ??
                country.value ??
                country.code ??
                "";
              const labelText = String(label).trim();
              if (!labelText) return null;
              const phoneCode =
                country.phone_code ??
                country.phoneCode ??
                country.phone ??
                country.dial_code ??
                country.dialCode ??
                country.code ??
                "";
              return {
                value: labelText,
                label: labelText,
                phoneCode: String(phoneCode ?? "").trim(),
                isoCode: String(country.iso_code ?? country.isoCode ?? "").trim().toUpperCase(),
              };
            }
            const labelText = String(country).trim();
            if (!labelText) return null;
            return { value: labelText, label: labelText, phoneCode: "", isoCode: "" };
          })
          .filter(Boolean);
        const nextPhoneMap = normalized.reduce<Record<string, string>>((acc, option) => {
          const key = String(option.value ?? "").trim();
          if (key && option.phoneCode) {
            acc[key] = String(option.phoneCode).replace(/\D/g, "");
          }
          return acc;
        }, {});
        const nextIsoMap = normalized.reduce<Record<string, string>>((acc, option) => {
          const key = String(option.value ?? "").trim();
          if (key && option.isoCode) acc[key] = option.isoCode;
          return acc;
        }, {});
        if (active) {
          setCountryOptions(normalized);
          setCountryPhoneMap(nextPhoneMap);
          setCountryIsoMap(nextIsoMap);
          setForm((prev) => {
            const hasCountry = normalized.some(
              (opt) => String(opt.value) === String(prev.country)
            );
            if (!hasCountry) {
              return { ...prev, country: "", phoneCode: "" };
            }
            const mappedCode = nextPhoneMap[String(prev.country)] ?? "";
            if (!mappedCode) {
              return prev;
            }
            const phoneDigits = String(prev.phone ?? "").replace(/\D/g, "");
            const prevCode = String(prev.phoneCode ?? "");
            const trimmedPhone =
              prevCode && phoneDigits.startsWith(prevCode)
                ? phoneDigits.slice(prevCode.length)
                : phoneDigits;
            return {
              ...prev,
              phoneCode: mappedCode,
              phone: mappedCode
                ? trimmedPhone
                  ? `+${mappedCode} ${trimmedPhone}`
                  : `+${mappedCode} `
                : trimmedPhone,
            };
          });
        }
      } catch (error) {
        if (active) {
          setCountryOptions([]);
          setCountryPhoneMap({});
          setForm((prev) => ({ ...prev, country: "", phoneCode: "" }));
        }
        const message =
          error?.response?.data?.message ??
          error?.response?.data?.error ??
          labels.countryLoadFailed;
        toast.error(message);
        console.error("Appointment countries load error", error);
      } finally {
        if (active) setCountryLoading(false);
      }
    };
    loadCountries();
    return () => {
      active = false;
    };
  }, [labels.countryLoadFailed]);

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
          setForm((prev) => ({
            ...prev,
            appointmentSlot: normalizeSlotSelection(prev.appointmentSlot, nextOptions),
          }));
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
  useEffect(() => {
    let active = true;
    const loadDisabledSlots = async () => {
      setDisabledLoading(true);
      try {
        const { data } = await axiosClient.get(
          "/api/appointment/get-disabled-date-and-time-slots"
        );
        const items = data?.data ?? [];
        if (!Array.isArray(items)) {
          if (active) {
            setDisabledDates([]);
            setDisabledSlotsByDate({});
          }
          return;
        }
        const dateList: string[] = [];
        const slotsMap: Record<string, string[]> = {};
        items.forEach((item) => {
          const dateKey = String(item?.date ?? item?.appointment_date ?? "").trim();
          if (!dateKey) return;
          const disabledList = Array.isArray(item?.disabled_timeSlots)
            ? item.disabled_timeSlots
            : Array.isArray(item?.disabled_time_slots)
            ? item.disabled_time_slots
            : [];
          if (!disabledList.length) {
            dateList.push(dateKey);
            return;
          }
          const slots = disabledList
            .map((slot) =>
              String(slot?.time_slot ?? slot?.slot ?? slot?.label ?? slot?.value ?? "").trim()
            )
            .filter(Boolean);
          if (slots.length) {
            slotsMap[dateKey] = Array.from(new Set(slots));
          }
        });
        if (active) {
          setDisabledDates(dateList);
          setDisabledSlotsByDate(slotsMap);
        }
      } catch (error) {
        if (active) {
          setDisabledDates([]);
          setDisabledSlotsByDate({});
        }
        toast.error(
          languageKey === "fi"
            ? "Varattujen aikojen lataus epaonnistui."
            : "Failed to load disabled dates."
        );
        console.error("Appointment disabled dates load error", error);
      } finally {
        if (active) setDisabledLoading(false);
      }
    };
    loadDisabledSlots();
    return () => {
      active = false;
    };
  }, [languageKey]);
  const disabledDateSet = useMemo(() => new Set(disabledDates), [disabledDates]);
  const isDisabledDate = useCallback(
    (date) => {
      if (!date) return false;
      const formatted = formatDateValue(date);
      return disabledDateSet.has(formatted);
    },
    [disabledDateSet]
  );
  const selectedDate = parseDateValue(form.appointmentDate);
  const convertedSlotOptions = useMemo(
    () =>
      slotOptions.map((opt) => ({
        ...opt,
        label: convertSlotLabel(opt.value, selectedCountryTz),
      })),
    [slotOptions, selectedCountryTz]
  );
  const slotOptionsForDate = useMemo(() => {
    if (!form.appointmentDate) return convertedSlotOptions;
    const disabledSlots = disabledSlotsByDate[form.appointmentDate] ?? [];
    if (!disabledSlots.length) return convertedSlotOptions;
    const disabledSet = new Set(disabledSlots.map((slot) => String(slot)));
    return convertedSlotOptions.filter((opt) => !disabledSet.has(String(opt.value)));
  }, [disabledSlotsByDate, form.appointmentDate, convertedSlotOptions]);
  useEffect(() => {
    if (!form.appointmentDate) return;
    if (disabledDateSet.has(form.appointmentDate)) {
      setForm((prev) => ({ ...prev, appointmentDate: "", appointmentSlot: "" }));
      return;
    }
    const disabledSlots = disabledSlotsByDate[form.appointmentDate] ?? [];
    if (!disabledSlots.length) return;
    const disabledSet = new Set(disabledSlots.map((slot) => String(slot)));
    if (form.appointmentSlot && disabledSet.has(String(form.appointmentSlot))) {
      setForm((prev) => ({ ...prev, appointmentSlot: "" }));
    }
  }, [disabledDateSet, disabledSlotsByDate, form.appointmentDate, form.appointmentSlot]);
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "country") {
      const nextCountry = value;
      const mappedCode = nextCountry ? countryPhoneMap[nextCountry] ?? "" : "";
      const phoneDigits = String(form.phone ?? "").replace(/\D/g, "");
      const prevCode = String(form.phoneCode ?? "");
      const trimmedPhone =
        prevCode && phoneDigits.startsWith(prevCode)
          ? phoneDigits.slice(prevCode.length)
          : phoneDigits;
      const isoCode = nextCountry ? countryIsoMap[nextCountry] ?? "" : "";
      const tz = isoCode ? COUNTRY_TIMEZONE_MAP[isoCode] ?? "" : "";
      setSelectedCountryTz(tz);
      setSelectedSlotDisplayLabel("");
      setForm((prev) => ({
        ...prev,
        country: nextCountry,
        phoneCode: mappedCode,
        phone: mappedCode
          ? trimmedPhone
            ? `+${mappedCode} ${trimmedPhone}`
            : `+${mappedCode} `
          : trimmedPhone,
        appointmentSlot: "",
      }));
      return;
    }
    if (name === "phone") {
      const cleaned = value.replace(/[^\d ]/g, "").replace(/\s+/g, " ").replace(/^\s+/, "");
      if (form.phoneCode) {
        const digitsOnly = cleaned.replace(/\s/g, "");
        const codeDigits = String(form.phoneCode ?? "");
        const restDigits = digitsOnly.startsWith(codeDigits)
          ? digitsOnly.slice(codeDigits.length)
          : digitsOnly;
        const nextValue = restDigits ? `+${codeDigits} ${restDigits}` : `+${codeDigits} `;
        setForm((prev) => ({ ...prev, phone: nextValue }));
        return;
      }
      const digitsOnly = cleaned.replace(/[^\d]/g, "");
      const nextValue = digitsOnly ? `+${digitsOnly}` : "";
      setForm((prev) => ({ ...prev, phone: nextValue }));
      return;
    }
    if (name === "appointmentSlot") {
      const matchedOpt = slotOptionsForDate.find((o) => String(o.value) === String(value));
      setSelectedSlotDisplayLabel(matchedOpt?.label ?? value);
      setForm((prev) => ({ ...prev, appointmentSlot: value }));
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
    if (isDisabledDate(date)) {
      toast.error(disabledDateMessage);
      setForm((prev) => ({ ...prev, appointmentDate: "", appointmentSlot: "" }));
      return;
    }
    const nextDateValue = formatDateValue(date);
    const disabledSlots = disabledSlotsByDate[nextDateValue] ?? [];
    const disabledSet = new Set(disabledSlots.map((slot) => String(slot)));
    const nextSlot = form.appointmentSlot && !disabledSet.has(String(form.appointmentSlot))
      ? form.appointmentSlot
      : "";
    setForm((prev) => ({
      ...prev,
      appointmentDate: nextDateValue,
      appointmentSlot: nextSlot,
    }));
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
    if (isDisabledDate(appointmentDateValue)) {
      toast.error(disabledDateMessage);
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
        phone_number: form.phone.replace(/\s+/g, "").trim(),
        date: form.appointmentDate,
        time_slot: form.appointmentSlot,
        display_time_slot: selectedSlotDisplayLabel || form.appointmentSlot,
        display_timezone: timezoneLabel,
        description: form.details.trim(),
        appointment_type: form.appointmentType,
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
              <SelectField
                label={labels.country}
                name="country"
                placeholder={labels.country}
                required
                disabled={countryLoading || !countryOptions.length}
                value={form.country}
                onChange={handleChange}
                options={countryOptions}
                isSearchable
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
                  filterDate={(date) =>
                    !isWeekendDay(date) && !isPastDay(date) && !isDisabledDate(date)
                  }
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
                disabled={slotLoading || disabledLoading || !slotOptionsForDate.length}
                value={form.appointmentSlot}
                onChange={handleChange}
                options={slotOptionsForDate}
              />
              <SelectField
               label={labels.appointmentType}
              name="appointmentType"
              placeholder={labels.appointmentTypePlaceholder}
                required
                disabled={false}
                value={form.appointmentType}
                onChange={handleChange}
                options={appointmentTypeOptions}
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
              <Button type="submit" variant="primarySoft" disabled={submitting}>
                {submitting ? (languageKey === "fi" ? "Lahetaan..." : "Submitting...") : labels.submit}
              </Button>
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
      <SiteFooter brandDescription={t("footer.homeBrandDescription")} />
    </div>
  );
}
