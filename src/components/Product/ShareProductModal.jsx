"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal.jsx";
import styles from "./ShareProductModal.module.css";

export default function ShareProductModal({ buttonClassName = "", buttonContent = null }) {
  const [open, setOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [open]);

  const shareLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(currentUrl || "");
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedUrl}`,
    };
  }, [currentUrl]);

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
    } catch (error) {
      const input = document.createElement("input");
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger}${buttonClassName ? ` ${buttonClassName}` : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Share"
      >
        {buttonContent ?? <Image src="/icons/share.png" alt="" width={14} height={14} />}
      </button>

      <Modal
        open={open}
        title="Share This Product"
        onClose={() => setOpen(false)}
        className={styles.modal}
        bodyClassName={styles.modalBody}
        footer={
          <div className={styles.footer}>
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        }
      >
        <p className={styles.subtitle}>Share this product with your friends:</p>
        <div className={styles.shareGrid}>
          <a
            className={styles.shareItem}
            href={shareLinks.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on Facebook"
          >
            <span className={`${styles.shareIcon} ${styles.facebook}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.315h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"
                />
              </svg>
            </span>
            <span>Facebook</span>
          </a>
          <a
            className={styles.shareItem}
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on WhatsApp"
          >
            <span className={`${styles.shareIcon} ${styles.whatsapp}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.31-1.65a11.86 11.86 0 0 0 5.75 1.47h.01c6.56 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44zm-8.45 18.1h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.22-3.75.98 1-3.65-.23-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.44 4.43-9.86 9.88-9.86a9.81 9.81 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 6.98c0 5.45-4.43 9.87-9.87 9.87zm5.42-7.4c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-.3-.15-1.26-.46-2.39-1.48-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.28.3-.48.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.2-.24-.58-.48-.5-.66-.5-.17 0-.37-.02-.57-.02-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.12 3.24 5.14 4.54.72.31 1.29.5 1.73.64.73.23 1.4.2 1.93.12.59-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.08-.12-.27-.2-.57-.35z"
                />
              </svg>
            </span>
            <span>WhatsApp</span>
          </a>
        </div>

        <div className={styles.copyRow}>
          <div className={styles.copyField} title={currentUrl || ""}>
            {currentUrl || "Copy link"}
          </div>
          <button type="button" className={styles.copyButton} onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </Modal>
    </>
  );
}
