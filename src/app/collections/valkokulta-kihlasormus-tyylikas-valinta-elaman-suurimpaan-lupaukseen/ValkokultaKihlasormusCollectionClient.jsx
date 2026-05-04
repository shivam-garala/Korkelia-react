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
    Valkokultainen kihlasormus on ajaton valinta, joka symboloi rakkautta ja
    sitoutumista. Meiltä{" "}
    <a href={`${SITE_URL}/collections/sormukset`} rel="noopener noreferrer">
      Korkeila Helsingiltä
    </a>{" "}
    löydät kauniit{" "}
    <a
      href={`${SITE_URL}/collections/sileat-kivettomat-sormukset`}
      rel="noopener noreferrer"
    >
      valkokultaiset sormukset
    </a>{" "}
    valmistettu aina laadukkaasta{" "}
    <a
      href={`${SITE_URL}/products/kopio-kihlasormus-3mm-bombe-court-premium`}
      rel="noopener noreferrer"
    >
      valkokulta 14k -materiaalista
    </a>
    . Saatavilla on eri leveyksiä, värejä ja kokoja, joihin voit halutessasi lisätä
    timantteja, jolloin syntyy upea{" "}
    <a
      href={`${SITE_URL}/products/kopio-kihlasormus-3mm-bombe-court-premium`}
      rel="noopener noreferrer"
    >
      vihkisormus
    </a>{" "}
    <br />
    <br />
    Tutustu monipuoliseen{" "}
    <a href={`${SITE_URL}/collections/sormukset`} rel="noopener noreferrer">
      valikoimaamme
    </a>
    ,{" "}
    jossa on sekä sileitä kihlasormuksia että näyttäviä{" "}
    <a
      href={`${SITE_URL}/products/kopio-kopio-puoliallianssi-sormus-0-33ct`}
      rel="noopener noreferrer"
    >
      timanttisormuksia
    </a>
    . Tilauksen tekeminen onnistuu helposti – lue ohjeet{" "}
    <a href={`${SITE_URL}/pages/nain-tilaat-verkkokaupasta`} rel="noopener noreferrer">
      näin tilaat verkkokaupasta
    </a>{" "}
    tai pyydä tarjous juuri omasta unelmasormuksestasi. Löydä oma kaunis{" "}
    <a
      href={`${SITE_URL}/products/kopio-briljantti-hiontainen-halosormus-yht-0-35ct`}
      rel="noopener noreferrer"
    >
      valkokultainen kihlasormus
    </a>
    , joka kestää aikaa ja säilyttää arvonsa aina.
  </>
);

const faqs = [
  {
    question: "Kumpi on arvokkaampaa, valkokulta vai kulta?",
    answer: [
      "Valkokulta ja keltakulta ovat molemmat arvokkaita jalometalleja, ja niiden arvo määräytyy ensisijaisesti kullan pitoisuuden mukaan. Itse kulta on aina samanarvoista riippumatta siitä, onko se valkokullasta, keltaisesta vai ruusukullasta valmistettu.",
      "Valkokultainen sormus syntyy, kun puhdasta kultaa sekoitetaan esimerkiksi palladiumiin tai hopeaan, mikä antaa sille vaalean värin. Valkokullan valmistusprosessi on usein työläämpi ja siihen lisätään rodinointi, mikä voi nostaa sormuksen hintaa.",
    ],
  },
  {
    question: "Voiko kihlasormus olla hopeaa?",
    answer: [
      "Kihlasormus voi olla myös hopeaa, mutta materiaali on pehmeämpää kuin esimerkiksi valkokulta 14k. Hopea naarmuuntuu ja muotoutuu helpommin, kun taas 14 karaatin valkokulta säilyttää muotonsa ja arvonsa paremmin ajan mittaan.",
      "Jos haluat kestävän ja kauniin sormuksen, kannattaa valita esimerkiksi valkokultainen kihlasormus, johon voit lisätä timantit – näin siitä syntyy upea vihkisormus.",
    ],
  },
  {
    question: "Onko kihla ja kihlasormus sama asia?",
    answer: [
      "Arkikielessä kyllä. “Kihla” tarkoittaa usein juuri kihlasormusta, joka on aina ollut merkki lupauksesta avioliittoon. Alun perin “kihla” viittasi sopimukseen, mutta nykyään se yhdistetään kiinteästi itse sormukseen.",
      "Meiltä Korkeila Helsingiltä löydät yksilölliset ja käsityönä valmistetut kihlasormukset, joista voit valita juuri teille sopivan mallin. Valikoimastamme löytyy eri leveyksiä, kokoja ja timanttien määrää vaihtelevia vaihtoehtoja – aina klassisista puolipyöreistä malleista näyttäviin timanttisormuksiin.",
    ],
  },
  {
    question: "Onko valkokulta arvokasta?",
    answer: [
      "Ehdottomasti. Valkokultainen kihlasormus on arvostettu valinta, koska se yhdistää kullan arvon ja vaaleiden metallien kestävyyden. Esimerkiksi valkokulta 14k sisältää 58,5 % puhdasta kultaa, ja loput seosaineet vaikuttavat sormuksen väriin ja kestävyyteen.",
      "Lisäksi valkokultaiset sormukset eivät tummu kuten hopea, ja ne säilyttävät kiiltonsa pitkään.",
      "Timanttien koko, leveys ja istutus vaikuttaa aina tuotteen hintaan, mutta lopputulos on kaunis sormus, joka kertoo omasta tarinastasi.",
      <>
        Löydät meiltä helposti{" "}
        <a href={`${SITE_URL}/collections/sormukset`} rel="noopener noreferrer">
          valkokultaiset sormukset
        </a>
        , joihin voit lisätä timantteja tai tilata klassisen sileän mallin. Näin
        varmistat, että kihlasormuksen arvo ja kauneus säilyvät sukupolvien ajan.
      </>,
    ],
  },
];

