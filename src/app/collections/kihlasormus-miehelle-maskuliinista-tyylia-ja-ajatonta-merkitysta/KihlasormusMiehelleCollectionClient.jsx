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
import fi from "../../../i18n/fi.json";
import styles from "./page.module.css";

const CATEGORY_ID = "1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.korkeilahelsinki.fi";

const buildSortOptions = (labels) => [
  { value: "price-asc", label: labels.lowToHigh },
  { value: "price-desc", label: labels.highToLow },
];

const introText = (
  <>
    Kihlasormus miehelle ei ole vain koru – se on lupaus, sitoumus ja osa tärkeää
    elämänvaihetta.{" "}
    <a href={SITE_URL} rel="noopener noreferrer">
      Korkeila Helsingillä
    </a>{" "}
    suunnittelemme ja valmistamme miesten kihlasormukset käsityönä, yksilöllisesti ja
    laadukkaista materiaaleista. Valikoimastamme löydät ajattoman tyylikkäitä
    vaihtoehtoja miehille, jotka arvostavat huoliteltua muotoilua, kestävyyttä ja
    eettisiä arvoja.
  </>
);

const faqs = [
  {
    question: "Tuleeko miehelle kihlasormus?",
    answer: [
      "Kyllä tulee – ja yhä useammin. Miesten kihlasormus ei ollut aiemmin Suomessa yleinen, mutta nykyään se on tavallinen osa kihlautumista. Parit haluavat juhlistaa sitoutumistaan tasapuolisesti, ja yhteinen sormusvalinta koetaan merkitykselliseksi. Miesten sormukset voivat olla yhtä tyylikkäitä kuin naisten, mutta muotoilu, materiaalit ja leveydet suunnitellaan usein miehen käteen ja tyyliin sopiviksi.",
    ],
  },
  {
    question: "Kuka hankkii miehelle kihlasormuksen?",
    answer: [
      "Kihlasormus hankitaan usein yhdessä, jolloin ulkonäkö, materiaali ja budjetti sovitaan yhteisymmärryksessä. Näin varmistetaan, että sormus miellyttää molempia ja kuvastaa parin yhteistä tyyliä.",
      <>
        Joissain tapauksissa toinen osapuoli voi kuitenkin yllättää kumppanin ja
        hankkia{" "}
        <a href={`${SITE_URL}/pages/ota-yhteytta`} rel="noopener noreferrer">
          kihlasormuksen lahjaksi
        </a>
        . Mikä tahansa tapa onkin kyseessä, kihlasormuksen valinnassa kannattaa miettiä
        käytännöllisyyttä, ulkonäköä ja henkilökohtaista merkitystä.
      </>,
    ],
  },
  {
    question: "Onko miehellä kihla- ja vihkisormus?",
    answer: [
      "Kyllä, miehellä voi olla sekä kihla- että vihkisormus. Usein kihlasormus on yksinkertaisempi ja arkeen sopiva, kun taas vihkisormus voi olla näyttävämpi esimerkiksi timanteilla tai kaiverruksilla. Toisinaan sama sormus toimii molemmissa rooleissa – valinta on täysin henkilökohtainen.",
    ],
  },
  {
    question: "Kummassa kädessä miehellä on kihlasormus?",
    answer: [
      "Suomessa kihlasormusta pidetään yleensä vasemman käden nimettömässä sormessa, symbolina yhteydestä sydämeen. Vihkimisen jälkeen vihkisormus asetetaan usein samaan sormeen, jolloin kihlasormus siirretään tai jätetään pois. Osa miehistä käyttää molempia rinnakkain, osa vain toista – tärkeintä on, että ratkaisu tuntuu omalta.",
    ],
  },
];

