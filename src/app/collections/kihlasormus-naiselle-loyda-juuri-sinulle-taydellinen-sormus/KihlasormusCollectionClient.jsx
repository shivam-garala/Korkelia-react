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
    Kihlasormus naiselle on paljon enemmän kuin koru – se on lupaus rakkaudesta,
    yhteisestä tulevaisuudesta ja ainutlaatuisesta tarinasta.{" "}
    <a href={SITE_URL} rel="noopener noreferrer">
      Me Korkeila Helsingillä
    </a>{" "}
    ymmärrämme, että jokainen kihlasormus on henkilökohtainen valinta, joka kantaa
    syvää tunnetta ja merkitystä. Siksi valmistamme kaikki sormukset käsityönä,
    käyttäen vain tarkoin valittuja materiaaleja ja eettisesti hankittuja
    timantteja.
  </>
);
const faqs = [
  {
    question: "Tuleeko kihlasormus vain naiselle?",
    answer: [
      "Nykyään kihlasormuksia hankitaan usein molemmille osapuolille. Perinteisesti vain naiselle, mutta nykyiset tavat ovat joustavampia – tärkeintä on sopia yhdessä.",
    ],
  },
  {
    question: "Mitä eroa on kihla- ja vihkisormuksella?",
    answer: [
      "Kihlasormus annetaan yleensä kosinnan yhteydessä, vihkisormus vaihdetaan hääpäivänä. Moni nainen käyttää molempia yhdessä.",
    ],
  },
  {
    question: "Kenen kuuluu ostaa kihlasormukset?",
    answer: [
      "Useimmiten toinen osapuoli ostaa molemmat sormukset, mutta yhä useammin kihlasormukset valitaan ja ostetaan yhdessä.",
    ],
  },
  {
    question: "Miksi naisilla kaksi sormusta?",
    answer: [
      "Kihlasormus ja vihkisormus symboloivat kahta eri lupausta: kihlausta ja avioliittoa. Yhdessä ne muodostavat kokonaisuuden, joka kertoo elämän tärkeimmästä liitosta.",
    ],
  },
];

const extractPlainText = (node) => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractPlainText).join(" ");
  if (node?.props?.children != null) return extractPlainText(node.props.children);
  return "";
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: [extractPlainText(faq.answer), ...(faq.bullet ?? [])].filter(Boolean).join(" "),
    },
  })),
};

