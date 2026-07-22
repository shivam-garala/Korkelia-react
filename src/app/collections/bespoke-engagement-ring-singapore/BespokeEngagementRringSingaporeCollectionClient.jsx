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
import en from "../../../i18n/en.json";
import styles from "./page.module.css";

const CATEGORY_ID = "1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.korkeilahelsinki.fi";

const buildSortOptions = (labels) => [
  { value: "price-asc", label: labels.lowToHigh },
  { value: "price-desc", label: labels.highToLow },
];

const introText = (
  <>
   At Korkeila Helsinki, a bespoke engagement ring Singapore experience is defined by intention, artistry, and devotion to detail. An engagement ring is not simply jewellery. It is a testament to your love, a reflection of your relationship, and the beginning of a lifelong journey.
  </>
);



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
  const normalized = normalizeLabel(label).toLowerCase();

  return (
   
    normalized.includes("halo") ||
    normalized.includes("solitaire") ||
    normalized.includes("3 stones") ||
    normalized.includes("alliance")
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
      <SiteHeader availableLanguages={["en"]} fixedLanguage="en" />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                Bespoke Engagement Ring Singapore
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
                  {showAllContent ? "Show less" : "READ MORE"}
                </button>

                </div>

              ) : null}
              {showAllContent ? (
                <div className={styles.storyBody} id="story-content">
                  <p className={styles.intro}>For clients in Singapore who seek something extraordinary, a bespoke engagement ring offers the freedom to create a one-of-a-kind piece that embodies the essence of your story. Your proposal deserves more than a ready-made ring. It deserves craftsmanship, thought, and a design shaped entirely around you.</p>
                  
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="/link6/image_6.jpeg"
                      alt="Bespoke Engagement Ring Singapore image 1"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     The Meaning Of A Bespoke Engagement Ring
                    </h2>
                    










                    <p className={styles.sectionCopy}>
                     An engagement ring is a symbol of commitment. It is the promise you make to your partner during one of the most meaningful moments of your life.
                    </p>
                    <p className={styles.sectionCopy}>
                     A bespoke engagement ring takes that meaning further. It allows you to create a piece that exists nowhere else in the world. The ring is a reflection of your vision, your style, and the depth of your love story.
                    </p>
                    <p className={styles.sectionCopy}>
                    Unlike standard engagement rings in a collection, a custom engagement ring is built from the ground up. Every diamond, every curve, every proportion is intentional.
                    </p>
                    <h2 className={styles.storyHeading}>
                     Why Choose a Bespoke Engagement Ring?
                    </h2>
                    <p className={styles.sectionCopy}>
                                  
                     Discerning clients increasingly choose bespoke engagement over mass-produced engagement rings. The decision to commission a custom engagement ring is the decision to prioritize individuality.
                    </p>
                     <p className={styles.sectionCopy}>
                                  
                      A bespoke engagement process allows you to participate fully in the creation of your proposal ring. You are not selecting from stock; you are shaping the final piece with our designers.
                    </p>
                    <p className={styles.sectionCopy}>This approach ensures that your engagement ring is a unique reflection of your love and your partner’s personality.</p>
                 
                   
                    <h2 className={styles.storyHeading}>
                         The Engagement Ring Journey
                    </h2>
                      <p className={styles.sectionCopy}>Your engagement ring journey begins with an online consultation through our website. During this first meeting, we explore your vision for the proposal and discuss diamond ring designs that resonate with you.</p>
                    <p className={styles.sectionCopy}>
                     This engagement ring journey is carefully structured. We guide you through diamond selection, ring design considerations, and practical elements such as ring sizes and daily wear.
                    </p>
                    <p className={styles.sectionCopy}>
                    The journey is personal and collaborative. From first sketch to final polish, you are part of the creation process.
                    </p>
                    
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     From Vision To Ring Design
                    </h2>
                    <p className={styles.sectionCopy}>A bespoke engagement ring is built around your vision. Whether you are drawn to a classic solitaire or contemporary diamond ring designs, our designers translate inspiration into form.</p>
                    <p className={styles.sectionCopy}>
                 We begin by understanding your partner’s style. Is the aesthetic minimal or intricate? Modern or timeless? Does your partner prefer understated beauty or bold brilliance?
                    </p>
                     <p className={styles.sectionCopy}>
                   The ring design process involves sketches, refined proportions, and 3D visualization. With a custom engagement approach, you can adjust details before production begins.


                    </p>
                                       
                  
                  </section>


                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     Selecting The Perfect Diamond
                    </h2>
                    <p className={styles.sectionCopy}>The diamond is the heart of the engagement ring. Choosing the right diamond is the foundation of your proposal ring.</p>
                    <p className={styles.sectionCopy}>
                We guide you through cut, clarity, and carat weight to ensure the diamond ring achieves optimal brilliance. The centre diamond determines the presence of the ring and the balance of the design.
                    </p>
                     <p className={styles.sectionCopy}>
                   Whether you select a solitaire diamond engagement ring or a setting with a halo of diamonds, the choice of the diamond is essential to the overall beauty of the piece.


                    </p>
                                       
                  
                  </section>



                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/fcf7f846-0cd8-42fc-90e7-da8f80dffbd6.jpeg"
                      alt="diamond ring Singapore"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    Solitaire And Timeless Designs
                    </h2>
                    <p className={styles.sectionCopy}>The solitaire remains one of the most iconic engagement rings. A solitaire engagement ring design highlights a single diamond with pure elegance.</p>
                    <p className={styles.sectionCopy}>
                  For many clients in Singapore, a solitaire proposal ring is the perfect expression of devotion. The simplicity of the setting allows the diamond to shine without distraction.
                    </p>
                     <p className={styles.sectionCopy}>
                     Yet bespoke engagement does not mean limited style. We create diamond engagement rings in a variety of designs, ensuring that each ring is a unique interpretation of your vision.


                    </p>
                   







                    <h2 className={styles.storyHeading}>
                   Custom Engagement Ring Versus Ready-Made
                    </h2>
                     <p className={styles.sectionCopy}>
                     Can I simply choose from a collection instead of commissioning a custom engagement ring? Of course you can. However, a bespoke engagement ring offers a deeper level of personalization.
                    </p>
                    <p className={styles.sectionCopy}>
                     A custom engagement ring ensures that no two rings are identical. The ring is tailored specifically for your partner and your proposal.
                    </p>
                    <p className={styles.sectionCopy}>When you choose bespoke engagement, you choose intentionality over convenience.</p>
                  
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Craftsmanship And Precision</h2>
                    <p className={styles.sectionCopy}>
                     Each bespoke engagement ring is created with meticulous craftsmanship. Our collections are inspirated by Scandinavian minimalism and precision.
                    </p>
                     <p className={styles.sectionCopy}>
                    Every diamond ring is crafted with attention to structure and durability. The ring is not only beautiful but also engineered for a lifetime of wear.
                    </p>
                   <p className={styles.sectionCopy}> This dedication to craftsmanship ensures that your proposal ring maintains its beauty and integrity through the years.</p>
                  </section>

                   <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Creating A Unique Proposal Ring</h2>
                    <p className={styles.sectionCopy}>
                     The proposal is one of the most meaningful milestones in a relationship. A proposal ring should honour that significance.
                    </p>
                     <p className={styles.sectionCopy}>
                   To create a one-of-a-kind proposal ring, we combine your vision with our expertise. The result is a diamond ring that feels deeply personal. </p>
                   <p className={styles.sectionCopy}> Your proposal becomes not only a moment but the beginning of a lifetime commitment symbolized by the ring.</p>
                  </section>
                  
                    <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>The Process Of Bespoke Engagement</h2>
                    <p className={styles.sectionCopy}>
                     The bespoke engagement process is structured yet flexible. First, we discuss your ideas and gather inspiration. Then we develop initial ring design concepts.
                    </p>
                     <p className={styles.sectionCopy}>
                 You can refine details with our designers until the design aligns perfectly with your expectations. Once approved, the piece enters production. </p>
                   <p className={styles.sectionCopy}> Throughout the process, we ensure transparency and clarity. From diamond sourcing to final finishing, you are informed at every stage.</p>
                  </section>

                    <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Diamond Engagement Rings Crafted To Last</h2>
                    <p className={styles.sectionCopy}>
                     Our diamond engagement rings are created to balance beauty and durability. An engagement ring is worn daily, and the structure of the ring must support the diamond securely.
                    </p>
                     <p className={styles.sectionCopy}>
                  We evaluate the proportions of the setting, the thickness of the band, and the stability of the centre stone. The result is a diamond ring that combines elegance with performance.</p>
                   <p className={styles.sectionCopy}> For the proposal and beyond, the ring becomes a testament to your commitment.</p>
                  </section>


                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Can I Personalize Every Detail?</h2>
                    <p className={styles.sectionCopy}>
                  Can I choose the diamond shape? Can I adjust the bandwidth? Can I incorporate hidden details into the ring design?
                    </p>
                    <p className={styles.sectionCopy}>
                  Yes, you can. A bespoke engagement ring allows you to personalize every element. From subtle engravings to refined settings, the ring is crafted to reflect your partner’s style.
                    </p>
                    <p className={styles.sectionCopy}>
                    This level of custom engagement ensures that your ring is truly a unique creation.
                    </p>
                      
                  
                    
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Harmonizing With Wedding Bands</h2>
                    <p className={styles.sectionCopy}>
                 When planning for the future, many clients consider how the engagement ring will pair with a wedding band.
                    </p>
                    <p className={styles.sectionCopy}>
                       We design wedding bands and wedding rings to complement your bespoke engagement ring seamlessly. Whether you prefer minimalist wedding bands or diamond-accented styles, we ensure visual harmony.
                    </p>
                    <p className={styles.sectionCopy}>
                        The combination of an engagement ring and a wedding band symbolizes the continuity of your commitment.
                    </p>
                  
                    
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link6/img0.jpeg"
                      alt="bespoke engagement ring Singapore image 2"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>





                  
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>A Testament To Your Love Story</h2>
                    <p className={styles.sectionCopy}>
                 A bespoke engagement ring is more than a piece of jewellery. It is a testament to your love story and the journey you share.
                    </p>
                    <p className={styles.sectionCopy}>
                From the first idea to the final proposal, every detail reflects the essence of your relationship. The ring is a symbol of your love, your promise, and your shared future.
                    </p>
                    
                      
                  
                    
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>For Clients In Singapore And Beyond</h2>
                    <p className={styles.sectionCopy}>
                  We welcome clients in Singapore and internationally who seek a refined, bespoke engagement experience.
                    </p>
                    <p className={styles.sectionCopy}>
                Through private online consultations and secure communication, we ensure discretion and personalized care. Our website provides initial inspiration, but the true experience unfolds during your consultation.
                    </p>
                    <p className={styles.sectionCopy}>
                   Whether you are planning an intimate proposal in Singapore or abroad, we are honoured to guide you.
                    </p>
                      
                  
                    
                  </section>

                    <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Begin Your Engagement Ring Journey</h2>
                    <p className={styles.sectionCopy}>
                        Your engagement ring journey is one of intention, creativity, and devotion. The decision to commission a bespoke engagement ring is the decision to create something extraordinary.
                    </p>
                    <p className={styles.sectionCopy}>
                        With our designers, you can shape a custom engagement ring that reflects your vision, honours your partner, and marks the beginning of a lifetime together.
                    </p>
                    <p className={styles.sectionCopy}>
                        The proposal is a defining moment. Let the ring be worthy of that moment.
                    </p>
                    <p className={styles.sectionCopy}>
                       Book your private consultation and begin the creation of a bespoke engagement ring that captures the beauty, commitment, and uniqueness of your love.
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
                  {showAllContent ? "Show less" : "Read more"}
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
      <SiteFooter brandDescription={en.footer.ringBrandDescription} fixedLanguage="en" />
    </div>
  );
}
