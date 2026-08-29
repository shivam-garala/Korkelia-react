import { notFound } from "next/navigation";
import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import Container from "../../../components/ui/Container.jsx";
import en from "../../../i18n/en.json";
import fi from "../../../i18n/fi.json";
import styles from "../../diamond-difference/page.module.css";
import DiamondDifferenceTabs from "./DiamondDifferenceTabs.jsx";

const SUPPORTED_LOCALES = new Set(["en", "fi"]);
const dictionaries = { en, fi };

const headerByLanguage = {
  en: {
    heading: "Designed and Manufactured in Finland",
    //subtitle: "The Korkeila Helsinki Diamond Difference: Your personal diamond sourcing Concierge",
    //intro:      "When it comes to diamonds—whether natural or laboratory-grown—finding the perfect stone requires more than just luck. It requires a dedicated global network, deep expertise, and a commitment to quality and ethics. At Korkeila Helsinki, we don't just sell diamonds; we are your personal concierge and sourcing partner.",
  },
  fi: {
    heading: "Suunniteltu ja valmistettu Suomessa",
    //subtitle: "Henkilökohtainen timanttien hankintakonsulttisi",
    //intro:  "Timantin valinta, olipa kyseessä luonnontimantti tai laboratoriossa kasvatettu kivi, vaatii enemmän kuin pelkkää onnea. Se vaatii laajan kansainvälisen verkoston, syvällistä asiantuntemusta sekä tinkimätöntä sitoutumista laatuun ja eettisyyteen. Me Korkeila Helsingillä emme vain myy timantteja, olemme henkilökohtainen hankintakumppanisi ja concierge-palvelusi timanttien maailmassa.",
  },
};

const tabs = [
  {
    key: "global",
    label: {
      en: "Transparent Nordic Craftsmanship",
      fi: "Läpinäkyvää Pohjoismaista Käsityötaitoa",
    },
    title: {
      en: "Transparent Nordic Craftsmanship",
      fi: "Läpinäkyvää Pohjoismaista Käsityötaitoa",
    },
    image: "/diamonddifference/global_sourcing.jpg",
    alt: "Global sourcing network",
    body: {
      en: [
        "True luxury requires complete transparency. We manage our supply chain meticulously to ensure ethical production, utilizing recycled precious metals and maintaining exceptional quality standards.",
      ],
      enList: [
        {
          bold: "Design & Engineering: ",
          text: "Every bespoke engagement ring and fine jewelry piece is conceptualized by our advisors at our Korkeavuorenkatu boutique.",
        },
        {
          bold: "Precision Casting (Kirkkonummi): ",
          text: "We utilize recycled 14K gold, 18K gold, and Platinum 950, with the complete casting process executed in Kirkkonummi, Finland.",
        },
        {
          bold: "Polishing, Setting & Inspection (Helsinki): ",
          text: "The final polishing, precision diamond setting, and rigorous quality inspection are all executed locally in Helsinki.",
        },
        {
          bold: "Ethical Diamond Sourcing: ",
          text: "We source exceptional lab-grown stones and strictly Kimberley Process-compliant natural diamonds through established, vetted partners in the USA, Belgium, Germany, and Finland. We ensure our diamonds are fully certified by the world's most recognized gemological laboratories, primarily the GIA and IGI.",
        },
      ],
      fi: [
        "Todellinen ylellisyys vaatii täydellistä läpinäkyvyyttä. Hallitsemme toimitusketjuamme huolellisesti varmistaaksemme eettisen tuotannon, hyödyntäen kierrätettyjä jalometalleja ja ylläpitäen poikkeuksellisia laatustandardeja.",
      ],
      fiList: [
        {
          bold: "Suunnittelu: ",
          text: "Jokainen tilaustyönä tehtävä sormus ja hienokoru suunnitellaan asiantuntijoidemme toimesta Korkeavuorenkadun myymälässämme.",
        },
        {
          bold: "Valu (Kirkkonummi): ",
          text: "Käytämme kierrätettyä 14K ja 18K kultaa sekä platina 950:tä, ja koko valamisprosessi toteutetaan Kirkkonummella, Suomessa.",
        },
        {
          bold: "Kiillotus, Istutus ja Tarkastus (Helsinki): ",
          text: "Lopullinen kiillotus, tarkka timanttien istutus ja tiukka laaduntarkastus toteutetaan kaikki paikallisesti Helsingissä.",
        },
        {
          bold: "Eettinen Timanttien Hankinta: ",
          text: "Hankimme poikkeuksellisia laboratoriotimantteja sekä tarkasti Kimberley-prosessin mukaisia luonnontimantteja luotettavien kumppaneidemme kautta Yhdysvalloista, Belgiasta, Saksasta ja Suomesta. Varmistamme, että timanttimme ovat täysin sertifioituja maailman arvostetuimpien gemologisten laboratorioiden, ensisijaisesti GIA:n ja IGI:n, toimesta.",
        },
      ],
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
    image: "/diamonddifference/commitment.jpg",
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
    image: "/diamonddifference/beyond_the_cut.jpg",
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

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isFi = locale === "fi";
  return {
    title: isFi
      ? "Timanttiero | Korkeila Helsinki"
      : "The Diamond Difference | Korkeila Helsinki",
    description: isFi
      ? "Henkilökohtainen timanttien hankintakonsulttisi: globaali verkosto, sertifiointi ja eettisyys."
      : "Your personal diamond sourcing concierge: global network, certification, and ethical sourcing.",
    alternates: {
      canonical: `/${locale}/diamond-difference`,
      languages: {
        en: "/en/diamond-difference",
        fi: "/fi/diamond-difference",
        "x-default": "/en/diamond-difference",
      },
    },
  };
}

export default async function LocalizedDiamondDifferencePage({ params }) {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.has(locale)) notFound();
  const header = headerByLanguage[locale] ?? headerByLanguage.en;
  const brandDescription = (dictionaries[locale] ?? dictionaries.en).footer.homeBrandDescription;

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

          <DiamondDifferenceTabs tabs={tabs} languageKey={locale} />
        </Container>
      </main>
      <SiteFooter brandDescription={brandDescription} />
    </div>
  );
}
