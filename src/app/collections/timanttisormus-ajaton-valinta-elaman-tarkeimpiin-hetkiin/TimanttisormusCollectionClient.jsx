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
    Timanttisormus on enemmän kuin vain koru – se on rakkauden, muiston ja merkityksen symboli.{" "}
    <a href={SITE_URL} rel="noopener noreferrer">
      Me Korkeila Helsingillä
    </a>{" "}
    olemme erikoistuneet valmistamaan uniikkeja ja kauniisti viimeisteltyjä timanttisormuksia,
    jotka säilyttävät arvonsa ja kauneutensa sukupolvien ajan. 
  </>
);

const faqs = [
  {
    question: "Miten timantin laatu vaikuttaa timanttisormuksen hintaan?",
    answer: [
      "Timantin hinta muodostuu niin sanotun 4C-luokituksen perusteella: karaatti (carat), väri (color), kirkkaus (clarity) ja hionta (cut).",
    ],
    bullet:[
      "Karaatti viittaa timantin painoon – suurempi karaattimäärä tarkoittaa suurempaa ja usein näyttävämpää timanttia.",
      "Väri arvioidaan asteikolla D (väritön) – Z (keltaiseen vivahtava). Mitä värittömämpi timantti, sitä arvokkaampi se yleensä on.",
      "Kirkkaus kertoo, kuinka puhdas timantti on luonnollisista sulkeumista ja epäpuhtauksista.",
      "Hionta vaikuttaa siihen, kuinka kauniisti timantti taittaa valoa – hyvä hionta saa timantin säihkymään. Yhdessä nämä tekijät määrittävät timantin esteettisen laadun ja arvon – ja sitä kautta timanttisormuksen hinnan. Meiltä saat aina asiantuntevaa opastusta timantin valintaan.",
      ],
  },
  {
    question: "Onko laboratoriotimantti aito timantti?",
    answer: [
      "Kyllä – laboratoriotimantti on täysin aito timantti. Se on kemiallisesti, optisesti ja fyysisesti identtinen luonnontimantin kanssa. Ainoa ero on syntytapa: luonnontimantti muodostuu maaperässä miljoonien vuosien aikana, kun taas laboratoriotimantti kasvatetaan valvotuissa olosuhteissa muutamassa viikossa.",
      "Laboratoriotimantit ovat eettinen ja ekologinen vaihtoehto, ja ne tarjoavat erinomaisen hinta–laatusuhteen ilman kompromisseja säihkeessä tai kestävyydessä.",
    ],
  },
  
  
];

