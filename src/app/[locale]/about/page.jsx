import { notFound } from "next/navigation";
import Image from "next/image";
import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import Container from "../../../components/ui/Container.jsx";
import en from "../../../i18n/en.json";
import fi from "../../../i18n/fi.json";
import styles from "../../about/page.module.css";

const SUPPORTED_LOCALES = new Set(["en", "fi"]);
// Same dictionaries I18nProvider uses client-side, so the footer text here
// stays identical to what every other page already shows — not a hand-copied
// duplicate that could drift from the source of truth.
const dictionaries = { en, fi };

const contentByLanguage = {
  en: {
    heading: "ABOUT US",
    sections: [
      {
        title: "Our Story: Heritage Meets Modern Precision",
        body: [
          "Korkeila Helsinki is a premier jewelry destination in the heart of Helsinki, built on the foundation of a Master Goldsmith's legacy. Today, we carry that heritage forward by combining timeless Finnish design with uncompromising, world-class craftsmanship. Whether you are searching for the perfect engagement ring or a bespoke pendant, our focus remains on what matters most to our clients: exceptional quality, transparent value for money, and unwavering trust.",
        ],
      },
      {
        title: "The Advisor Approach",
        body: [
          "Finding the perfect engagement or wedding ring should be a confident, stress-free experience. At Korkeila Helsinki, we take an advisor approach rather than a sales approach. We sit down to listen to your story, understand your lifestyle, and guide you through the nuances of natural and lab-grown diamonds. Our goal is to help you maximize your budget and find a piece that perfectly matches your personal style.",
        ],
      },
      {
        title: "Engineering & Artistry",
        body: [
          "We understand that our clients demand perfection in the details. That is why we are obsessively focused on the technical architecture of our jewelry.",
        ],
        list: [
          {
            bold: "Precision Symmetry:",
            text: " Finns know that a ring is only as beautiful as its construction. We are known for the flawless symmetry of our prongs and secure settings, ensuring maximum light performance and durability.",
          },
          {
            bold: "Seamless Fit:",
            text: " We optimally balance the architecture of our engagement rings—whether you require a low-profile diamond setting for an active lifestyle or a high-profile setting for maximum brilliance—so they sit perfectly flush next to your future wedding band.",
          },
          {
            bold: "Specialty Metals:",
            text: " Beyond standard alloys, we specialize in crafting custom jewelry in Platinum 950, 14K gold, and 18K gold. We are proud to offer highly sought-after, unique tones including Hamilton yellow gold and Champagne color yellow gold.",
          },
        ],
      },
      {
        title: "The Korkeila Helsinki Promise",
        body: [
          "We bridge the gap between bespoke custom jewelry and immediate availability.",
        ],
        list: [
          {
            bold: "Immediate Selection & Short-Notice Orders:",
            text: " Unlike boutiques that only offer display samples to try on, we maintain a vast, premium selection of jewelry available to purchase immediately. We also possess the agility to execute custom orders on short notice without ever compromising quality.",
          },
          {
            bold: "Risk-Free Proposals:",
            text: " Propose with complete confidence. We offer free ring resizing within 6 months of purchase. Furthermore, if you propose and your partner desires a different style, our flexible exchange policy allows you to trade the original ring for their dream design.",
          },
          {
            bold: "Certified Authenticity & Independent Grading:",
            text: " Trust is built on transparency. All our natural and lab-grown diamonds are strictly conflict-free. Our premium center stones are accompanied by internationally recognized grading certificates (such as GIA or IGI), providing you with objective proof of their cut, clarity, and value. Furthermore, every Korkeila Helsinki piece carries official hallmarks, guaranteeing the exact purity of our Platinum, 14K, and 18K gold.",
          },
        ],
      },
    ],
  },
  fi: {
    heading: "MEISTÄ",
    sections: [
      {
        title: "Tarinamme: Perinteet kohtaavat modernin tarkkuuden",
        body: [
          "Korkeila Helsinki on Helsingin sydämessä sijaitseva huippuluokan kultasepänliike, jonka juuret ovat vahvasti suomalaisen kultaseppämestarin perinteessä. Tänä päivänä viemme tätä perintöä eteenpäin yhdistämällä ajattoman suomalaisen suunnittelun maailmanluokan käsityötaitoon. Etsitpä sitten täydellistä kihlasormusta tai uniikkia riipusta, keskitymme siihen, mikä on asiakkaillemme tärkeintä: poikkeukselliseen laatuun, läpinäkyvään hinta-laatusuhteeseen ja horjumattomaan luottamukseen.",
        ],
      },
      {
        title: "Asiantuntijavetoinen lähestymistapa",
        body: [
          "Täydellisen kihla- tai vihkisormuksen valinnan tulisi olla varma ja stressitön kokemus. Korkeila Helsingissä emme toimi painostavina myyjinä, vaan asiantuntevina neuvonantajina. Kuuntelemme tarinaasi, ymmärrämme elämäntyyliäsi ja opastamme sinua luonnon- ja laboratoriotimanttien eroissa. Tavoitteemme on auttaa sinua maksimoimaan budjettisi ja löytämään koru, joka vastaa täydellisesti henkilökohtaista tyyliäsi.",
        ],
      },
      {
        title: "Tekninen täydellisyys ja käsityö",
        body: [
          "Ymmärrämme, että suomalaiset asiakkaat vaativat täydellisyyttä yksityiskohdissa. Siksi keskitymme intohimoisesti korujemme tekniseen rakenteeseen.",
        ],
        list: [
          {
            bold: "Tarkka symmetria:",
            text: " Sormus on juuri niin kaunis kuin sen rakenne antaa myöten. Olemme tunnettuja istutuksen kynsien virheettömästä symmetriasta ja turvallisista rakenteista, jotka takaavat timantin maksimaalisen säihkeen ja kestävyyden.",
          },
          {
            bold: "Saumaton istuvuus:",
            text: " Tasapainotamme kihlasormuksen rakenteen optimaalisesti – vaatipa elämäntyylisi sitten matalaa timantti-istutusta tai maksimaalista näyttävyyttä tuovaa korkeaa istutusta – jotta sormus asettuu täydellisen saumattomasti tulevan vihkisormuksen viereen.",
          },
          {
            bold: "Erikoismetallit:",
            text: " Perinteisten seosten lisäksi olemme erikoistuneet valmistamaan tilaustöitä platina 950:stä sekä 14 ja 18 karaatin kullasta. Olemme ylpeitä voidessamme tarjota haluttuja erikoissävyjä, kuten ainutlaatuista Hamilton-kultaa ja samppanjakultaa.",
          },
        ],
      },
      {
        title: "Korkeila Helsinki -lupaus",
        body: [
          "Yhdistämme yksilöllisen tilaustyön ja heti saatavilla olevan valikoiman parhaat puolet.",
        ],
        list: [
          {
            bold: "Laaja valikoima ja nopeat tilaukset:",
            text: " Toisin kuin liikkeet, joissa on esillä vain sovitettavia mallikappaleita, meillä on myymälässämme poikkeuksellisen laaja ja laadukas valikoima koruja heti ostettavaksi. Pystymme myös toteuttamaan tilaustöitä lyhyellä varoitusajalla laadusta tinkimättä.",
          },
          {
            bold: "Riskitön kosinta:",
            text: " Kosi luottavaisin mielin. Tarjoamme ilmaisen koonmuutoksen kuuden kuukauden sisällä ostopäivästä. Lisäksi tarjoamme joustavan vaihtokäytännön: jos kosit yhdellä sormuksella ja kumppanisi toivoo erilaista tyyliä, alkuperäinen sormus voidaan vaihtaa hänen unelmiensa designiin.",
          },
          {
            bold: "Sertifioitua aitoutta ja luottamusta:",
            text: " Luottamus rakentuu läpinäkyvyydelle. Kaikki käyttämämme luonnon- ja laboratoriotimantit ovat sataprosenttisesti konfliktivapaita. Ensiluokkaisten keskikiviemme mukana toimitetaan aina kansainvälisesti arvostettu, riippumaton sertifikaatti (kuten GIA tai IGI), joka on objektiivinen todistus kiven hionnasta, puhtaudesta ja arvosta. Lisäksi jokaisessa Korkeila Helsingin korussa on viralliset tarkastusleimat, jotka takaavat käyttämämme platinan sekä 14K ja 18K kullan tarkan pitoisuuden.",
          },
        ],
      },
    ],
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isFi = locale === "fi";
  return {
    title: isFi
      ? "Meistä | Korkeila Helsinki"
      : "About Us | Korkeila Helsinki",
    description: isFi
      ? "Korkeila Helsinki on Helsingin sydämessä sijaitseva huippuluokan kultasepänliike, jonka juuret ovat suomalaisen kultaseppämestarin perinteessä."
      : "Korkeila Helsinki is a premier jewelry destination in the heart of Helsinki, built on the foundation of a Master Goldsmith's legacy.",
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        en: "/en/about",
        fi: "/fi/about",
        "x-default": "/en/about",
      },
    },
  };
}

export default async function LocalizedAboutPage({ params }) {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.has(locale)) notFound();
  const content = contentByLanguage[locale] ?? contentByLanguage.en;
  const brandDescription =
    (dictionaries[locale] ?? dictionaries.en).footer.homeBrandDescription;

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
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
                    <ul className={styles.list}>
                      {section.list.map((item, itemIndex) => (
                        <li key={itemIndex} className={styles.listItem}>
                          <strong>{item.bold}</strong>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </div>

          <div className={styles.imageWrap}>
            <Image
              className={styles.image}
              src="/aboutus/FINAL%20LOGO_NEW.png"
              alt="Korkeila Helsinki"
              width={640}
              height={420}
            />
          </div>
        </Container>
      </main>
      <SiteFooter brandDescription={brandDescription} />
    </div>
  );
}
