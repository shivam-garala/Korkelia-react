"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import FiltersBar from "../../components/Product/FiltersBar.jsx";
import ProductGrid from "../../components/Product/ProductGrid.jsx";
import axiosClient from "../../lib/axiosClient.js";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const cacheProductList = (items) => {
  if (typeof window === "undefined") return;
  try {
    const existing = window.sessionStorage.getItem("product_list_cache");
    const parsed = existing ? JSON.parse(existing) : {};
    const cache = parsed && typeof parsed === "object" ? parsed : {};
    items.forEach((item) => {
      const id = item?.id ?? item?.product_id ?? null;
      if (!id) return;
      cache[String(id)] = item;
    });
    window.sessionStorage.setItem("product_list_cache", JSON.stringify(cache));
  } catch (error) {
    console.error("Product cache write failed", error);
  }
};

export default function ProductListingClient() {
  const { language } = useI18n();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category_id");
  const categoryNameFromParams = searchParams.get("category_name");
  const languageId = language === "fi" ? "2" : "1";
  const [categoryId, setCategoryId] = useState(categoryIdParam ?? "");
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState(categoryNameFromParams || "RINGS");
  const [sortFilter, setSortFilter] = useState("featured");
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);

  const labels = useMemo(
    () =>
      language === "fi"
        ? {
            subCategory: "Alakategoria",
            sortByPrice: "Lajittele hinnan mukaan",
            lowToHigh: "Halvin ensin",
            highToLow: "Kallein ensin",
            noProducts: "Tässä kategoriassa ei löytynyt tuotteita.",
          }
        : {
            subCategory: "Sub Category",
            sortByPrice: "Sort By Price",
            lowToHigh: "Low to High",
            highToLow: "High to Low",
            noProducts: "No products found in this category.",
          },
    [language]
  );

  const sortOptions = useMemo(
    () => [
      // { value: "featured", label: "Featured" },
      // { value: "newest", label: "Newest" },
      { value: "price-asc", label: labels.lowToHigh },
      { value: "price-desc", label: labels.highToLow },
    ],
    [labels]
  );

  useEffect(() => {
    let active = true;

    const resolveCategoryId = async () => {
      if (categoryIdParam) {
        if (active) setCategoryId(categoryIdParam);
        return;
      }
      if (!categoryNameFromParams) {
        if (active) setCategoryId("1");
        return;
      }
      try {
        const { data } = await axiosClient.get(
          `/api/categoryMaster/home-page?language_id=${encodeURIComponent(languageId)}`
        );
        const list = Array.isArray(data) ? data : data?.data ?? [];
        const normalizedName = String(categoryNameFromParams).trim().toLowerCase();
        const match = list.find((item) => {
          const label = item?.category_name ?? item?.name ?? "";
          return String(label).trim().toLowerCase() === normalizedName;
        });
        const resolvedId = match?.id ?? match?.category_id ?? null;
        if (active) setCategoryId(resolvedId ? String(resolvedId) : "1");
      } catch (error) {
        if (active) setCategoryId("1");
        console.error("Category resolve failed", error);
      }
    };

    resolveCategoryId();
    return () => {
      active = false;
    };
  }, [categoryIdParam, categoryNameFromParams, languageId]);

  useEffect(() => {
    let active = true;
    if (!categoryId) return () => {
      active = false;
    };

    const loadSubCategories = async () => {
      try {
        const { data } = await axiosClient.get(
          `/api/subCategory/home-page?language_id=${encodeURIComponent(
            languageId
          )}&category_id=${encodeURIComponent(categoryId)}`
        );
        const list = Array.isArray(data) ? data : data?.data ?? [];
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.sub_category_id ?? null;
            const label = item?.sub_category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { value: String(id), label: String(label) };
          })
          .filter(Boolean);

        if (active) setSubCategories(mapped);
      } catch (error) {
        if (active) setSubCategories([]);
        console.error("Subcategory load failed", error);
      }
    };

    loadSubCategories();
    return () => {
      active = false;
    };
  }, [categoryId, languageId]);

  const subCategoryOptions = useMemo(() => subCategories, [subCategories]);

  useEffect(() => {
    let active = true;
    if (!categoryId) return () => {
      active = false;
    };
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "";
    if (active) setProductsLoading(true);

    const normalizeImage = (image) => {
      if (!image) return "/productlisting/no_image.jpg";
      if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
      if (!apiBase) return image;
      return `${apiBase.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
    };

    const loadProducts = async () => {
      try {
        const { data } = await axiosClient.get(
          `/api/product/listEcom?language_id=${encodeURIComponent(
            languageId
          )}&category_id=${encodeURIComponent(categoryId)}`
        );
        const list = Array.isArray(data) ? data : data?.data ?? [];
        cacheProductList(list);
        
        // Extract category name directly from first product's design.product.category.category_name
        if (active && list.length > 0) {
          const categoryNameFromApi = list[0]?.design?.product?.category?.category_name;
          if (categoryNameFromApi) {
            setCategoryName(categoryNameFromApi);
          } else if (categoryNameFromParams) {
            setCategoryName(categoryNameFromParams);
          } else {
            setCategoryName("RINGS");
          }
        } else if (active && list.length === 0) {
          // If no products, fallback to params or default
          setCategoryName(categoryNameFromParams || "RINGS");
        }
        
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.product_id ?? null;
            if (!id) return null;
            const design =
              item?.design ??
              item?.design_variant ??
              item?.designVariant ??
              null;
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
            return {
              id,
              name: item?.product_name ?? item?.name ?? "PRODUCT",
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
  }, [categoryId, languageId]);

  const displayedProducts = useMemo(() => {
    let list = products;
    if (subCategoryFilter.length) {
      const selected = new Set(subCategoryFilter.map((value) => String(value)));
      list = list.filter((item) => selected.has(String(item.subCategoryId)));
    }

    if (sortFilter === "price-asc" || sortFilter === "price-desc") {
      const parsePrice = (value) => {
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
  }, [products, sortFilter, subCategoryFilter]);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <h1 className={styles.heading}>{categoryName}</h1>

          <FiltersBar
            leftLabel={labels.subCategory}
            rightLabel={labels.sortByPrice}
            leftValue={subCategoryFilter}
            rightValue={sortFilter}
            onLeftChange={setSubCategoryFilter}
            onRightChange={setSortFilter}
            leftOptions={subCategoryOptions}
            rightOptions={sortOptions}
            leftMulti
          />

          <div className={styles.gridWrap}>
            <ProductGrid products={displayedProducts} columns={3} loading={productsLoading} />
            {!productsLoading && displayedProducts.length === 0 ? (
              <div className={styles.emptyState}>{labels.noProducts}</div>
            ) : null}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
