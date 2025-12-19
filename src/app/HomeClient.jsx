"use client";

import CategoryGrid from "../components/Home/CategoryGrid.jsx";
import FullMediaSection from "../components/Home/FullMediaSection.jsx";
import Hero from "../components/Home/Hero.jsx";
import SiteFooter from "../components/Home/SiteFooter.jsx";
import SiteHeader from "../components/Home/SiteHeader.jsx";
import { useI18n } from "../providers/I18nProvider.jsx";
import styles from "./home.module.css";

export default function HomeClient() {
  const { t } = useI18n();

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Hero
          videoSrc="/productdetails/Rose%20Anim%20Kastehelmi%20Mq%20Rd%201725.mp4"
          posterSrc="/homepage/banner_1.jpg"
          eyebrow={t("home.hero.eyebrow")}
          title={t("home.hero.title")}
          subcopy={t("home.hero.subcopy")}
          primaryCta={{ label: t("home.hero.ctaPrimary"), href: "#" }}
          secondaryCta={{ label: t("home.hero.ctaSecondary"), href: "#" }}
        />

        <CategoryGrid
          title={t("home.categories.title")}
          categories={[
            { label: t("home.categories.items.rings"), href: "/product", imageSrc: "/homepage/category.jpg" },
            { label: t("home.categories.items.bracelets"), href: "/product", imageSrc: "/homepage/category.jpg" },
            {
              label: t("home.categories.items.necklaces"),
              href: "/product",
              imageSrc: "/homepage/category.jpg",
            },
            { label: t("home.categories.items.earrings"), href: "/product", imageSrc: "/homepage/category.jpg" },
          ]}
        />

        <FullMediaSection
          mediaType="video"
          mediaSrc="/productdetails/Rose%20Anim%20Kastehelmi%20Mq%20Rd%201725.mp4"
          posterSrc="/homepage/banner_2.jpg"
          eyebrow={t("home.diamondGuide.eyebrow")}
          title={t("home.diamondGuide.title")}
          subtitle={t("home.diamondGuide.subtitle")}
          description={t("home.diamondGuide.description")}
          ctaLabel={t("home.cta.discover")}
          href="#"
        />

        <FullMediaSection
          mediaType="video"
          mediaSrc="/productdetails/Rose%20Anim%20Kastehelmi%20Mq%20Rd%201725.mp4"
          posterSrc="/homepage/banner_1.jpg"
          eyebrow={t("home.diamondDifference.eyebrow")}
          title={t("home.diamondDifference.title")}
          subtitle={t("home.diamondDifference.subtitle")}
          description={t("home.diamondDifference.description")}
          ctaLabel={t("home.cta.discover")}
          href="#"
        />

        <FullMediaSection
          mediaType="image"
          mediaSrc="/homepage/banner_3.jpg"
          posterSrc="/homepage/banner_3.jpg"
          eyebrow={t("home.about.eyebrow")}
          title={t("home.about.title")}
          subtitle={t("home.about.subtitle")}
          description={t("home.about.description")}
          ctaLabel={t("home.cta.discover")}
          href="#"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