export default function KihlasormusMiehelleCollectionClient() {
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

    const isMensRings = (label) => {
      const normalized = normalizeLabel(label).replace(/’/g, "'");
      return (
        normalized.includes("men's rings") ||
        normalized.includes("mens rings") ||
        normalized.includes("men rings") ||
        normalized.includes("men's ring") ||
        normalized.includes("mens ring")
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

        const filtered = mapped.filter((option) => isMensRings(option.label));
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
      <SiteHeader availableLanguages={["fi"]} fixedLanguage="fi" />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                Kihlasormus Miehelle – maskuliinista tyyliä ja ajatonta merkitystä
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
                      src="/link6/7abc622d-e0cd-4a99-8a18-1ea708672b51.jpeg"
                      alt="kihlasormukset, myös, sormuksen, sormukset, leveys, kuten, kohinoor, titaanista, lisäksi, kihlasormusta, lisää, myös, valita"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Miesten kihlasormukset – ajaton valinta jokaiselle tyylille
                    </h2>
                    <p className={styles.sectionCopy}>
                      Miesten kihlasormuksia on nykyään saatavilla runsaasti erilaisilla
                      muotoiluilla, materiaaleilla ja viimeistelyillä. Meiltä löytyy niin
                      klassisen hillityistä sormuksista kuin modernin musta-titaani yhdistelmän
                      kautta rohkeampiin linjoihin. Kaikki kihlasormukset suunnitellaan ja
                      valmistetaan vastuullisesti.
                    </p>

                    <h2 className={styles.storyHeading}>
                      Valikoimastamme löydät kestävät ja kauniit miesten kihlasormukset
                    </h2>
                    <p className={styles.sectionCopy}>
                      <a
                        href={`${SITE_URL}/pages/meidan-liike`}
                        rel="noopener noreferrer"
                        className={styles.inlineLink}
                      >
                        Korkeila Helsingin
                      </a>{" "}
                      valikoiman ytimessä ovat miesten kihlasormukset, jotka kestävät aikaa niin
                      tyylin kuin laadunkin puolesta. Löydät meiltä esimerkiksi sormuksia
                      titaanista, hopeasta, keltakullasta tai platinasta – kaikki huolellisesti
                      viimeisteltyinä ja sopivina päivittäiseen käyttöön. Jokainen sormus
                      suunnitellaan kestämään arkea, juhlaa ja aikaa.
                    </p>

                    <h2 className={styles.storyHeading}>
                      Materiaalit – titaani, hopea ja kierrätetty kulta
                    </h2>
                    <p className={styles.sectionCopy}>
                      Titaani on erityisen suosittu materiaali miesten kihlasormuksissa. Se on
                      kevyt, erittäin kestävä ja hypoallergeeninen – täydellinen valinta miehelle,
                      joka arvostaa käytännöllisyyttä ja tyyliä. Myös hopea on suosittu vaihtoehto,
                      joka tuo pehmeää kiiltoa sormukseen. Käytämme aina kierrätettyjä
                      jalometalleja, kuten keltakultaa ja valkokultaa, yhdistäen ekologisuuden ja
                      estetiikan.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Kihlasormuksen valinnassa kannattaa huomioida tyyli ja käyttötarpeet
                    </h2>
                    <p className={styles.sectionCopy}>
                      Kihlasormuksen valinnassa kannattaa miettiä miehen persoonallista tyyliä,
                      arkea ja mieltymyksiä. Valinta voi olla rohkea ja moderni tai klassinen ja
                      hillitty – tärkeintä on, että sormus tuntuu oikealta. Leveys on yksi
                      keskeinen tekijä: valikoimassamme on sormuksia eri leveyksillä aina 2 mm:stä
                      jopa yli 7 mm leveisiin malleihin.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link6/9165c4c3-6b01-4b77-aceb-d5248af34693.jpeg"
                      alt="kihlasormukset, myös, sormuksen, sormukset, leveys, kuten, kohinoor, titaanista, lisäksi, kihlasormusta, valita, sormusta"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Miesten kihlasormus voi olla tyyliltään minimalistinen tai näyttävä
                    </h2>
                    <p className={styles.sectionCopy}>
                      Miesten kihlasormus voi olla juuri niin huomaamaton tai näyttävä kuin
                      haluat. Musta titaani antaa sormukselle modernin, maskuliinisen ilmeen, kun
                      taas kiiltävä valkokulta tai mattapintainen luovat harmonisen ja ajattoman
                      vaikutelman.
                    </p>

                    <h2 className={styles.storyHeading}>
                      Yksilöllisyys ja käsityö näkyvät jokaisessa sormuksessa
                    </h2>
                    <p className={styles.sectionCopy}>
                      Meille Korkeila Helsingillä jokainen sormus on enemmän kuin vain koru – se
                      on osa sinun tarinaasi. Siksi valmistamme kihlasormukset käsityönä, suurella
                      tarkkuudella ja sydämellä, jotta lopputulos olisi täydellinen juuri sinulle
                      tai rakkaallesi. Suunnitteluprosessi on joustava, asiakaslähtöinen ja tarjoaa
                      mahdollisuuden luoda täysin uniikki lopputulos.
                    </p>
                    <p className={styles.sectionCopy}>
                      Voit suunnitella sormuksen yhdessä asiantuntijoidemme kanssa alusta asti.
                      Huomioimme toiveesi seuraavissa asioissa:
                    </p>
                    <ul className={styles.storyList}>
                      <li>
                        Materiaali: esimerkiksi titaani, hopea, keltakulta, valkokulta tai
                        punakulta – kaikki kierrätettyjä ja vastuullisesti hankittuja.
                      </li>
                      <li>
                        Leveys: valikoima ulottuu siroista malleista leveämpiin, näyttäviin
                        vaihtoehtoihin – aina 2 mm:stä yli 7 mm asti.
                      </li>
                      <li>
                        Pinnan viimeistely: kiiltävä, matta, harjattu, taottu tai yhdistelmä
                        viimeistelyistä – jokainen tuo eri ilmeen sormukseen.
                      </li>
                      <li>
                        Muotoilu: klassinen, moderni, selkeä tai graafinen – suunnittelemme mallin
                        yhdessä juuri sinun tyyliisi.
                      </li>
                      <li>
                        Kaiverrus: nimi, päivämäärä tai muu henkilökohtainen viesti tekee
                        sormuksesta entistä merkityksellisemmän.
                      </li>
                    </ul>
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Kihlasormus miehelle alkaen 990€</h2>
                    <p className={styles.sectionCopy}>
                      <a rel="noopener noreferrer" href={`${SITE_URL}/pages/meidan-liike`}>
                        Korkeila Helsingin
                      </a>{" "}
                      valikoimasta löytyy kihlasormuksia miehille alkaen 990 €. Hinta riippuu
                      esimerkiksi materiaalista, leveydestä ja mahdollisista kaiverruksista. Voit
                      pyytää meiltä tarjouksen tai tulla suoraan liikkeeseemme Helsingin
                      Ullanlinnassa – autamme mielellämme oikean sormuksen valinnassa.
                    </p>
                  </section>
                  <figure className={styles.storyImage}>
                    <Image
                      src="/link6/28ef6817-598f-4e82-917a-ee4431fe3da9.jpeg"
                      alt="kihlasormukset, myös, sormuksen, sormukset, leveys, kuten, kohinoor, lisäksi, kihlasormusta, miesten kihlasormukset, myös, miehen,"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

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
                    <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                      <Image
                        src="/link6/SunMatt5_0mm.jpg.jpeg"
                        alt="Kihlasormus miehelle, kihlasormukset, myös, sormuksen, sormukset, leveys, miesten kihlasormukset, kuten, kohinoor, lisäksi, leveys, kihlasormukset, myös"
                        fill
                        sizes="(max-width: 720px) 80vw, 360px"
                      />
                    </figure>
                    <section className={styles.storySection}>
                        <h2 className={styles.storyHeading}>Löydä oikea sormus asiantuntevalla opastuksella tai helposti verkosta</h2>
                        <p className={styles.sectionCopy}>Löydä juuri sinulle sopiva kihlasormus miehelle tai tutustu koko valikoimaan miesten kihlasormuksia verkkosivustollamme:{" "}
                        <a rel="noopener noreferrer" href={SITE_URL}>Tutustu valikoimaan Korkeila Helsinki</a>{" "}
                      </p>
                        <p className={styles.sectionCopy}>Jos kaipaat henkilökohtaista opastusta tai haluat suunnitella täysin yksilöllisen kihlasormuksen, voit varata ajan asiantuntijamme kanssa – me olemme täällä sinua varten.</p>
                    </section>
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
      <SiteFooter brandDescription={fi.footer.ringBrandDescription} fixedLanguage="fi" />
    </div>
  );
}
