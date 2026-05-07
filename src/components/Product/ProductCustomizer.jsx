"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosClient from "../../lib/axiosClient.js";
import { fetchProductListEcom } from "../../lib/productListingCache.js";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./ProductCustomizer.module.css";

const cutImageByCode = {
  RD: "/diamondcuts/round_cut.png",
  PR: "/diamondcuts/princess.png",
  EM: "/diamondcuts/emreld.png",
  OL: "/diamondcuts/oval.png",
  MQ: "/diamondcuts/marqus.png",
  PE: "/diamondcuts/pear_cut.png",
  CU: "/diamondcuts/cusion.png",
  RA: "/diamondcuts/radiant.png",
};
const cutImageByName = {
  ROUND: "/diamondcuts/round_cut.png",
  PRINCESS: "/diamondcuts/princess.png",
  EMERALD: "/diamondcuts/emreld.png",
  OVAL: "/diamondcuts/oval.png",
  MARQUISE: "/diamondcuts/marqus.png",
  PEAR: "/diamondcuts/pear_cut.png",
  CUSHION: "/diamondcuts/cusion.png",
  RADIANT: "/diamondcuts/radiant.png",
};
const metalColorByCode = {
  YG: "#eab308",
  RG: "#fca5a5",
  WG: "#f4f4f5",
  PT: "#d4d4d8",
};

const normalizeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

/** Unwrap common API envelopes so design fields (e.g. total_price) sit on one object. */
const unwrapVariantPayload = (raw) => {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  if (typeof raw !== "object") return raw;
  const inner =
    raw?.data?.data ??
    raw?.data?.design ??
    (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
      ? raw.data
      : null) ??
    raw?.result ??
    raw?.payload;
  return inner && typeof inner === "object" ? inner : raw;
};

/** Prefer formatted total_price string, then numeric price, from design or product. */
const pickTotalPrice = (source) => {
  if (!source || typeof source !== "object") return "";
  const candidates = [
    source.total_price,
    source.totalPrice,
    source.price,
    source.design?.total_price,
    source.design?.totalPrice,
  ];
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    if (typeof c === "number" && Number.isFinite(c)) {
      return String(c);
    }
    const s = normalizeString(c);
    if (s) return s;
  }
  return "";
};

const normalizeLanguageToken = (value) => normalizeString(value).toLowerCase();

const resolveLanguageToken = (entry) => {
  const candidates = [
    entry?.language_id,
    entry?.languageId,
    entry?.lang_id,
    entry?.langId,
    entry?.language?.id,
    entry?.language?.language_id,
    entry?.language?.languageId,
    entry?.language?.lang_id,
    entry?.language?.langId,
    entry?.language_code,
    entry?.languageCode,
    entry?.lang_code,
    entry?.langCode,
    entry?.language?.language_code,
    entry?.language?.languageCode,
    entry?.language?.lang_code,
    entry?.language?.langCode,
    entry?.language?.code,
    entry?.language?.short_code,
    entry?.language?.shortCode,
    entry?.language?.short_name,
    entry?.language?.shortName,
    entry?.language?.name,
    entry?.language?.label,
    entry?.language_name,
    entry?.languageName,
  ];
  for (const candidate of candidates) {
    const normalized = normalizeLanguageToken(candidate);
    if (normalized) return normalized;
  }
  return "";
};

const buildLanguageAliases = (languageId) => {
  const normalized = normalizeLanguageToken(languageId);
  if (!normalized) return [];
  if (normalized === "1" || normalized === "en" || normalized === "english") {
    return ["1", "en", "english"];
  }
  if (normalized === "2" || normalized === "fi" || normalized === "finnish") {
    return ["2", "fi", "finnish"];
  }
  return [normalized];
};

const resolveDesignTranslation = (translation, languageId) => {
  if (!translation) return "";
  if (typeof translation === "string") return normalizeString(translation);
  if (Array.isArray(translation)) {
    const languageAliases = buildLanguageAliases(languageId);
    const match = translation.find((entry) => {
      const entryLangId = resolveLanguageToken(entry);
      return entryLangId && languageAliases.includes(entryLangId);
    });
    const candidate =
      match?.description ??
      match?.design_description ??
      match?.designDescription ??
      match?.design_variant_name ??
      match?.product_name ??
      match?.productName ??
      match?.name ??
      match?.label ??
      "";
    return normalizeString(candidate);
  }
  if (typeof translation === "object") {
    const candidate =
      translation?.description ??
      translation?.design_description ??
      translation?.designDescription ??
      translation?.design_variant_name ??
      translation?.product_name ??
      translation?.productName ??
      translation?.name ??
      translation?.label ??
      "";
    return normalizeString(candidate);
  }
  return "";
};

const resolveTranslationName = (translation, languageId) => {
  if (!translation) return "";
  if (typeof translation === "string") return normalizeString(translation);
  if (Array.isArray(translation)) {
    const languageAliases = buildLanguageAliases(languageId);
    const match = translation.find((entry) => {
      const entryLangId = resolveLanguageToken(entry);
      return entryLangId && languageAliases.includes(entryLangId);
    });
    const candidate =
      match?.design_variant_name ??
      match?.product_name ??
      match?.productName ??
      match?.name ??
      match?.label ??
      "";
    return normalizeString(candidate);
  }
  if (typeof translation === "object") {
    const candidate =
      translation?.design_variant_name ??
      translation?.product_name ??
      translation?.productName ??
      translation?.name ??
      translation?.label ??
      "";
    return normalizeString(candidate);
  }
  return "";
};

const resolveTranslationDescription = (translation, languageId) => {
  if (!translation) return "";
  if (typeof translation === "string") return normalizeString(translation);
  if (Array.isArray(translation)) {
    const languageAliases = buildLanguageAliases(languageId);
    const match = translation.find((entry) => {
      const entryLangId = resolveLanguageToken(entry);
      return entryLangId && languageAliases.includes(entryLangId);
    });
    const candidate =
      match?.description ??
      match?.design_description ??
      match?.designDescription ??
      "";
    return normalizeString(candidate);
  }
  if (typeof translation === "object") {
    const candidate =
      translation?.description ??
      translation?.design_description ??
      translation?.designDescription ??
      "";
    return normalizeString(candidate);
  }
  return "";
};

const resolveListingDefaults = (details) => {
  const design =
    details?.design ??
    details?.design_variant ??
    details?.designVariant ??
    null;
  const metalRate = design?.metal_rate ?? null;
  const diamondDetail = Array.isArray(design?.diamond_details)
    ? design.diamond_details[0]
    : null;
  const diamondRate = diamondDetail?.diamond_rate ?? null;
  return {
    cut: normalizeString(
      diamondDetail?.cut_master_id ?? diamondDetail?.cut_master?.id ?? "",
    ),
    quality: normalizeString(diamondRate?.diamond_type_id ?? ""),
    clarity: normalizeString(diamondRate?.clarity_id ?? ""),
    carat: normalizeString(
      diamondRate?.diamond_master?.carat ??
        diamondRate?.diamond_master_id?.carat ??
        "",
    ),
    metal: normalizeString(metalRate?.metal_id ?? metalRate?.metal?.id ?? ""),
    karat: normalizeString(metalRate?.karat_id ?? metalRate?.karat?.id ?? ""),
  };
};

const resolveCategoryId = (details) => {
  if (!details) return "";
  const design =
    details?.design ??
    details?.design_variant ??
    details?.designVariant ??
    null;
  return normalizeString(
    details?.category_id ??
      details?.categoryId ??
      design?.category_id ??
      design?.categoryId ??
      design?.product?.category_id ??
      design?.product?.categoryId ??
      "",
  );
};

