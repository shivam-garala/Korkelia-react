"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./NavMenuOverlay.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";
import { useEffectiveTranslation } from "../../hooks/useEffectiveLanguage.js";
import { fetchCategoryHomePage } from "../../lib/categoryHomeCache.js";
import ShareProductModal from "../Product/ShareProductModal.jsx";

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

export default function NavMenuOverlay({ open, onClose, fixedLanguage }) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const { t, language } = useI18n();
  const pathname = usePathname();
  const { t: effectiveT, effectiveLanguage } = useEffectiveTranslation(fixedLanguage);
  const languageId = language === "fi" ? "2" : "1";
  const categoriesLoadedRef = useRef({});
  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));

  const buildCategoryHref = (id, label) => {
    const nameParam = label ? `&category_name=${encodeURIComponent(label)}` : "";
    if (id) {
      return `/product?category_id=${encodeURIComponent(id)}${nameParam}`;
    }
    return label ? `/product?category_name=${encodeURIComponent(label)}` : "/product";
  };

  const fallbackCategories = useMemo(
    () => [
      {
        id: "",
        label: t("menu.productsSub.rings"),
      },
      {
        id: "",
        label: t("menu.productsSub.bracelets"),
      },
      {
        id: "",
        label: t("menu.productsSub.necklaces"),
      },
      {
        id: "",
        label: t("menu.productsSub.earrings"),
      },
    ],
    [t]
  );

  const displayedCategories = categories.length ? categories : fallbackCategories;

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
    if (!open) return;
    if (categoriesLoadedRef.current[languageId]) return;
    let active = true;

    const loadCategories = async () => {
      try {
        if (active) setCategoriesLoading(true);
        const list = await fetchCategoryHomePage(languageId);
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.category_id ?? null;
            const label = item?.category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { id, label, href: buildCategoryHref(id, label) };
          })
          .filter(Boolean);

        if (active) {
          setCategories(mapped);
          categoriesLoadedRef.current[languageId] = true;
        }
      } catch (error) {
        if (active) setCategories([]);
        console.error("Menu categories load failed", error);
      } finally {
        if (active) setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, [languageId, open]);

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
          <ul className={styles.menu}>
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/") ? styles.activeLink : ""}`}
                href="/"
                onClick={onClose}
              >
                {effectiveT("menu.home")}
              </Link>
            </li>
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/about") ? styles.activeLink : ""}`}
                href={`/${effectiveLanguage}/about`}
                onClick={onClose}
              >
                {effectiveT("menu.about")}
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
                  {effectiveT("menu.products")}
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
                  {categoriesLoading ? (
                    <div className={styles.subLoading}>Loading...</div>
                  ) : (
                    displayedCategories.map((category) => {
                      const href =
                        category.href ??
                        buildCategoryHref(category.id ?? "", category.label ?? "");
                      return (
                        <Link
                          key={String(category.id ?? category.label)}
                          className={styles.subLink}
                          href={href}
                          onClick={onClose}
                        >
                          {category.label}
                        </Link>
                      );
                    })
                  )}
                </div>
              ) : null}
            </li>
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/diamond-guide") ? styles.activeLink : ""}`}
                href={`/${effectiveLanguage}/diamond-guide`}
                onClick={onClose}
              >
                {effectiveT("menu.diamondGuide")}
              </Link>
            </li>
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/diamond-difference") ? styles.activeLink : ""}`}
                href={`/${effectiveLanguage}/diamond-difference`}
                onClick={onClose}
              >
                {effectiveT("menu.diamondDifference")}
              </Link>
            </li>
           
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/custom-jewelry") ? styles.activeLink : ""}`}
                href={`/${effectiveLanguage}/custom-jewelry`}
                onClick={onClose}
              >
                {effectiveT("menu.customJewelry")}
              </Link>
            </li>
       
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/shipping-returns") ? styles.activeLink : ""}`}
                href="/en/shipping-returns"
                onClick={onClose}
              >
                {effectiveT("menu.shippingReturns")}
              </Link>
            </li>
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/faq") ? styles.activeLink : ""}`}
                href={`/${effectiveLanguage}/faq`}
                onClick={onClose}
              >
                {effectiveT("menu.faq")}
              </Link>
            </li>
            <li className={styles.item}>
              <Link
                className={`${styles.link} ${isActive("/contact") ? styles.activeLink : ""}`}
                href={`/${effectiveLanguage}/contact`}
                onClick={onClose}
              >
                {effectiveT("menu.contact")}
              </Link>
            </li>
          </ul>

          <div className={styles.divider} aria-hidden="true" />

          <div className={styles.topActions}>
            <div className={styles.topActionsRight}>
              <ShareProductModal
                buttonClassName={styles.topLink}
                buttonContent={
                  <>
                    <Image
                      className={styles.topIcon}
                      src="/icons/share.png"
                      alt=""
                      width={14}
                      height={14}
                    />
                    <span>{effectiveT("header.share")}</span>
                  </>
                }
              />
              <Link className={styles.topLink} href={`/${effectiveLanguage}/appointment`} onClick={onClose}>
                <Image
                  className={styles.topIcon}
                  src="/icons/appointment.png"
                  alt=""
                  width={14}
                  height={14}
                />
                <span>{effectiveT("header.appointment")}</span>
              </Link>
              <Link className={styles.topLink} href={`/${effectiveLanguage}/contact`} onClick={onClose}>
                <Image
                  className={styles.topIcon}
                  src="/icons/contact_header_icon.png"
                  alt=""
                  width={14}
                  height={14}
                />
                <span>{effectiveT("header.ambassador")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
