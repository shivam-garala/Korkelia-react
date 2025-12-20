"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./NavMenuOverlay.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";

function Icon({ path, className, style }) {
  return (
    <svg
      className={className ?? styles.icon}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function NavMenuOverlay({ open, onClose }) {
  const [productsOpen, setProductsOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Navigation menu">
      <div className={styles.top}>
        <div className={styles.topInner}>
          <div className={styles.left}>
            <button type="button" className={styles.iconBtn} aria-label="Close menu" onClick={onClose}>
              <Icon path="M18 6 6 18M6 6l12 12" />
            </button>
          </div>

          <Link className={styles.brand} href="/" aria-label="Home" onClick={onClose}>
            <Image
              className={styles.brandLogo}
              src="/logo/logo.png"
              alt="KORKEILA HELSINKI"
              width={520}
              height={270}
            />
          </Link>

          <div className={styles.right} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentInner}>
          <div className={styles.divider} aria-hidden="true" />
          <ul className={styles.menu}>
            <li className={styles.item}>
              <Link className={styles.link} href="/" onClick={onClose}>
                {t("menu.home")}
              </Link>
            </li>
            <li className={styles.item}>
              <Link className={styles.link} href="/about" onClick={onClose}>
                {t("menu.about")}
              </Link>
            </li>
            <li className={styles.item}>
              <div className={styles.itemRow}>
                <button
                  type="button"
                  className={`${styles.link} ${styles.linkButton}`}
                  onClick={() => setProductsOpen((prev) => !prev)}
                  aria-expanded={productsOpen}
                  aria-controls="products-submenu"
                >
                  {t("menu.products")}
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label="Toggle products submenu"
                  onClick={() => setProductsOpen((prev) => !prev)}
                  aria-expanded={productsOpen}
                >
                  <Icon
                    className={styles.chev}
                    path="m6 9 6 6 6-6"
                    style={productsOpen ? { transform: "rotate(180deg)" } : undefined}
                  />
                </button>
              </div>
              {productsOpen ? (
                <div id="products-submenu" className={styles.subMenu}>
                  <Link className={styles.subLink} href="/product" onClick={onClose}>
                    {t("menu.productsSub.rings")}
                  </Link>
                  <Link className={styles.subLink} href="/product" onClick={onClose}>
                    {t("menu.productsSub.bracelets")}
                  </Link>
                  <Link className={styles.subLink} href="/product" onClick={onClose}>
                    {t("menu.productsSub.necklaces")}
                  </Link>
                  <Link className={styles.subLink} href="/product" onClick={onClose}>
                    {t("menu.productsSub.earrings")}
                  </Link>
                </div>
              ) : null}
            </li>
            <li className={styles.item}>
              <Link className={styles.link} href="/diamond-difference" onClick={onClose}>
                {t("menu.diamondDifference")}
              </Link>
            </li>
            <li className={styles.item}>
              <Link className={styles.link} href="/diamond-guide" onClick={onClose}>
                {t("menu.diamondGuide")}
              </Link>
            </li>
            {/* <li className={styles.item}>
              <Link className={`${styles.link} ${styles.muted}`} href="#" onClick={onClose} aria-disabled="true">
                {t("menu.shippingReturns")}
              </Link>
            </li> */}
            <li className={styles.item}>
              <Link className={styles.link} href="/contact" onClick={onClose}>
                {t("menu.contact")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
