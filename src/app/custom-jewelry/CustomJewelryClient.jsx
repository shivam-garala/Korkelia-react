"use client";

import Hero from "../../components/Home/Hero.jsx";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const contentByLanguage = {
  en: {
    heading: "CUSTOM JEWELRY",
    sections: [
      {
        title: "Bespoke & Custom Jewelry in Helsinki",
        body: [
          "At Korkeila Helsinki, crafting a bespoke piece is a collaborative, advisor-led process. We translate your vision into reality without the typical long wait times—we are uniquely positioned to execute short-notice custom orders to our exacting standards. Whether you are designing an engagement ring, a custom pendant, or bespoke earrings, we deliver world-class craftsmanship with transparent value for money.",
        ],
      },
      {
        title: "Our Custom Design Process",
        body: [
          "We believe that finding or creating the perfect ring should be a confident, stress-free experience.",
        ],
        listType: "ordered",
        list: [
          {
            bold: "The Advisor Consultation",
            text: " We take an advisor approach, not a sales approach. We sit down with you to understand your lifestyle, aesthetic preferences, and budget. If you are planning a proposal, we discuss how to balance the architecture of the engagement ring so it will sit perfectly flush next to a future wedding band.",
          },
          {
            bold: "Metal & Diamond Selection",
            text: " We guide you through a side-by-side comparison of ethically sourced natural diamonds and premium lab-grown diamonds, explaining the true value of each. You will also select your preferred precious metal. While others offer standard alloys, we specialize in Platinum 950, 14K gold, 18K gold, and our highly sought-after, unique tones: Hamilton yellow gold and Champagne color yellow gold.",
          },
          {
            bold: "Engineering & Craftsmanship",
            text: " Our focus is on uncompromising technical architecture. We tailor the height of your diamond setting—offering secure, low-profile settings for active lifestyles or high-profile settings for maximum brilliance. Throughout the crafting process, we ensure flawless precision prong symmetry, guaranteeing both the durability and the aesthetic perfection of the piece.",
          },
        ],
      },
      {
        title: "Flexibility for Proposals",
        body: [
          "If you want to propose with a custom piece but are unsure of the exact details, we offer complete peace of mind. You can propose with a ring from our immediate display collection, and if your partner prefers a different bespoke design, our flexible exchange policy allows you to trade the original ring. Furthermore, we offer free resizing within 6 months of purchase to ensure the perfect fit.",
        ],
      },
    ],
  },
  fi: {
    heading: "TILAUSTYÖT",
    sections: [
      {
        title: "Tilaustyöt ja Uniikit Korut Helsingissä",
        body: [
          "Korkeila Helsingissä uniikin korun teettäminen on yhteistyötä asiantuntijan kanssa. Muutamme visiosi todeksi ilman tyypillisiä pitkiä odotusaikoja – meillä on ainutlaatuinen kyky toteuttaa tilaustöitä myös lyhyellä varoitusajalla, tiukoista laatustandardeistamme tinkimättä. Suunnittelitpa sitten kihlasormusta, yksilöllistä riipusta tai korvakoruja, tarjoamme maailmanluokan käsityötaitoa ja läpinäkyvää hinta-laatusuhdetta.",
        ],
      },
      {
        title: "Tilaustöiden valmistusprosessi",
        body: [
          "Uskomme, että täydellisen sormuksen suunnittelun tai valinnan tulisi olla varma ja stressitön kokemus.",
        ],
        listType: "ordered",
        list: [
          {
            bold: "Asiantuntijan konsultaatio",
            text: " Emme toimi painostavina myyjinä, vaan luotettavina neuvonantajina. Kartoitamme rauhassa elämäntyylisi, tyylitoiveesi ja budjettisi. Jos suunnittelet kosintaa, katsomme jo tässä vaiheessa tulevaisuuteen: suunnittelemme kihlasormuksen rakenteen niin, että se asettuu aikanaan täydellisen saumattomasti yhteen vihkisormuksen kanssa.",
          },
          {
            bold: "Metallien ja timanttien valinta",
            text: " Autamme sinua vertailemaan eettisesti tuotettuja luonnontimantteja ja huippuluokan laboratoriotimantteja vierekkäin, avaten niiden todellisen arvon. Valitset myös haluamasi jalometallin. Vaikka monet tarjoavat vain vakioseoksia, meidän erikoisosaamistamme ovat platina 950, 14K ja 18K kulta – sekä erityisesti poikkeukselliset ja erittäin halutut erikoissävyimme: Hamilton-kulta ja samppanjakulta.",
          },
          {
            bold: "Tekninen rakenne ja käsityötaito",
            text: " Keskitymme tinkimättömään tekniseen laatuun. Räätälöimme timantti-istutuksen korkeuden tarpeidesi mukaan: voimme toteuttaa turvallisen ja matalan istutuksen aktiiviseen arkeen tai korkean istutuksen, joka maksimoi timantin säihkeen. Koko valmistusprosessin ajan varmistamme kynsien virheettömän symmetrian, mikä takaa korulle sekä kestävyyden että esteettisen täydellisyyden.",
          },
        ],
      },
      {
        title: "Joustavuutta kosintaan",
        body: [
          "Jos haluat kosia tilaustyönä tehdyllä sormuksella, mutta olet epävarma yksityiskohdista, tarjoamme täydellisen mielenrauhan. Voit kosia heti saatavilla olevan valikoimamme sormuksella. Mikäli kumppanisi toivoo erilaista, yksilöllistä designia, joustava vaihtokäytäntömme mahdollistaa alkuperäisen sormuksen vaihtamisen. Lisäksi tarjoamme ilmaisen koonmuutoksen 6 kuukauden ajan ostopäivästä täydellisen istuvuuden varmistamiseksi.",
        ],
      },
    ],
  },
};

export default function CustomJewelryPage() {
  const { language, t } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const content = contentByLanguage[languageKey] ?? contentByLanguage.en;

  return (
    <div className={styles.page}>
      <SiteHeader />
      <Hero
        videoSrc="https://imagesweb2026.s3.eu-north-1.amazonaws.com/Rings_in_Motion.mp4"
        mobileVideoSrc="https://imagesweb2026.s3.eu-north-1.amazonaws.com/Ring_in_motion_mobile.mp4"
        posterSrc="/homepage/poster_default.png"
      />
      <main className={styles.main}>
        <Container>
          <div className={styles.header}>
            <h2 className={styles.heading}>{content.heading}</h2>
            <div className={styles.content}>
              {content.sections.map((section, index) => (
                <section key={index} className={styles.section}>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                  {section.body?.map((paragraph, pIndex) => (
                    <p key={pIndex} className={styles.paragraph}>
                      {paragraph}
                    </p>
                  ))}
                  {section.list ? (
                    section.listType === "ordered" ? (
                      <ol className={styles.orderedList}>
                        {section.list.map((item, itemIndex) => (
                          <li key={itemIndex} className={styles.listItem}>
                            <strong>{item.bold}</strong>
                            {item.text}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ul className={styles.list}>
                        {section.list.map((item, itemIndex) => (
                          <li key={itemIndex} className={styles.listItem}>
                            <strong>{item.bold}</strong>
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    )
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter brandDescription={t("footer.homeBrandDescription")} />
    </div>
  );
}
