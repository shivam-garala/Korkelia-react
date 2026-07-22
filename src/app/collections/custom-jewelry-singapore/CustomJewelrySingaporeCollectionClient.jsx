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
import en from "../../../i18n/en.json";
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
  At Korkeila Helsinki, custom jewelry is about creating jewellery that reflects your story, your values, and the moments that define your life. Jewellery is not merely an adornment. It is an expression of identity, memory, and love.
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
      <SiteHeader availableLanguages={["en"]} fixedLanguage="en" />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Custom Jewelry Singapore </h1>
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
                   In Singapore, discerning clients seek more than ready-made collections. They want a piece that is personal, one of a kind, and crafted with intention. Our approach to jewellery design is rooted in refinement, precision, and a deep respect for craftsmanship.
                  </p>
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/Custom_jew_1.jpeg"
                      alt="custom jewelry Singapore"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     What Custom Jewellery Truly Means
                    </h2>
                 








                    <p className={styles.sectionCopy}>
                       Custom jewellery is a collaborative creation between you and the jeweller. It is not chosen from stock. It is designed from the ground up, shaped around your vision and lifestyle.
                    </p>
                    <p className={styles.sectionCopy}>
                       Each jewellery piece begins with a conversation. We explore your ideas, preferences, and inspirations. Whether you are designing an engagement ring, wedding band, or commemorative piece, the process ensures the final creation feels deeply personal.
                    </p>
                    <p className={styles.sectionCopy}>
                     For our clients in Singapore, custom jewellery is a meaningful alternative to mass-produced jewellery.



                    </p>
                    <h2 className={styles.storyHeading}>
                      Jewellery Design Guided By Your Story
                    </h2>
                    <p className={styles.sectionCopy}>
                   Every jewellery design starts with your story. A memory, milestone, or loved one may inspire the piece. Sometimes it is a subtle detail, initials engraved inside a ring, or a gemstone that holds sentimental meaning.
                    </p>
                    <p className={styles.sectionCopy}>
                      The design process is structured yet flexible. With you to guide us, we refine proportions, choose gemstones, and perfect the setting. The design evolves through careful discussion until everything aligns with your expectations.
                    </p>
                    <p className={styles.sectionCopy}>
                     This is not simply about creating jewellery. It is about translating your vision into something tangible.
                    </p>

                    <h2 className={styles.storyHeading}>
                       Engagement Rings Crafted With Intention
                    </h2>
                    <p className={styles.sectionCopy}>
                   An engagement ring is a symbol of love and commitment. It marks one of life’s most significant moments.
                    </p>
                    <p className={styles.sectionCopy}>
                     We create engagement rings that are tailored entirely to your partner’s style. From classic solitaire designs to modern interpretations with lab-grown diamonds, each engagement ring is crafted with care.
                    </p>
                    <p className={styles.sectionCopy}>
                     For couples in Singapore, engagement rings can be personalized in gold tones, diamond proportions, and fine details. A custom diamond ring becomes more than a ring. It becomes a testament to your love.
                    </p>
                    <h2 className={styles.storyHeading}>
                        Wedding Bands And Wedding Rings
                    </h2>
                    <p className={styles.sectionCopy}>
                    Your engagement ring is often complemented by wedding bands. We design wedding rings and wedding bands that harmonize beautifully with the engagement piece.
                    </p>
                    <p className={styles.sectionCopy}>
                   A wedding band can be minimal and refined or enhanced with diamonds for added brilliance. The setting and structure are carefully considered to ensure comfort for daily wear.
                    </p>
                      <p className={styles.sectionCopy}>For many couples, the wedding band is worn for life. It should feel natural, balanced, and meaningful.</p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    Beyond Rings: Necklaces, Earrings, And Bracelets
                    </h2>
                    <p className={styles.sectionCopy}>
                     Custom jewellery extends beyond rings. We design necklaces, earrings, bracelets, and bangles that celebrate milestones or serve as a special gift.
                    </p>
                    <p className={styles.sectionCopy}>
                     Gemstones play an essential role in these pieces. From vibrant sapphires to timeless diamonds, each gemstone is selected for quality and symbolism.
                    </p>
                    <p className={styles.sectionCopy}>
                     Whether you seek a refined pair of earrings or a statement necklace with a touch of gold, we work with you to create something distinctive.
                    </p>

                    <h2 className={styles.storyHeading}>
                      Personalized Jewellery For Meaningful Gifts
                    </h2>
                    <p className={styles.sectionCopy}>
                      Personalized jewellery is often chosen for gifts that mark significant occasions. A memory can be preserved in a pendant or initials engraved inside a piece.
                    </p>
                    <p className={styles.sectionCopy}>
                      If you are searching for a gift for your loved one, custom jewellery offers something more meaningful than standard options. It is thoughtful, considered, and crafted specifically for the recipient. Personalized jewellery has become a way to celebrate life’s most intimate moments.
                    </p>
                   
                  </section>









                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/Custom_jew_2.jpeg"
                      alt="Singapore"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     The Role Of Gemstones And Diamonds
                    </h2>
                    <p className={styles.sectionCopy}>
                     Gemstones are central to our jewellery design philosophy. Each gemstone carries its own character and symbolism.
                    </p>
                    <p className={styles.sectionCopy}>
                    We source diamonds and lab-grown diamonds for clients who seek responsible luxury. Lab-grown options offer clarity and brilliance while maintaining ethical considerations.
                    </p>
                    <p className={styles.sectionCopy}>
                     The selection of gemstones can be tailored for our clients based on colour, meaning, and budget. From a diamond ring to a gemstone pendant, every piece reflects intention.
                    </p>

                    <h2 className={styles.storyHeading}>
                     Craftsmanship And The Art Of Jewellery
                    </h2>
                    <p className={styles.sectionCopy}>
                      Jewellery is both art and engineering. Our jewellers ensure that every setting is secure, every curve refined, and every finish immaculate.
                    </p>
                    <p className={styles.sectionCopy}>
                     Gold remains one of the most enduring materials in jewellery. Its warmth and versatility make it ideal for engagement rings, wedding bands, and statement pieces.
                    </p>
                    <p className={styles.sectionCopy}>
                       Each piece is examined carefully before delivery, ensuring durability and elegance.

                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                   Inspired By Contemporary Singapore
                    </h2>
                    <p className={styles.sectionCopy}>
                     Singapore is home to talented jewellers such as Carrie K and Carolyn Kan, whose work reflects innovation and individuality. While we maintain our own distinct brand philosophy, we share the commitment to refined design and craftsmanship.
                    </p>
                    <p className={styles.sectionCopy}>
                   Our design style emphasizes minimalism, structure, and timeless appeal. We believe jewellery should transcend trends and remain relevant for generations.


                    </p>
                   
                  </section>

                 

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    The Consultation Experience
                    </h2>
                    <p className={styles.sectionCopy}>
                   The consultation is the foundation of your custom journey. During this meeting, we explore your ideas and expectations.
                    </p>
                    <p className={styles.sectionCopy}>
                    Our clients appreciate discretion and clarity. We provide both. You can discuss budget, timeline, and design direction openly.
                    </p>
                    <p className={styles.sectionCopy}>The consultation allows us to align on the design and ensure the piece is tailored precisely for you.</p>
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                       How The Process Works
                    </h2>
                    <p className={styles.sectionCopy}>
                    The process begins with consultation. We then create sketches and digital renderings of the design.
                    </p>
                    <p className={styles.sectionCopy}>
                     You review and refine every detail. Once approved, the piece enters production. Throughout the process, we maintain communication to ensure transparency.
                    </p>
                    <p className={styles.sectionCopy}>
                      This structured approach ensures that nothing is overlooked.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                       Creating Heirlooms For Life
                    </h2>
                    <p className={styles.sectionCopy}>
                    Custom jewellery often becomes heirlooms passed through generations. A carefully crafted ring or necklace can carry your story forward.
                    </p>
                    <p className={styles.sectionCopy}>
                    These pieces can be redesigned in the future, adapting to new styles while preserving sentiment.
                    </p>
                    <p className={styles.sectionCopy}>
                     Jewellery is not static. It evolves with life.
                    </p>
                  </section>


                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Why Clients Choose Custom Jewellery
                    </h2>
                    <p className={styles.sectionCopy}>
                    Clients choose custom jewellery because they want control over every detail. They want the best materials, the best craftsmanship, and a design that resonates personally.
                    </p>
                    <p className={styles.sectionCopy}>
                     If you desire something unique, a one-of-a-kind piece ensures exclusivity. It cannot be replicated.
                    </p>
                    <p className={styles.sectionCopy}>
                     For our clients in Singapore and beyond, this experience is about more than a purchase. It is about connection.
                    </p>
                  </section>


                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/Custom_jew_3.jpeg"
                      alt="Custom Jewelry Singapore image 2"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                       From Idea To Completion
                    </h2>
                    <p className={styles.sectionCopy}>
                    Everything begins with an idea. It may be simple or elaborate.</p>
                    <p className={styles.sectionCopy}>
                     We work with you to transform that idea into a finished piece. Each stage of the journey reflects collaboration and precision.
                    </p>
                    <p className={styles.sectionCopy}>From initial sketch to final polish, the experience is thoughtful and deliberate.</p>
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                  Jewellery For Every Chapter
                    </h2>
                    <p className={styles.sectionCopy}>
                    Jewellery accompanies us through all stages of life. Engagement, marriage, anniversaries, achievements, each moment deserves recognition.
                    </p>
                    <p className={styles.sectionCopy}>
                    Whether you seek an engagement ring, wedding rings, or commemorative pieces, we offer a refined experience tailored for you.
                    </p>
                    <p className={styles.sectionCopy}>
                     Our collection provides inspiration, but custom creation allows full personalization.
                    </p>
                  </section>



                   <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                       Stay Connected
                    </h2>
                    <p className={styles.sectionCopy}>
                    We invite you to explore our website and subscribe to our newsletter for updates on new designs and ideas.
                    </p>
                    <p className={styles.sectionCopy}>
                    Custom jewellery is not simply about appearance. It is about meaning, intention, and enduring beauty.
                    </p>
                    <p className={styles.sectionCopy}>
                   At Korkeila Helsinki, we create jewellery with you to honour your story, one carefully crafted piece at a time.
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
      <SiteFooter brandDescription={en.footer.homeBrandDescription} fixedLanguage="en" />
    </div>
  );
}
