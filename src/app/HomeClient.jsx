"use client";

import CategoryGrid from "../components/Home/CategoryGrid.jsx";
import Hero from "../components/Home/Hero.jsx";
import ImageBanner from "../components/Home/ImageBanner.jsx";
import SiteFooter from "../components/Home/SiteFooter.jsx";
import SiteHeader from "../components/Home/SiteHeader.jsx";
import { useI18n } from "../providers/I18nProvider.jsx";
import styles from "./home.module.css";

export default function HomeClient() {
  const { t } = useI18n();

  return (
    <div className={styles.page}>
      <SiteHeader />
      <div className={styles.stack}>
        <Hero
          imageSrc="/homebanner/banner-story.jpg"
          videoSrc="/others/202411221117018124.mp4"
          posterSrc="/homebanner/banner-story.jpg"
          eyebrow={t("home.hero.eyebrow")}
          title={t("home.hero.title")}
          subcopy={null}
          primaryCta={{ label: t("home.hero.ctaPrimary"), href: "#" }}
          secondaryCta={{ label: t("home.hero.ctaSecondary"), href: "#" }}
        />

        <CategoryGrid
          categories={[
            { label: "RINGS", href: "/product", imageSrc: "/others/productandcategory.png" },
            { label: "BRACELETS", href: "/product", imageSrc: "/others/productandcategory.png" },
            { label: "NECKLACES & PENDANTS", href: "/product", imageSrc: "/others/productandcategory.png" },
            { label: "EARRINGS", href: "/product", imageSrc: "/others/productandcategory.png" },
          ]}
        />

        <ImageBanner
          imageSrc="/homebanner/banner-ethical.jpg"
          scheme="light"
          shade="light"
          align="left"
          title="Ethical & sustainable"
          copy="Responsible sourcing, crafted with care and transparency."
          cta={{ label: "Learn more", href: "#" }}
        />

        <section id="our-story">
          <ImageBanner
            imageSrc="/homebanner/banner-story.jpg"
            scheme="light"
            shade="light"
            align="left"
            eyebrow="OUR STORY"
            title="Modern heirlooms"
            copy="A focus on craftsmanship, comfort, and long-lasting shine."
            cta={{ label: "Read more", href: "#our-story" }}
          />
        </section>

        <ImageBanner
          imageSrc="/homebanner/banner-diamond.jpg"
          scheme="dark"
          shade="dark"
          align="left"
          title="Diamond guide"
          copy="Cut, clarity, color, and carat — made easy."
          cta={{ label: "Explore", href: "#" }}
        />

        <ImageBanner
          imageSrc="/homebanner/banner-logistics.jpg"
          scheme="dark"
          shade="dark"
          align="left"
          title="White glove logistics"
          copy="Secure delivery with thoughtful packaging and tracking."
          cta={{ label: "Shipping info", href: "#" }}
        />

        <SiteFooter />
      </div>
    </div>
  );
}
