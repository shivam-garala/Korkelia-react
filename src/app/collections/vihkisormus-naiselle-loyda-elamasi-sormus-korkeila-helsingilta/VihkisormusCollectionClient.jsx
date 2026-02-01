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

const buildSortOptions = (labels) => [
  { value: "price-asc", label: labels.lowToHigh },
  { value: "price-desc", label: labels.highToLow },
];

const introText = (
  <>
    Vihkisormus naiselle ei ole vain koru – se on rakkauden, lupauksen ja elämän tärkeimmän hetken symboli. Me Korkeila Helsingillä autamme sinua löytämään juuri sen oikean, yksilöllisen vihkisormuksen, joka säilyttää merkityksensä vuodesta toiseen. Valikoimastamme löydät kauniit ja laadukkaat vihkisormukset, ja halutessasi voimme myös{" "}
    <a href="https://www.korkeilahelsinki.fi/collections/kultainen-kihlasormus-ajaton-symboli-rakkaudelle" rel="noopener noreferrer" target="_blank">
      suunnitella
    </a> {" "}
    täysin omanlaisesi mallin. {" "}
    <br />
    <strong>Korkeila Helsinki</strong> on perheyritys Ullanlinnasta, ja olemme <strong>vuodesta 2016</strong> asti valmistaneet käsityönä tehtyjä vihkisormuksia, jotka suunnitellaan ja valmistetaan Suomessa  rakkaudella ja huolella, jotta jokainen vihkisormus olisi yhtä ainutlaatuinen kuin sen tarina.
  </>
);

const faqs = [
  {
    question: "Mistä löydän kauniin ja laadukkaan sormuksen?",
    answer: [
      "Voit löytää tyylikkäät ja kestävät sormukset joko verkkokaupastamme tai boutique myymälästämme Helsingin Ullanlinnasta. ",
      "Valikoimastamme löydät sekä klassisia että moderneja malleja, kuten valkokultaisia kihlasormuksia ja 14 karaatin valkokultaisia sormuksia.",
      "Kaikki sormukset on valmistettu korkealaatuisista ja eettisesti hankituista materiaaleista, ja voit valita leveyden, värin, koko ja mahdolliset timantit juuri omiin mieltymyksiisi sopiviksi.",
    ],
    question: "Voinko suunnitella oman sormuksen?",
    answer: [
      "Kyllä, voit. Me tarjoamme täysin yksilöllisen suunnittelupalvelun, jossa voit luoda oman kauniin sormuksen alusta alkaen. Voit valita materiaaleja kuten valkokultaa, kultaa tai platinaa, timanttien määrän, leveyden ja tyylin.  ",
      "Myös olemassa oleva kihlasormus voidaan yhdistää uniikkiin malliin. Lisäksi me valmistamme ja kunnostamme perintösormuksia näin sormuksesta voi tulla osa perheesi tarinaa.",
    ],
    question: "Mikä vaikuttaa sormuksen hintaan?",
    answer: [
      "Sormuksen hinta muodostuu valitun materiaalin, esimerkiksi 14k valkokullan tai kullan mukaan, timanttien määrästä, sormuksen leveyden, koon ja valmistustyön laajuudesta. Voit helposti rajata valikoiman verkkokaupassamme oman budjettisi mukaan. Sormus on sijoitus, joka säilyttää arvonsa ja kauneutensa ajan myötä.  ",
    ],
    question: "Millaisia materiaaleja voin valita?",
    answer: [
      "Voit valita esimerkiksi valkokultaa 14k, 14 karaatin valkokullan, kultaa, punakultaa tai platinaa. Me valmistamme kaikki sormukset korkealaatuisista ja eettisesti hankituista materiaaleista, ja valikoimastamme löytyy myös timanttisormuksia ja harvinaisempia jalokiviä. Valkokultaiset sormukset säilyttävät kiiltonsa pitkään eivätkä tummu kuten hopea.  ",
    ],
      question: "Voinko ostaa sormuksen verkkokaupasta?",
    answer: [
      "Ehdottomasti. Verkkokauppamme on turvallinen ja helppokäyttöinen, ja löydät sieltä laajan valikoiman valkokultaisia kihlasormuksia ja muita kauniita sormuksia. Voit selata eri tyylejä, vertailla hintoja, tarkastella yksityiskohtaisia kuvia ja tuotekuvauksia, sekä tilata suoraan verkosta.  ",
      "Jos jokin malli kiinnostaa, voit myös varata ajan myymälään ja kokeilla sormuksia paikan päällä. Halutessasi voit tilata omasta unelmiesi sormuksen helposti verkosta – valitse juuri sinun tyyliisi sopiva malli ja tee siitä osa tarinaasi."
    ],
  },
];

