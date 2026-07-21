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
  fetchAllCategories,
  fetchProductListEcom,
  fetchSubCategoryHomePage,
} from "../../../lib/productListingCache.js";
import { useI18n } from "../../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const buildSortOptions = (labels) => [
  { value: "price-asc", label: labels.lowToHigh },
  { value: "price-desc", label: labels.highToLow },
];

const normalizeImage = (image, apiBase) => {
  if (!image) return "/productlisting/no_image.jpg";
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  if (!apiBase) return image;
  return `${apiBase.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
};

const mapProduct = (item, languageId, apiBase) => {
  const id = item?.id ?? item?.product_id ?? null;
  if (!id) return null;
  const design = item?.design ?? item?.design_variant ?? item?.designVariant ?? null;
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
  if (diamondRate?.diamond_type_id)
    query.set("diamond_type_id", String(diamondRate.diamond_type_id));
  if (diamondRate?.clarity_id)
    query.set("clarity_id", String(diamondRate.clarity_id));
  const caratValue =
    diamondRate?.diamond_master?.carat ??
    diamondRate?.diamond_master_id?.carat ??
    null;
  if (caratValue !== null && caratValue !== undefined)
    query.set("carat", String(caratValue));
  if (primaryDetail?.cut_master_id)
    query.set("cut_id", String(primaryDetail.cut_master_id));
  const translations = Array.isArray(design?.design_translations)
    ? design.design_translations
    : [];
  const matchingTranslation = translations.find(
    (t) => String(t?.language_id ?? "") === String(languageId)
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
    imageSrc: normalizeImage(item?.image, apiBase),
    href: query.toString()
      ? `/product/${id}?${query.toString()}`
      : `/product/${id}`,
    categoryId: String(item?.category_id ?? ""),
    subCategoryId: String(item?.sub_category_id ?? ""),
  };
};

const introText = (
  <>
  At Korkeila Helsinki, bespoke jewelry represents more than an accessory. It is a thoughtful creation shaped around your story, your vision, and the moments that define your life. In a world of mass production, bespoke jewellery is a return to intention.
  </>
);

export default function LabgrownDiamondSingaporeCollectionClient() {
  const { language, currencyCode,currencySymbol } = useI18n();
  const [showAllContent, setShowAllContent] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
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
            category: "Kategoria",
            subCategory: "Alakategoria",
            sortByPrice: "Lajittele hinnan mukaan",
            lowToHigh: "Halvin ensin",
            highToLow: "Kallein ensin",
          }
        : {
            category: "Category",
            subCategory: "Sub Category",
            sortByPrice: "Sort By Price",
            lowToHigh: "Low to High",
            highToLow: "High to Low",
          },
    [language]
  );

  const sortFilterOptions = useMemo(() => buildSortOptions(labels), [labels]);

  // Load all categories
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await fetchAllCategories(languageId);
        const raw = Array.isArray(list) ? list : list?.data ?? [];
        const mapped = raw
          .map((item) => {
            const id = item?.id ?? null;
            const label = item?.category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { value: String(id), label: String(label) };
          })
          .filter(Boolean);
        if (active) setCategories(mapped);
      } catch (e) {
        if (active) setCategories([]);
        console.error("Category load failed", e);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [languageId]);

  // Load all products across all categories once categories are known
  useEffect(() => {
    if (categories.length === 0) return;
    let active = true;
    if (active) setProductsLoading(true);
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

    const load = async () => {
      try {
        clearProductListingCache();
        const results = await Promise.all(
          categories.map((cat) =>
            fetchProductListEcom(languageId, cat.value, currencyCode, currencySymbol)
              .then((list) =>
                list.map((item) => mapProduct(item, languageId, apiBase)).filter(Boolean)
              )
              .catch(() => [])
          )
        );
        const all = results.flat();
        // Deduplicate by product id
        const seen = new Set();
        const unique = all.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        if (active) setProducts(unique);
      } catch (e) {
        if (active) setProducts([]);
        console.error("Product load failed", e);
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [categories, languageId, currencyCode, currencySymbol]);

  // When category selection changes, fetch subcategories for all selected categories
  useEffect(() => {
    if (categoryFilter.length === 0) {
      setSubCategories([]);
      setSubCategoryFilter([]);
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const results = await Promise.all(
          categoryFilter.map((catId) => fetchSubCategoryHomePage(languageId, catId).catch(() => []))
        );
        const seen = new Set();
        const merged = results
          .flat()
          .map((item) => {
            const id = item?.id ?? item?.sub_category_id ?? null;
            const label = item?.sub_category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { value: String(id), label: String(label) };
          })
          .filter(Boolean)
          .filter((opt) => {
            if (seen.has(opt.value)) return false;
            seen.add(opt.value);
            return true;
          });
        if (active) {
          setSubCategories(merged);
          setSubCategoryFilter([]);
        }
      } catch (e) {
        if (active) {
          setSubCategories([]);
          setSubCategoryFilter([]);
        }
        console.error("Subcategory load failed", e);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [categoryFilter, languageId]);

  const handleCategoryChange = (values) => {
    setCategoryFilter(Array.isArray(values) ? values : []);
    setSubCategoryFilter([]);
  };

  const displayedProducts = useMemo(() => {
    let list = products;

    if (categoryFilter.length > 0) {
      const catSet = new Set(categoryFilter.map(String));
      list = list.filter((p) => catSet.has(String(p.categoryId)));
    }

    if (subCategoryFilter.length > 0) {
      const subSet = new Set(subCategoryFilter.map(String));
      list = list.filter((p) => subSet.has(String(p.subCategoryId)));
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
  }, [products, categoryFilter, subCategoryFilter, sortFilter]);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Bespoke Jewelry Singapore</h1>
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
                    READ MORE
                  </button>
                </div>
              ) : null}
              {showAllContent ? (
                <div className={styles.storyBody} id="story-content">
                  <p className={styles.intro}>
                    We believe jewellery can be refined, meaningful, and deeply personal. Each piece is a reflection of identity and emotion, brought to life through craftsmanship and design.
                  </p>
                
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/bespoke_Design_1.jpeg"
                      alt="bespoke jewelry Singapore image 0"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     What Does “Bespoke” Mean In Jewellery?
                    </h2>
                 








                    <p className={styles.sectionCopy}>
                       The word bespoke originates from tailoring. In jewellery, it means a piece created entirely from the ground up for one individual.
                    </p>
                    <p className={styles.sectionCopy}>
                        Bespoke jewellery is not selected from ready-to-wear collections. It is conceived specifically for you, based on your story, your ideas, and your vision.
                    </p>
                    <p className={styles.sectionCopy}>
                      A bespoke jewellery piece is one of a kind. It does not exist before your consultation, and it will not be replicated.

                    </p>
                    <h2 className={styles.storyHeading}>
                      Custom And Bespoke: What Is The Difference?
                    </h2>
                    <p className={styles.sectionCopy}>
                      Many customers ask about the difference between custom and bespoke jewelry. While both involve personalization, bespoke jewellery begins with a blank canvas.
                    </p>
                    <p className={styles.sectionCopy}>
                      A custom design may adapt existing designs or collections. The bespoke approach, however, is a full design process tailored to your vision from the first sketch to final polish.
                    </p>
                    <p className={styles.sectionCopy}>
                      With your bespoke creation, every design element is intentional. From the choice of gemstone to the proportion of the jewel, the piece is unique to you.
                    </p>

                    <h2 className={styles.storyHeading}>
                        The Meaning Of A Bespoke Jeweller
                    </h2>
                    <p className={styles.sectionCopy}>
                     A bespoke jeweller is an artisan who guides you through the entire process of creating fine jewellery. This includes consultation, concept development, gemstone selection, and the crafting process.
                    </p>
                    
                    <h2 className={styles.storyHeading}>
                        Jewellery In Singapore – A New Standard Of Craft
                    </h2>
                    <p className={styles.sectionCopy}>
                     Jewellery has evolved significantly. Discerning clients now seek authenticity and individuality.
                    </p>
                    <p className={styles.sectionCopy}>
                     Rather than selecting ready-to-wear pieces, more people are choosing bespoke jewellery services. This shift reflects a desire for deeper meaning in the jewellery they wear.
                    </p>
                      <p className={styles.sectionCopy}>In Singapore, fine jewellery is no longer just about adornment. It is about creating something meaningful for life.</p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/bespoke_Design_2.jpeg"
                      alt="Bespoke Jewelry Singapore image 2"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     From Engagement Ring To Heirloom Pieces
                    </h2>
                    <p className={styles.sectionCopy}>
                     While many clients begin with an engagement ring or proposal ring, bespoke jewellery extends far beyond engagement rings.
                    </p>
                    <p className={styles.sectionCopy}>
                     We create wedding bands, rings, necklaces, bracelets, and statement pieces that mark important moments. Whether it is a jewel to celebrate a milestone or a si dian jin gift, the bespoke process ensures every detail aligns with your story.
                    </p>
                    <p className={styles.sectionCopy}>
                     Each jewellery piece is crafted with intention, reflecting your life and your journey.
                    </p>

                    <h2 className={styles.storyHeading}>
                      The Calla Lily Inspiration
                    </h2>
                    <p className={styles.sectionCopy}>
                      One of our signature inspirations is the calla lily. The calla lily symbolizes purity, elegance, and grace.
                    </p>
                    <p className={styles.sectionCopy}>
                      In our jewellery design, the calla lily appears in sculptural forms and subtle design elements. This motif is woven into selected pieces, echoing natural beauty.
                    </p>
                    <p className={styles.sectionCopy}>
                        The calla lily has become part of our brand identity, reflecting our refined approach to bespoke jewellery in Singapore.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    The Bespoke Design Process
                    </h2>
                    <p className={styles.sectionCopy}>
                     The design process begins with a private consultation. During this experience, we explore your story, expectations, and style preferences.
                    </p>
                    <p className={styles.sectionCopy}>
                    We discuss gemstones, pearls, diamonds, and carat weight considerations. We examine how the jewellery piece will be worn and what it represents in your life.


                    </p>
                    <p className={styles.sectionCopy}>
                     From the initial vision to the final creation, the process is collaborative.
                    </p>
                  </section>

                 

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    From Vision To Life
                    </h2>
                    <p className={styles.sectionCopy}>
                    Your vision guides the design. With the help of our jewellers, your custom ideas are translated into sketches and renderings.
                    </p>
                    <p className={styles.sectionCopy}>
                     We refine proportions, explore gemstone combinations, and select the right gold tone. Each element of the design is considered carefully.
                    </p>
                    <p className={styles.sectionCopy}>Through the crafting process, the piece evolves from concept to tangible jewel, ready to accompany you through life’s moments.</p>
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                       Gemstones And Meaning
                    </h2>
                    <p className={styles.sectionCopy}>
                     Gemstones carry symbolism. From vibrant sapphires to luminous pearls, each gemstone tells a story.
                    </p>
                    <p className={styles.sectionCopy}>
                     The selection of gemstones is deeply personal. Some clients choose birthstones; others seek colours that represent significant memories.
                    </p>
                    <p className={styles.sectionCopy}>
                      In bespoke jewellery, gemstones are not decorative afterthoughts. They are central to the story of the piece.
                    </p>
                  </section>
                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/bespoke_Design_3.jpeg"
                      alt="Bespoke Jewelry Singapore image 3"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                       Fine Jewellery Beyond Trends
                    </h2>
                    <p className={styles.sectionCopy}>
                    Fine jewellery should endure beyond seasons. Bespoke jewellery focuses on longevity and timeless design.</p>
                    <p className={styles.sectionCopy}>
                     Rather than following trends, we design pieces that hold meaning. The right jewellery piece becomes part of your identity.
                    </p>
                    <p className={styles.sectionCopy}>This philosophy defines our collections and bespoke services alike.</p>
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                   The Crafting Process And Master Craftsmen
                    </h2>
                    <p className={styles.sectionCopy}>
                     Our master craftsmen shape each jewellery piece with precision and care. From stone setting to polishing, every step reflects dedication to quality.
                    </p>
                    <p className={styles.sectionCopy}>
                      The crafting process is meticulous. Each jewel is examined to ensure it meets our standards before delivery.
                    </p>
                    <p className={styles.sectionCopy}>
                     This commitment ensures that your bespoke jewellery will last a lifetime.
                    </p>
                  </section>



                   <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                        How Much Does Custom-Made Jewelry Cost?
                    </h2>
                    <p className={styles.sectionCopy}>
                    Cost varies depending on design complexity, gemstone selection, and carat weight. A bespoke jewellery piece can range from a modest to a significant investment.
                    </p>
                    <p className={styles.sectionCopy}>
                      During consultation, we provide transparent guidance. A deposit confirms the order, and the final price reflects materials and craftsmanship.
                    </p>
                    <p className={styles.sectionCopy}>
                     Custom jewellery in Singapore is an investment in something meaningful, not merely a transaction.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                        Jewellery For Significant Moments
                    </h2>
                    <p className={styles.sectionCopy}>
                   Jewellery often marks defining moments in life. An engagement ring symbolizes commitment. Wedding bands represent unity.
                    </p>
                    <p className={styles.sectionCopy}>
                      Beyond rings, bespoke jewellery commemorates anniversaries, milestones, and personal achievements.
                    </p>
                    <p className={styles.sectionCopy}>
                     Each piece carries a story. Each jewel becomes part of your life narrative.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                        Experience The Bespoke Journey
                    </h2>
                    <p className={styles.sectionCopy}>
                    The bespoke journey is intimate and rewarding. From first consultation to final delivery, we offer attentive care.
                    </p>
                    <p className={styles.sectionCopy}>
                      Our customers value discretion, clarity, and craftsmanship. The experience is as meaningful as the final piece.
                    </p>
                    <p className={styles.sectionCopy}>
                     In Singapore and beyond, we are honoured to serve clients who seek authenticity.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Brand Philosophy And Inspiration
                    </h2>
                   
                    <p className={styles.sectionCopy}>
                       Our brand draws inspiration from heritage and modernity. These inspirations inform our jewellery design without overwhelming it. The result is a refined aesthetic grounded in elegance.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     Jewellery Services In Singapore
                    </h2>
                   
                    <p className={styles.sectionCopy}>
                       We offer a full range of bespoke jewellery services. From engagement rings to heirloom redesign, our services are tailored.
                    </p>
                    <p className={styles.sectionCopy}>
                       Jewellery in Singapore deserves precision and creativity. We ensure each piece reflects your expectations.
                    </p>
                    <p className={styles.sectionCopy}>
                      Whether you seek a single jewel or multiple pieces, we guide you through the process with transparency.
                    </p>
                  </section>
                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/bespoke_Design_4.jpeg"
                      alt="Bespoke Jewelry Singapore image 1"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                        Bringing Your Story To Life
                    </h2>
                    <p className={styles.sectionCopy}>
                    Your story is central to the design. We listen carefully to understand your journey, your values, and your vision.
                    </p>
                    <p className={styles.sectionCopy}>
                     Every bespoke jewellery piece begins with a narrative. It may symbolize love, growth, or transformation.
                    </p>
                    <p className={styles.sectionCopy}>
                     Through thoughtful design, we bring your story to life.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      The Right Choice For A Lifetime
                    </h2>
                   
                    <p className={styles.sectionCopy}>
                       Choosing the right jeweller matters. A bespoke jeweller should understand both craft and emotion.
                    </p>
                       <p className={styles.sectionCopy}>
                       We combine artistry with responsibility, ensuring that each jewellery piece meets high standards of quality.
                    </p>
                       <p className={styles.sectionCopy}>
                       For clients in Singapore seeking meaningful fine jewellery, bespoke is the right choice.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     Begin Your Bespoke Jewellery Journey
                    </h2>
                   
                    <p className={styles.sectionCopy}>
                       If you are ready to create something personal, we invite you to book an online consultation.
                    </p>
                    <p className={styles.sectionCopy}>
                        Whether it is an engagement ring, wedding bands, or a commemorative jewel, we are here to guide your journey.
                    </p>
                    <p className={styles.sectionCopy}>
                      Bespoke jewellery is more than design. It is a reflection of your life, your moments, and your story, crafted with care, intention, and timeless elegance.
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
                    Show less
                  </button>
                </div>
              ) : null}

              <section className={styles.productSection}>
                <Container className={styles.productContainer}>
                  <div className={styles.filtersRow}>
                    <div className={styles.filtersBarWrap}>
                      <FiltersBar
                        leftLabel={labels.category}
                        centerLabel={labels.subCategory}
                        rightLabel={labels.sortByPrice}
                        leftValue={categoryFilter}
                        centerValue={subCategoryFilter}
                        rightValue={sortFilter}
                        onLeftChange={handleCategoryChange}
                        onCenterChange={(vals) => setSubCategoryFilter(Array.isArray(vals) ? vals : [])}
                        onRightChange={setSortFilter}
                        leftOptions={categories}
                        centerOptions={subCategories}
                        rightOptions={sortFilterOptions}
                        leftMulti
                        centerMulti
                        centerDisabled={categoryFilter.length === 0}
                      />
                    </div>
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
