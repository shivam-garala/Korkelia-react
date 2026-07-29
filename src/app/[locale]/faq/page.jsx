import { notFound } from "next/navigation";
import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import Container from "../../../components/ui/Container.jsx";
import en from "../../../i18n/en.json";
import fi from "../../../i18n/fi.json";
import styles from "../../faq/page.module.css";
import FaqAccordion from "./FaqAccordion.jsx";

const SUPPORTED_LOCALES = new Set(["en", "fi"]);
const dictionaries = { en, fi };

const contentByLanguage = {
  en: {
    heading: "FREQUENTLY ASKED QUESTIONS",
    faqs: [
      {
        question: "Do you offer both lab-grown and natural diamonds?",
        answer:
          "Yes. We take an advisor approach to help you choose the best stone for your preferences. Our extensive selection of engagement and wedding rings can be crafted using either ethically sourced natural diamonds or premium lab-grown diamonds, set in 14K gold, 18K gold, or Platinum 950.",
      },
      {
        question:
          "I am looking for a specific gold color. Do you craft rings in Hamilton or Champagne yellow gold?",
        answer:
          "Absolutely. While many jewelers only carry standard alloys, Korkeila Helsinki specializes in unique gold tones, including the highly sought-after Hamilton yellow gold and Champagne color yellow gold.",
      },
      {
        question: "How do you ensure the engagement ring and wedding band fit together seamlessly?",
        answer:
          "We engineer our rings to optimally balance the fit and style of the engagement ring next to the wedding ring. Whether you prefer a low-profile diamond setting for an active lifestyle or a high-profile setting for maximum brilliance, we guarantee precision prong symmetry and a flush fit between bands.",
      },
      {
        question: "Do you accommodate short-notice engagement ring orders in Helsinki?",
        answer:
          "Yes. We understand that timelines can change. Unlike many jewelers who only offer custom pieces with long wait times, Korkeila Helsinki maintains a wide, premium selection of jewelry available on display for immediate purchase, and we possess the agility to execute short-notice custom orders without compromising our leading craftsmanship.",
      },
      {
        question: "What if I guess the wrong ring size or my partner wants a different style after I propose?",
        answer:
          "We offer complete peace of mind. Korkeila Helsinki provides free resizing within 6 months of purchase. Furthermore, we offer a flexible proposal policy: you can propose with one ring from our collection, and if your partner prefers a different design, they can exchange the original ring to ensure they get exactly what they want.",
      },
      {
        question: "Do you use recycled gold and platinum in your jewelry?",
        answer:
          "Yes, our rings and fine jewelry are crafted using 100% recycled 14K gold, 18K gold, and Platinum 950. Recycled precious metals are chemically, structurally, and visually identical to newly mined metals. They offer the exact same durability and premium luxury finish without the heavy environmental toll of raw extraction.\n\nBy utilizing refined, pre-existing metals, we drastically reduce our carbon footprint and avoid the ecological disruption associated with traditional mining. This commitment to a circular economy perfectly complements the sustainable nature of our laboratory-grown diamonds. It also aligns seamlessly with the strict ethical standards of our natural diamonds, which are fully certified and sourced exclusively from suppliers adhering to the Kimberley Process. Whether you select a lab-grown diamond or a certified natural diamond, your piece is engineered with uncompromising environmental and ethical integrity from the metal up.",
      },
    ],
  },
  fi: {
    heading: "USEIN KYSYTYT KYSYMYKSET",
    faqs: [
      {
        question: "Tarjoatteko sekä laboratorio- että luonnontimantteja?",
        answer:
          "Kyllä. Toimimme asiantuntijoina ja neuvonantajina auttaaksemme sinua valitsemaan juuri sinulle sopivimman kiven. Laaja valikoimamme kihla- ja vihkisormuksia on saatavilla joko eettisesti tuotetuilla luonnontimanteilla tai huippuluokan laboratoriotimanteilla. Jalometalleina käytämme 14 karaatin ja 18 karaatin kultaa sekä platina 950:tä.",
      },
      {
        question: "Etsin tiettyä kullansävyä. Valmistatteko sormuksia Hamilton- tai samppanjakullasta?",
        answer:
          "Ehdottomasti. Vaikka monet liikkeet tarjoavat vain vakioseoksia, Korkeila Helsinki on erikoistunut ainutlaatuisiin kultasävyihin. Valikoimaamme kuuluvat muun muassa erittäin halutut Hamilton-kulta sekä samppanjakulta.",
      },
      {
        question: "Miten varmistatte, että kihla- ja vihkisormus istuvat täydellisesti yhteen?",
        answer:
          "Suunnittelemme sormuksemme niin, että kihla- ja vihkisormuksen istuvuus ja tyyli ovat optimaalisessa tasapainossa. Halusitpa sitten aktiiviseen elämäntyyliin sopivan matalan istutuksen tai maksimaalista säihkettä tuovan korkean istutuksen, takaamme istutuksen kynsien täydellisen symmetrian ja sormusten saumattoman yhteensopivuuden.",
      },
      {
        question: "Onnistuvatko sormustilaukset lyhyellä varoitusajalla Helsingissä?",
        answer:
          "Kyllä. Ymmärrämme, että aikataulut voivat muuttua. Toisin kuin monet liikkeet, jotka tarjoavat vain pitkän toimitusajan tilaustöitä, Korkeila Helsingin myymälässä on laaja ja korkealaatuinen valikoima sormuksia heti ostettavaksi. Pystymme myös toteuttamaan tilaustöitä lyhyellä varoitusajalla laadusta ja käsityön tasosta tinkimättä.",
      },
      {
        question:
          "Entä jos arvioin sormuksen koon väärin, tai kumppanini haluaa kosinnan jälkeen vaihtaa sormuksen tyyliä?",
        answer:
          "Tarjoamme täydellisen mielenrauhan. Korkeila Helsinki tarjoaa ilmaisen koonmuutoksen 6 kuukauden sisällä ostopäivästä. Lisäksi tarjoamme joustavan kosintakäytännön: voit kosia yhdellä valikoimamme sormuksista, ja mikäli kumppanisi toivoo erilaista designia, alkuperäinen sormus voidaan vaihtaa. Näin varmistamme, että lopputulos on täydellinen.",
      },
      {
        question: "Käytättekö koruissanne kierrätettyä kultaa ja platinaa?",
        answer:
          "Kyllä, sormuksemme ja muut hienokorumme valmistetaan 100-prosenttisesti kierrätetystä 14K kullasta, 18K kullasta sekä 950-platinasta. Kierrätetyt jalometallit ovat kemiallisilta, rakenteellisilta ja visuaalisilta ominaisuuksiltaan täysin identtisiä juuri louhitun metallin kanssa. Ne tarjoavat täsmälleen saman kestävyyden ja ensiluokkaisen viimeistelyn ilman raaka-aineiden louhintaan liittyvää raskasta ympäristökuormitusta.\n\nHyödyntämällä puhdistettuja, jo olemassa olevia metalleja pienennämme hiilijalanjälkeämme merkittävästi ja vältämme perinteiseen kaivostoimintaan liittyvät ekologiset haitat. Tämä sitoutuminen kiertotalouteen täydentää täydellisesti laboratoriotimanttiemme kestävää luonnetta. Se sopii saumattomasti yhteen myös luonnontimanttiemme tiukkojen eettisten standardien kanssa: hankimme luonnontimanttimme yksinomaan Kimberleyn prosessia noudattavilta toimittajilta, ja jokainen timanttimme on luotettavasti sertifioitu. Valitsitpa sitten laboratoriotimantin tai sertifioidun luonnontimantin, korusi on valmistettu alusta alkaen ehdottoman eettisesti ja ympäristöä kunnioittaen.",
      },
    ],
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isFi = locale === "fi";
  return {
    title: isFi
      ? "Usein kysytyt kysymykset | Korkeila Helsinki"
      : "Frequently Asked Questions | Korkeila Helsinki",
    description: isFi
      ? "Vastauksia yleisimpiin kysymyksiin kihla- ja vihkisormuksista, timanteista ja tilauksista."
      : "Answers to common questions about engagement rings, wedding bands, diamonds, and orders.",
    alternates: {
      canonical: `/${locale}/faq`,
      languages: {
        en: "/en/faq",
        fi: "/fi/faq",
        "x-default": "/en/faq",
      },
    },
  };
}

export default async function LocalizedFaqPage({ params }) {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.has(locale)) notFound();
  const content = contentByLanguage[locale] ?? contentByLanguage.en;
  const brandDescription = (dictionaries[locale] ?? dictionaries.en).footer.homeBrandDescription;

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h2 className={styles.heading}>{content.heading}</h2>
          </div>

          <FaqAccordion faqs={content.faqs} languageKey={locale} />
        </Container>
      </main>
      <SiteFooter brandDescription={brandDescription} />
    </div>
  );
}
