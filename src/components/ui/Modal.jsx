"use client";

import { useEffect } from "react";
import styles from "./Modal.module.css";

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  backdropClassName,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const backdropClasses = `${styles.backdrop}${backdropClassName ? ` ${backdropClassName}` : ""}`;
  const modalClasses = `${styles.modal}${className ? ` ${className}` : ""}`;
  const headerClasses = `${styles.header}${headerClassName ? ` ${headerClassName}` : ""}`;
  const bodyClasses = `${styles.body}${bodyClassName ? ` ${bodyClassName}` : ""}`;
  const footerClasses = `${styles.footer}${footerClassName ? ` ${footerClassName}` : ""}`;

  return (
    <div className={backdropClasses} role="dialog" aria-modal="true" aria-label={title ?? "Modal"}>
      <button className={styles.backdropBtn} type="button" aria-label="Close modal" onClick={onClose} />
      <div className={modalClasses}>
        <div className={headerClasses}>
          <div className={styles.title}>{title}</div>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={bodyClasses}>{children}</div>
        {footer ? <div className={footerClasses}>{footer}</div> : null}
      </div>
    </div>
  );
}
