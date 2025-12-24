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

export default function ProductListingClient() {
  const { language } = useI18n();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id") ?? "1";
  const categoryName = searchParams.get("category_name");
  const languageId = language === "fi" ? "2" : "1";
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState("featured");
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);

  const sortOptions = useMemo(
    () => [
      // { value: "featured", label: "Featured" },
      // { value: "newest", label: "Newest" },
      { value: "price-asc", label: "Low to High" },
      { value: "price-desc", label: "High to Low" },
    ],
    []
  );

  useEffect(() => {
    let active = true;

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
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "";
    if (active) setProductsLoading(true);

    const normalizeImage = (image) => {
      if (!image) return "/productlisting/White_Pers_Palladim_4mm_0001.png";
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
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.product_id ?? null;
            if (!id) return null;
            return {
              id,
              name: item?.product_name ?? item?.name ?? "PRODUCT",
              price: item?.total_price ?? null,
              imageSrc: normalizeImage(item?.image),
              href: `/product/${id}`,
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
          <h1 className={styles.heading}>{categoryName || "RINGS"}</h1>

          <FiltersBar
            leftLabel="Sub Category"
            rightLabel="Sort By Price"
            leftValue={subCategoryFilter}
            rightValue={sortFilter}
            onLeftChange={setSubCategoryFilter}
            onRightChange={setSortFilter}
            leftOptions={subCategoryOptions}
            rightOptions={sortOptions}
            leftMulti
          />

          <div className={styles.gridWrap}>
            <ProductGrid products={displayedProducts} columns={3} />
            {!productsLoading && displayedProducts.length === 0 ? (
              <div className={styles.emptyState}>No products found in this category.</div>
            ) : null}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
