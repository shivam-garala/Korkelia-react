"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Modal from "../ui/Modal.jsx";
import styles from "./ShareProductModal.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";

export default function ShareProductModal({ buttonClassName = "", buttonContent = null }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language } = useI18n();
  const labels =
    language === "fi"
      ? {
          title: "Jaa tämä tuote",
          subtitle: "Jaa tämä tuote ystäviesi kanssa:",
          copyPlaceholder: "Kopioi linkki",
          copy: "Kopioi",
          copied: "Kopioitu",
          close: "Sulje",
          shareButton: "Jaa",
          facebook: "Facebook",
          whatsapp: "WhatsApp",
          instagram: "Instagram",
          threads: "Threads",
          facebookAria: "Jaa Facebookissa",
          whatsappAria: "Jaa WhatsAppissa",
          instagramAria: "Avaa Instagramissa",
          threadsAria: "Avaa Threadsissa",
        }
      : {
          title: "Share This Product",
          subtitle: "Share this product with your friends:",
          copyPlaceholder: "Copy link",
          copy: "Copy",
          copied: "Copied",
          close: "Close",
          shareButton: "Share",
          facebook: "Facebook",
          whatsapp: "WhatsApp",
          instagram: "Instagram",
          threads: "Threads",
          facebookAria: "Share on Facebook",
          whatsappAria: "Share on WhatsApp",
          instagramAria: "Open on Instagram",
          threadsAria: "Open on Threads",
        };

  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin || "";
    const path = pathname ?? "";
    const query = searchParams?.toString();
    return `${base}${path}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  const shareUrl = useMemo(() => {
    if (!currentUrl) return "";
    const normalizedLanguage = typeof language === "string" ? language.toLowerCase() : "";
    if (!normalizedLanguage) return currentUrl;
    try {
      const url = new URL(currentUrl);
      url.searchParams.set("lang", normalizedLanguage);
      return url.toString();
    } catch (error) {
      const separator = currentUrl.includes("?") ? "&" : "?";
      return `${currentUrl}${separator}lang=${encodeURIComponent(normalizedLanguage)}`;
    }
  }, [currentUrl, language]);

  const shareLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(shareUrl || "");
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedUrl}`,
      instagram: "https://www.instagram.com/korkeilahelsinki/",
      threads: "https://www.threads.com/@korkeilahelsinki",
    };
  }, [shareUrl]);

  const copyToClipboard = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleCopy = async () => {
    await copyToClipboard(shareUrl);
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger}${buttonClassName ? ` ${buttonClassName}` : ""}`}
        onClick={() => setOpen(true)}
        aria-label={labels.shareButton}
      >
        {buttonContent ?? <Image src="/icons/share.png" alt="" width={14} height={14} />}
      </button>

      <Modal
        open={open}
        title={labels.title}
        onClose={() => setOpen(false)}
        className={styles.modal}
        bodyClassName={styles.modalBody}
        footer={
          <div className={styles.footer}>
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)}>
              {labels.close}
            </button>
          </div>
        }
      >
        <p className={styles.subtitle}>{labels.subtitle}</p>
        <div className={styles.shareGrid}>
          <a
            className={styles.shareItem}
            href={shareLinks.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label={labels.facebookAria}
          >
            <span className={`${styles.shareIcon} ${styles.facebook}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.315h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"
                />
              </svg>
            </span>
            <span>{labels.facebook}</span>
          </a>
          <a
            className={styles.shareItem}
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label={labels.whatsappAria}
          >
            <span className={`${styles.shareIcon} ${styles.whatsapp}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.31-1.65a11.86 11.86 0 0 0 5.75 1.47h.01c6.56 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44zm-8.45 18.1h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.22-3.75.98 1-3.65-.23-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.44 4.43-9.86 9.88-9.86a9.81 9.81 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 6.98c0 5.45-4.43 9.87-9.87 9.87zm5.42-7.4c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-.3-.15-1.26-.46-2.39-1.48-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.28.3-.48.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.2-.24-.58-.48-.5-.66-.5-.17 0-.37-.02-.57-.02-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.12 3.24 5.14 4.54.72.31 1.29.5 1.73.64.73.23 1.4.2 1.93.12.59-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.08-.12-.27-.2-.57-.35z"
                />
              </svg>
            </span>
            <span>{labels.whatsapp}</span>
          </a>
          <a
            className={styles.shareItem}
            href={shareLinks.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label={labels.instagramAria}
          >
            <span className={`${styles.shareIcon} ${styles.instagram}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.71 4.71 0 0 0 12 7.3zm0 7.7A3 3 0 1 1 15 12a3 3 0 0 1-3 3z"
                />
                <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
                <path
                  fill="currentColor"
                  d="M17.5 3h-11A3.5 3.5 0 0 0 3 6.5v11A3.5 3.5 0 0 0 6.5 21h11a3.5 3.5 0 0 0 3.5-3.5v-11A3.5 3.5 0 0 0 17.5 3zm2 14.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z"
                />
              </svg>
            </span>
            <span>{labels.instagram}</span>
          </a>
          <a
            className={styles.shareItem}
            href={shareLinks.threads}
            target="_blank"
            rel="noreferrer"
            aria-label={labels.threadsAria}
          >
            <span className={`${styles.shareIcon} ${styles.threads}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.15 2 12s4.48 10 10 10 10-4.15 10-10S17.52 2 12 2zm4.46 11.07c-.23 1.63-.93 2.77-2.12 3.51-.9.57-2.02.84-3.25.76-1.22-.08-2.19-.49-2.91-1.21-.7-.71-1.08-1.68-1.12-2.89l1.89-.07c.03.74.22 1.28.57 1.63.39.39.94.61 1.67.66.71.05 1.32-.09 1.82-.41.61-.38.98-.98 1.11-1.8a4.03 4.03 0 0 1-1.9.47c-1.12 0-2.06-.35-2.82-1.04-.78-.69-1.17-1.61-1.17-2.76 0-1.16.37-2.08 1.1-2.77.73-.7 1.67-1.05 2.81-1.05 1.22 0 2.22.36 2.98 1.09.75.71 1.2 1.68 1.35 2.9.52.2.93.52 1.23.94.35.49.53 1.08.53 1.75 0 .73-.2 1.35-.61 1.87a3.22 3.22 0 0 1-1.38 1.02zm-3.02-4.94c-.44-.4-.96-.6-1.58-.6-.62 0-1.14.2-1.57.6-.42.4-.63.95-.63 1.63 0 .65.22 1.18.66 1.6.44.42.98.63 1.62.63.64 0 1.17-.21 1.6-.63.43-.42.64-.96.64-1.6 0-.68-.22-1.23-.64-1.63z"
                />
              </svg>
            </span>
            <span>{labels.threads}</span>
          </a>
        </div>

        <div className={styles.copyRow}>
          <div className={styles.copyField} title={shareUrl || ""}>
            {shareUrl || labels.copyPlaceholder}
          </div>
          <button type="button" className={styles.copyButton} onClick={handleCopy}>
            {copied ? labels.copied : labels.copy}
          </button>
        </div>
      </Modal>
    </>
  );
}
