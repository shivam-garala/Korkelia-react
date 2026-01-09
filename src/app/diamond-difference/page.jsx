"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const headerByLanguage = {
  en: {
    heading: "THE KORKEILA HELSINKI DIAMOND DIFFERENCE",
    subtitle: "The Korkeila Helsinki Diamond Difference: Your personal diamond sourcing Concierge",
    intro:
      "When it comes to diamonds—whether natural or laboratory-grown—finding the perfect stone requires more than just luck. It requires a dedicated global network, deep expertise, and a commitment to quality and ethics. At Korkeila Helsinki, we don't just sell diamonds; we are your personal concierge and sourcing partner.",
  },
  fi: {
    heading: "Mikä tekee timanteistamme ainutlaatuisia?",
    subtitle: "Henkilökohtainen timanttien hankintakonsulttisi",
    intro:
      "Timantin valinta, olipa kyseessä luonnontimantti tai laboratoriossa kasvatettu kivi, vaatii enemmän kuin pelkkää onnea. Se vaatii laajan kansainvälisen verkoston, syvällistä asiantuntemusta sekä tinkimätöntä sitoutumista laatuun ja eettisyyteen. Me Korkeila Helsingillä emme vain myy timantteja, olemme henkilökohtainen hankintakumppanisi ja concierge-palvelusi timanttien maailmassa.",
  },
};

const tabs = [
  {
    key: "global",
    label: {
      en: "GLOBAL SOURCING NETWORK",
      fi: "GLOBAALI HANKINTAVERKOSTO",
    },
    title: {
      en: "GLOBAL SOURCING NETWORK",
      fi: "GLOBAALI HANKINTAVERKOSTO",
    },
    image: "/diamonddifference/global_sourcing.jpg",
    alt: "Global sourcing network",
    body: {
      en: [
        "Our ability to find precisely the right diamond for every client—from a flawless round brilliant to the most uniquely shaped, rare fancy color stone—is powered by our established global network. This infrastructure gives us direct access to the world’s leading diamond hubs, ensuring we can deliver on virtually any request.",
      ],
      enList: [
        "The USA, for both established certification standards and cutting-edge lab-grown innovation.",
        "Hong Kong, a gateway to diverse Asian markets and a key center for specialized stones.",
        "Germany and Belgium, historical and modern centers of diamond cutting, trading, and expertise.",
        "India, the world’s largest cutting and polishing center, offering unparalleled access to a vast array of polished goods.",
      ],
      enAfter:
        "This comprehensive network allows us to bypass middlemen, secure the highest quality stones at competitive values, and, most importantly, find the exact diamond that meets your vision and budget.",
      fi: [
        "Tavoitteemme on löytää jokaiselle asiakkaalle juuri oikea timantti – aina virheettömästä pyöreästä briljantista harvinaisiin, erikoismuotoisiin ja värillisiin kiviin. Vakiintuneen kansainvälisen verkostomme ansiosta meillä on suora yhteys maailman johtaviin timanttimarkkinoihin.",
      ],
      fiList: [
        "Yhdysvallat – tunnettu sekä vahvoista sertifiointistandardeistaan että huippuluokan laboratoriotimanttiteknologiasta.",
        "Hongkong – portti monimuotoisille Aasian markkinoille ja keskus erikoiskiville.",
        "Saksa ja Belgia – perinteikkäitä ja nykyaikaisia timanttien hionnan, kaupan ja asiantuntemuksen keskuksia.",
        "Intia – maailman suurin timanttien hionta- ja kiillotusmaa, joka tarjoaa vertaansa vailla olevan valikoiman jalostettuja kiviä.",
      ],
      fiAfter:
        "Tämän verkoston ansiosta voimme ohittaa välikädet, tarjota korkealaatuisia timantteja kilpailukykyisin hinnoin ja ennen kaikkea löytää juuri sinun toiveitasi ja budjettiasi vastaavan kiven.",
    },
  },
  {
    key: "commitment",
    label: {
      en: "COMMITMENT",
      fi: "SERTIFIOITU, EETTINEN JA LÄPINÄKYVÄ",
    },
    title: {
      en: "OUR COMMITMENT",
      fi: "SERTIFIOITU, EETTINEN JA LÄPINÄKYVÄ",
    },
    image: "/diamonddifference/commitment.jpeg",
    alt: "Certified and ethical sourcing",
    body: {
      en: [
        "Trust is the foundation of every diamond purchase, and our sourcing strategy is built to reinforce it. We maintain rigorous standards across all stones:",
      ],
      enList: [
        "Certification: we source certified diamonds by independent, globally recognized grading laboratories (such as GIA and IGI) giving you absolute confidence in the diamond’s quality specifications.",
        "Ethical sourcing: for natural diamonds, we maintain a strict policy of sourcing only ethically mined stones and fully adhere to the Kimberley Process. For laboratory diamonds, we work only with producers that follow sustainable, transparent practices.",
        "Traceability: the journey of every stone is documented and accountable.",
      ],
      fi: [
        "Luottamus on jokaisen timanttioston perusta ja siksi hankintaprosessimme on rakennettu tukemaan tätä luottamusta. Pidämme kiinni tiukoista standardeista jokaisen kiven kohdalla:",
      ],
      fiList: [
        "Sertifiointi - kaikki timanttimme ovat itsenäisten ja kansainvälisesti tunnustettujen laboratorioiden, kuten GIA:n ja IGI:n sertifioimia, joten voit luottaa kiven laatuun ja arvoon täysin.",
        "Eettisyys - luonnontimanttien osalta teemme yhteistyötä vain niiden toimittajien kanssa, jotka noudattavat tiukkoja eettisiä käytäntöjä ja Kimberley-prosessia, joka estää konfliktitimanttien kauppaa. Laboratoriotimanttien kohdalla työskentelemme vain vastuullisten ja läpinäkyvästi toimivien tuottajien kanssa.",
        "Jäljitettävyys - jokaisen kiven matka dokumentoidaan alusta loppuun, jotta tiedät tarkalleen, mistä timanttisi tulee.",
      ],
    },
  },
  {
    key: "beyond",
    label: {
      en: "BEYOND THE CUT",
      fi: "TIMANTIN TIE JALOKIVEKSI",
    },
    title: {
      en: "BEYOND THE CUT",
      fi: "TIMANTIN TIE JALOKIVEKSI",
    },
    image: "/diamonddifference/beyond_the_cut.jpeg",
    alt: "Beyond the cut",
    body: {
      en: [
        "A diamond’s value and identity are shaped long before it arrives in our studio. Understanding this journey is key to appreciating the stone in your hand.",
        "The diamond value chain begins at the mine, where rough stones are extracted. These rough diamonds are then sold to cutters and polishers, typically in global trading centers. Next, highly skilled cutters and polishers transform the rough stones into brilliant polished diamonds. These polished stones are then graded and certified by independent labs based on the 4Cs (Carat, Color, Clarity, Cut). Finally, the certified diamonds are delivered to our Korkeila Helsinki boutique where they are carefully crafted into fine jewellery. Each step adds skill, accountability, and value to the final product.",
      ],
      fi: [
        "Timantin arvo ja ainutlaatuisuus syntyvät jo kauan ennen kuin se saapuu liikkeeseemme. Tämän matkan ymmärtäminen antaa uudenlaista arvostusta kiveä kohtaan.",
        "Timantin matka alkaa kaivoksesta, jossa raakakivi kaivetaan esiin. Sieltä kivet myydään eteenpäin hiojille ja kiillottajille, yleensä kansainvälisen timanttikaupan keskuksissa, missä taitavat ammattilaiset muotoilevat raakakivestä säihkyvän timantin. Tämän jälkeen kivi lähetetään riippumattomaan laboratorioon, jossa se arvioidaan 4C-kriteerien mukaan: karaatti (Carat), väri (Color), kirkkaus (Clarity) ja hionta (Cut). Vasta tämän jälkeen sertifioitu timantti lähetetään meille Korkeila Helsingille, jossa niistä valmistetaan huolella ja ammattitaidolla uniikkeja koruja. Jokainen vaihe lisää kiveen arvoa, asiantuntemusta ja vastuullisuutta, jotta lopputuote olisi jotain mitä voit kantaa ylpeydellä ja merkityksellä.",
      ],
    },
  },
];

