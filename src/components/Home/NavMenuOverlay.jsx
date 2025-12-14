"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./NavMenuOverlay.module.css";

function Icon({ path }) {
  return (
    <svg
      className={styles.icon}
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

export default function NavMenuOverlay({
  open,
  onClose,
}) {
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
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
            <button type="button" className={styles.iconBtn} aria-label="Search">
              <Image className={styles.icon} src="/icons/search.png" alt="" width={18} height={18} />
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
        <ul className={styles.menu}>
          <li className={styles.itemRow}>
            <Link className={styles.link} href="/" onClick={onClose}>
              Kotiin
            </Link>
          </li>
          <li className={styles.itemRow}>
            <Link className={styles.link} href="#" onClick={onClose}>
              Tietoja meistä
            </Link>
          </li>
          <li>
            <div className={styles.itemRow}>
              <Link className={styles.link} href="/dashboard/product" onClick={onClose}>
                Tuotteet
              </Link>
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Toggle products submenu"
                onClick={() => setProductsOpen((prev) => !prev)}
              >
                <Image
                  className={styles.chev}
                  src="/icons/down_Arrow.png"
                  alt=""
                  width={14}
                  height={9}
                  style={productsOpen ? { transform: "rotate(180deg)" } : undefined}
                />
              </button>
            </div>
            {productsOpen ? (
              <div className={styles.subMenu}>
                <Link className={styles.subLink} href="/dashboard/product" onClick={onClose}>
                  Rings
                </Link>
                <Link className={styles.subLink} href="/dashboard/product" onClick={onClose}>
                  Necklace
                </Link>
                <Link className={styles.subLink} href="/dashboard/product" onClick={onClose}>
                  Earrings
                </Link>
              </div>
            ) : null}
          </li>
          <li className={styles.itemRow}>
            <Link className={styles.link} href="#" onClick={onClose}>
              Kestävä kehitys ja eettinen hankinta
            </Link>
          </li>
          <li className={styles.itemRow}>
            <Link className={styles.link} href="#" onClick={onClose}>
              Timanttiopas
            </Link>
          </li>
          <li className={styles.itemRow}>
            <Link className={styles.link} href="#" onClick={onClose}>
              Toimitus ja palautus
            </Link>
          </li>
          <li className={styles.itemRow}>
            <Link className={styles.link} href="#" onClick={onClose}>
              Ota yhteyttä
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
