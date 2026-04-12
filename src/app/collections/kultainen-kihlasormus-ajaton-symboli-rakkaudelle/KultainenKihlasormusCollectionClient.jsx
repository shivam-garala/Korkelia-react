"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import FiltersBar from "../../../components/Product/FiltersBar.jsx";
import ProductGrid from "../../../components/Product/ProductGrid.jsx";
import Container from "../../../components/ui/Container.jsx";
import {
  clearProductListingCache,
  fetchProductListEcom,
  fetchSubCategoryHomePage,
} from "../../../lib/productListingCache.js";
import { useI18n } from "../../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const CATEGORY_ID = "1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.korkeilahelsinki.fi";

const buildSortOptions = (labels) => [
  { value: "price-asc", label: labels.lowToHigh },
  { value: "price-desc", label: labels.highToLow },
];

const introText = (
  <>
    Kultainen kihlasormus on klassinen ja kaunis symboli rakkaudelle.
    Valikoimastamme löydät{" "}
    <a href={`${SITE_URL}/collections/sormukset`} rel="noopener noreferrer">
      kultaisia kihlasormuksia
    </a>{" "}
    useissa malleissa – aina perinteisestä{" "}
    <a
      href={`${SITE_URL}/products/kopio-kihlasormus-4mm-bombe-court-premium`}
      rel="noopener noreferrer"
    >
      14 karaatin keltakullasta
    </a>{" "}
    moderneihin timanteilla koristeltuihin vaihtoehtoihin, kuten{" "}
    <a
      href={`${SITE_URL}/products/kopio-puoliallianssi-sormus-0-33ct-1`}
      rel="noopener noreferrer"
    >
      puoliallianssi-sormus
    </a>{" "}
    tai{" "}
    <a
      href={`${SITE_URL}/products/kopio-kapea-taysallianssisormus-briljanteilla-0-50ct`}
      rel="noopener noreferrer"
    >
      kapea täysallianssisormus
    </a>
    . Sormuksen koko sekä leveys sopii helposti eri tyyleihin – niin miehille kuin
    naisille.
    <br />
    <br />
    Valikoimasta löytyy myös yksilöllisiä malleja, kuten{" "}
    <a
      href={`${SITE_URL}/products/criss-cross-kihlasormus-4-5mm`}
      rel="noopener noreferrer"
    >
      Criss Cross
    </a>
    ,{" "}
    <a href={`${SITE_URL}/products/kukkasormus`} rel="noopener noreferrer">
      Kukkasormus
    </a>
    ,{" "}
    <a
      href={`${SITE_URL}/products/sun-matt-kihlasormus-5-mm`}
      rel="noopener noreferrer"
    >
      Sun Matt
    </a>
    . ja{" "}
    <a
      href={`${SITE_URL}/products/ice-matt-kihlasormus-4-5-mm-1`}
      rel="noopener noreferrer"
    >
      Ice Matt
    </a>
    . Tilaa helposti kultaiset kihlasormukset verkkokaupastamme, tai kysy lisää{" "}
    <a href={`${SITE_URL}/pages/tilaustyot`} rel="noopener noreferrer">
      tilaustyöstä
    </a>
    ,{" "}
    jos haluat täysin uniikin sormuksen. Tervetuloa myös tutustumaan{" "}
    <a href={`${SITE_URL}/pages/meidan-liike`} rel="noopener noreferrer">
      meidän liikkeeseemme
    </a>
    .
  </>
);