const buildDesignCacheKey = (designId) =>
  designId ? `design:${designId}` : "";

const buildLastPriceKey = (productId, designId = "", currencyCode = "") => {
  if (!productId) return "";
  return `product_detail_last_price:${String(productId)}:${String(
    designId || "",
  )}:${String(currencyCode || "")}`;
};

const readLastDisplayPrice = (productId, designId = "", currencyCode = "") => {
  if (typeof window === "undefined") return "";
  const key = buildLastPriceKey(productId, designId, currencyCode);
  if (!key) return "";
  try {
    return window.sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const writeLastDisplayPrice = (
  productId,
  designId = "",
  currencyCode = "",
  price = "",
) => {
  if (typeof window === "undefined") return;
  const key = buildLastPriceKey(productId, designId, currencyCode);
  if (!key || !price) return;
  try {
    window.sessionStorage.setItem(key, String(price));
  } catch {
    /* ignore */
  }
};

const isPriceForCurrency = (price, currencySymbol) => {
  const value = normalizeString(price);
  const symbol = normalizeString(currencySymbol);
  if (!value) return false;
  if (!symbol) return true;
  if (value.includes(symbol)) return true;

  // Formatted ecommerce prices should carry the selected currency symbol.
  // If they carry another marker, keep them out of the current currency cache.
  return ![
    "€",
    "₹",
    "$",
    "£",
    "¥",
    "د.إ",
    "AED",
    "INR",
    "EUR",
    "USD",
    "GBP",
  ].some((candidate) => value.includes(candidate));
};

const hasIdValue = (value) =>
  value !== null && value !== undefined && value !== "";

const getDesignIdCandidates = (entry) => {
  if (!entry) return [];
  const candidates = [
    entry?.design?.id,
    entry?.design_variant?.id,
    entry?.designVariant?.id,
    entry?.design?.design_id,
    entry?.design?.designId,
    entry?.design_id,
    entry?.designId,
    entry?.design_variant_id,
    entry?.designVariantId,
  ];
  if (candidates.some((value) => hasIdValue(value))) return candidates;
  return [entry?.id];
};

const hasDesignId = (entry) => getDesignIdCandidates(entry).some(hasIdValue);

const matchesProductId = (entry, expectedId) => {
  if (!entry || expectedId === null || expectedId === undefined) return false;
  const expected = String(expectedId);
  const candidates = [
    entry?.id,
    entry?.product_id,
    entry?.productId,
    entry?.product?.id,
    entry?.product?.product_id,
    entry?.design?.product_id,
    entry?.design?.product?.id,
    entry?.design?.product?.product_id,
    entry?.design_variant?.product_id,
    entry?.designVariant?.product_id,
  ];
  return candidates.some(
    (value) =>
      value !== null && value !== undefined && String(value) === expected,
  );
};

const matchesDesignId = (entry, expectedId) => {
  if (!entry || expectedId === null || expectedId === undefined) return false;
  const expected = String(expectedId);
  const candidates = getDesignIdCandidates(entry);
  return candidates.some(
    (value) =>
      value !== null && value !== undefined && String(value) === expected,
  );
};

const readCachedProduct = (productId, designId = "") => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const designKey = buildDesignCacheKey(designId);
    if (designKey && parsed[designKey]) {
      const byDesign = parsed[designKey];
      if (!productId || matchesProductId(byDesign, productId)) {
        return byDesign;
      }
    }
    if (productId) {
      const byProduct = parsed[String(productId)] ?? null;
      if (byProduct) {
        if (!designId) return byProduct;
        if (matchesDesignId(byProduct, designId)) return byProduct;
        if (!hasDesignId(byProduct)) return byProduct;
      }
    }
    if (productId || designId) {
      const entries = Object.values(parsed).filter(
        (entry) => entry && typeof entry === "object",
      );
      const strictMatch = entries.find(
        (entry) =>
          (!productId || matchesProductId(entry, productId)) &&
          (!designId || matchesDesignId(entry, designId)),
      );
      if (strictMatch) return strictMatch;
      if (designId) {
        const designMatch = entries.find((entry) =>
          matchesDesignId(entry, designId),
        );
        if (designMatch) return designMatch;
      }
      if (productId) {
        const productMatch = entries.find((entry) =>
          matchesProductId(entry, productId),
        );
        if (productMatch) return productMatch;
      }
    }
    return null;
  } catch (error) {
    console.error("Product cache read failed", error);
    return null;
  }
};

const updateCacheWithVariant = (productId, variantDetails, options = {}) => {
  if (typeof window === "undefined" || !productId || !variantDetails) {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    const cache = raw ? JSON.parse(raw) : {};
    if (typeof cache !== "object") return;

    const productKey = String(productId);
    const existingProduct = cache[productKey] || {};
    const existingDesign =
      existingProduct.design ??
      existingProduct.design_variant ??
      existingProduct.designVariant ??
      {};
    const designId =
      variantDetails?.id ??
      existingDesign?.id ??
      variantDetails?.design_id ??
      variantDetails?.designId ??
      variantDetails?.design_variant_id ??
      variantDetails?.designVariantId ??
      "";
    const designKey = buildDesignCacheKey(designId);

    const incomingImages = Array.isArray(variantDetails?.images)
      ? variantDetails.images
      : null;
    const nextDesign = {
      ...existingDesign,
      ...variantDetails,
      design_translation:
        variantDetails?.design_translation ??
        existingDesign?.design_translation,
      design_translations:
        variantDetails?.design_translations ??
        existingDesign?.design_translations,
      translations:
        variantDetails?.translations ?? existingDesign?.translations,
      design_variant_name:
        variantDetails?.design_variant_name ??
        existingDesign?.design_variant_name,
      description: variantDetails?.description ?? existingDesign?.description,
      product: variantDetails?.product ?? existingDesign?.product,
      images: incomingImages ?? existingDesign?.images,
      image: variantDetails?.image ?? existingDesign?.image,
      total_price:
        variantDetails?.total_price ??
        variantDetails?.totalPrice ??
        existingDesign?.total_price,
      price: variantDetails?.price ?? existingDesign?.price,
    };
    const nextProduct = {
      ...existingProduct,
      image: variantDetails?.image ?? existingProduct?.image,
      total_price:
        variantDetails?.total_price ??
        variantDetails?.totalPrice ??
        existingProduct?.total_price ??
        nextDesign.total_price,
      price:
        variantDetails?.price ?? existingProduct?.price ?? nextDesign.price,
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
      new CustomEvent("productCacheUpdated", {
        detail: {
          productId: productKey,
          designId,
          userInitiated: options?.userInitiated === true,
          forceDesign: options?.forceDesign === true,
        },
      }),
    );
    return nextProduct;
  } catch (error) {
    console.error("Product cache update failed", error);
    return null;
  }
};