export default function KihlasormusCollectionClient() {
  const { language, currencyCode, currencySymbol, t } = useI18n();
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

    const matchesAllowed = (label) => {
      const normalized = normalizeLabel(label);
      return normalized.includes("solitaire") || normalized.includes("halo");
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
          setSubCategoryFilter(finalOptions.map((option) => option.value));
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
        const list = await fetchProductListEcom(languageId, CATEGORY_ID, currencyCode, currencySymbol);
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
  }, [languageId, currencyCode, currencySymbol]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                Kihlasormus Naiselle – löydä juuri sinulle täydellinen sormus
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
              <div
                className={`${styles.storyBody} ${!showAllContent ? styles.storyBodyHidden : ""}`}
                id="story-content"
              >
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="/link2/b90a221c-8867-4c75-89fd-3e546236ea6c.jpeg"
                      alt="Kihlasormus kädessä"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Valikoimastamme löydät kauniit ja kestävästi valmistetut kihlasormukset
                    </h2>
                    <p className={styles.sectionCopy}>
                      Valikoimastamme löydät laajan valikoiman{" "}
                      <strong>kihlasormuksia naiselle</strong> – oli haussa klassisen siro
                      timanttisormus, moderni valkokultainen vaihtoehto tai yksilöllinen
                      kihlasormus, joka henkii persoonallisuuttasi. Kaikki sormukset valmistetaan
                      käsityönä, joten voit luottaa niiden laatuun ja kestävyyteen sukupolvien
                      ajaksi.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Mikä on kihlasormuksen merkitys nykyään?
                    </h2>
                    <p className={styles.sectionCopy}>
                      Nykyään kihlasormus on sekä symbolinen että esteettinen valinta. Usein naiset
                      haluavat sormuksen, jota voi käyttää yhdessä vihkisormuksen kanssa – joko
                      täydentävänä kokonaisuutena tai yksittäisenä koruna. Kihlasormuksen valinnassa
                      kannattaa huomioida sekä oma tyyli että sormuksen sopivuus mahdolliseen
                      tulevaan vihkisormukseen.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/e08c09ef-e4a9-4737-a4d6-23b987398285.jpeg"
                      alt="Kihlasormus lähikuvassa"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Kihlasormus – ajaton valinta, joka kestää elämän muutokset
                    </h2>
                    <p className={styles.sectionCopy}>
                      Jokainen kihlasormus valmistetaan yksilöllisesti.{" "}
                      <a href={SITE_URL} rel="noopener noreferrer">
                        Korkeila Helsinki
                      </a>{" "}
                      tarjoaa mahdollisuuden valita sormuksen materiaali – esimerkiksi valkokulta,
                      keltakulta, ruusukulta, platina tai jopa moderni titaani. Materiaalit ovat
                      paitsi kauniita myös kestäviä – valinta, joka kestää aikaa ja käyttää.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Timanttisormus vai siro kihlasormus? Valinta on sinun
                    </h2>
                    <p className={styles.sectionCopy}>
                      Timanttisormus on suosittu valinta kihlasormukseksi, mutta myös siro ja
                      yksinkertainen sormus voi olla kaunis ja merkityksellinen. Meiltä löydät
                      vaihtoehtoja niin ilman kiviä kuin timanteilla koristeltuina – kaikki
                      valmistettu käsityönä ja huolella viimeistelty.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/ac63a6a5-9fbe-4023-b744-dc7c965726a3.jpeg"
                      alt="Kihlasormus esillepanossa"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Laadukkaat materiaalit – hopea, kulta, titaani ja timantti
                    </h2>
                    <p className={styles.sectionCopy}>
                      Sormuksen materiaali on tärkeä osa valintaa.{" "}
                      <a href={`${SITE_URL}/pages/tilaustyopalvelu`} rel="noopener noreferrer">
                        Korkeila Helsingillä
                      </a>{" "}
                      kaikki materiaalit ovat vastuullisesti hankittuja. Valikoimassa on hopea,
                      keltakulta, valkokulta, ruusukulta, platina ja titaani. Timantit – olivatpa ne
                      luonnon tai laboratoriossa kasvatettuja – ovat aina eettisesti tuotettuja ja
                      huolella valikoituja.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Valikoimastamme löydät myös uniikkeja vaihtoehtoja
                    </h2>
                    <p className={styles.sectionCopy}>
                      Jos etsit jotain todella yksilöllistä, tutustu mittatilaustyönä
                      valmistettaviin kihlasormuksiimme. Suunnitella oman sormuksesi yhdessä
                      Korkeila Helsinki kanssa ja valita siihen juuri sinulle sopivan materiaalin,
                      timantin karaatin koon, värit sekä muut yksityiskohdat.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/134ab082-fd01-4711-aa73-d780a76a82a4.jpeg"
                      alt="Kihlasormus lähikuvassa"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Hinta alk. 1800 €</h2>
                    <p className={styles.sectionCopy}>
                      Laadukas kihlasormus ei aina tarkoita suurta hintalappua. Meiltä löydät
                      edullinen, mutta kaunis kihla jo alkaen 1800 €. Useimmat naisten
                      kihlasormukset sijoittuvat hintahaarukkaan 1800 €–2900 € materiaalista,
                      timannin karaatin koosta ja mallista riippuen. Saat myös asiantuntevan
                      opastuksen oikean sormuksen valintaan.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Kihlasormuksen valinnassa vinkkejä ammattilaisilta
                    </h2>
                    <p className={styles.sectionCopy}>
                      Ota huomioon oma ja kumppanisi tyyli kihlasormusta valitessasi, myös
                      käyttötarkoitus ja tulevat valinnat – esimerkiksi yhteensopivuus
                      vihkisormuksen kanssa. Aina varata ajan boutiqueemme Ullanlinnaan ja
                      keskustella asiantuntijamme kanssa vaihtoehdoista rauhassa.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/10904625-52fe-409d-a55d-7680e207556b.jpeg"
                      alt="Halo-mallinen timanttinen kihlasormus sormien välissä"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Kestäviä kihlasormuksia timanteilla – löydä oma unelmasormuksesi
                    </h2>
                    <p className={styles.sectionCopy}>
                      <a
                        href={`${SITE_URL}/pages/timanttitietoutta`}
                        rel="noopener noreferrer"
                        className={styles.inlineLink}
                      >
                        Kestävä timanttisormus
                      </a>{" "}
                      on hyvä valinta naiselle, joka arvostaa laatua ja ajatonta muotoilua.
                      Timanteilla koristeltu sormus tuo juhlavuutta arkeen ja säilyttää hohtonsa
                      vuosikymmenien ajan. Myös yksinkertainen kihlasormus ilman kiviä voi olla
                      tyylikäs ja arvokas – tärkeintä on, että sormus tuntuu omalta.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Tutustu korkeila Helsingin verkkokauppaan
                    </h2>
                    <p className={styles.sectionCopy}>
                      Kihlasormuksen valinta onnistuu helposti myös verkkokaupasta. Tutustu eri
                      malleihin, materiaaleihin ja kokoihin suoraan kotisohvalta käsin.
                      Verkkokaupassamme helposti vertailla sormuksia, suodattaa vaihtoehtoja
                      budjetin, materiaalin tai karaatin mukaan ja tehdä ostopäätöksen rauhassa.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/3ff9666e-0384-4a3d-8262-397e9698849d.jpeg"
                      alt="Kihlasormus valkoisella taustalla"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>
                  <section className={styles.storySection}>
                    <p className={styles.sectionCopy}>
                      Käsityönä valmistettu kihlasormus on aina uniikki:
                    </p>
                    <p className={styles.sectionCopy}>
                      Kaikki kihlasormukset valmistetaan käsityönä. Tämä tarkoittaa, että jokainen
                      sormus on ainutlaatuinen – suunniteltu juuri sinulle ja viimeistelty
                      yksityiskohtia myöten. Käsityö takaa sekä laadun että tunnearvon, joka kestää
                      elämän eri vaiheissa.
                    </p>
                    <p className={styles.sectionCopy}>
                      Vaihtoehtoja kaikille tyyleille ja budjeteille:
                    </p>
                    <p className={styles.sectionCopy}>
                      Etsitpä sitten siroa, näyttävää, klassista tai modernia kihlasormusta,
                      meiltä löytyy sopivia vaihtoehtoja. Kaikki sormukset sopivat yhteen muiden
                      Korkeila Helsingin korujen kanssa, joten voit luoda täydellisen kokonaisuuden
                      kihla- ja vihkisormuksen välille.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/fcf7f846-0cd8-42fc-90e7-da8f80dffbd6.jpeg"
                      alt="Pyöreä timanttinen kihlasormus sormessa lähikuvassa"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <p className={styles.sectionCopy}>
                      Vihkisormus ja kihlasormus – täydellinen pari:
                    </p>
                    <p className={styles.sectionCopy}>
                      Usein kihlasormus toimii parina vihkisormukselle. Voit halutessasi valita
                      molemmat samasta sarjasta, tai yhdistellä eri tyylejä persoonallisesti.
                      Vihkisormuksen ja kihlasormuksen yhteensopivuus kannattaa huomioida jo
                      ensivalinnassa – näin varmistat saumattoman kokonaisuuden.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.sectionCopy}>Valitse oikea koko ja istuvuus:</h2>
                    <p className={styles.sectionCopy}>
                      Sormuksen koko vaikuttaa käyttömukavuuteen, joten oikean koon valinta on
                      tärkeä osa prosessia. Meiltä saat aina apua koon mittauksessa ja voit
                      halutessasi tulla liikkeeseemme sovittamaan vaihtoehtoja paikan päälle.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/b9255fba-3e37-445e-bdb8-c9d513d1ab9f.jpeg"
                      alt="Kihlasormus käytössä"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <p className={styles.sectionCopy}>Kihla, joka kertoo tarinasi</p>
                    <p className={styles.sectionCopy}>
                      Kihla ei ole vain metallia ja kiveä – se on lupaus, tarina, tunne.{" "}
                      <a href={`${SITE_URL}/pages/ota-yhteytta`} rel="noopener noreferrer">
                        Me Korkeila Helsingillä
                      </a>{" "}
                      olemme sitoutuneet tekemään jokaisesta kihlasormuksesta
                      erityisen. Juuri sinunlaisesi. Juuri sellaisen, jota kannat ylpeydellä ja
                      rakkaudella.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h3 className={styles.storySubheading}>
                      Usein kysytyt kysymykset – kihlasormus naiselle
                    </h3>
                    <div className={styles.faqList}>
                      {faqs.map((faq, index) => (
                        <details key={`${faq.question}-${index}`} className={styles.faqItem}>
                          <summary className={styles.faqSummary}>{faq.question}</summary>
                          <div className={styles.faqBody}>
                            {faq.answer.map((line, lineIndex) => (
                              <p key={`${faq.question}-${index}-${lineIndex}`} className={styles.sectionCopy}>
                                {line}
                              </p>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                    <figure className={styles.storyImage}>
                    <Image
                      src="/link2/0daebbc8-a774-4654-a8ad-4f384945aff5.jpeg"
                      alt="Ovaali timanttinen kihlasormus kädessä leuan alla"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>
            <section className={styles.storySection}>
                    
                    <p className={styles.sectionCopy}><strong>Löydä oma kihlasormuksesi Korkeila Helsingin valikoimasta</strong></p>

                    <p className={styles.sectionCopy}>Tutustu nyt verkkokauppaamme osoitteessa 
                    
                    {" "}
                    <a
                      href={SITE_URL}
                      rel="noopener noreferrer"
                      className={styles.inlineLink}
                    >
                    Korkeila Helsinki 
                    </a>{" "}
                    ja löydä kihlasormus, joka ansaitsee vain parasta.</p>

                    <p className={styles.sectionCopy}>Haluatko yksilöllisen, käsintehdyn ja vastuullisesti valmistetun kihlasormuksen?</p>

                    <p className={styles.sectionCopy}>Varaa aika henkilökohtaiseen suunnitteluhetkeen Ullanlinnan liikkeeseemme jo tänään.</p>
                    </section>
                  </section>
                </div>

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
      <SiteFooter brandDescription={t("footer.ringBrandDescription")} />
    </div>
  );
}
