"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axiosClient from "../../../lib/axiosClient.js";
import cardStyles from "../../../components/Product/ProductCard.module.css";
import Carousel from "../../../components/ui/Carousel.jsx";
import { useI18n } from "../../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const readCachedProduct = (productId) => {
  if (typeof window === "undefined") return null;
  if (!productId) return null;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed[String(productId)] ?? null;
  } catch (error) {
    console.error("Related product cache read failed", error);
    return null;
  }
};

const buildDesignCacheKey = (designId) =>
  designId ? `design:${designId}` : "";

const normalizeBaseUrl = (value) => {
  if (!value) return "";
  return String(value).replace(/\/+$/, "");
};

const apiBase = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_BASE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""
);

const normalizeImage = (image) => {
  if (!image) return "/productlisting/no_image.jpg";
  const raw = String(image);
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
  if (!apiBase) return raw;
  return `${apiBase}/${raw.replace(/^\//, "")}`;
};

const resolveListingImage = (item, design) => {
  const direct =
    item?.image_url ??
    item?.imageUrl ??
    item?.image ??
    item?.image_name ??
    item?.imageName ??
    "";
  if (direct) return direct;
  const images = Array.isArray(design?.images) ? design.images : [];
  if (!images.length) return "";
  const primary =
    images.find((image) => image?.is_product_listing === 1) ??
    images[0] ??
    null;
  return (
    primary?.image_url ??
    primary?.image ??
    primary?.image_name ??
    ""
  );
};

const updateCacheWithRelated = (product) => {
  if (typeof window === "undefined") return;
  if (!product?.productId) return;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    const cache = raw ? JSON.parse(raw) : {};
    if (!cache || typeof cache !== "object") return;
    const productKey = String(product.productId);
    const designId = product.designId ? String(product.designId) : "";
    const designKey = buildDesignCacheKey(designId);
    const existingProduct = cache[productKey] ?? {};
    const existingDesign =
      existingProduct.design ??
      existingProduct.design_variant ??
      existingProduct.designVariant ??
      {};
    const incomingDesign = product.design ?? {};
    const incomingImages = Array.isArray(incomingDesign.images)
      ? incomingDesign.images
      : null;
    const nextImages =
      incomingImages ??
      (product.imageSrc ? [{ image_url: product.imageSrc }] : null) ??
      existingDesign.images;
    const nextDesign = {
      ...existingDesign,
      ...incomingDesign,
      id: product.designId || incomingDesign.id || existingDesign.id,
      design_variant_name:
        product.name ??
        incomingDesign.design_variant_name ??
        existingDesign.design_variant_name,
      design_translation:
        incomingDesign.design_translation ??
        existingDesign.design_translation,
      design_translations:
        incomingDesign.design_translations ??
        existingDesign.design_translations,
      translations:
        incomingDesign.translations ??
        existingDesign.translations,
      images: nextImages ?? existingDesign.images,
      image: product.imageSrc || incomingDesign.image || existingDesign.image,
      total_price:
        product.price ??
        incomingDesign.total_price ??
        existingDesign.total_price,
      metal_rate: incomingDesign.metal_rate ?? existingDesign.metal_rate,
      diamond_details:
        incomingDesign.diamond_details ?? existingDesign.diamond_details,
      product: incomingDesign.product ?? existingDesign.product,
    };

    const nextProduct = {
      ...existingProduct,
      total_price:
        product.price ??
        existingProduct.total_price ??
        nextDesign.total_price,
      product_name: product.name ?? existingProduct.product_name,
      image: product.imageSrc ?? existingProduct.image,
      category_id: product.categoryId ?? existingProduct.category_id,
      design: nextDesign,
      design_variant: nextDesign,
      designVariant: nextDesign,
    };
    cache[productKey] = nextProduct;
    if (designKey) {
      cache[designKey] = nextProduct;
    }

    window.sessionStorage.setItem("product_list_cache", JSON.stringify(cache));
    window.dispatchEvent(
      new CustomEvent("productCacheUpdated", { detail: { productId: productKey, designId } })
    );
  } catch (error) {
    console.error("Related product cache update failed", error);
  }
};

const extractRelatedItems = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const directList =
    payload.related_products ??
    payload.relatedProducts ??
    payload.related_product_details ??
    payload.relatedProductDetails ??
    payload.products ??
    payload.data ??
    null;
  if (Array.isArray(directList)) return directList;
  if (Array.isArray(directList?.data)) return directList.data;
  return [];
};

const resolveTranslatedName = (item, design, languageId) => {
  if (!languageId) {
    return (
      item?.design_variant_name ??
      item?.designVariantName ??
      design?.design_translation?.design_variant_name ??
      design?.design_variant_name ??
      item?.product_name ??
      item?.name ??
      "PRODUCT"
    );
  }

  const translations = Array.isArray(design?.design_translations)
    ? design.design_translations
    : Array.isArray(item?.design_translations)
      ? item.design_translations
      : [];
  const matching = translations.find(
    (translation) => String(translation?.language_id ?? "") === String(languageId)
  );
  const translatedName =
    matching?.design_variant_name ??
    matching?.product_name ??
    null;

  return (
    translatedName ??
    design?.design_translation?.design_variant_name ??
    design?.design_variant_name ??
    item?.design_variant_name ??
    item?.designVariantName ??
    item?.product_name ??
    item?.name ??
    "PRODUCT"
  );
};