const faqs = [
  {
    question: "Mikä tekee kultaisesta kihlasormuksesta ajattoman?",
    answer: [
      "Kultainen kihlasormus on ajaton, koska kulta säilyttää sekä arvonsa että kauneutensa sukupolvien ajan. Sen lämmin sävy sopii monille ja henkii klassista eleganssia.",
      "Korkeila Helsingin sormukset yhdistävät perinteet ja modernin muotoilun – siksi ne kestävät aikaa sekä ulkonäöllisesti että merkitykseltään.",
    ],
  },
  {
    question: "Voiko kihlasormuksen valmistaa omasta kullasta?",
    answer: [
      "Kyllä voi. Meillä voit teettää kultaisen kihlasormuksen omasta kullastasi, esimerkiksi vanhasta korusta tai perintökullasta.",
      "Tämä tekee sormuksesta entistä merkityksellisemmän ja antaa vanhalle materiaalille uuden elämän tärkeässä roolissa.",
    ],
  },
  {
    question: "Sopiiko keltakultainen kihlasormus miehille?",
    answer: [
      "Ehdottomasti. Kultainen kihlasormus on erinomainen valinta myös miehille – valikoimastamme löytyy niin pelkistettyjä kuin näyttävämpiä timanteilla koristeltuja malleja.",
      "Autamme sinua löytämään juuri omaan tyyliin ja arkeen sopivan sormuksen.",
    ],
  },
  {
    question: "Miten kultaisen kihlasormuksen hinta muodostuu?",
    answer: [
      "Kultaisen kihlasormuksen hinta riippuu muun muassa kultapitoisuudesta (14K tai 18K), koosta, muotoilusta ja mahdollisista timanteista.",
      "Hinnat alkavat 990 eurosta. Jokainen sormus valmistetaan huolella, laadukkaista materiaaleista, juuri sinulle.",
    ],
  },
];