export default function DiamondDifferencePage() {
  const { language } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const [activeKey, setActiveKey] = useState("global");
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeKey) ?? tabs[0],
    [activeKey]
  );
  const header = headerByLanguage[languageKey] ?? headerByLanguage.en;

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h1 className={styles.heading}>{header.heading}</h1>
            <p className={styles.subtitle}>{header.subtitle}</p>
            <p className={styles.copy}>{header.intro}</p>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Diamond difference sections">
            {tabs.map((tab) => {
              const isActive = tab.key === activeKey;
              return (
                <button
                  key={tab.key}
                  type="button"
                  id={`diamond-difference-tab-${tab.key}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="diamond-difference-panel"
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  onClick={() => setActiveKey(tab.key)}
                >
                  {tab.label[languageKey] ?? tab.label.en}
                </button>
              );
            })}
          </div>

          <div
            id="diamond-difference-panel"
            role="tabpanel"
            aria-labelledby={`diamond-difference-tab-${activeTab.key}`}
            className={styles.panel}
          >
            <div className={styles.panelText}>
              <p className={styles.panelTitle}>
                {activeTab.title[languageKey] ?? activeTab.title.en}
              </p>
              {(languageKey === "fi" ? activeTab.body.fi : activeTab.body.en)?.map((paragraph) => (
                <p key={paragraph} className={styles.panelBody}>
                  {paragraph}
                </p>
              ))}
              {(languageKey === "fi" ? activeTab.body.fiList : activeTab.body.enList) ? (
                <ul className={styles.panelList}>
                  {(languageKey === "fi" ? activeTab.body.fiList : activeTab.body.enList).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {(languageKey === "fi" ? activeTab.body.fiAfter : activeTab.body.enAfter) ? (
                <p className={styles.panelBody}>
                  {languageKey === "fi" ? activeTab.body.fiAfter : activeTab.body.enAfter}
                </p>
              ) : null}
            </div>
            <div className={styles.panelMedia}>
              <Image
                className={styles.panelImage}
                src={activeTab.image}
                alt={activeTab.alt}
                width={520}
                height={360}
              />
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