const updateCacheWithListing = (productId, listingItem, options = {}) => {
  if (typeof window === "undefined" || !productId || !listingItem) return null;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    const cache = raw ? JSON.parse(raw) : {};
    if (typeof cache !== "object") return null;

    const preserveExplicitImages = Boolean(options?.preserveExplicitImages);

    const productKey = String(productId);
    const existingProduct = cache[productKey] ?? {};
    const existingProductDesign =
      existingProduct.design ??
      existingProduct.design_variant ??
      existingProduct.designVariant ??
      {};
    const incomingDesign =
      listingItem?.design ??
      listingItem?.design_variant ??
      listingItem?.designVariant ??
      {};
    const designId =
      incomingDesign?.id ??
      listingItem?.design_id ??
      listingItem?.designId ??
      listingItem?.design_variant_id ??
      listingItem?.designVariantId ??
      "";
    const designKey = buildDesignCacheKey(designId);
    const existingDesignFromKey = designKey
      ? (cache[designKey]?.design ??
        cache[designKey]?.design_variant ??
        cache[designKey]?.designVariant ??
        null)
      : null;
    const existingDesign = existingDesignFromKey ?? existingProductDesign;
    const existingImages = existingDesign?.images;
    const hasExplicitImages = Array.isArray(existingImages);
    const canPreserveImages =
      preserveExplicitImages &&
      hasExplicitImages &&
      (!designId || matchesDesignId(existingDesign, designId));
    const nextImages = canPreserveImages
      ? existingImages
      : (incomingDesign?.images ?? existingDesign?.images);
    const nextDesign = {
      ...existingDesign,
      ...incomingDesign,
      design_translation:
        incomingDesign?.design_translation ??
        existingDesign?.design_translation,
      design_translations:
        incomingDesign?.design_translations ??
        existingDesign?.design_translations,
      translations:
        incomingDesign?.translations ?? existingDesign?.translations,
      design_variant_name:
        incomingDesign?.design_variant_name ??
        existingDesign?.design_variant_name,
      description: incomingDesign?.description ?? existingDesign?.description,
      product: incomingDesign?.product ?? existingDesign?.product,
      images: nextImages,
      image: incomingDesign?.image ?? existingDesign?.image,
    };
    const nextProduct = {
      ...existingProduct,
      ...listingItem,
      product_name: listingItem?.product_name ?? existingProduct?.product_name,
      description: listingItem?.description ?? existingProduct?.description,
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
      new CustomEvent("productCacheUpdated", {
        detail: { productId: productKey, designId },
      }),
    );
    return nextProduct;
  } catch (error) {
    console.error("Product cache update failed", error);
    return null;
  }
};