export default function TimanttisormusCollectionClient() {
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
      /(^|\b)3\s*-?\s*stones?\b/.test(value) ||
      value.includes("three stone") ||
      value.includes("three-stone") ||
      value.includes("three stones") ||
      value.includes("three-stones");

    const matchesAllowed = (label) => {
      const normalized = normalizeLabel(label);
      return (
        normalized.includes("solitaire") ||
        normalized.includes("halo") ||
        normalized.includes("alliance") ||
        isThreeStone(normalized)
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
               Timanttisormus – ajaton valinta elämän tärkeimpiin hetkiin
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
                      src="/link1/Halo_sormus_emerald_-hiontaisella_timantilla.jpg"
                      alt="Timanttisormus lähikuvassa"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Valikoimastamme löydät juuri sinulle sopivan timanttisormuksen
                    </h2>
                    <p className={styles.sectionCopy}>
                      Laajasta valikoimastamme löydät upeita vaihtoehtoja eri tyyleihin, kivien
                      muotoihin ja kultaväreihin – oli kyseessä kihla-, vihkisormus tai
                      ainutlaatuinen lahja tärkeälle ihmiselle.{" "}
                      {/* <a
                        href="https://korkeilahelsinki.bridaljewellery.shop/engagement-rings.php?maxDiamondWeight=1.55&maxCentreDiamondWeight=5.00#filtersOpen"
                        rel="noopener noreferrer"
                      > */}
                        Jokainen timanttisormus {" "}
                      {/* </a>{" "} */}
                      valmistetaan huolellisesti 14 tai 18 karaatin valkokullasta, keltakullasta
                      tai platinasta.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link1/bee5e388-97d8-499a-b128-327817580bd3.jpeg"
                      alt="Timanttisormus kädessä"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Klassinen Timanttisormus vai Moderni Halo-muotoilu?
                    </h2>
                    <p className={styles.sectionCopy}>
                      Timanttisormuksen muotoilulla on suuri vaikutus sormuksen tyyliin,
                      symboliikkaan ja yleisilmeeseen. Valinta klassisen ja halo-tyylisen
                      timanttisormuksen välillä perustuu usein henkilökohtaiseen makuun,
                      sormuksen käyttötarkoitukseen sekä siihen, millaisen vaikutelman haluat
                      sormuksen välittävän.
                    </p>
                    <h3 className={styles.storySubheading}>
                      Klassinen Yksikivinen Timanttisormus – Ajaton ja Elegantti
                    </h3>
                    <p className={styles.sectionCopy}>
                      Solitaire-malli, eli yksikivinen klassinen timanttisormus, on yksi suosituimmista ja ikonisimmista sormusmalleista. Se korostaa yhtä huolellisesti valittua timanttia, joka saa kaiken huomion. Yksinkertainen ja puhdas muotokieli tekee siitä ajattoman valinnan – erityisesti kihla- ja vihkisormuksena, jossa ajattomuus ja symbolinen pysyvyys ovat tärkeitä.
                    </p>
                    <p className={styles.sectionCopy}>
                     Tällainen sormus istuu kauniisti monenlaiseen tyyliin ja on helppo yhdistää muihin koruihin. Yksikivinen timanttisormus sopii erityisesti sinulle, joka arvostat hillittyä eleganssia, selkeyttä ja klassista muotoilua, joka ei koskaan mene pois muodista.
                    </p>
                  
                    <h3 className={styles.storySubheading}>Moderni Halo-sormus – Loistoa ja Näyttävyyttä</h3>
                    <p className={styles.sectionCopy}>
                      Halo-sormuksessa keskellä oleva timantti on ympäröity useilla pienemmillä
                      timanteilla, jotka muodostavat sen ympärille kehän eli "halon". Tämä
                      rakenne saa keskikiven näyttämään suuremmalta ja kirkkaammalta, ja lisää
                      koko sormukseen ylellistä säihkettä.<br/>Halo-muotoilu on täydellinen valinta silloin, kun haluat sormukselta
                      lisänäyttävyyttä, modernia muotoilua ja erityistä hohtoa.
                    </p>
                   
                    <p className={styles.sectionCopy}>
                      Halo-sormuksia valmistetaan eri variaatioissa – esimerkiksi ovaaleilla,
                      cushion- tai princess-hiontaisilla keskikivillä – ja niitä voidaan
                      yhdistellä eri kultasävyihin, kuten valko-, kelta- tai ruusukultaan. Tämä
                      tekee halo-muotoilusta muunneltavan ja persoonallisen valinnan.
                    </p>
                    <h3 className={styles.storySubheading}>
                      Valinnan Taustalla – Tyyli, Budjetti ja Elämäntapa
                    </h3>
                    <p className={styles.sectionCopy}>
                      Kumpikin vaihtoehto – klassinen tai halo – voi olla täydellinen valinta,
                      riippuen:
                    </p>
                    <ul className={styles.storyList}>
                      <li>Tyylistäsi: hillitty vs. näyttävä</li>
                      <li>Budjetistasi: halo-sormuksessa on useampia timantteja, mikä voi vaikuttaa hintaan</li>
                      <li>Elämäntyylistäsi: arkeen sopiva matalampi malli vai juhlavampi rakenne</li>
                    </ul>
                    <p className={styles.sectionCopy}>
                      Me Korkeila Helsingillä autamme sinua vertailemaan vaihtoehtoja ja
                      löytämään sormuksen, joka vastaa juuri sinun toiveitasi ja tarpeitasi –
                      oli kyseessä sitten klassinen yksikivinen sormus tai säihkyvä halo-muotoilu.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Timanttisormus kihla- ja vihkisormuksena</h2>
                    <p className={styles.sectionCopy}>
                      Kihlasormuksena timanttisormus viestii pysyvyyttä ja arvokkuutta.
                      Vihkisormuksena se täydentää täydellisesti kihlasormuksen, muodostaen
                      harmonisen kokonaisuuden. Meiltä löydät vihkisormuksia eri karaatin
                      painoluokissa ja timanttien muodoissa, kuten ovaali, princess ja
                      briljantti.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Timantin laatu vaikuttaa sormuksen ulkonäköön ja hintaan
                    </h2>
                    <p className={styles.sectionCopy}>
                      Timantin laatuun vaikuttavat väri, puhtaus, hionta ja karaatin paino.
                      Meidän valikoimasta löydät vain laadukkaita, tarkoin valittuja timantteja,
                      jotka on sertifioitu ja eettisesti hankittuja. Käytämme myös
                      laboratoriossa kasvatettuja timantteja, jotka tarjoavat
                      ympäristöystävällisen vaihtoehdon ilman kompromisseja kauneudessa tai
                      kestävyydessä.
                    </p>
                    
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link1/a41441d0-922a-48aa-8716-bc20b338b0aa.jpeg"
                      alt="Timanttisormus lähikuvassa"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Sormuksia eri kultaväreissä – valkokulta, keltakulta ja ruusukulta
                    </h2>
                    <p className={styles.sectionCopy}>
                      Timanttisormuksen ilmeeseen ja tunnelmaan vaikuttaa olennaisesti valittu
                      metalliväri. Meiltä Korkeila Helsingiltä löydät 14 ja 18 karaatin
                      valkokultaiset, keltakultaiset ja ruusukultaiset sormukset, jotka
                      valmistetaan käsityönä tarkoin valituista jalometalleista.
                    </p>
                    <p className={styles.sectionCopy}>
                      Valkokulta – modernia tyylikkyyttä ja timantin kirkastamista
                    </p>
                    <p className={styles.sectionCopy}>
                     Valkokulta on suosittu valinta erityisesti silloin, kun halutaan korostaa timantin värittömyyttä ja säihkettä. Sen viileä, hopeanhohtoinen sävy toimii erinomaisesti briljanttihiottujen timanttien kanssa, ja se tuo kokonaisuuteen modernia eleganssia. Valkokulta on myös käytännöllinen vaihtoehto – se sopii yhteen monien muiden korujen kanssa ja tarjoaa ajattoman mutta tyylikkään lopputuloksen.
                    </p>
                    <p className={styles.sectionCopy}>Keltakulta – klassinen ja lämmintunnelmainen valinta</p>
                    <p className={styles.sectionCopy}>
                      Keltakulta on perinteinen ja ylellinen materiaali, joka huokuu lämpöä ja arvokkuutta. Se tuo timanttisormukseen vintage-henkisyyttä ja ajattomuutta – erinomainen valinta esimerkiksi silloin, kun halutaan koru, joka kestää paitsi aikaa, myös muuttuvia trendejä. Keltakulta korostaa erityisen kauniisti lämpimän sävyisiä timantteja ja on suosittu valinta myös kihla- ja vihkisormuksissa.
                    </p>
                    <p className={styles.sectionCopy}>Ruusukulta – pehmeän romanttinen ja erottuva</p>
                    <p className={styles.sectionCopy}>
                     Ruusukulta, eli pinkinkultainen seos, tarjoaa pehmeän, romanttisen sävyn, joka on viime vuosina noussut suureen suosioon etenkin yksilöllisyyttä etsivien keskuudessa. Se sopii erinomaisesti yhteen vaaleiden timanttien, morganiittien tai muiden pastellisävyisten jalokivien kanssa. Ruusukulta on oivallinen valinta silloin, kun haluat sormuksen, joka tuntuu persoonalliselta mutta säilyttää arvokkuutensa.
                    </p>
                    <p className={styles.sectionCopy}>
                      14 tai 18 Karaatin kulta – kestävä ja arvokas materiaalivalinta
                    </p>
                    <p className={styles.sectionCopy}>
                      Kaikki kultasormuksemme valmistetaan joko 14 tai 18 karaatin kullasta, joka tarkoittaa, että metalliseoksessa on 58,5 tai 75% puhdasta kultaa. Tämä yhdistää erinomaisen kestävyyden ja ylellisen sävyn – ideaalinen yhdistelmä päivittäiseen käyttöön tarkoitetulle sormukselle. Olipa valintasi sitten valkokulta, keltakulta tai ruusukulta, voit olla varma, että lopputulos on laadukas ja ajattoman kaunis.
                    </p>
                    <p className={styles.sectionCopy}>
                      Tutustu valikoimaan ja löydä juuri sinulle sopiva kultasävy, joka tuo
                      timanttisi kauneuden esiin parhaalla mahdollisella tavalla.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Uniikki timanttisormus – suunnitellaan yhdessä</h2>
                    <p className={styles.sectionCopy}>
                       Haluatko jotain täysin omaa ja henkilökohtaista? Voimme valmistaa sinulle täysin uniikin timanttisormuksen, jossa yhdistyvät juuri sinun toiveesi, oikea materiaali ja oikean kokoinen timantti. Valmistamme sormuksia myös vanhoista koruista, jolloin muisto säilyy mukana uudessa muodossa.
                    </p>
                   
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Timanttisormuksia kaikkiin hetkiin</h2>
                    <p className={styles.sectionCopy}>
                     Timanttisormus voi olla myös lahja – valmistujaisiin, vuosipäivään tai merkkipäivään. Valikoimastamme löydät sormuksia eri hintaluokissa ja design-vaihtoehdoissa, joten sopiva valinta löytyy varmasti.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link1/c2da90ae-3928-4c3b-94d1-b0d5bf4359b3.jpeg"
                      alt="Timanttisormus kädessä"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Timanttisormuksen valinta – Asiantunteva Palvelu Auttaa Oikean Valinnan Teossa
                    </h2>
                    <p className={styles.sectionCopy}>
                      Timanttisormuksen valinta on henkilökohtainen ja usein tunteikas prosessi, jossa huomioidaan paljon enemmän kuin vain ulkonäkö tai budjetti. Sormuksen tulisi heijastaa kantajansa tyyliä, arvoja ja elämäntilannetta – ja siksi me Korkeila Helsingillä otamme jokaisen asiakkaan yksilölliset toiveet vakavasti.
                    </p>
                    <p className={styles.sectionCopy}>Sopivan timanttisormuksen valintaan vaikuttavat muun muassa:</p>
                    <ul className={styles.storyList}>
                      <li>
                        Käden ja sormien muoto: Esimerkiksi pitkät, kapeat sormet saattavat korostua kauniisti soikealla (ovaali) tai princess-hiontaisella timantilla, kun taas leveämpään sormeen istuu usein matalampi ja leveämpi sormusrunko.
                      </li>
                      <li>
                        Oma tyyli ja arjen käyttötarpeet: Onko tyyli klassinen, moderni, vintage-henkinen vai minimalistinen? Käytätkö sormusta päivittäin vai vain juhlatilanteissa? Nämä seikat vaikuttavat muun muassa sormuksen korkeuteen, kivien määrään ja istutustapaan.
                      </li>
                      <li>
                        Materiaalivalinta: Valitsetko lämpimän keltakullan, viileän valkokullan vai kenties ruusukullan pehmeän sävyn? Meiltä saat aina 14 tai 18 karaatin kultaa tai platinaa, jotka kestävät käyttöä ja korostavat timanttien säihkettä kauniisti.
                      </li>
                      <li>
                        Timantin muoto ja koko: Timantti voi olla pyöreä briljanttihiontainen, ovaalihiontainen, smaragdihiontainen, cushionhiontainen, pisarahiontainen tai princesshiontainen – ja jokaisella muodolla on oma ilmeensä ja vaikutuksensa sormuksen tyyliin. Me autamme sinua vertailemaan eri vaihtoehtoja ja ymmärtämään niiden eroja.
                      </li>
                    </ul>
                    <p className={styles.sectionCopy}>
                     Asiantunteva henkilökuntamme opastaa sinua kaikissa valintaan liittyvissä vaiheissa – oli kyseessä valmiin mallin katsominen valikoimasta tai täysin yksilöllisen timanttisormuksen suunnittelu. Haluamme varmistaa, että jokainen asiakkaamme löytää sormuksen, joka ei ainoastaan näytä hyvältä – vaan myös tuntuu oikealta.
                    </p>
                    <p className={styles.sectionCopy}>
                      Oikein valittu timanttisormus kulkee mukana läpi elämän – ja säilyttää merkityksensä vuodesta toiseen.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Timanttisormukset – valmistettu kestämään aikaa</h2>
                    <p className={styles.sectionCopy}>
                      Käytämme kierrätettyä kultaa ja eettisesti hankittuja timantteja. Jokainen
                      sormus käy läpi tarkan laadunvalvonnan ja viimeistelyn.
                    </p>
                    <p className={styles.sectionCopy}>
                      <a href={SITE_URL} rel="noopener noreferrer">
                        Tilaa timanttisormus suoraan verkkokaupasta tai tule käymään liikkeessämme
                      </a>
                      .
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Miksi valita timanttisormus meiltä?</h2>
                    <ul className={styles.storyList}>
                      <li>Suunnitellaan Suomessa</li>
                      <li>Käytämme vain 14 ja 18 karaatin kulta- ja platinamateriaaleja</li>
                      <li>Mahdollisuus valita laboratoriossa kasvatettu tai luonnollinen timantti</li>
                      <li>Kauniisti viimeistellyt yksityiskohdat</li>
                      <li>Ystävällinen ja asiantunteva palvelu</li>
                    </ul>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link1/824a893f-c912-4f9b-8930-849c38145afd.jpeg"
                      alt="Timanttisormus käytössä"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>UKK – Timanttisormukset</h2>
                    
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
                             {/* Bullet list */}
                            {faq.bullet && (
                              <ul className={styles.storyList}>
                                {faq.bullet.map((item) => (
                                  <li key={item} className={styles.sectionCopy}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                    
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link1/bbd48034-ce22-4e12-82e2-a470f97241b3.jpeg"
                      alt="Timanttisormus kukkien keskellä"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.calloutFinal}>
                    <h2 className={styles.storyHeading}>
                      Löydä täydellinen timanttisormus – suunnitellaan Suomessa juuri sinulle
                    </h2>
                    <p className={styles.sectionCopy}>
                     Etsitpä sitten ajattoman kaunista kihlasormusta, merkityksellistä vihkisormusta tai henkilökohtaista lahjaa, timanttisormus Korkeila Helsingiltä on pysyvä osoitus rakkaudesta, tyylistä ja käsityötaidosta. Jokainen sormus valmistetaan huolella, käyttäen eettisesti hankittuja timantteja ja korkealaatuista 14 tai 18 karaatin kultaa, jotta koru kestää aikaa yhtä arvokkaasti kuin se hetki, jota se juhlistaa.
                    </p>
                    <p className={styles.sectionCopy}>
                     Valikoimastamme löydät huolella valittuja timanttisormuksia – ja halutessasi myös mahdollisuuden suunnitella oman, ainutlaatuisen sormuksen. Perheyrityksemme auttaa sinua tekemään oikean valinnan, oli kyse sitten valmiista mallista tai täysin yksilöllisestä toteutuksesta.
                    </p>
                    
                    <p className={styles.sectionCopy}>
                      <a href={SITE_URL} rel="noopener noreferrer">
                        Tutustu koko valikoimaan ja löydä timanttisormus
                      </a>
                      , joka tuntuu juuri sinulle tehdyltä.
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
              <section className={styles.productSection} id="valikoima">
                <Container className={styles.productContainer}>
                {/*
                  <div className={`${styles.sectionHeader} ${styles.productSectionHeader}`}>
                    <h2 className={`${styles.sectionTitle} ${styles.productHeading}`}>
                      Valikoima timanttisormuksia
                    </h2>
                    <p className={styles.sectionCopy}>
                      Inspiroidu suosituimmista malleista ja löydä oma säihkeesi. Alla esimerkkejä
                      timanttisormuksista eri tyyleissä.
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