export default function KultainenKihlasormusCollectionClient() {
  const { language, currencyCode } = useI18n();
  const [showAllContent, setShowAllContent] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState("featured");
  const languageId = language === "fi" ? "2" : "1";
  const labels = useMemo(
    () =>
      language === "fi"
        ? {
            subCategory: "Alakategoria",
            sortByPrice: "Lajittele hinnan mukaan",
            lowToHigh: "Halvin ensin",
            highToLow: "Kallein ensin",
          }
        : {
            subCategory: "Sub Category",
            sortByPrice: "Sort By Price",
            lowToHigh: "Low to High",
            highToLow: "High to Low",
          },
    [language]
  );
  const sortFilterOptions = useMemo(() => buildSortOptions(labels), [labels]);

  useEffect(() => {
    let active = true;

    const normalizeLabel = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const isMensRings = (value) => {
      const normalized = value.replace(/’/g, "'");
      return (
        normalized.includes("men's rings") ||
        normalized.includes("mens rings") ||
        normalized.includes("men rings")
      );
    };

    const matchesAllowed = (label) => {
      const normalized = normalizeLabel(label);
      return (
        normalized.includes("solitaire") ||
        normalized.includes("halo") ||
        isMensRings(normalized)
      );
    };

    const loadSubCategories = async () => {
      try {
        const list = await fetchSubCategoryHomePage(languageId, CATEGORY_ID);
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.sub_category_id ?? null;
            const label = item?.sub_category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { value: String(id), label: String(label) };
          })
          .filter(Boolean);

        const filtered = mapped.filter((option) => matchesAllowed(option.label));
        const finalOptions = filtered.length ? filtered : mapped;

        if (active) {
          setSubCategories(finalOptions);
          setSubCategoryFilter(
            (filtered.length ? filtered : finalOptions).map((option) => option.value)
          );
        }
      } catch (error) {
        if (active) {
          setSubCategories([]);
          setSubCategoryFilter([]);
        }
        console.error("Subcategory load failed", error);
      }
    };

    loadSubCategories();
    return () => {
      active = false;
    };
  }, [languageId]);

  useEffect(() => {
    let active = true;
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
    if (active) setProductsLoading(true);

    const normalizeImage = (image) => {
      if (!image) return "/productlisting/no_image.jpg";
      if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
      if (!apiBase) return image;
      return `${apiBase.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
    };

    const loadProducts = async () => {
      try {
        clearProductListingCache();
        const list = await fetchProductListEcom(languageId, CATEGORY_ID, currencyCode);
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.product_id ?? null;
            if (!id) return null;
            const design =
              item?.design ?? item?.design_variant ?? item?.designVariant ?? null;
            const designId =
              design?.id ??
              item?.design_id ??
              item?.designId ??
              item?.design_variant_id ??
              item?.designVariantId ??
              "";
            const metalRate = design?.metal_rate ?? null;
            const primaryDetail = Array.isArray(design?.diamond_details)
              ? design.diamond_details[0]
              : null;
            const diamondRate = primaryDetail?.diamond_rate ?? null;
            const query = new URLSearchParams();
            if (designId) query.set("design_id", String(designId));
            if (metalRate?.metal_id) query.set("metal_id", String(metalRate.metal_id));
            if (metalRate?.karat_id) query.set("karat_id", String(metalRate.karat_id));
            if (diamondRate?.diamond_type_id) {
              query.set("diamond_type_id", String(diamondRate.diamond_type_id));
            }
            if (diamondRate?.clarity_id) {
              query.set("clarity_id", String(diamondRate.clarity_id));
            }
            const caratValue =
              diamondRate?.diamond_master?.carat ??
              diamondRate?.diamond_master_id?.carat ??
              null;
            if (caratValue !== null && caratValue !== undefined) {
              query.set("carat", String(caratValue));
            }
            if (primaryDetail?.cut_master_id) {
              query.set("cut_id", String(primaryDetail.cut_master_id));
            }
            const translations = Array.isArray(design?.design_translations)
              ? design.design_translations
              : [];
            const matchingTranslation = translations.find(
              (translation) =>
                String(translation?.language_id ?? "") === String(languageId)
            );
            const translatedName =
              matchingTranslation?.design_variant_name ??
              matchingTranslation?.product_name ??
              null;

            return {
              id,
              name:
                translatedName ??
                design?.design_translation?.design_variant_name ??
                design?.design_variant_name ??
                item?.product_name ??
                item?.name ??
                "PRODUCT",
              price: item?.total_price ?? null,
              imageSrc: normalizeImage(item?.image),
              href: query.toString()
                ? `/product/${id}?${query.toString()}`
                : `/product/${id}`,
              subCategoryId: String(item?.sub_category_id ?? ""),
            };
          })
          .filter(Boolean);

        if (active) setProducts(mapped);
      } catch (error) {
        if (active) setProducts([]);
        console.error("Product list load failed", error);
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, [languageId, currencyCode]);

  const displayedProducts = useMemo(() => {
    let list = products;
    if (subCategoryFilter.length) {
      const selected = new Set(subCategoryFilter.map((value) => String(value)));
      list = list.filter((item) => selected.has(String(item.subCategoryId)));
    }

    if (sortFilter === "price-asc" || sortFilter === "price-desc") {
      const parsePrice = (value) => {
        if (typeof value === "number") return value;
        const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
        return cleaned ? Number(cleaned) : Number.NaN;
      };
      list = [...list].sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        if (Number.isNaN(priceA) && Number.isNaN(priceB)) return 0;
        if (Number.isNaN(priceA)) return 1;
        if (Number.isNaN(priceB)) return -1;
        return sortFilter === "price-asc" ? priceA - priceB : priceB - priceA;
      });
    }

    return list;
  }, [products, subCategoryFilter, sortFilter]);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                Kultainen Kihlasormus – Ajaton Symboli Rakkaudelle
              </h1>
            </header>
            <article className={styles.story}>
              <p className={styles.intro}>{introText}</p>
              {!showAllContent ? (

                <div className={styles.toggleRow}>

                  <button
                  className={styles.toggleButton}
                  type="button"
                  onClick={() => setShowAllContent((prev) => !prev)}
                  aria-expanded={showAllContent}
                  aria-controls="story-content"
                >
                  {showAllContent ? "Näytä vähemmän" : "Lue lisää"}
                </button>

                </div>

              ) : null}
              {showAllContent ? (
                <div className={styles.storyBody} id="story-content">
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="/link5/8a924f86-bdfb-4074-bbbc-a7f387f618fc.jpeg"
                      alt="kultainen kihlasormus"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Valikoimastamme löydät laadukkaat kultaiset kihlasormukset
                    </h2>
                    <p className={styles.sectionCopy}>
                      Etsitpä sitten perinteistä keltakultaista mallia tai modernimpaa designia,
                      valikoimastamme löydät sopivan vaihtoehdon. Meiltä löytyy kultaisia
                      kihlasormuksia eri leveyksissä, muodoissa ja karaattipainoissa – aina
                      tyylikkäästi viimeisteltyinä. Jokainen sormus on valmistettu kierrätetystä
                      kullasta.
                    </p>

                    <h2 className={styles.storyHeading}>
                      Keltakultainen kihlasormus – lämmin ja arvokas valinta
                    </h2>
                    <p className={styles.sectionCopy}>
                      Keltakulta on perinteinen mutta yhä ajankohtainen valinta kihlasormuksen
                      materiaaliksi. Sen lämmin sävy sopii monen ihonvärin kanssa yhteen ja henkii
                      klassista eleganssia.
                    </p>
                    <p className={styles.sectionCopy}>
                      Korkeila Helsingin keltakultaiset kihlasormukset ovat aina huolella
                      suunniteltuja ja viimeisteltyjä – valinta, jota ei tarvitse katua.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Kultaisia kihlasormuksia – jokaiselle oma tyyli
                    </h2>
                    <p className={styles.sectionCopy}>
                      Tarjoamme kultaisia kihlasormuksia niin miehille kuin naisille.
                      Valikoimasta löytyy puolipyöreä malli, moderneja viistettyjä pintoja sekä
                      sormuksia timanteilla.
                    </p>
                    <p className={styles.sectionCopy}>
                      Sormuksen voi valita täysin sileänä tai koristeltuna. Voit myös suunnitella
                      oman sormuksen kanssamme – yksilöllinen vaihtoehto, joka valmistetaan
                      käsityönä juuri sinua varten.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link5/1ce3ffca-b6c5-40cd-a4f2-90c10cf5c369.jpeg"
                      alt="kultainen kihlasormus"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Kihlasormuksen valinnassa kannattaa huomioida oma elämäntyyli
                    </h2>
                    <p className={styles.sectionCopy}>
                      Kihlasormus kulkee mukanasi joka päivä, joten sen täytyy olla paitsi kaunis
                      myös kestävä.
                    </p>

                    <p className={styles.sectionCopy}>
                      Kulta on arvokas mutta käytännöllinen materiaali, ja oikein valittu karaatin
                      määrä sekä sormuksen muotoilu tekevät siitä pitkäikäisen.
                    </p>
                    <p className={styles.sectionCopy}>
                      Kihlasormuksen valinnassa asiantunteva opastus auttaa tekemään oikean
                      päätöksen.
                    </p>

                    <h2 className={styles.storyHeading}>
                      Kultainen kihlasormus – valmistettu rakkaudella juuri sinulle
                    </h2>
                    <p className={styles.sectionCopy}>
                      Kaikki sormuksemme valmistetaan käsityönä. Käytämme kullassa eri vaihtoehtoja,
                      kuten 14K ja 18K keltakultaa.
                    </p>
                    <p className={styles.sectionCopy}>
                      Karaatin määrän voi valita tarpeen mukaan – 14 karaatin sormus sopii
                      aktiiviseen arkeen, kun taas 18 karaatin sormus on arvokkaampi ja hieman
                      pehmeämpi vaihtoehto. Kummassakin tapauksessa lopputulos on kaunis ja kestävä.
                    </p>
                    <h3 className={styles.storySubheading}>
                      Kultainen kihlasormus on nyt helppo valinta ja edullinen hankkia omaksesi
                    </h3>
                    <p className={styles.sectionCopy}>
                      Kultaisen kihlasormuksen hinta alkaa meillä 990 eurosta. Esimerkiksi klassinen
                      puolipyöreä malli 3 mm leveydellä on erinomainen valinta.
                    </p>
                    <p className={styles.sectionCopy}>
                      Timanteilla koristeltu malli puolestaan alkaen 1800 euroa tuo
                      lisäylellisyyttä. Kaikki hinnat sisältävät huolellisen työn ja
                      korkealaatuiset materiaalit. Valinta on aina sinun.
                    </p>
                    <h3 className={styles.storySubheading}>
                      Klassiset ja modernit kultaiset vaihtoehdot
                    </h3>

                    <p className={styles.sectionCopy}>
                      Kultainen kihlasormus on aina klassinen ja kaunis valinta. Valikoimastamme
                      löydät{" "}
                      <a rel="noopener" href={`${SITE_URL}/collections/sormukset`}>
                        kultaisia kihlasormuksia
                      </a>
                      ,{" "}
                      jotka on valmistettu laadukkaasta kullasta – kuten 14 karaatin{" "}
                      <a
                        rel="noopener"
                        href={`${SITE_URL}/products/kopio-kihlasormus-3mm-bombe-court`}
                      >
                        keltakulta
                      </a>{" "}
                      ja 14k{" "}
                      <a
                        href={`${SITE_URL}/products/sun-matt-kihlasormus-5-mm`}
                        rel="noopener"
                      >
                        keltakultainen
                      </a>{" "}
                      materiaali. Sormuksen koko sekä leveys voidaan valita helposti juuri sinun
                      tarpeisiisi.
                    </p>
                    <p className={styles.sectionCopy}>
                      Kihlasormusten valikoimastamme löytyy useita vaihtoehtoja eri tyyleissä.
                      Näistä löytyy aina useita kauniita vaihtoehtoja, jotka sopivat sekä miehille
                      että naisille.
                    </p>
                    <p className={styles.sectionCopy}>
                      Hinta alkaa jo 990 €, ja valikoimastamme löytyy aina laadukkaita kultaisia
                      kihlasormuksia. Tilaa helposti{" "}
                      <a rel="noopener" href={SITE_URL}>
                        kaikki sormukset
                      </a>{" "}
                      verkkokaupastamme ja löydä juuri sinulle sopiva kihlasormus.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link5/83c12469-93e9-4cd9-a1aa-394e7be7db55.jpeg"
                      alt="valkokultainen kihlasormus, kihlasormus"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Miksi valita kultaa?</h2>

                    <p className={styles.sectionCopy}>
                      Kulta on paitsi kaunis ja arvokas, myös kestävä ja helppohoitoinen materiaali.{" "}
                      <a href={`${SITE_URL}/pages/ota-yhteytta`} rel="noopener noreferrer">
                        Korkeila Helsingillä
                      </a>{" "}
                      kullasta valmistetut sormukset suunnitellaan käyttöä varten – ne eivät ole
                      vain juhlakoristeita, vaan osa arkea. Meidän kihlasormukset ovat osoitus
                      ajattomasta tyylistä.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Usein kysytyt kysymykset</h2>
                    <div className={styles.faqList}>
                      {faqs.map((faq) => (
                        <details key={faq.question} className={styles.faqItem}>
                          <summary className={styles.faqSummary}>{faq.question}</summary>
                          <div className={styles.faqBody}>
                            {faq.answer.map((line, index) => (
                              <p key={`${faq.question}-${index}`} className={styles.sectionCopy}>
                                {line}
                              </p>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link5/dae21270-658f-4119-8aff-6d688fa42cea.jpeg"
                      alt="kultainen kihlasormus, kihlasormus, kulta, löydät, kohinoor, valikoimastamme, helposti, kulta, kihlasormus, kihlasormukset, myös, kultaa, keltakulta, timanttien"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <p className={styles.sectionCopy}>
                      <strong>Tutustu valikoimaamme ja löydä unelmiesi kultainen kihlasormus</strong>
                    </p>
                    <p className={styles.sectionCopy}>
                      Kultainen kihlasormus on enemmän kuin vain koru – se on henkilökohtainen
                      symboli, joka kertoo rakkaudestasi ja yhteisestä tulevaisuudestanne.
                    </p>
                    <p className={styles.sectionCopy}>
                      Me Korkeila Helsingillä olemme täällä auttamassa sinua löytämään juuri oikean
                      sormuksen tähän ainutlaatuiseen hetkeen.
                    </p>
                    <p className={styles.sectionCopy}>
                      Valikoimamme kattaa sekä klassiset että modernit kultaiset kihlasormukset,
                      jotka sopivat eri tyyleihin, budjetteihin ja elämäntilanteisiin.
                    </p>
                    <p className={styles.sectionCopy}>
                      Verkkosivuillamme voit selata laajaa kokoelmaamme, josta löydät eri mallisia,
                      levyisiä ja karaattipainoisia sormuksia – aina huolella valmistettuina ja
                      kauniisti viimeisteltyinä.
                    </p>
                    <p className={styles.sectionCopy}>
                      Haluatko mieluummin yksinkertaisen puolipyöreän sormuksen vai timanteilla
                      koristellun katseenvangitsijan? Meiltä löytyy sopiva vaihtoehto molempiin – ja
                      kaikkeen siltä väliltä.
                    </p>
                    <p className={styles.sectionCopy}>
                      <a
                        href={SITE_URL}
                        rel="noopener noreferrer"
                        className={styles.inlineLink}
                      >
                        Tutustu kultaisten kihlasormusten valikoimaamme täällä
                      </a>
                    </p>
                    <p className={styles.sectionCopy}>
                      Jos etsit jotain täysin ainutlaatuista, voit myös varata ajan myymäläämme
                      Ullanlinnassa ja suunnitella sormuksen yhdessä meidän kanssamme.
                    </p>
                    <p className={styles.sectionCopy}>
                      Me kuuntelemme toiveesi ja toteutamme ne – käsityönä, vastuullisesti ja
                      suurella sydämellä.
                    </p>
                  </section>
                </div>
              ) : null}

              {showAllContent ? (

                <div className={styles.toggleRow}>

                  <button
                  className={styles.toggleButton}
                  type="button"
                  onClick={() => setShowAllContent((prev) => !prev)}
                  aria-expanded={showAllContent}
                  aria-controls="story-content"
                >
                  {showAllContent ? "Näytä vähemmän" : "Lue lisää"}
                </button>

                </div>

              ) : null}
              <section className={styles.productSection}>
                <Container className={styles.productContainer}>
                  {/*
                  <div className={`${styles.sectionHeader} ${styles.productSectionHeader}`}>
                    <h2 className={`${styles.sectionTitle} ${styles.productHeading}`}>
                      Valikoima kihlasormuksia
                    </h2>
                    <p className={styles.sectionCopy}>
                      Inspiroidu suosituimmista malleista ja löydä oma säihkeesi. Alla esimerkkejä
                      kihlasormuksista eri tyyleissä.
                    </p>
                  </div>
                  */}
                  <div className={styles.filtersRow}>
                    <FiltersBar
                      leftLabel={labels.subCategory}
                      rightLabel={labels.sortByPrice}
                      leftValue={subCategoryFilter}
                      rightValue={sortFilter}
                      onLeftChange={setSubCategoryFilter}
                      onRightChange={setSortFilter}
                      leftOptions={subCategories}
                      rightOptions={sortFilterOptions}
                      leftMulti
                      leftDisabled
                    />
                  </div>
                  <div className={styles.gridWrap}>
                    <ProductGrid products={displayedProducts} columns={3} loading={productsLoading} />
                  </div>
                </Container>
              </section>
            </article>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