export default function ValkokultaKihlasormusCollectionClient() {
  const { language, currencyCode, currencySymbol } = useI18n();
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
        const list = await fetchProductListEcom(languageId, CATEGORY_ID, currencyCode, currencySymbol, true);
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
                Valkokulta kihlasormus – tyylikäs valinta elämän suurimpaan
                lupaukseen
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
                      src="/link4/5177722b-507c-4291-9443-07c947615d5b.jpeg"
                      alt="myös, kihlasormukset, löydät, leveys, kulta, materiaali, kohinoor, timantti, myymälästä, helposti, koruja, verkkokaupasta, tilaa"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Mikä tekee valkokultaisesta kihlasormuksesta erityisen?
                    </h2>
                    <p className={styles.sectionCopy}>
                      Valkokulta on elegantti ja moderni vaihtoehto perinteiselle keltakullalle.
                      Sen hillitty kiilto ja viileä sävy sopivat erityisesti niille, jotka
                      arvostavat klassista mutta huomaamatonta tyylikkyyttä. Lisäksi valkokulta
                      sopii yhteen monien muiden korumateriaalien kanssa – esimerkiksi timantit
                      pääsevät siinä erityisen hyvin oikeuksiinsa.
                    </p>
                    <p className={styles.sectionCopy}>
                      <a href={`${SITE_URL}/pages/meidan-liike`} rel="noopener noreferrer">
                        Valkokultaiset kihlasormukset
                      </a>{" "}
                      sopivat myös täydellisesti yhdistettäväksi vihkisormukseen, olipa kyseessä
                      yksinkertainen sormus tai timanttisormus. Siksi valkokultainen kihlasormus on
                      usein valinta, johon palataan myös vuosien päästä.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Kihlasormus, joka valmistetaan juuri sinulle
                    </h2>
                    <p className={styles.sectionCopy}>
                      Kaikki kihlasormukset suunnitellaan Suomessa, pääosin kierrätetystä kullasta
                      tai eettisesti tuotetuista raaka-aineista. Valikoimastamme löydät esimerkiksi
                      puolipyöreä muotoilun, erilaisia leveyksiä ja timanteilla koristeltuja
                      vaihtoehtoja. Käytämme valkokultaa, jonka laatu ja sävy kestävät aikaa.
                    </p>
                    <p className={styles.sectionCopy}>
                      Valitse omasta valikoimastamme 14k valkokultainen kihlasormus tai suunnittele
                      täysin uniikki sormus yhdessä kanssamme. Meillä voit yhdistää timantteja,
                      valita sopivan väri- ja pintavaihtoehdon sekä vaikuttaa sormuksen istuvuuteen
                      ja muotoiluun.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link4/060a7952-53f1-48f1-9c6d-6de4e44fa1bc.jpeg"
                      alt="valkokultainen kihlasormus, kihlasormukset, kulta, timantti, timantit, lisää,"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Laaja valikoima valkokultaisia kihlasormuksia
                    </h2>
                    <p className={styles.sectionCopy}>
                      Verkkokaupasta ja myymälästä löydät runsaasti valkokultaisia kihlasormuksia
                      eri tyyleissä ja hintaluokissa. Esimerkiksi klassinen valkokultainen
                      kihlasormus ilman kiveä on saatavilla hintaan 990€, mutta valikoimastamme
                      löytyy myös ylellisempiä vaihtoehtoja, joihin on lisätty timantteja. Jokainen
                      sormus on yksilöllinen ja kaunis valinta – löydät varmasti juuri sen oikean.
                    </p>
                    <p className={styles.sectionCopy}>
                      Niitä on saatavilla eri leveyksillä ja malleilla, jotta voit valita juuri
                      sinulle sopivan. Myymälästämme löytyy useita mallikappaleita, joita voit
                      kokeilla paikan päällä – ja tilata heti, kun täydellinen 14k kihlasormus
                      löytyy.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Sopivatko valkokultaiset sormukset jokaiselle?
                    </h2>
                    <p className={styles.sectionCopy}>
                      Valkokulta sopii lähes kaikille ihonsävyille ja tyyleille, joten valkokultainen
                      kihlasormus on usein varma valinta. Se sopii myös niille, jotka haluavat pitää
                      sormuksensa mahdollisimman huomaamattomana mutta arvokkaana. Valkokultaiset
                      sormukset sopivat myös hyvin yhteen muiden metallien, kuten platina- tai
                      ruusukultasormusten, kanssa.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Miten kihlasormuksen hinta muodostuu?
                    </h2>
                    <p className={styles.sectionCopy}>
                      Kihlasormuksen hinta vaihtelee materiaalin, timanttien, työn ja muotoilun
                      mukaan. Esimerkiksi 14k valkokultaa käytettäessä sormuksen kestävyys ja väri
                      säilyvät erinomaisesti ajan saatossa. Myös timanttien määrä, koko ja laatu
                      vaikuttavat lopulliseen hintaan. Meillä voit vaikuttaa sormuksen hintaan
                      valitsemalla yksityiskohdat itse – aina omaan budjettiisi sopivasti.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link4/81926cfa-75e2-484c-982a-6cac0c974b4f.jpeg"
                      alt="valkokultainen kihlasormus, kihlasormus"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Tilaa valkokultainen kihlasormus helposti
                    </h2>
                    <p className={styles.sectionCopy}>
                      Voit tilata valkokultaisen kihlasormuksen helposti verkkokaupastamme tai
                      vierailla myymälässämme Helsingin Ullanlinnassa. Meiltä löytyy asiantunteva
                      henkilökunta, joka auttaa sinua valitsemaan juuri teille sopivat
                      kihlasormukset. Meillä voit myös muokata olemassa olevia sormuksia tai
                      teettää täysin uuden, juuri sinulle suunnitellun sormuksen.
                    </p>
                    <p className={styles.sectionCopy}>
                      Lisäksi tarjoamme kattavan valikoiman myös muita valkokultaisia koruja – kuten
                      timanttisormuksia, korvakoruja ja riipuksia – jotka sopivat täydellisesti
                      kihlasormuksen rinnalle.{" "}
                      <a href={`${SITE_URL}/pages/ota-yhteytta`} rel="noopener noreferrer">
                        Tutustu valikoimaan ja löydä omat suosikkisi
                      </a>
                      !
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Usein kysytyt kysymykset - Valkokultainen kihlasormus
                    </h2>
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
                      src="/link4/6a32fd56-b9ca-4427-bbca-708b6775a484.jpeg"
                      alt="valkokulta kihlasormus, kihlasormus, myös, kihlasormukset, valkokultaiset,"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Miksi valita valkokultainen kihlasormus juuri meiltä?
                    </h2>
                    <p className={styles.sectionCopy}>
                      Meillä Korkeila Helsingillä yhdistyvät käsityö, vastuullisuus ja kauneus.
                      Tarjoamme sinulle mahdollisuuden vaikuttaa sormuksen materiaaliin, väriin,
                      timanttien kokoon ja tyyliin – lopputuloksena ainutlaatuinen sormus, joka
                      kestää aikaa.
                    </p>
                    <p className={styles.sectionCopy}>
                      Voit tutustua valikoimaan ja tilata valkokultaisen kihlasormuksen jo tänään
                      verkkokaupastamme:{" "}
                      <a href={SITE_URL} rel="noopener noreferrer">
                        Korkeila Helsinki - Valkokultaiset kihlasormukset
                      </a>
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
                    <ProductGrid
                      products={displayedProducts}
                      columns={3}
                      loading={productsLoading}
                    />
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


