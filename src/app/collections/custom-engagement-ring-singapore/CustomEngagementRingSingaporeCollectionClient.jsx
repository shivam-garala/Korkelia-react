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
   At Korkeila Helsinki, we believe an engagement ring is the most personal symbol of your commitment. For those searching for a custom engagement ring Singapore, we offer a refined design experience rooted in Scandinavian elegance and uncompromising craftsmanship.
  </>
);



export default function KihlasormusMiehelleCollectionClient() {
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
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                Custom engagement ring Singapore
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
              <div
                className={`${styles.storyBody} ${!showAllContent ? styles.storyBodyHidden : ""}`}
                id="story-content"
              >
                  <p className={styles.intro}>A custom engagement ring is not simply a product. It is the creation of a piece that reflects the depth of your love story, the individuality of your relationship, and the promise of a lifetime together. We are honoured to guide you through this meaningful journey.</p>
                  
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/custom_ring_sing_1.jpeg"
                      alt="Custom Engagement Ring Singapore image"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     Why Choose A Custom Engagement Ring?
                    </h2>
                    










                    <p className={styles.sectionCopy}>
                     An engagement ring is the symbol of your love and commitment. While our curated collection of engagement rings offers timeless designs, many of our clients seek something more personal.
                    </p>
                    <p className={styles.sectionCopy}>
                     A custom engagement ring allows you to shape every detail, from diamond selection to gold tone, from proportions to textures. With a custom engagement approach, you are involved in the design process from the very beginning.
                    </p>
                    <p className={styles.sectionCopy}>
                    For many couples, this engagement ring journey becomes as meaningful as the proposal itself.
                    </p>
                    <h2 className={styles.storyHeading}>
                     The Engagement Ring Journey With Our Designers
                    </h2>
                    <p className={styles.sectionCopy}>
                                  
                     Our custom engagement process begins with a consultation via our website. During this session, we discuss your vision, preferences, and questions about diamonds, style, and setting.
                    </p>
                     <p className={styles.sectionCopy}>
                                  
                      With our designers and experts, you can explore diamond shapes, carat weight, and design inspirations. Whether you are drawn to classic diamond engagement rings or modern minimalist diamond rings, we help translate your vision into a tangible concept.
                    </p>
                    <p className={styles.sectionCopy}>This engagement ring journey is carefully structured to ensure clarity, transparency, and confidence at every stage.</p>
                 
                   
                    <h2 className={styles.storyHeading}>
                         Selecting The Perfect Diamond
                    </h2>
                      <p className={styles.sectionCopy}>The diamond is the heart of every engagement ring. Our diamond specialists guide you through cut, clarity, colour, and carat weight, ensuring the diamond you choose reflects brilliance and quality.</p>
                    <p className={styles.sectionCopy}>
                     We source diamonds that meet strict standards, including certifications from the Gemological Institute of America. This ensures your diamond ring meets international quality benchmarks.
                    </p>
                    <p className={styles.sectionCopy}>
                    If you are considering something extraordinary, we can also source rare diamonds from trusted partners in Australia and across the world. Our commitment to quality ensures that your engagement ring performs beautifully for a lifetime.
                    </p>
                    
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     Designing With Intention And Craftsmanship
                    </h2>
                    <p className={styles.sectionCopy}>A custom engagement ring is crafted with care and precision. Our designers refine proportions, balance, and structural integrity to ensure the ring is both elegant and durable.</p>
                    <p className={styles.sectionCopy}>
                  We offer refined options in gold and carefully selected metals, ensuring harmony between the diamond and the setting. Every detail, from subtle textures to prong placement, is considered in the creation of your ring.
                    </p>
                     <p className={styles.sectionCopy}>
                    Our Finnish approach to jewellery emphasizes grace, minimalism, and quiet brilliance. This design philosophy ensures your engagement ring remains timeless.


                    </p>
                                       
                  
                  </section>






                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/custom_ring_sing_2.jpeg"
                      alt="Engagement-Ring-Singapore image 1"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    From Vision To Creation
                    </h2>
                    <p className={styles.sectionCopy}>During your appointment, we translate your vision into detailed sketches and digital renderings. This allows you to visualize the piece before production begins.</p>
                    <p className={styles.sectionCopy}>
                  You can refine the design, adjust diamond proportions, and confirm ring sizes before the final creation. Everything is reviewed carefully to your satisfaction.
                    </p>
                     <p className={styles.sectionCopy}>
                     We are dedicated to ensuring that the final engagement ring reflects your expectations. This is not simply manufacturing; it is the creation of something deeply personal.


                    </p>
                   







                    <h2 className={styles.storyHeading}>
                   Diamond Engagement Rings Crafted To Last
                    </h2>
                     <p className={styles.sectionCopy}>
                     Our custom engagement ring process is built on craftsmanship and enduring quality. Each diamond engagement ring is created in the highest standards of jewellery making.
                    </p>
                    <p className={styles.sectionCopy}>
                     The performance of the setting, the precision of the diamond cut, and the structural security of the ring are carefully evaluated. This ensures your engagement ring can be worn every day without compromise.
                    </p>
                    <p className={styles.sectionCopy}>In Singapore, where lifestyle and climate require durability, our engagement rings are crafted to withstand daily wear while maintaining brilliance.</p>
                  
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Custom Engagement Rings And Wedding Bands</h2>
                    <p className={styles.sectionCopy}>
                     Many clients choose to design both their engagement ring and wedding band together. This ensures visual harmony between the two rings.
                    </p>
                     <p className={styles.sectionCopy}>
                     Our wedding bands and wedding rings can be created to complement your custom engagement ring seamlessly. Whether you prefer minimalist wedding bands or diamond wedding rings with subtle detailing, we design them to align with your engagement ring.
                    </p>
                   <p className={styles.sectionCopy}> This unified approach ensures your jewellery reflects both elegance and continuity.</p>
                  </section>

                   <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Can I Design My Own Engagement Ring?</h2>
                    <p className={styles.sectionCopy}>
                     Yes, you can. Many clients ask, “Can I fully design my own engagement ring?” With our guidance, you can customize every element, from diamond selection to band width and setting style.
                    </p>
                     <p className={styles.sectionCopy}>
                    If you have specific questions about diamond quality, ring sizes, or timelines, our experts provide detailed guidance. We believe informed decisions create confident outcomes.                    </p>
                   <p className={styles.sectionCopy}> The process is collaborative. You are never alone in the journey.</p>
                  </section>
                  




                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/custom_ring_sing_3.jpeg"
                      alt="Singapore"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>





                  
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Quality, Care, And Commitment</h2>
                    <p className={styles.sectionCopy}>
                  Every engagement ring we create reflects our commitment to quality and care. We adhere to strict standards in sourcing, design, and finishing.
                    </p>
                    <p className={styles.sectionCopy}>
                  Our jewellery is crafted to accompany you through life’s most meaningful moments. From proposal to wedding, and through the years that follow, your engagement ring becomes part of your daily life.
                    </p>
                    <p className={styles.sectionCopy}>
                     We offer guidance on care, maintenance, and long-term support to ensure your ring retains its brilliance.
                    </p>
                      
                  
                    
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Book An Appointment In Singapore</h2>
                    <p className={styles.sectionCopy}>
                  The first step in your custom engagement ring journey is a private appointment. In our online store, you can view diamonds, explore design references, and discuss your vision in detail.
                    </p>
                    <p className={styles.sectionCopy}>
                  If you are located outside Singapore, we offer remote consultations through our website. Our team ensures security and discretion throughout the process.
                    </p>
                    <p className={styles.sectionCopy}>
                    Booking an appointment allows us to dedicate time exclusively to your project.
                    </p>
                      
                  
                    
                  </section>

                    <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Creating Something Truly Personal</h2>
                    <p className={styles.sectionCopy}>
                  A custom engagement ring is the ultimate expression of individuality. It is designed to your proportions, your aesthetic, and your story.
                    </p>
                    <p className={styles.sectionCopy}>
                 With our designers and diamond experts, you can transform inspiration into reality. From diamond ring proportions to the subtle curve of the band, every decision shapes the final piece.
                    </p>
                    <p className={styles.sectionCopy}>
                   We believe that the perfect engagement ring is the one that resonates deeply with you and your loved one.
                    </p>
                      
                  
                    
                  </section>

                   <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Begin Your Custom Engagement Ring Journey</h2>
                    <p className={styles.sectionCopy}>
                  In Singapore and around the world, we are honoured to guide clients through this significant journey.
                    </p>
                    <p className={styles.sectionCopy}>
                 Whether you are seeking classic diamond engagement rings or a modern reinterpretation with a unique centre diamond, we are here to help you create something meaningful.
                    </p>
                    <p className={styles.sectionCopy}>
                  Your engagement ring is the symbol of your love, your commitment, and your shared future. With our expertise, craftsmanship, and dedication to quality, we help you design a piece that will last a lifetime.
                    </p>
                       <p className={styles.sectionCopy}>
                 Book your appointment today and begin the creation of your custom engagement ring, a reflection of your vision, your love story, and the brilliance of your commitment.
                    </p>
                  
                    
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
      <SiteFooter brandDescription={t("footer.ringBrandDescription")} />
    </div>
  );
}
