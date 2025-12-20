"use client";

import Image from "next/image";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const contentByLanguage = {
  en: {
    heading: "ABOUT US",
    paragraphs: [
      "Rooted in Nordic heritage, Korkeila Helsinki draws inspiration from natural beauty, clean lines, and timeless simplicity. Our designs reflect this legacy while embracing modern innovation and elegance.",
      "We draw inspiration from Finnish design culture — honoring thoughtful craftsmanship and innovation, the natural world, people, and the traditions that shape us. With responsibility at the core of everything we do, our jewellery brings a touch of enchantment to everyday life, turning moments into lasting memories.",
      "At the heart of our work is you. Your story, your milestones, and your individuality inspire our designs. From concept to creation, each piece is crafted to honor your life and celebrate the moments that matter.",
      "With Korkeila Helsinki, jewellery is not just worn — it becomes part of your journey.",
    ],
  },
  fi: {
    heading: "MEISTÄ",
    paragraphs: [
      "Korkeila Helsingin juuret ovat pohjoismaisessa estetiikassa – luonnon kauneudessa, selkeissä linjoissa ja ajattomassa yksinkertaisuudessa. Mallistomme ilmentää tätä perinnettä yhdistäen sen moderniin eleganssiin ja innovatiiviseen suunnitteluun.",
      "Inspiraatiomme kumpuaa suomalaisesta muotoilukulttuurista, joka arvostaa harkittua käsityötaitoa, kekseliäisyyttä ja ihmisyyttä. Kunnioitamme perinteitä, jotka ovat muovanneet meitä ja katsomme samalla rohkeasti tulevaan. Vastuullisuus ohjaa kaikkea toimintaamme. Jokainen koru on tehty huolella kestävien arvojen mukaisesti.",
      "Työmme keskiössä olet sinä – tarinasi, ainutlaatuisuutesi ja elämäsi merkitykselliset hetket inspiroivat suunnittelua ja toimintaamme. Korujemme tarkoitus on tuoda arkeesi hienovaraista taikaa ja tehdä tärkeistä hetkistäsi ikimuistoisia.",
      "Korkeila Helsingin koru ei ole vain asuste – se on osa matkaasi.",
    ],
  },
};

export default function AboutPage() {
  const { language } = useI18n();
  const content = contentByLanguage[language] ?? contentByLanguage.en;

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h1 className={styles.heading}>{content.heading}</h1>
            <div className={styles.copy}>
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className={styles.imageWrap}>
            <Image
              className={styles.image}
              src="/aboutus/FINAL%20LOGO_NEW.jpg"
              alt="Korkeila Helsinki"
              width={640}
              height={420}
            />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