export default function VihkisormusCollectionClient() {
  const { language } = useI18n();
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

    const isThreeStone = (value) =>
      /(^|\b)3\s*-?\s*stone\b/.test(value) ||
      value.includes("three stone") ||
      value.includes("three-stone");

    const matchesAllowed = (label) => {
      const normalized = normalizeLabel(label);
      return (
        normalized.includes("solitaire") ||
        normalized.includes("halo") ||
        normalized.includes("alliance") ||
        normalized.includes("allianssi") ||
        isThreeStone(normalized)
      );
    };

    const pickAllianceFilter = (options) => {
      const allianceOption = options.find((option) => {
        const label = normalizeLabel(option?.label);
        return label.includes("alliance") || label.includes("allianssi");
      });
      return allianceOption
        ? [String(allianceOption.value)]
        : options.map((option) => option.value);
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
          setSubCategoryFilter(pickAllianceFilter(finalOptions));
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
        const list = await fetchProductListEcom(languageId, CATEGORY_ID);
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
  }, [languageId]);

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
                Vihkisormus naiselle – löydä elämäsi sormus Korkeila Helsingiltä
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
                      src="/link3/16d326f7-c99f-491b-8fbf-c2eb296625be.jpeg"
                      alt="vihkisormus, vihkisormukset, myös, naisten, miesten"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    Mikä tekee naisten vihkisormuksesta erityisen?
                    </h2>
                    <p className={styles.sectionCopy}>
                     <strong>Naisten vihkisormukset</strong> ovat usein tarkkaan harkittuja ja yksilöllisiä valintoja. Vihkisormuksen valinta on tärkeä hetki, ja oikean sormuksen löytäminen voi tuntua haastavalta – mutta me olemme täällä auttamassa.
                      Valikoimastamme löydät runsaasti vaihtoehtoja eri tyyleihin, materiaaleihin ja budjetteihin. Haluatko sormuksen timanteilla vai ilman? Valitse juuri sellainen vihkisormus, joka tuntuu omalta.
                    </p>
                    <h2 className={styles.storyHeading}>
                     Vihkisormus voi olla yksinkertainen tai näyttävä – molemmat ovat kauniita
                    </h2>
                    <p className={styles.sectionCopy}>
                     Vihkisormus voi olla hillityn tyylikäs tai rohkean säihkyvä – kumpikin vaihtoehto on yhtä arvokas. Tyylikäs sormus kultaa, valkokultaa tai vaikka platinasta valmistettuna on aina ajaton valinta. Käytämme sekä kierrätettyä kultaa että eettisesti hankittuja luonnon- ja laboratoriotimantteja. 
                    </p>
                    <h2 className={styles.storyHeading}>
                     Kaunis sormus – valmistamme sen sinulle
                    </h2>
                    <p className={styles.sectionCopy}>
                      <a
                        href="https://www.korkeilahelsinki.fi/pages/ota-yhteytta"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Korkeila Helsinki
                      </a>{" "}
                      tunnetaan laadukkaista ja yksilöllisistä koruista, jotka suunnitellaan
                      asiakkaan toiveiden mukaan. Halutessasi voit yhdistää kihlasormuksen ja
                      vihkisormuksen harmoniseksi kokonaisuudeksi, jossa muotoilu ja tyyli
                      täydentävät toisiaan.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link3/8c061b8e-afe8-453c-b105-3a207640bc66.jpeg"
                      alt="vihkisormus, vihkisormukset, myös, miesten, naisten, timanttisormukset"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                  <h2 className={styles.storyHeading}>
                      Vihkisormukset verkkokaupasta – helppoa ja turvallista
                    </h2>
                    <p className={styles.sectionCopy}>
                     Verkkokauppamme kautta voit tutustua koko mallistoomme rauhassa – meiltä löydät monipuoliset vihkisormukset, joiden joukosta voit valita juuri sinulle sopivan vihkisormuksen. Voit helposti selata eri malleja, tarkastella tuotteiden kuvia ja hintatietoja sekä tehdä tilauksen ilman kiirettä.
                    </p>
                      <p className={styles.sectionCopy}>
                    Kauniit vihkisormukset on suunniteltu kestämään aikaa ja säilyttämään merkityksensä vuodesta toiseen, joten ne ilahduttavat aina käytössä. Korkeila <strong>Helsinki</strong> tarjoaa myös mahdollisuuden suunnitella täysin omanlaisesi sormuksen – ota yhteyttä, niin autamme sinua tekemään vihkisormuksesta uniikin ja henkilökohtaisen valinnan.
                    </p>
                    <h2 className={styles.storyHeading}>
                     Timanteilla tai ilman – valitse juuri sinulle sopiva koriste
                    </h2>
                    <p className={styles.sectionCopy}>
                        Timantit ovat suosittu valinta vihkisormukseen. Timanteilla koristeltu sormus
                        tuo lisää säihkettä ja korostaa korun arvokkuutta.{" "}
                        <a
                          href="https://www.korkeilahelsinki.fi/pages/koru-opas"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.inlineLink}
                        >
                          Valikoimastamme löytyy useita eri vaihtoehtoja
                        </a>
                        , myös värillisillä kivillä tai ilman timantteja. Voit valita juuri sen tyylin,
                        joka heijastaa parhaiten omaa persoonaasi.
                    </p>
                    <h2 className={styles.storyHeading}>Vihkisormukset valkokullasta – Kauneutta ja ajattomuutta joka hetkeen</h2>
                    <p className={styles.sectionCopy}>
                     Valikoimastamme löydät laajan valikoiman valkokultaisia sormuksia, jotka sopivat täydellisesti sekä kihlasormuksiksi että vihkisormuksiksi. Tarjolla on kaikkea klassisista <strong>14 karaatin</strong> puolipyöreistä malleista näyttäviin timanttisormuksiin, joissa säihkyvät timantit ja timanttien loiste tekevät jokaisesta tuotteesta ainutlaatuisen.
                    </p>
                    <p className={styles.sectionCopy}>Jokainen valkokultainen kihlasormus ja vihkisormus on huolella valmistettu laadukkaasta valkokulta <strong>14k materiaalista</strong>, jotta sormus säilyttää kauneutensa ja kestää aikaa.</p>
                  </section>


                  <figure className={styles.storyImage}>
                    <Image
                      src="/link3/5ce16714-af3d-4a4d-8a51-68bed03209f6.jpeg"
                      alt="vihkisormus, vihkisormukset, naisten, timanttisormukset"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>
                  <section className={styles.storySection}>
                    <h3 className={styles.storySubheading}>Valinta on sinun – me autamme löytämään oikean</h3>
                    <p className={styles.sectionCopy}>
                     Vihkisormuksen valinta voi tuntua suurelta päätökseltä, mutta me Korkeila Helsingillä olemme tukenasi jokaisessa vaiheessa. Käytämme aikaa suunnitteluun, kuuntelemme toiveitasi ja varmistamme, että lopputulos on juuri sinulle täydellinen. Käytämme korkealaatuisia materiaaleja ja panostamme tarkkaan viimeistelyyn – lopputuloksena on kaunis, yksilöllinen vihkisormus, joka kestää aikaa.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                  <h3 className={styles.storySubheading}>
                     Vihkisormuksen valinta – löydä täydellinen sormus naiselle verkkokaupasta tai myymälästä
                    </h3>
                    <p className={styles.sectionCopy}>
                      Verkkokaupastamme löydät laajan valikoiman{" "}
                      <strong>vihkisormuksia naiselle</strong> – niin klassisia kuin moderneja,
                      timanteilla tai ilman.{" "}
                      <a
                        href="https://www.korkeilahelsinki.fi/pages/koru-opas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.inlineLink}
                      >
                        Valikoimastamme löytyy useita eri vaihtoehtoja
                      </a>
                      , turvallisesti ja ilman painetta. Ota aikaa, vertaile vaihtoehtoja ja tee
                      harkittu valinta. Vihkisormus on tärkeä osa elämää, ja sen valinta ansaitsee
                      rauhallisen hetken.
                    </p>
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Usein kysytyt kysymykset - Vihkisormus</h2>
                    <div className={styles.faqList}>
                      {faqs.map((faq) => (
                        <details key={faq.question} className={styles.faqItem}>
                          <summary className={styles.faqSummary}>{faq.question}</summary>
                          <div className={styles.faqBody}>
                            {faq.answer.map((line) => (
                              <p key={line} className={styles.sectionCopy}>
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
                      src="/link3/9c97a591-fcc4-43a8-9e42-cbd303654a01.jpeg"
                      alt="hinta, vihkisormus naiselle, leveys, kihlasormus, vihkisormuksia, hinta"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>


                  <section className={styles.calloutFinal}>

                    <p className={styles.sectionCopy}>
                      <strong>Löydä täydellinen sormus – me teemme siitä totta</strong>
                    </p>
                    <p className={styles.sectionCopy}>
                    Olipa etsinnässäsi klassinen keltakultainen sormus, moderni valkokultainen malli timanteilla tai täysin uniikki, juuri teille suunniteltu vihkisormus, Korkeila Helsinki on oikea osoite. 
                    </p>

                    <p className={styles.sectionCopy}>
                    Voit selailla vaihtoehtoja rauhassa {" "}
                      <a href="https://www.korkeilahelsinki.fi/" rel="noopener noreferrer" target="_blank">
                      verkkokaupassamme
                      </a>
                      , vertailla eri malleja, tutustua hintoihin ja tehdä ostoksen helposti ja turvallisesti. Tai tule paikan päälle boutique-myymäläämme Helsingin Ullanlinnaan, jossa voit nähdä sormukset luonnossa, sovittaa eri kokoja ja keskustella toiveistasi asiantuntevan kultaseppämme kanssa.
                      </p>
                    <p className={styles.sectionCopy}>Korkeila Helsinki – Kaikki vihkisormukset valmistetaan rakkaudella, juuri sinulle.</p>
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
              <section className={styles.productSection} id="valikoima">
                <Container className={styles.productContainer}>
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