export default function ProductCustomizer({
  title = "...",
  productId = "",
  designId = "",
  defaultMetalId = "",
  defaultKaratId = "",
  defaultDiamondTypeId = "",
  defaultClarityId = "",
  defaultCarat = "",
  defaultCutId = "",
}) {
  const router = useRouter();
  const { language, currency, currencyCode, currencySymbol } = useI18n();
  const qualityId = useId();
  const clarityId = useId();
  const sizeId = useId();
  const [filterData, setFilterData] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [variantDetails, setVariantDetails] = useState(null);
  const [lastDisplayPrice, setLastDisplayPrice] = useState("");
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantEnabled, setVariantEnabled] = useState(false);
  const [variantAdjustedFilters, setVariantAdjustedFilters] = useState(null);
  const [variantDesignAvailable, setVariantDesignAvailable] = useState(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [cut, setCut] = useState(() => normalizeString(defaultCutId));
  const [quality, setQuality] = useState(() =>
    normalizeString(defaultDiamondTypeId),
  );
  const [clarity, setClarity] = useState(() =>
    normalizeString(defaultClarityId),
  );
  const [carat, setCarat] = useState(() => normalizeString(defaultCarat));
  const [metal, setMetal] = useState(() => normalizeString(defaultMetalId));
  const [metalType, setMetalType] = useState(() =>
    normalizeString(defaultKaratId),
  );
  const [size, setSize] = useState("");
  const [engraving, setEngraving] = useState("");
  const lastFilterQueryRef = useRef("");
  const lastVariantQueryRef = useRef("");
  const skipNextVariantFetchRef = useRef(false);
  const lastListingRefreshRef = useRef("");
  const userVariantInteractionRef = useRef(false);

  // ─── FIX: track previous currency so we can detect actual changes ───
  const prevCurrencyCodeRef = useRef(currencyCode);
  const prevLanguageRef = useRef(language);

  const labels =
    language === "fi"
      ? {
          customizedForYou: "Räätälöity sinulle",
          selectDiamondCut: "Valitse timantin hionta",
          diamondQuality: "Timanttityyppi",
          diamondCaratWeight: "timantin koko",
          centerPrefix: "keskitimantinkoko",
          selectMetalColor: "Valitse metallin väri",
          metalType: "Metallin tyyppi",
          ringSize: "Sormuksen halkaisija (mm)",
          price: "Hinta",
          engraving: "Kaiverrus (valinnainen)",
          engravingPlaceholder: "Ole hyvä ja rajoita sanamäärä 10 merkkiin",
          submit: "Lähetä",
          enquireNow: "kysy lisää",
        }
      : {
          customizedForYou: "CUSTOMIZED FOR YOU",
          selectDiamondCut: "SELECT DIAMOND CUT",
          diamondQuality: "DIAMOND TYPE",
          diamondCaratWeight: "DIAMOND CARAT",
          centerPrefix: "CENTER DIAMOND CARAT",
          selectMetalColor: "SELECT METAL COLOR",
          metalType: "METAL TYPE",
          ringSize: "RING SIZE DIAMETER (mm)",
          price: "PRICE",
          engraving: "ENGRAVING (Optional)",
          engravingPlaceholder: "Please limit word count to 10 characters",
          submit: "SUBMIT",
          enquireNow: "ENQUIRE NOW",
        };

  const languageId = language === "fi" ? "2" : "1";

  // ─── FIX: Clear stale price + force re-fetch when currency OR language changes ───
  useEffect(() => {
    const currencyChanged = prevCurrencyCodeRef.current !== currencyCode;
    const languageChanged = prevLanguageRef.current !== language;

    if (currencyChanged || languageChanged) {
      prevCurrencyCodeRef.current = currencyCode;
      prevLanguageRef.current = language;

      // Immediately wipe displayed price so the old-currency/old-language
      // value never shows as a fallback while new data loads.
      setLastDisplayPrice("");
      setVariantDetails(null);
      setVariantAdjustedFilters(null);
      setVariantDesignAvailable(null);

      // Reset deduplication refs so variant + listing fetches fire again.
      lastVariantQueryRef.current = "";
      lastListingRefreshRef.current = "";

      // Restore from cache only if the cached price matches the NEW currency.
      const cached = readLastDisplayPrice(productId, designId, currencyCode);
      if (cached && isPriceForCurrency(cached, currencySymbol)) {
        setLastDisplayPrice(cached);
      }
    }
  }, [currencyCode, currencySymbol, language, productId, designId]);

  useEffect(() => {
    let active = true;
    setDefaultsApplied(false);
    if (!productId) {
      setProductDetails(null);
      return () => {
        active = false;
      };
    }

    const updateCachedProduct = () => {
      if (!active) return;
      setProductDetails(readCachedProduct(productId, designId));
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
  }, [designId, productId]);

  const listingCategoryId = useMemo(
    () => resolveCategoryId(productDetails),
    [productDetails],
  );

  useEffect(() => {
    let active = true;
    if (!productId || !languageId || !listingCategoryId) {
      return () => {
        active = false;
      };
    }
    const refreshKey = `${languageId}:${productId}:${listingCategoryId}:${currency}`;
    if (lastListingRefreshRef.current === refreshKey) {
      return () => {
        active = false;
      };
    }
    lastListingRefreshRef.current = refreshKey;

    const refreshListingDetails = async () => {
      try {
        const list = await fetchProductListEcom(
          languageId,
          listingCategoryId,
          currencyCode,
          currencySymbol,
        );
        if (!active || !Array.isArray(list)) return;
        const matchById = (item) => {
          const id = item?.id ?? item?.product_id ?? item?.productId ?? null;
          return String(id) === String(productId);
        };
        const matchByDesign = (item) => {
          const itemDesignId =
            item?.design?.id ??
            item?.design_id ??
            item?.designId ??
            item?.design_variant_id ??
            item?.designVariantId ??
            null;
          return String(itemDesignId) === String(designId);
        };
        const match = designId
          ? (list.find((item) => matchById(item) && matchByDesign(item)) ??
            list.find((item) => matchById(item)))
          : list.find((item) => matchById(item));
        if (match) {
          if (variantEnabled && userVariantInteractionRef.current) return;
          const updated = updateCacheWithListing(productId, match, {
            preserveExplicitImages: variantEnabled,
          });
          if (updated && active) {
            setProductDetails(updated);
          }
        }
      } catch (error) {
        if (!active) return;
        console.error("Product list refresh failed", error);
      }
    };

    refreshListingDetails();
    return () => {
      active = false;
    };
  }, [
    productId,
    languageId,
    listingCategoryId,
    variantEnabled,
    designId,
    currency,
    currencyCode,
    currencySymbol,
  ]);

  useEffect(() => {
    const nextCut = normalizeString(defaultCutId);
    const nextQuality = normalizeString(defaultDiamondTypeId);
    const nextClarity = normalizeString(defaultClarityId);
    const nextCarat = normalizeString(defaultCarat);
    const nextMetal = normalizeString(defaultMetalId);
    const nextKarat = normalizeString(defaultKaratId);

    setCut(nextCut);
    setQuality(nextQuality);
    setClarity(nextClarity);
    setCarat(nextCarat);
    setMetal(nextMetal);
    setMetalType(nextKarat);
    setSize("");
    setEngraving("");
    userVariantInteractionRef.current = false;
    setVariantEnabled(
      Boolean(
        nextCut ||
        nextQuality ||
        nextClarity ||
        nextCarat ||
        nextMetal ||
        nextKarat,
      ),
    );
    setDefaultsApplied(false);
    skipNextVariantFetchRef.current = false;
    lastVariantQueryRef.current = "";
  }, [
    productId,
    defaultCutId,
    defaultDiamondTypeId,
    defaultClarityId,
    defaultCarat,
    defaultMetalId,
    defaultKaratId,
  ]);

  // ─── FIX: write last price to sessionStorage + local state together ───
  useEffect(() => {
    if (productId && designId !== undefined && currencyCode) {
      const cached = readLastDisplayPrice(productId, designId, currencyCode);
      if (cached && isPriceForCurrency(cached, currencySymbol)) {
        setLastDisplayPrice(cached);
      }
    }
  }, [productId, designId, currencyCode, currencySymbol]);

  const markVariantInteraction = useCallback(() => {
    userVariantInteractionRef.current = true;
    setVariantEnabled(true);
  }, []);

  const listingDefaults = useMemo(
    () => resolveListingDefaults(productDetails),
    [productDetails],
  );
  const listingDesign =
    productDetails?.design ??
    productDetails?.design_variant ??
    productDetails?.designVariant ??
    null;

  const hasDefaultCut = Boolean(normalizeString(defaultCutId));
  const hasDefaultQuality = Boolean(normalizeString(defaultDiamondTypeId));
  const hasDefaultClarity = Boolean(normalizeString(defaultClarityId));
  const hasDefaultCarat = Boolean(normalizeString(defaultCarat));
  const hasDefaultMetal = Boolean(normalizeString(defaultMetalId));
  const hasDefaultKarat = Boolean(normalizeString(defaultKaratId));
  const hasPrefilledVariant =
    hasDefaultCut ||
    hasDefaultQuality ||
    hasDefaultClarity ||
    hasDefaultCarat ||
    hasDefaultMetal ||
    hasDefaultKarat;

  useEffect(() => {
    if (hasPrefilledVariant && !variantEnabled) {
      setVariantEnabled(true);
    }
  }, [hasPrefilledVariant, variantEnabled]);

  useEffect(() => {
    if (!productDetails || defaultsApplied || variantEnabled) return;

    if (!hasDefaultCut && listingDefaults.cut) {
      setCut(listingDefaults.cut);
    }
    if (!hasDefaultQuality && listingDefaults.quality) {
      setQuality(listingDefaults.quality);
    }
    if (!hasDefaultClarity && listingDefaults.clarity) {
      setClarity(listingDefaults.clarity);
    }
    if (!hasDefaultCarat && listingDefaults.carat) {
      setCarat(listingDefaults.carat);
    }
    if (!hasDefaultMetal && listingDefaults.metal) {
      setMetal(listingDefaults.metal);
    }
    if (!hasDefaultKarat && listingDefaults.karat) {
      setMetalType(listingDefaults.karat);
    }

    setDefaultsApplied(true);
  }, [
    productDetails,
    defaultsApplied,
    variantEnabled,
    listingDefaults,
    hasDefaultCut,
    hasDefaultQuality,
    hasDefaultClarity,
    hasDefaultCarat,
    hasDefaultMetal,
    hasDefaultKarat,
  ]);

  const filterCutId = normalizeString(cut);
  const filterQualityId = normalizeString(quality);
  const filterAvailabilityValue = normalizeString(
    variantDetails?.is_filter_available ??
      listingDesign?.is_filter_available ??
      productDetails?.is_filter_available ??
      filterData?.is_filter_available ??
      "",
  );
  const hideCutSection =
    filterAvailabilityValue === "2" ||
    filterAvailabilityValue === "3" ||
    filterAvailabilityValue === "4";
  const allowCutInQuery = filterAvailabilityValue !== "0" && !hideCutSection;
  const hideCaratSection =
    filterAvailabilityValue === "2" || filterAvailabilityValue === "3";
  const allowCaratInQuery =
    filterAvailabilityValue !== "0" &&
    filterAvailabilityValue !== "4" &&
    !hideCaratSection;
  const hideClaritySection = filterAvailabilityValue === "3";
  const hideSizeSection = filterAvailabilityValue === "3";
  const hideEngravingSection = filterAvailabilityValue === "3";

  useEffect(() => {
    const controller = new AbortController();

    const query = new URLSearchParams({
      language_id: String(languageId),
    });
    if (productId) query.set("product_id", String(productId));
    if (filterCutId && allowCutInQuery) query.set("cut_id", filterCutId);
    if (filterQualityId) query.set("diamond_type_id", filterQualityId);
    const queryString = query.toString();
    if (queryString === lastFilterQueryRef.current) {
      return () => {
        controller.abort();
      };
    }

    const loadFilters = async () => {
      try {
        const { data } = await axiosClient.get(
          `/api/design/filter-dropdowns-ecom?${queryString}`,
          { signal: controller.signal },
        );
        const payload = data?.data ?? data;
        lastFilterQueryRef.current = queryString;
        setFilterData(payload && typeof payload === "object" ? payload : null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setFilterData(null);
        lastFilterQueryRef.current = "";
        console.error("Product filter load failed", error);
      }
    };

    loadFilters();
    return () => {
      controller.abort();
    };
  }, [languageId, productId, filterCutId, filterQualityId, allowCutInQuery]);

  const cutOptions = useMemo(() => {
    const list = Array.isArray(filterData?.cuts) ? filterData.cuts : [];
    return list
      .map((item) => {
        const rawId =
          item?.cut_id ??
          item?.id ??
          item?.cutId ??
          item?.code ??
          item?.name ??
          item?.label ??
          "";
        const rawLabel =
          item?.cut_name ??
          item?.name ??
          item?.label ??
          item?.code ??
          String(rawId ?? "");
        const id = normalizeString(rawId);
        const label = normalizeString(rawLabel);
        if (!id && !label) return null;
        const codeKey = String(
          item?.cut_code ?? item?.code ?? "",
        ).toUpperCase();
        const nameKey = label.toUpperCase();
        const src =
          cutImageByCode[codeKey] ||
          cutImageByName[nameKey] ||
          "/diamondcuts/round_cut.png";
        return {
          id: id || label,
          label: label.toUpperCase() || "CUT",
          src,
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const qualityOptions = useMemo(() => {
    const list = Array.isArray(filterData?.diamond_types)
      ? filterData.diamond_types
      : [];
    return list
      .map((item) => {
        const rawValue =
          item?.diamond_type_id ??
          item?.id ??
          item?.diamondTypeId ??
          item?.code ??
          item?.value ??
          "";
        const rawLabel =
          item?.diamond_type_name ??
          item?.name ??
          item?.label ??
          item?.code ??
          "";
        const value = normalizeString(rawValue);
        const label = normalizeString(rawLabel ?? value);
        if (!value && !label) return null;
        const isLab =
          item?.is_lab === 1 ||
          item?.is_lab === "1" ||
          String(item?.is_lab ?? "").toLowerCase() === "yes";
        return {
          value: value || label,
          label: label.toUpperCase() || "QUALITY",
          isLab,
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const clarityOptions = useMemo(() => {
    const list = Array.isArray(filterData?.clarities)
      ? filterData.clarities
      : [];
    return list
      .map((item) => {
        const rawValue =
          item?.clarity_id ??
          item?.id ??
          item?.clarityId ??
          item?.code ??
          item?.value ??
          item?.name ??
          "";
        const rawLabel =
          item?.clarity_name ??
          item?.name ??
          item?.label ??
          String(rawValue ?? "");
        const value = normalizeString(rawValue);
        const label = normalizeString(rawLabel ?? value);
        if (!value && !label) return null;
        const isLab =
          item?.is_lab === 1 ||
          item?.is_lab === "1" ||
          String(item?.is_lab ?? "").toLowerCase() === "yes";
        return {
          value: value || label,
          label: label.toUpperCase() || "CLARITY",
          isLab,
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const filteredClarityOptions = useMemo(() => {
    if (!clarityOptions.length) return [];
    const selectedQualityOption =
      qualityOptions.find((opt) => opt.value === quality) ?? null;
    if (!selectedQualityOption?.isLab) return clarityOptions;
    return clarityOptions.filter((opt) => opt.isLab);
  }, [clarityOptions, qualityOptions, quality]);
  const showQualitySelect = qualityOptions.length > 0;
  const showClaritySelect =
    filteredClarityOptions.length > 0 && !hideClaritySection;
  const showDiamondTypeSection = showQualitySelect || showClaritySelect;

  const caratOptions = useMemo(() => {
    const list = Array.isArray(filterData?.carats) ? filterData.carats : [];
    return list
      .map((item) => {
        const value =
          item?.carat_name ?? item?.name ?? item?.carat ?? item?.value ?? item;
        const label = normalizeString(value);
        return label ? label : null;
      })
      .filter(Boolean);
  }, [filterData]);

  const diamondDetailGroups = useMemo(() => {
    if (filterAvailabilityValue !== "2") return [];
    const list = Array.isArray(variantDetails?.diamond_details)
      ? variantDetails.diamond_details
      : [];
    if (!list.length) return [];
    const groups = new Map();
    list.forEach((detail) => {
      const cutName = normalizeString(
        detail?.cut_master?.cut_name ??
          detail?.cut_master?.name ??
          detail?.cut_name ??
          detail?.cut ??
          "",
      );
      const caratValue = normalizeString(
        detail?.diamond_rate?.diamond_master?.carat ??
          detail?.diamond_rate?.diamond_master_id?.carat ??
          detail?.diamond_rate?.carat ??
          detail?.carat ??
          "",
      );
      if (!cutName || !caratValue) return;
      const key = cutName.toUpperCase();
      if (!groups.has(key)) {
        groups.set(key, { cutName: key, carats: [] });
      }
      const entry = groups.get(key);
      if (!entry.carats.includes(caratValue)) {
        entry.carats.push(caratValue);
      }
    });
    return Array.from(groups.values());
  }, [variantDetails, filterAvailabilityValue]);

  const hasCenterDiamond = useMemo(() => {
    const list =
      variantDetails?.diamond_details ??
      listingDesign?.diamond_details ??
      productDetails?.design?.diamond_details ??
      productDetails?.design_variant?.diamond_details ??
      productDetails?.designVariant?.diamond_details ??
      [];
    if (!Array.isArray(list) || !list.length) return false;
    return list.some((detail) => {
      const value = detail?.is_center ?? detail?.isCenter ?? "";
      return (
        value === 1 ||
        value === "1" ||
        value === true ||
        String(value).toLowerCase() === "true"
      );
    });
  }, [listingDesign, productDetails, variantDetails]);
  const diamondCaratLabel =
    filterAvailabilityValue === "4" && hasCenterDiamond
      ? `${labels.centerPrefix}`
      : labels.diamondCaratWeight;

  const metalOptions = useMemo(() => {
    const list = Array.isArray(filterData?.metals) ? filterData.metals : [];
    return list
      .map((item) => {
        const rawValue =
          item?.metal_id ??
          item?.id ??
          item?.metalId ??
          item?.value ??
          item?.code ??
          item?.name;
        const rawLabel =
          item?.metal_name ??
          item?.name ??
          item?.label ??
          item?.code ??
          rawValue;
        const value = normalizeString(rawValue);
        const label = normalizeString(rawLabel);
        if (!value && !label) return null;
        const codeKey = String(
          item?.metal_code ?? item?.code ?? "",
        ).toUpperCase();
        const color = item?.color ?? metalColorByCode[codeKey] ?? "#e5e7eb";
        return {
          value: value || label,
          label: label.toUpperCase() || "METAL",
          color,
          isPlatinum:
            item?.is_platinum === 1 ||
            item?.is_platinum === "1" ||
            String(item?.is_platinum ?? "").toLowerCase() === "yes",
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const metalTypeOptions = useMemo(() => {
    const list = Array.isArray(filterData?.karats) ? filterData.karats : [];
    return list
      .map((item) => {
        const rawId =
          item?.karat_id ??
          item?.id ??
          item?.karatId ??
          item?.code ??
          item?.value ??
          null;
        const rawLabel =
          item?.karat_name ??
          item?.karat ??
          item?.name ??
          item?.label ??
          item?.value ??
          rawId ??
          "";
        const label = normalizeString(rawLabel);
        const value =
          rawId !== null && rawId !== undefined
            ? normalizeString(rawId)
            : label;
        if (!value) return null;
        return {
          value,
          label: label ? label.toUpperCase() : value.toUpperCase(),
          isPlatinum:
            item?.is_platinum === 1 ||
            item?.is_platinum === "1" ||
            String(item?.is_platinum ?? "").toLowerCase() === "yes",
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const filteredMetalTypeOptions = useMemo(() => {
    const selectedMetalOption =
      metalOptions.find((opt) => opt.value === metal) ?? null;
    if (!selectedMetalOption) return metalTypeOptions;
    const isPlatinumMetal = Boolean(selectedMetalOption.isPlatinum);
    return metalTypeOptions.filter(
      (opt) => Boolean(opt.isPlatinum) === isPlatinumMetal,
    );
  }, [metal, metalOptions, metalTypeOptions]);

  const sizeOptions = useMemo(() => {
    const list = Array.isArray(filterData?.ring_sizes)
      ? filterData.ring_sizes
      : [];
    return list
      .map((item) => {
        const rawValue = item?.value ?? item?.size ?? item?.id ?? "";
        const rawLabel = item?.size ?? item?.label ?? item?.value ?? rawValue;
        const value = normalizeString(rawValue);
        const label = normalizeString(rawLabel);
        if (!value && !label) return null;
        return { value: value || label, label: label || value };
      })
      .filter(Boolean);
  }, [filterData]);
  const showSizeSection = !hideSizeSection;

  const dropdownStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 30,
        height: 30,
        borderColor: "var(--color-primary)",
        boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary)" : "none",
        ":hover": {
          borderColor: "var(--color-primary)",
        },
      }),
      menu: (base) => ({
        ...base,
        fontFamily: "var(--font-body)",
      }),
      menuList: (base) => ({
        ...base,
        padding: "4px",
      }),
      option: (base, state) => ({
        ...base,
        padding: "6px 8px",
        fontSize: "12px",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        lineHeight: 1.5,
        backgroundColor: state.isSelected
          ? "var(--color-primary-soft)"
          : state.isFocused
            ? "color-mix(in srgb, var(--color-primary), transparent 85%)"
            : "transparent",
        color: "var(--color-heading)",
        ":active": {
          backgroundColor: "var(--color-primary-soft)",
        },
      }),
      singleValue: (base) => ({
        ...base,
        fontSize: "12px",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        color: "var(--color-heading)",
      }),
      placeholder: (base) => ({
        ...base,
        fontSize: "12px",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        color: "var(--color-heading)",
      }),
    }),
    [],
  );
  const qualityDropdownStyles = useMemo(
    () => ({
      ...dropdownStyles,
      control: (base, state) => ({
        ...dropdownStyles.control(base, state),
        minWidth: 100,
      }),
    }),
    [dropdownStyles],
  );

  useEffect(() => {
    if (hideCutSection) return;
    if (cutOptions.length && !cutOptions.some((opt) => opt.id === cut)) {
      setCut(cutOptions[0].id);
    }
  }, [cutOptions, cut, hideCutSection]);

  useEffect(() => {
    if (
      qualityOptions.length &&
      !qualityOptions.some((opt) => opt.value === quality)
    ) {
      setQuality(qualityOptions[0].value);
    }
  }, [qualityOptions, quality]);

  useEffect(() => {
    if (
      filteredClarityOptions.length &&
      !filteredClarityOptions.some((opt) => opt.value === clarity)
    ) {
      setClarity(filteredClarityOptions[0].value);
    }
  }, [filteredClarityOptions, clarity]);

  useEffect(() => {
    if (hideCaratSection) return;
    if (caratOptions.length && !caratOptions.includes(carat)) {
      setCarat(caratOptions[0]);
    }
  }, [caratOptions, carat, hideCaratSection]);

  useEffect(() => {
    if (
      metalOptions.length &&
      !metalOptions.some((opt) => opt.value === metal)
    ) {
      setMetal(metalOptions[0].value);
    }
  }, [metalOptions, metal]);

  useEffect(() => {
    if (!filteredMetalTypeOptions.length) return;
    if (
      metalType &&
      filteredMetalTypeOptions.some((opt) => opt.value === metalType)
    ) {
      return;
    }
    setMetalType(filteredMetalTypeOptions[0].value);
  }, [filteredMetalTypeOptions, metalType]);

  useEffect(() => {
    if (
      size &&
      sizeOptions.length &&
      !sizeOptions.some((opt) => opt.value === size)
    ) {
      setSize("");
    }
  }, [sizeOptions, size]);

  const selectedCutId =
    cutOptions.find((opt) => opt.id === cut)?.id ?? normalizeString(cut);
  const selectedQualityId =
    qualityOptions.find((opt) => opt.value === quality)?.value ??
    normalizeString(quality);

  // this is added for crical fix nirmit adde on 05/05/2026
  const selectedClarityId =
    filteredClarityOptions.find((opt) => opt.value === clarity)?.value ??
      normalizeString(clarity);
      // auto code removed
    // (filteredClarityOptions.length > 0
    //   ? filteredClarityOptions[0].value
    //   : "");



  const selectedMetalId =
    metalOptions.find((opt) => opt.value === metal)?.value ??
    normalizeString(metal);
  const selectedKaratId =
    filteredMetalTypeOptions.find((opt) => opt.value === metalType)?.value ??
    normalizeString(metalType);
  const selectedCarat = carat ? String(carat) : "";

  const variantTranslationSource =
    variantDetails?.design_translation ??
    variantDetails?.design_translations ??
    variantDetails?.translations ??
    variantDetails?.design_name_array ??
    variantDetails?.designNameArray ??
    variantDetails?.product_name_array ??
    variantDetails?.productNameArray ??
    variantDetails?.product_translations ??
    variantDetails?.productTranslations ??
    null;
  const variantTitle = variantEnabled
    ? resolveTranslationName(variantTranslationSource, languageId) ||
      normalizeString(variantDetails?.design_variant_name) ||
      normalizeString(variantDetails?.product_name)
    : "";
  const variantDescription = variantEnabled
    ? resolveTranslationDescription(variantTranslationSource, languageId) ||
      normalizeString(variantDetails?.description ?? "")
    : "";

  const productTranslationSource =
    productDetails?.design?.design_translation ??
    productDetails?.design_translation ??
    productDetails?.design?.design_translations ??
    productDetails?.design_translations ??
    productDetails?.design?.translations ??
    productDetails?.translations ??
    productDetails?.design?.design_name_array ??
    productDetails?.design?.designNameArray ??
    productDetails?.design?.product_name_array ??
    productDetails?.design?.productNameArray ??
    productDetails?.design?.product_translations ??
    productDetails?.design?.productTranslations ??
    productDetails?.product_name_array ??
    productDetails?.productNameArray ??
    productDetails?.product_translations ??
    productDetails?.productTranslations ??
    null;
  const translatedTitle = resolveTranslationName(
    productTranslationSource,
    languageId,
  );
  const translatedDescription = resolveTranslationDescription(
    productTranslationSource,
    languageId,
  );

  const productTitle =
    variantTitle ||
    translatedTitle ||
    normalizeString(productDetails?.design?.design_variant_name) ||
    normalizeString(productDetails?.product_name) ||
    normalizeString(title);
  const productDescription =
    variantDescription ||
    translatedDescription ||
    resolveDesignTranslation(
      productDetails?.design?.design_translation ??
        productDetails?.design_translation ??
        productDetails?.design?.design_translations ??
        productDetails?.design_translations ??
        productDetails?.design?.description ??
        productDetails?.description,
      languageId,
    ) ||
    normalizeString(productDetails?.design?.design_variant_name) ||
    normalizeString(productDetails?.product_name) ||
    "";
  const productBasePrice =
    pickTotalPrice(productDetails?.design) ||
    pickTotalPrice(productDetails) ||
    "";

  useEffect(() => {
    let active = true;

    if (!variantEnabled) {
      setVariantDetails(null);
      setVariantAdjustedFilters(null);
      setVariantDesignAvailable(null);
      setVariantLoading(false);
      return () => {
        active = false;
      };
    }

    if (!productId || !selectedMetalId || !selectedKaratId) {
      setVariantDetails(null);
      setVariantAdjustedFilters(null);
      setVariantDesignAvailable(null);
      setVariantLoading(false);
      return () => {
        active = false;
      };
    }
    // // this is added by nirmit added on 05/05/2026
    // // ─── CRITICAL: Skip fetch if clarity is invalid ───
    // // This prevents sending invalid clarity_id to API which causes wrong pricing
    // if (showClaritySelect && clarity && !filteredClarityOptions.some((opt) => opt.value === clarity)) {
    //   setVariantLoading(false);
    //   return () => {
    //     active = false;
    //   };
    // }
    //remove auto code
    if (
      filterAvailabilityValue === "4" &&
      hasPrefilledVariant &&
      listingDesign &&
      !userVariantInteractionRef.current
    ) {
      setVariantDetails(null);
      setVariantAdjustedFilters(null);
      setVariantDesignAvailable(null);
      setVariantLoading(false);
      return () => {
        active = false;
      };
    }

    if (skipNextVariantFetchRef.current) {
      skipNextVariantFetchRef.current = false;
      if (active) setVariantLoading(false);
      return () => {
        active = false;
      };
    }

    const params = new URLSearchParams({
      product_id: String(productId),
    });
    if (languageId) params.set("language_id", String(languageId));
    if (currencyCode) params.set("currency", String(currencyCode));
    if (currencySymbol) params.set("currency_symbol", String(currencySymbol));
    if (selectedMetalId) params.set("metal_id", String(selectedMetalId));
    if (selectedQualityId)
      params.set("diamond_type_id", String(selectedQualityId));
    if (selectedClarityId) params.set("clarity_id", String(selectedClarityId));
    if (selectedCarat && allowCaratInQuery)
      params.set("carat", String(selectedCarat));
    if (selectedCutId && allowCutInQuery)
      params.set("cut_id", String(selectedCutId));
    if (selectedKaratId) {
      params.set("karat_id", String(selectedKaratId));
    }
    const queryString = params.toString();
    if (queryString === lastVariantQueryRef.current) {
      return () => {
        active = false;
      };
    }
    lastVariantQueryRef.current = queryString;

    setVariantLoading(true);
    const loadVariant = async () => {
      try {
        const { data } = await axiosClient.get(
          `/api/design/variant-details-ecom?${queryString}`,
        );
        if (active) {
          const response = data ?? null;
          const payload = unwrapVariantPayload(
            response?.data ?? response ?? null,
          );
          setVariantDetails(payload);
          const updated = updateCacheWithVariant(productId, payload, {
            userInitiated: userVariantInteractionRef.current,
          });
          if (updated) {
            setProductDetails(updated);
          }
          setVariantAdjustedFilters(
            response?.adjusted_filters ??
              payload?.adjusted_filters ??
              response?.adjustedFilters ??
              payload?.adjustedFilters ??
              null,
          );
          setVariantDesignAvailable(
            response?.is_design_avl ??
              payload?.is_design_avl ??
              response?.isDesignAvailable ??
              payload?.isDesignAvailable ??
              null,
          );
        }
      } catch (error) {
        if (active) {
          setVariantDetails(null);
          setVariantAdjustedFilters(null);
          setVariantDesignAvailable(null);
          const errorMessage =
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            error?.message ??
            "Failed to load variant details. Please try again.";
          toast.error(errorMessage);
        }
        lastVariantQueryRef.current = "";
        console.error("Variant details load failed", error);
      } finally {
        if (active) setVariantLoading(false);
      }
    };

    loadVariant();
    return () => {
      active = false;
    };
  }, [
    productId,
    selectedMetalId,
    selectedKaratId,
    selectedQualityId,
    selectedClarityId,
    selectedCarat,
    selectedCutId,
    variantEnabled,
    languageId,
    allowCutInQuery,
    allowCaratInQuery,
    listingDesign,
    filterAvailabilityValue,
    hasPrefilledVariant,
    currencyCode,
    currencySymbol,
    // this is added for critical fix nirmit added on 05/05/2026
    // showClaritySelect,
    // clarity,
    // filteredClarityOptions,
    // remove auto code 
  ]);

  useEffect(() => {
    if (!variantEnabled || !variantAdjustedFilters) return;
    const designAvailability =
      variantDesignAvailable ??
      variantAdjustedFilters?.is_design_avl ??
      variantAdjustedFilters?.is_design_available ??
      variantDetails?.is_design_avl ??
      variantDetails?.is_design_available ??
      null;
    if (designAvailability === null || designAvailability === undefined) return;
    const availabilityValue = normalizeString(designAvailability).toLowerCase();
    if (availabilityValue !== "0" && availabilityValue !== "false") {
      return;
    }

    const adjusted = variantAdjustedFilters ?? {};
    const nextCut = normalizeString(adjusted.cut_id ?? adjusted.cutId ?? "");
    const nextQuality = normalizeString(
      adjusted.diamond_type_id ??
        adjusted.diamondTypeId ??
        adjusted.type_id ??
        adjusted.typeId ??
        "",
    );
    const nextClarity = normalizeString(
      adjusted.clarity_id ?? adjusted.clarityId ?? "",
    );
    const nextCarat = normalizeString(
      adjusted.carat ?? adjusted.carat_weight ?? adjusted.caratWeight ?? "",
    );
    const nextMetal = normalizeString(
      adjusted.metal_id ?? adjusted.metalId ?? "",
    );
    const nextKarat = normalizeString(
      adjusted.karat_id ?? adjusted.karatId ?? "",
    );

    const canUseOption = (value, options, matcher) => {
      if (!value) return false;
      if (!options || !options.length) return true;
      return options.some((opt) => matcher(opt, value));
    };

    if (!hideCutSection) {
      const canUseCut = canUseOption(
        nextCut,
        cutOptions,
        (opt, value) => opt.id === value,
      );
      if (nextCut && nextCut !== cut && canUseCut) {
        setCut(nextCut);
      }
    }

    const canUseQuality = canUseOption(
      nextQuality,
      qualityOptions,
      (opt, value) => opt.value === value,
    );
    if (nextQuality && nextQuality !== quality && canUseQuality) {
      setQuality(nextQuality);
    }

    const canUseClarity = canUseOption(
      nextClarity,
      clarityOptions,
      (opt, value) => opt.value === value,
    );
    if (nextClarity && nextClarity !== clarity && canUseClarity) {
      setClarity(nextClarity);
    }

    if (!hideCaratSection) {
      const canUseCarat =
        nextCarat && (!caratOptions.length || caratOptions.includes(nextCarat));
      if (nextCarat && nextCarat !== carat && canUseCarat) {
        setCarat(nextCarat);
      }
    }

    const canUseMetal = canUseOption(
      nextMetal,
      metalOptions,
      (opt, value) => opt.value === value,
    );
    if (nextMetal && nextMetal !== metal && canUseMetal) {
      setMetal(nextMetal);
    }

    const metalTypeList = filteredMetalTypeOptions.length
      ? filteredMetalTypeOptions
      : metalTypeOptions;
    const canUseKarat = canUseOption(
      nextKarat,
      metalTypeList,
      (opt, value) => opt.value === value,
    );
    if (nextKarat && nextKarat !== metalType && canUseKarat) {
      setMetalType(nextKarat);
    }

    if (
      (!hideCutSection && nextCut && nextCut !== cut) ||
      (nextQuality && nextQuality !== quality) ||
      (nextClarity && nextClarity !== clarity) ||
      (!hideCaratSection && nextCarat && nextCarat !== carat) ||
      (nextMetal && nextMetal !== metal) ||
      (nextKarat && nextKarat !== metalType)
    ) {
      skipNextVariantFetchRef.current = true;
    }
  }, [
    variantAdjustedFilters,
    variantDesignAvailable,
    variantDetails,
    variantEnabled,
    cut,
    cutOptions,
    quality,
    qualityOptions,
    clarity,
    clarityOptions,
    carat,
    caratOptions,
    metal,
    metalOptions,
    metalType,
    metalTypeOptions,
    filteredMetalTypeOptions,
    hideCutSection,
    hideCaratSection,
  ]);

  const isPlatinum = useMemo(() => {
    const metalRate = variantEnabled
      ? variantDetails?.metal_rate
      : (productDetails?.design?.metal_rate ??
        productDetails?.design_variant?.metal_rate ??
        productDetails?.designVariant?.metal_rate);
    const metalNameFromDetails = metalRate?.metal?.metal_name ?? "";
    if (metalNameFromDetails) {
      return normalizeString(metalNameFromDetails).toLowerCase() === "platinum";
    }
    const selectedMetalOption = metalOptions.find((opt) => opt.value === metal);
    const metalNameFromOption = selectedMetalOption?.label ?? "";
    return normalizeString(metalNameFromOption).toLowerCase() === "platinum";
  }, [variantEnabled, variantDetails, productDetails, metalOptions, metal]);

  const variantPriceStr = pickTotalPrice(variantDetails);

  // ─── FIX: Only use productBasePrice if it matches the current currency ───
  const productBasePriceForCurrency = isPriceForCurrency(
    productBasePrice,
    currencySymbol,
  )
    ? productBasePrice
    : "";

  const displayPrice = variantPriceStr || productBasePriceForCurrency || null;

  // ─── FIX: currentDisplayPrice — must match current currency ───
  const currentDisplayPrice = isPriceForCurrency(displayPrice, currencySymbol)
    ? displayPrice
    : "";

  // ─── FIX: only fall back to lastDisplayPrice if we have no current price
  //          AND it matches the current currency (prevents stale cross-currency flash) ───
  const previousDisplayPrice =
    currentDisplayPrice === "" &&
    isPriceForCurrency(lastDisplayPrice, currencySymbol)
      ? lastDisplayPrice
      : "";

  const stableDisplayPrice = currentDisplayPrice || previousDisplayPrice;
  const shouldShowPrice = true;

  // ─── FIX: persist price keyed by currency ───
  useEffect(() => {
    if (currentDisplayPrice) {
      const nextPrice = String(currentDisplayPrice);
      setLastDisplayPrice(nextPrice);
      writeLastDisplayPrice(productId, designId, currencyCode, nextPrice);
    }
  }, [currentDisplayPrice, productId, designId, currencyCode]);

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>{productTitle}</h2>
      {productDescription ? (
        <p className={styles.copy}>{productDescription}</p>
      ) : null}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{labels.customizedForYou}</div>
        {!hideCutSection && cutOptions.length ? (
          <>
            <div className={styles.fieldTitle}>{labels.selectDiamondCut}</div>
            <div className={styles.cuts}>
              {cutOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.cut} ${cut === item.id ? styles.cutActive : ""}`}
                  onClick={() => {
                    markVariantInteraction();
                    setCut(item.id);
                  }}
                >
                  <div className={styles.cutIcon} aria-hidden>
                    <img
                      className={styles.cutIconImage}
                      src={item.src}
                      alt=""
                    />
                  </div>
                  <div className={styles.cutLabel}>{item.label}</div>
                </button>
              ))}
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        {showDiamondTypeSection ? (
          <>
            <div className={styles.gridFields}>
              <div className={styles.fieldTitle}>{labels.diamondQuality}</div>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "16px" }}
              >
                {showQualitySelect ? (
                  <div>
                    <Select
                      className={styles.select}
                      classNamePrefix="customizer"
                      instanceId={qualityId}
                      styles={qualityDropdownStyles}
                      value={
                        qualityOptions.find((opt) => opt.value === quality) ??
                        null
                      }
                      options={qualityOptions}
                      onChange={(option) => {
                        markVariantInteraction();
                        setQuality(option?.value ?? "");
                      }}
                      isSearchable={false}
                    />
                  </div>
                ) : null}
                {showClaritySelect ? (
                  <div>
                    <Select
                      className={styles.select}
                      classNamePrefix="customizer"
                      instanceId={clarityId}
                      styles={dropdownStyles}
                      value={
                        filteredClarityOptions.find(
                          (opt) => opt.value === clarity,
                        ) ?? null
                      }
                      options={filteredClarityOptions}
                      onChange={(option) => {
                        markVariantInteraction();
                        setClarity(option?.value ?? "");
                      }}
                      isSearchable={false}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        {!hideCaratSection && caratOptions.length ? (
          <>
            <div className={styles.fieldTitle}>{diamondCaratLabel}</div>
            <div className={styles.pills}>
              {caratOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.pill} ${carat === value ? styles.pillActive : ""}`}
                  onClick={() => {
                    markVariantInteraction();
                    setCarat(value);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        {diamondDetailGroups.length ? (
          <>
            <div className={styles.diamondDetailGroups}>
              {diamondDetailGroups.map((group) => {
                return (
                <div className={styles.diamondDetailGroup} key={group.cutName}>
                  <div className={styles.fieldTitle}>
                    {group.cutName} {diamondCaratLabel} 
                  </div>
                  <div className={styles.pills}>
                    {group.carats.map((value) => (
                      <button
                        key={`${group.cutName}-${value}`}
                        type="button"
                        className={`${styles.pill} ${styles.pillDisabled}`}
                        disabled
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )})}
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        <div className={styles.fieldTitle}>{labels.selectMetalColor}</div>
        <div
          className={`${styles.metalRow}${language === "fi" ? ` ${styles.metalRowWrap}` : ""}`}
        >
          {metalOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.metal} ${metal === item.value ? styles.metalActive : ""}`}
              onClick={() => {
                markVariantInteraction();
                setMetal(item.value);
              }}
            >
              <span
                className={styles.dot}
                style={{ background: item.color }}
                aria-hidden
              />
              <span className={styles.dotLabel}>{item.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.divider} aria-hidden />

        <div className={styles.gridFields}>
          {filteredMetalTypeOptions.length ? (
            <>
              <div>
                <div className={styles.fieldTitle}>{labels.metalType}</div>
                <div className={styles.pills}>
                  {filteredMetalTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.pill} ${metalType === option.value ? styles.pillActive : ""}`}
                      onClick={() => {
                        markVariantInteraction();
                        setMetalType(option.value);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {showSizeSection ? (
                <div className={styles.divider} aria-hidden />
              ) : null}
            </>
          ) : null}
          {showSizeSection ? (
            <div>
              <div className={styles.fieldTitle}>{labels.ringSize}</div>
              <Select
                className={styles.select}
                classNamePrefix="customizer"
                instanceId={sizeId}
                styles={dropdownStyles}
                value={sizeOptions.find((opt) => opt.value === size) ?? null}
                options={sizeOptions}
                onChange={(option) => setSize(option?.value ?? "")}
                placeholder="Select Size"
                isSearchable={false}
              />
            </div>
          ) : null}
        </div>
        {shouldShowPrice ? (
          <>
            <div className={styles.divider} aria-hidden />
            <div className={styles.priceBlock}>
              {stableDisplayPrice ? (
                <div className={styles.priceValue}>{stableDisplayPrice}</div>
              ) : variantLoading ? (
                <div className={styles.variantStatus}>...</div>
              ) : null}
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        {!hideEngravingSection ? (
          <>
            <div className={styles.fieldTitle}>{labels.engraving}</div>
            <div className={styles.engraveRow}>
              <input
                className={styles.input}
                value={engraving}
                onChange={(e) => setEngraving(e.target.value)}
                placeholder={labels.engravingPlaceholder}
              />
              <button className={styles.submit} type="button">
                {labels.submit}
              </button>
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        <button
          className={styles.enquire}
          type="button"
          onClick={() => router.push("/appointment")}
        >
          {labels.enquireNow}
        </button>
      </div>
    </aside>
  );
}