const mapRelatedProduct = (item, fallbackProductId = "", languageId = "") => {
  const productId = item?.product_id ?? item?.productId ?? item?.id ?? fallbackProductId ?? null;
  const designIdFromItem = item?.design_id ?? item?.designId ?? null;
  if (!productId) return null;
  const design =
    item?.design ??
    item?.design_variant ??
    item?.designVariant ??
    null;
  const resolvedDesignId =
    design?.id ??
    designIdFromItem ??
    item?.design_variant_id ??
    item?.designVariantId ??
    "";
  const categoryId =
    item?.category_id ??
    item?.categoryId ??
    design?.category_id ??
    design?.product?.category_id ??
    "";
  const metalRate = design?.metal_rate ?? null;
  const primaryDetail = Array.isArray(design?.diamond_details)
    ? design.diamond_details[0]
    : null;
  const diamondRate = primaryDetail?.diamond_rate ?? null;
  const query = new URLSearchParams();
  if (resolvedDesignId) query.set("design_id", String(resolvedDesignId));
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
    id: resolvedDesignId ? `${productId}-${resolvedDesignId}` : String(productId),
    productId,
    designId: resolvedDesignId ? String(resolvedDesignId) : "",
    categoryId: categoryId ? String(categoryId) : "",
    design,
    name: resolveTranslatedName(item, design, languageId),
    price:
      item?.price ??
      item?.total_price ??
      design?.total_price ??
      item?.totalPrice ??
      null,
    imageSrc: normalizeImage(resolveListingImage(item, design)),
    href: query.toString()
      ? `/product/${productId}?${query.toString()}`
      : `/product/${productId}`,
  };
};

export default function RelatedProducts({ productId, designId, columns = 3 }) {
  const { language, currencyCode, currencySymbol } = useI18n();
  const [currentProduct, setCurrentProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const languageId = useMemo(() => (language === "fi" ? "2" : "1"), [language]);

  useEffect(() => {
    let active = true;
    if (!productId) {
      setCurrentProduct(null);
      return () => {
        active = false;
      };
    }

    const updateCachedProduct = () => {
      if (!active) return;
      setCurrentProduct(readCachedProduct(productId));
    };

    updateCachedProduct();

    const handleCacheUpdate = (event) => {
      const updatedId = event?.detail?.productId ?? "";
      if (!updatedId || String(updatedId) === String(productId)) {
        updateCachedProduct();
      }
    };

    window.addEventListener("productCacheUpdated", handleCacheUpdate);
    return () => {
      active = false;
      window.removeEventListener("productCacheUpdated", handleCacheUpdate);
    };
  }, [productId]);

  const currentDesignId = useMemo(() => {
    if (designId) return String(designId);
    const design =
      currentProduct?.design ??
      currentProduct?.design_variant ??
      currentProduct?.designVariant ??
      null;
    return (
      design?.id ??
      currentProduct?.design_id ??
      currentProduct?.designId ??
      ""
    );
  }, [designId, currentProduct]);

  const currentCategoryId = useMemo(() => {
    const design =
      currentProduct?.design ??
      currentProduct?.design_variant ??
      currentProduct?.designVariant ??
      null;
    return (
      currentProduct?.category_id ??
      currentProduct?.categoryId ??
      design?.category_id ??
      design?.product?.category_id ??
      ""
    );
  }, [currentProduct]);

  useEffect(() => {
    let active = true;
    if (!productId || !languageId || !currentCategoryId) {
      setProducts([]);
      return () => {
        active = false;
      };
    }

    const loadRelated = async () => {
      try {
        const params = new URLSearchParams();
        params.set("product_id", String(productId));
        if (currentCategoryId) params.set("category_id", String(currentCategoryId));
        if (currentDesignId) params.set("design_id", String(currentDesignId));
        if (languageId) params.set("language_id", String(languageId));
        if (currencyCode) params.set("currency", String(currencyCode));
        if (currencySymbol) params.set("currency_symbol", String(currencySymbol));
        const { data } = await axiosClient.get(
          `/api/design/related-product-details-ecom?${params.toString()}`
        );
        const payload = data?.data ?? data;
        const list = extractRelatedItems(payload)
          .map((item) => mapRelatedProduct(item, productId, languageId))
          .filter(Boolean);
        if (active) setProducts(list);
      } catch (error) {
        if (active) setProducts([]);
        console.error("Related products load failed", error);
      }
    };

    loadRelated();
    return () => {
      active = false;
    };
  }, [
    productId,
    currentCategoryId,
    currentDesignId,
    languageId,
    currencyCode,
    currencySymbol,
  ]);

  const getProductKey = (product) =>
    product.id ?? product.href ?? product.productId ?? product.name;

  const renderCard = (product) => {
    const resolvedSrc = product.imageSrc || "/productlisting/no_image.jpg";
    const content = (
      <>
        <div className={cardStyles.media} aria-hidden>
          <img className={cardStyles.image} src={resolvedSrc} alt={product.name ?? ""} />
        </div>
        <div className={cardStyles.rule} aria-hidden />
        <div className={cardStyles.meta}>
          <div className={cardStyles.name}>{product.name}</div>
          <div className={cardStyles.price}>{product.price ?? ""}</div>
        </div>
      </>
    );

    return product.href ? (
      <Link
        className={cardStyles.card}
        href={product.href}
        onClick={() => updateCacheWithRelated(product)}
      >
        {content}
      </Link>
    ) : (
      <div
        className={cardStyles.card}
        onClick={() => updateCacheWithRelated(product)}
      >
        {content}
      </div>
    );
  };

  if (!products.length) return null;

  return (
    <div className={styles.related}>
      <h2 className={styles.relatedTitle}>RELATED PRODUCTS</h2>
      <div className={styles.relatedGrid}>
        <Carousel
          items={products}
          columns={columns}
          renderItem={(product) => renderCard(product)}
          getKey={(product) => getProductKey(product)}
          ariaLabel="Related products"
        />
      </div>
    </div>
  );
}
