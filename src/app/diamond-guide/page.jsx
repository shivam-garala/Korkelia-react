"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const tabs = [
  {
    key: "carat",
    label: { en: "CARAT", fi: "KARAATTI" },
    title: { en: "CARAT", fi: "KARAATTI" },
    image: "/diamondguide/carat.png",
    alt: "Diamond carat diagram",
    body: {
      en: "Carat refers to a diamond’s weight, a measure often associated with impact, presence, and luxury. One carat equals 200 milligrams, but the perception of size is influenced by the diamond’s shape and cut. While larger stones are rarer and often more valuable, size alone does not define a diamond’s beauty. At Korkeila Helsinki, we believe a well-balanced diamond — one that harmonizes carat weight with exceptional cut and proportion — has far more lasting elegance than weight alone can offer. Each diamond is chosen not only for its scale, but for how gracefully it sits in its setting, and how it speaks to the wearer’s individuality.",
      fi: "Karaatti kertoo timantin painosta – ominaisuudesta, joka usein yhdistetään näyttävyyteen, olemukseen ja ylellisyyteen. Yksi karaatti vastaa 200 milligrammaa, mutta todellinen koko- ja näyttävyysvaikutelma syntyy myös timantin muodosta ja hionnasta. Suuremmat kivet ovat harvinaisempia ja usein arvokkaampia, mutta koko ei yksin tee timantista kaunista. Me Korkeila Helsingillä uskomme, että todellinen eleganssi syntyy tasapainosta kun karaattipaino, hionta ja mittasuhteet täydentävät toisiaan. Jokainen timantti valitaan paitsi mittansa, myös sen perusteella, miten se asettuu koruun ja miten se puhuttelee kantajansa persoonallisuutta.",
    },
  },
  {
    key: "color",
    label: { en: "COLOR", fi: "VÄRI" },
    title: { en: "COLOR", fi: "VÄRI" },
    image: "/diamondguide/color.png",
    alt: "Diamond color scale",
    body: {
      en: "Color describes the subtle presence or absence of hue in a white diamond. The GIA color scale ranges from D (completely colorless) to Z (noticeable tint), with the most prized stones showing pure, icy brilliance free from any trace of yellow or brown. Yet, color is not just a technical grade — it is a mood, a feeling. A D-colour diamond may feel crisp and modern, while a slightly warmer tone may offer softness and vintage charm. Our role is to help you find the shade that complements your style, your skin tone, and the emotion you want your jewellery to convey.",
      fi: "Väri viittaa valkoisen timantin hienovaraiseen sävyerotteluun – siihen, kuinka väritön tai sävytetty kivi on. GIA:n väriskaala ulottuu D-luokan täydellisen värittömästä aina Z-luokan havaittavaan sävyyn saakka. Arvostetuimmat kivet ovat sävyltään kylmiä ja kirkkaita, ilman pienintäkään keltaista tai ruskeaa vivahdetta. Väri ei kuitenkaan ole vain tekninen luokitus, se on myös tunnelma ja tunnekokemus. D-luokan timantti voi tuntua modernilta ja raikkaalta, kun taas hieman lämpimämpi sävy voi tuoda koruun pehmeyttä ja vintage-henkeä. Meidän tehtävämme on auttaa sinua löytämään sävy, joka täydentää tyyliäsi, ihonsävyäsi ja sitä tunnetta, jonka haluat korusi välittävän.",
    },
  },
  {
    key: "clarity",
    label: { en: "CLARITY", fi: "SELKEYS" },
    title: { en: "CLARITY", fi: "SELKEYS" },
    image: "/diamondguide/clarity.png",
    alt: "Diamond clarity details",
    body: {
      en: "Clarity measures the purity of a diamond — the presence or absence of natural inclusions and surface features. These internal characteristics are like fingerprints; most are microscopic and invisible to the naked eye. The GIA clarity scale ranges from Flawless (FL) to Included (I), but clarity is not only about perfection — it is about how the diamond captures light, and how clean and brilliant it appears in person. At Korkeila Helsinki, we hand-select diamonds that are eye-clean, luminous, and full of life.",
      fi: "Kirkkaus eli clarity mittaa timantin puhtautta – luonnollisten sulkeumien ja pinnan ominaisuuksien esiintymistä tai puuttumista. Nämä sisäiset piirteet ovat kuin timantin sormenjälkiä ja suurin osa niistä on mikroskooppisia, paljaalle silmälle näkymättömiä. GIA:n kirkkausasteikko ulottuu virheettömästä (Flawless, FL) selvästi sulkeumia sisältävään (Included, I). Kirkkaus ei kuitenkaan ole vain täydellisyyden tavoittelua – se on myös sitä, kuinka timantti heijastaa valoa ja kuinka puhtaana ja elävänä se näyttäytyy todellisessa käytössä. Korkeila Helsingillä valitsemme käsin vain sellaisia timantteja, jotka ovat silmin katsottuna puhtaita, säteileviä ja elinvoimaisia.",
    },
  },
  {
    key: "cut",
    label: { en: "CUT", fi: "LEIKATA" },
    title: { en: "CUT", fi: "LEIKATA" },
    image: "/diamondguide/cut.png",
    alt: "Diamond cut proportions",
    body: {
      en: "Cut is the soul of the diamond — the only one of the 4Cs shaped entirely by human craftsmanship. It determines how a diamond interacts with light: how it reflects, refracts, and sparkles with every movement. A masterfully cut diamond exhibits brilliance (white light), fire (flashes of color), and scintillation (sparkle) in perfect harmony. Even a high-carat, high-color diamond can appear dull if the cut is poor — while a modestly sized stone with an excellent cut can outshine them all. Our commitment is to only work with diamonds that meet the highest standards of proportion, symmetry, and polish, ensuring that every stone comes to life the moment it touches the light.",
      fi: "Hionta on timantin sielu – ainoa neljästä C:stä, joka on täysin ihmisen muovaama. Se määrittää, miten timantti toimii valon kanssa: miten se heijastaa, taittaa ja sädehtii liikkeessä. Taidokkaasti hiottu timantti loistaa täydellisessä tasapainossa – siinä yhdistyvät briljanssi (valon kirkkaus), tuli (värisäteet) ja säihke (valon leikki). Suuren karaattimäärän ja korkean väriluokituksen timantti voi näyttää elottomalta, jos hionta on heikko kun taas pienempi, mutta erinomaisesti hiottu timantti voi säihkyä vertaansa vailla. Teemme yhteistyötä vain sellaisten hiomojen ja toimittajien kanssa, jotka täyttävät korkeimmat vaatimukset mittasuhteiden, symmetrian ja kiillotuksen osalta, jotta jokainen valitsemamme timantti herää eloon valossa.",
    },
  },
];

