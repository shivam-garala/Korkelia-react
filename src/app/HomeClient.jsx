"use client";

import { useEffect, useMemo, useState } from "react";
import CategoryGrid from "../components/Home/CategoryGrid.jsx";
import FullMediaSection from "../components/Home/FullMediaSection.jsx";
import Hero from "../components/Home/Hero.jsx";
import SiteFooter from "../components/Home/SiteFooter.jsx";
import SiteHeader from "../components/Home/SiteHeader.jsx";
import { fetchCategoryHomePage } from "../lib/categoryHomeCache.js";
import { useI18n } from "../providers/I18nProvider.jsx";
import styles from "./home.module.css";

const buildCategoryHref = (id, label) => {
  const nameParam = label ? `&category_name=${encodeURIComponent(label)}` : "";
  if (id) {
    return `/product?category_id=${encodeURIComponent(id)}${nameParam}`;
  }
  return label ? `/product?category_name=${encodeURIComponent(label)}` : "/product";
};

export default function HomeClient() {
  const { t, language } = useI18n();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  const languageId = language === "fi" ? "2" : "1";
  const fallbackCategories = useMemo(
    () => [
      {
        label: t("home.categories.items.rings"),
        href: buildCategoryHref("", t("home.categories.items.rings")),
        imageSrc: "/homepage/category.jpg",
      },
      {
        label: t("home.categories.items.bracelets"),
        href: buildCategoryHref("", t("home.categories.items.bracelets")),
        imageSrc: "/homepage/category.jpg",
      },
      {
        label: t("home.categories.items.necklaces"),
        href: buildCategoryHref("", t("home.categories.items.necklaces")),
        imageSrc: "/homepage/category.jpg",
      },
      {
        label: t("home.categories.items.earrings"),
        href: buildCategoryHref("", t("home.categories.items.earrings")),
        imageSrc: "/homepage/category.jpg",
      },
    ],
    [t]
  );

  useEffect(() => {
    let active = true;
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "";

    const normalizeImage = (image) => {
      if (!image) return "/productlisting/no_image.jpg";
      if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
      if (!apiBase) return image;
      return `${apiBase.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
    };

    const loadCategories = async () => {
      try {
        if (active) setCategoriesLoading(true);
        const list = await fetchCategoryHomePage(languageId);
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.category_id ?? null;
            const label = item?.category_name ?? item?.name ?? "";
            if (!label) return null;
            return {
              id: id ?? label,
              label,
              href: buildCategoryHref(id ?? "", label),
              imageSrc: normalizeImage(item?.image),
            };
          })
          .filter(Boolean);

        if (active) setCategories(mapped);
      } catch (error) {
        if (active) setCategories([]);
        console.error("Home categories load failed", error);
      } finally {
        if (active) setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, [languageId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = () => setIsDesktop(mediaQuery.matches);
    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Hero
          videoSrc="/homepage/Rings_in_Motion.mp4"
          posterSrc="/homepage/poster_default.png"
          eyebrow={t("home.hero.eyebrow")}
          title={t("home.hero.title")}
          subcopy={t("home.hero.subcopy")}
          primaryCta={{ label: t("home.hero.ctaPrimary"), href: "#" }}
          secondaryCta={{ label: t("home.hero.ctaSecondary"), href: "#" }}
        />

        <CategoryGrid
          title={t("home.categories.title")}
          categories={categories.length ? categories : fallbackCategories}
          loading={categoriesLoading}
        />

        <FullMediaSection
          mediaType="video"
          mediaSrc={
            isDesktop
              ? "/homepage/diamond_guid_desktop.mp4"
              : "/homepage/diamond_guid_mobile.mp4"
          }
          mediaPosition={isDesktop ? "right center" : "right bottom"}
          sectionClassName={styles.diamondGuideSection}
          mediaClassName={styles.diamondGuideMedia}
          contentClassName={styles.diamondGuideContent}
          videoClassName={styles.diamondGuideVideo}
          eyebrow={t("home.diamondGuide.eyebrow")}
          title={t("home.diamondGuide.title")}
          subtitle={t("home.diamondGuide.subtitle")}
          description={t("home.diamondGuide.description")}
          ctaLabel={t("home.cta.discover")}
          href="/diamond-guide"
        />

        <FullMediaSection
          mediaType="video"
          mediaSrc={
            isDesktop
              ? "/homepage/diamond_deference_desktop.mp4"
              : "/homepage/diamond_deference_desktop.mp4"
          }
          mediaPosition={isDesktop ? "right center" : "right bottom"}
          sectionClassName={styles.diamondDifferenceSection}
          mediaClassName={styles.diamondDifferenceMedia}
          contentClassName={styles.diamondDifferenceContent}
          videoClassName={styles.diamondDifferenceVideo}
          eyebrow={t("home.diamondDifference.eyebrow")}
          title={t("home.diamondDifference.title")}
          subtitle={t("home.diamondDifference.subtitle")}
          description={t("home.diamondDifference.description")}
          ctaLabel={t("home.cta.discover")}
          href="/diamond-difference"
        />

        {/* <FullMediaSection
          mediaType="image"
          mediaSrc="/homepage/banner_1.jpg"
          posterSrc="/homepage/banner_1.jpg"
          eyebrow={t("home.diamondDifference.eyebrow")}
          title={t("home.diamondDifference.title")}
          subtitle={t("home.diamondDifference.subtitle")}
          description={t("home.diamondDifference.description")}
          ctaLabel={t("home.cta.discover")}
          href="/diamond-difference"
        /> */}

        <FullMediaSection
          mediaType="image"
          mediaSrc={isDesktop ? "/homepage/banner_desktop_3.jpg" : "/homepage/banner_mobile_3.jpeg"}
          posterSrc={isDesktop ? "/homepage/banner_desktop_3.jpg" : "/homepage/banner_mobile_3.jpeg"}
          eyebrow={t("home.about.eyebrow")}
          title={t("home.about.title")}
          subtitle={t("home.about.subtitle")}
          description={t("home.about.description")}
          ctaLabel={t("home.cta.discover")}
          href="/about"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