export default function DiamondGuidePage() {
  const { language } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const [activeKey, setActiveKey] = useState("carat");
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeKey) ?? tabs[0],
    [activeKey]
  );

  const header =
    languageKey === "fi"
      ? {
          heading: "Korkeila Helsinki timanttiopas",
          subtitle: "Johdatus timanttien ainutlaatuiseen loistoon",
          copy: [
            "Timanttimme ovat tarinoita, jotka ovat saaneet alkunsa luonnossa, hioutuneet mestarillisissa käsissä ja valikoituneet tunteella. Korkeila Helsingin timanttiopas auttaa sinua ymmärtämään, mistä timantin kauneus ja arvo todella syntyvät. Tuomme esiin timantin eri ulottuvuudet, sen luonteen eri puolet, jotka yhdessä muodostavat kokonaisuuden: laadun, harvinaisuuden ja yksilöllisyyden.",
            "4C-järjestelmä antaa meille kielen, jonka avulla voimme kertoa timantin tarinan, mutta yksikään sertifikaatti ei voi täysin välittää timantin olemusta. Siksi yhdistämme asiantuntemuksen henkilökohtaiseen ohjaukseen ja autamme sinua löytämään juuri sen timantin, joka heijastaa paitsi laatua, myös sinua – sinun tyyliäsi, tarinaasi ja arvojasi.",
          ],
        }
      : {
          heading: "THE KORKEILA HELSINKI DIAMOND GUIDE",
          subtitle: "A Curated Guide to the brilliance of diamonds",
          copy: [
            "Our diamonds are a story shaped by nature, refined by human hands, and chosen with emotion. The Korkeila Helsinki Diamond Guide serves to help you understand what gives a diamond its beauty and value. We highlight the different facets of a diamond’s character which, when viewed together, form a complete picture of excellence, rarity, and personal expression.",
            "Together, the 4Cs offer a language through which a diamond’s story is told — but no grading report can capture the full essence of a stone. That’s why we combine expert knowledge with personal guidance, helping you discover a diamond that reflects not only quality, but you — your style, your story, your values.",
          ],
        };

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h2 className={styles.heading}>{header.heading}</h2>
            <p className={styles.subtitle}>{header.subtitle}</p>
            {header.copy.map((paragraph) => (
              <p key={paragraph} className={styles.copy}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Diamond guide sections">
            {tabs.map((tab) => {
              const isActive = tab.key === activeKey;
              return (
                <button
                  key={tab.key}
                  type="button"
                  id={`diamond-guide-tab-${tab.key}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="diamond-guide-panel"
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                onClick={() => setActiveKey(tab.key)}
              >
                {tab.label[languageKey] ?? tab.label.en}
              </button>
            );
          })}
        </div>

          <div
            id="diamond-guide-panel"
            role="tabpanel"
            aria-labelledby={`diamond-guide-tab-${activeTab.key}`}
            className={styles.panel}
          >
            <div className={styles.panelText}>
              <p className={styles.panelTitle}>
                {activeTab.title[languageKey] ?? activeTab.title.en}
              </p>
              <p className={styles.panelBody}>
                {languageKey === "fi" ? activeTab.body.fi : activeTab.body.en}
              </p>
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
