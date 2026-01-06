"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosClient from "../../lib/axiosClient.js";
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

const resolveDesignTranslation = (translation, languageId) => {
  if (!translation) return "";
  if (typeof translation === "string") return normalizeString(translation);
  if (Array.isArray(translation)) {
    const match = translation.find((entry) => {
      const entryLangId = normalizeString(entry?.language_id ?? entry?.language?.id);
      return entryLangId && entryLangId === normalizeString(languageId);
    });
    const candidate =
      match?.description ??
      match?.design_variant_name ??
      match?.name ??
      match?.label ??
      "";
    return normalizeString(candidate);
  }
  if (typeof translation === "object") {
    const candidate =
      translation?.description ??
      translation?.design_variant_name ??
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
    const match = translation.find((entry) => {
      const entryLangId = normalizeString(entry?.language_id ?? entry?.language?.id);
      return entryLangId && entryLangId === normalizeString(languageId);
    });
    const candidate = match?.design_variant_name ?? match?.name ?? match?.label ?? "";
    return normalizeString(candidate);
  }
  if (typeof translation === "object") {
    const candidate =
      translation?.design_variant_name ?? translation?.name ?? translation?.label ?? "";
    return normalizeString(candidate);
  }
  return "";
};

const resolveTranslationDescription = (translation, languageId) => {
  if (!translation) return "";
  if (typeof translation === "string") return normalizeString(translation);
  if (Array.isArray(translation)) {
    const match = translation.find((entry) => {
      const entryLangId = normalizeString(entry?.language_id ?? entry?.language?.id);
      return entryLangId && entryLangId === normalizeString(languageId);
    });
    const candidate = match?.description ?? "";
    return normalizeString(candidate);
  }
  if (typeof translation === "object") {
    const candidate = translation?.description ?? "";
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
      diamondDetail?.cut_master_id ?? diamondDetail?.cut_master?.id ?? ""
    ),
    quality: normalizeString(diamondRate?.diamond_type_id ?? ""),
    clarity: normalizeString(diamondRate?.clarity_id ?? ""),
    carat: normalizeString(
      diamondRate?.diamond_master?.carat ??
        diamondRate?.diamond_master_id?.carat ??
        ""
    ),
    metal: normalizeString(
      metalRate?.metal_id ?? metalRate?.metal?.id ?? ""
    ),
    karat: normalizeString(
      metalRate?.karat_id ?? metalRate?.karat?.id ?? ""
    ),
  };
};

const readCachedProduct = (productId) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed[String(productId)] ?? null;
  } catch (error) {
    console.error("Product cache read failed", error);
    return null;
  }
};

const updateCacheWithVariant = (productId, variantDetails) => {
  if (typeof window === "undefined" || !productId || !variantDetails) return;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    const cache = raw ? JSON.parse(raw) : {};
    if (typeof cache !== "object") return;
    
    const existingProduct = cache[String(productId)] || {};
    
    // Merge variant details into the product cache
    // Store variantDetails as design since ProductGallery looks for design.images
    cache[String(productId)] = {
      ...existingProduct,
      design: variantDetails,
      design_variant: variantDetails,
      designVariant: variantDetails,
    };
    
    window.sessionStorage.setItem("product_list_cache", JSON.stringify(cache));
    
    // Dispatch custom event to notify ProductGallery of cache update
    window.dispatchEvent(new CustomEvent("productCacheUpdated", { detail: { productId } }));
  } catch (error) {
    console.error("Product cache update failed", error);
  }
};

export default function ProductCustomizer({
  title = "PRODUCT NAME",
  productId = "",
  defaultMetalId = "",
  defaultKaratId = "",
  defaultDiamondTypeId = "",
  defaultClarityId = "",
  defaultCarat = "",
  defaultCutId = "",
}) {
  const router = useRouter();
  const { language } = useI18n();
  const qualityId = useId();
  const clarityId = useId();
  const sizeId = useId();
  const [filterData, setFilterData] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [variantDetails, setVariantDetails] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantEnabled, setVariantEnabled] = useState(false);
  const [variantAdjustedFilters, setVariantAdjustedFilters] = useState(null);
  const [variantDesignAvailable, setVariantDesignAvailable] = useState(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [cut, setCut] = useState(() => normalizeString(defaultCutId));
  const [quality, setQuality] = useState(() => normalizeString(defaultDiamondTypeId));
  const [clarity, setClarity] = useState(() => normalizeString(defaultClarityId));
  const [carat, setCarat] = useState(() => normalizeString(defaultCarat));
  const [metal, setMetal] = useState(() => normalizeString(defaultMetalId));
  const [metalType, setMetalType] = useState(() => normalizeString(defaultKaratId));
  const [size, setSize] = useState("");
  const [engraving, setEngraving] = useState("");
  const lastFilterQueryRef = useRef("");
  const lastVariantQueryRef = useRef("");
  const skipNextVariantFetchRef = useRef(false);
  const variantFromCacheRef = useRef(false);

  const labels =
    language === "fi"
      ? {
          customizedForYou: "Räätälöity sinulle",
          selectDiamondCut: "Valitse timantin hionta",
          diamondQuality: "Timanttityyppi",
          diamondCaratWeight: "TIMANTTI KARAATTI",
          selectMetalColor: "Valitse metallin väri",
          metalType: "Metallin tyyppi",
          ringSize: "Sormuksen koko",
          price: "Hinta",
          engraving: "Kaiverrus (valinnainen)",
          engravingPlaceholder: "Ole hyvä ja rajoita sanamäärä 10 merkkiin",
          submit: "Lähetä",
          enquireNow: "Kysy nyt",
        }
      : {
          customizedForYou: "CUSTOMIZED FOR YOU",
          selectDiamondCut: "SELECT DIAMOND CUT",
          diamondQuality: "DIAMOND TYPE",
          diamondCaratWeight: "DIAMOND CARAT",
          selectMetalColor: "SELECT METAL COLOR",
          metalType: "METAL TYPE",
          ringSize: "RING SIZE",
          price: "PRICE",
          engraving: "ENGRAVING (Optional)",
          engravingPlaceholder: "Please limit word count to 10 characters",
          submit: "SUBMIT",
          enquireNow: "ENQUIRE NOW",
        };

  const languageId = language === "fi" ? "2" : "1";

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
      setProductDetails(readCachedProduct(productId));
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
    setVariantEnabled(
      Boolean(
        nextCut ||
          nextQuality ||
          nextClarity ||
          nextCarat ||
          nextMetal ||
          nextKarat
      )
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

  const listingDefaults = useMemo(
    () => resolveListingDefaults(productDetails),
    [productDetails]
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
      ""
  );
  const hideCutSection = filterAvailabilityValue === "2";
  const allowCutInQuery = filterAvailabilityValue !== "0" && !hideCutSection;
  const hideCaratSection = filterAvailabilityValue === "2";
  const allowCaratInQuery = filterAvailabilityValue !== "0" && !hideCaratSection;

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
          { signal: controller.signal }
        );
        const payload = data?.data ?? data;
        console.log(payload);
        console.log(controller.signal.aborted);

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
        const codeKey = String(item?.cut_code ?? item?.code ?? "").toUpperCase();
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
    const list = Array.isArray(filterData?.clarities) ? filterData.clarities : [];
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

  const caratOptions = useMemo(() => {
    const list = Array.isArray(filterData?.carats) ? filterData.carats : [];
    return list
      .map((item) => {
        const value =
          item?.carat_name ??
          item?.name ??
          item?.carat ??
          item?.value ??
          item;
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
          ""
      );
      const caratValue = normalizeString(
        detail?.diamond_rate?.diamond_master?.carat ??
          detail?.diamond_rate?.diamond_master_id?.carat ??
          detail?.diamond_rate?.carat ??
          detail?.carat ??
          ""
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

  console.log(filterData);
  
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
        const codeKey = String(item?.metal_code ?? item?.code ?? "").toUpperCase();
        const color =
          item?.color ?? metalColorByCode[codeKey] ?? "#e5e7eb";
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
        const value = rawId !== null && rawId !== undefined ? normalizeString(rawId) : label;
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
    const selectedMetalOption = metalOptions.find((opt) => opt.value === metal) ?? null;
    if (!selectedMetalOption) return metalTypeOptions;
    const isPlatinumMetal = Boolean(selectedMetalOption.isPlatinum);
    return metalTypeOptions.filter((opt) => Boolean(opt.isPlatinum) === isPlatinumMetal);
  }, [metal, metalOptions, metalTypeOptions]);

  const sizeOptions = useMemo(() => {
    const list = Array.isArray(filterData?.ring_sizes) ? filterData.ring_sizes : [];
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
    []
  );
  const qualityDropdownStyles = useMemo(
    () => ({
      ...dropdownStyles,
      control: (base, state) => ({
        ...dropdownStyles.control(base, state),
        minWidth: 100,
      }),
    }),
    [dropdownStyles]
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
    if (metalType && filteredMetalTypeOptions.some((opt) => opt.value === metalType)) {
      return;
    }
    setMetalType(filteredMetalTypeOptions[0].value);
  }, [filteredMetalTypeOptions, metalType]);

  useEffect(() => {
    if (size && sizeOptions.length && !sizeOptions.some((opt) => opt.value === size)) {
      setSize("");
    }
  }, [sizeOptions, size]);

  const selectedCutId = cutOptions.find((opt) => opt.id === cut)?.id ?? "";
  const selectedQualityId = qualityOptions.find((opt) => opt.value === quality)?.value ?? "";
  const selectedClarityId =
    filteredClarityOptions.find((opt) => opt.value === clarity)?.value ?? "";
  const selectedMetalId = metalOptions.find((opt) => opt.value === metal)?.value ?? "";
  const selectedKaratId =
    filteredMetalTypeOptions.find((opt) => opt.value === metalType)?.value ?? "";
  const selectedCarat = carat ? String(carat) : "";

  const shouldSkipVariantFetch = useMemo(() => {
    if (!hasPrefilledVariant || !listingDesign) return false;
    const matchesField = (expected, actual) => {
      const normalizedExpected = normalizeString(expected);
      if (!normalizedExpected) return true;
      return normalizedExpected === normalizeString(actual);
    };
    return (
      matchesField(listingDefaults.metal, selectedMetalId) &&
      matchesField(listingDefaults.karat, selectedKaratId) &&
      matchesField(listingDefaults.cut, selectedCutId) &&
      matchesField(listingDefaults.quality, selectedQualityId) &&
      matchesField(listingDefaults.clarity, selectedClarityId) &&
      matchesField(listingDefaults.carat, selectedCarat)
    );
  }, [
    hasPrefilledVariant,
    listingDesign,
    listingDefaults,
    selectedMetalId,
    selectedKaratId,
    selectedCutId,
    selectedQualityId,
    selectedClarityId,
    selectedCarat,
  ]);

  // const variantTitle =
  //   variantEnabled
  //     ? resolveTranslationName(
  //         variantDetails?.design_translation ??
  //           variantDetails?.design_translations ??
  //           variantDetails?.translations,
  //         languageId
  //       ) ||
  //       normalizeString(variantDetails?.design_variant_name) ||
  //       normalizeString(variantDetails?.product_name)
  //     : "";
  const variantDescription =
    variantEnabled
      ? resolveTranslationDescription(
          variantDetails?.design_translation ??
            variantDetails?.design_translations ??
            variantDetails?.translations,
          languageId
        ) ||
        normalizeString(variantDetails?.description ?? "")
      : "";

  const productTranslationSource =
    productDetails?.design?.design_translation ??
    productDetails?.design_translation ??
    productDetails?.design?.design_translations ??
    productDetails?.design_translations ??
    productDetails?.design?.translations ??
    productDetails?.translations ??
    null;
  const translatedTitle = resolveTranslationName(productTranslationSource, languageId);
  const translatedDescription = resolveTranslationDescription(
    productTranslationSource,
    languageId
  );

  const productTitle =
    // variantTitle ||
    // normalizeString(productDetails?.product_name) ||
    translatedTitle ||
    normalizeString(productDetails?.design?.design_variant_name) ||
    normalizeString(productDetails?.product_name) ||
    normalizeString(title) ||
    "PRODUCT NAME";
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
      languageId
    ) ||
    normalizeString(productDetails?.design?.design_variant_name) ||
    normalizeString(productDetails?.product_name) ||
    "";
  const productBasePrice =
    normalizeString(productDetails?.total_price) ||
    normalizeString(productDetails?.design?.total_price) ||
    "";

  useEffect(() => {
    let active = true;
    
    if (!variantEnabled) {
      setVariantDetails(null);
      setVariantAdjustedFilters(null);
      setVariantDesignAvailable(null);
      setVariantLoading(false);
      variantFromCacheRef.current = false;
      return () => {
        active = false;
      };
    }
    
    if (!productId || !selectedMetalId || !selectedKaratId) {
      setVariantDetails(null);
      setVariantAdjustedFilters(null);
      setVariantDesignAvailable(null);
      setVariantLoading(false);
      variantFromCacheRef.current = false;
      return () => {
        active = false;
      };
    }

    if (skipNextVariantFetchRef.current) {
      skipNextVariantFetchRef.current = false;
      return () => {
        active = false;
      };
    }

    const params = new URLSearchParams({
      product_id: String(productId),
    });
    if (languageId) params.set("language_id", String(languageId));
    if (selectedMetalId) params.set("metal_id", String(selectedMetalId));
    if (selectedQualityId) params.set("diamond_type_id", String(selectedQualityId));
    if (selectedClarityId) params.set("clarity_id", String(selectedClarityId));
    if (selectedCarat && allowCaratInQuery) params.set("carat", String(selectedCarat));
    if (selectedCutId && allowCutInQuery) params.set("cut_id", String(selectedCutId));
    if (selectedKaratId) {
      params.set("karat_id", String(selectedKaratId));
    }
    const queryString = params.toString();
    if (shouldSkipVariantFetch && listingDesign) {
      variantFromCacheRef.current = true;
      lastVariantQueryRef.current = queryString;
      if (active) {
        setVariantDetails((prev) => (prev === listingDesign ? prev : listingDesign));
        setVariantAdjustedFilters(null);
        setVariantDesignAvailable(null);
        setVariantLoading(false);
      }
      return () => {
        active = false;
      };
    }
    if (queryString === lastVariantQueryRef.current) {
      return () => {
        active = false;
      };
    }
    lastVariantQueryRef.current = queryString;

    variantFromCacheRef.current = false;
    setVariantLoading(true);
    const loadVariant = async () => {
      try {
        const { data } = await axiosClient.get(
          `/api/design/variant-details-ecom?${queryString}`
        );
        if (active) {
          const response = data ?? null;
          const payload = response?.data ?? response ?? null;
          setVariantDetails(payload);
          setVariantAdjustedFilters(
            response?.adjusted_filters ??
              payload?.adjusted_filters ??
              response?.adjustedFilters ??
              payload?.adjustedFilters ??
              null
          );
          setVariantDesignAvailable(
            response?.is_design_avl ??
              payload?.is_design_avl ??
              response?.isDesignAvailable ??
              payload?.isDesignAvailable ??
              null
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
    shouldSkipVariantFetch,
    listingDesign,
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
        ""
    );
    const nextClarity = normalizeString(adjusted.clarity_id ?? adjusted.clarityId ?? "");
    const nextCarat = normalizeString(adjusted.carat ?? adjusted.carat_weight ?? adjusted.caratWeight ?? "");
    const nextMetal = normalizeString(adjusted.metal_id ?? adjusted.metalId ?? "");
    const nextKarat = normalizeString(adjusted.karat_id ?? adjusted.karatId ?? "");

    const canUseOption = (value, options, matcher) => {
      if (!value) return false;
      if (!options || !options.length) return true;
      return options.some((opt) => matcher(opt, value));
    };

    if (!hideCutSection) {
      const canUseCut = canUseOption(nextCut, cutOptions, (opt, value) => opt.id === value);
      if (nextCut && nextCut !== cut && canUseCut) {
        setCut(nextCut);
      }
    }

    const canUseQuality = canUseOption(nextQuality, qualityOptions, (opt, value) => opt.value === value);
    if (nextQuality && nextQuality !== quality && canUseQuality) {
      setQuality(nextQuality);
    }

    const canUseClarity = canUseOption(nextClarity, clarityOptions, (opt, value) => opt.value === value);
    if (nextClarity && nextClarity !== clarity && canUseClarity) {
      setClarity(nextClarity);
    }

    if (!hideCaratSection) {
      const canUseCarat = nextCarat && (!caratOptions.length || caratOptions.includes(nextCarat));
      if (nextCarat && nextCarat !== carat && canUseCarat) {
        setCarat(nextCarat);
      }
    }

    const canUseMetal = canUseOption(nextMetal, metalOptions, (opt, value) => opt.value === value);
    if (nextMetal && nextMetal !== metal && canUseMetal) {
      setMetal(nextMetal);
    }

    const metalTypeList = filteredMetalTypeOptions.length ? filteredMetalTypeOptions : metalTypeOptions;
    const canUseKarat = canUseOption(nextKarat, metalTypeList, (opt, value) => opt.value === value);
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

  // Update sessionStorage cache when variantDetails changes
  useEffect(() => {
    if (variantDetails && productId && !variantFromCacheRef.current) {
      updateCacheWithVariant(productId, variantDetails);
    }
  }, [variantDetails, productId]);

  // Check if current metal is Platinum
  const isPlatinum = useMemo(() => {
    // First check from variantDetails or productDetails if available
    const metalRate = variantEnabled
      ? variantDetails?.metal_rate
      : productDetails?.design?.metal_rate ?? productDetails?.design_variant?.metal_rate ?? productDetails?.designVariant?.metal_rate;
    const metalNameFromDetails = metalRate?.metal?.metal_name ?? "";
    if (metalNameFromDetails) {
      return normalizeString(metalNameFromDetails).toLowerCase() === "platinum";
    }
    // Fallback: check from selected metal option
    const selectedMetalOption = metalOptions.find((opt) => opt.value === metal);
    const metalNameFromOption = selectedMetalOption?.label ?? "";
    return normalizeString(metalNameFromOption).toLowerCase() === "platinum";
  }, [variantEnabled, variantDetails, productDetails, metalOptions, metal]);

  const variantPrice =
    variantDetails?.total_price ??
    variantDetails?.price ??
    variantDetails?.rate ??
    variantDetails?.metal_rate ??
    null;
  const displayPrice = variantPrice ?? (productBasePrice || null);
  const shouldShowPrice = true;

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>{productTitle}</h2>
      {/* {variantLoading ? (
        <p className={styles.variantStatus}>Updating selection...</p>
      ) : variantPrice ? (
        <p className={styles.variantStatus}>Price: {variantPrice}</p>
      ) : null} */}
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
                    setVariantEnabled(true);
                    setCut(item.id);
                  }}
                >
                  <div className={styles.cutIcon} aria-hidden>
                    <img className={styles.cutIconImage} src={item.src} alt="" />
                  </div>
                  <div className={styles.cutLabel}>{item.label}</div>
                </button>
              ))}
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        {qualityOptions.length || filteredClarityOptions.length ? (
          <>
            <div className={styles.gridFields}>
              <div className={styles.fieldTitle}>{labels.diamondQuality}</div>
              <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                {qualityOptions.length ? (
                  <div>
                    <Select
                      className={styles.select}
                      classNamePrefix="customizer"
                      instanceId={qualityId}
                      styles={qualityDropdownStyles}
                      value={qualityOptions.find((opt) => opt.value === quality) ?? null}
                      options={qualityOptions}
                      onChange={(option) => {
                        setVariantEnabled(true);
                        setQuality(option?.value ?? "");
                      }}
                      isSearchable={false}
                    />
                  </div>
                ) : null}
                {filteredClarityOptions.length ? (
                  <div>
                    <Select
                      className={styles.select}
                      classNamePrefix="customizer"
                      instanceId={clarityId}
                      styles={dropdownStyles}
                      value={filteredClarityOptions.find((opt) => opt.value === clarity) ?? null}
                      options={filteredClarityOptions}
                      onChange={(option) => {
                        setVariantEnabled(true);
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
            <div className={styles.fieldTitle}>{labels.diamondCaratWeight}</div>
            <div className={styles.pills}>
              {caratOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.pill} ${carat === value ? styles.pillActive : ""}`}
                  onClick={() => {
                    setVariantEnabled(true);
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
              {diamondDetailGroups.map((group) => (
                <div className={styles.diamondDetailGroup} key={group.cutName}>
                  <div className={styles.fieldTitle}>
                    {group.cutName} {labels.diamondCaratWeight}
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
              ))}
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

        <div className={styles.fieldTitle}>{labels.selectMetalColor}</div>
        <div className={styles.metalRow}>
          {console.log(metalOptions)}
          {metalOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.metal} ${metal === item.value ? styles.metalActive : ""}`}
              onClick={() => {
                setVariantEnabled(true);
                setMetal(item.value);
              }}
            >
              <span className={styles.dot} style={{ background: item.color }} aria-hidden />
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
                        setVariantEnabled(true);
                        setMetalType(option.value);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.divider} aria-hidden />
            </>
          ) : null}
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
        </div>
        {shouldShowPrice ? (
          <>
            <div className={styles.divider} aria-hidden />
            <div className={styles.priceBlock}>
              {/* <div className={styles.priceLabel}>{labels.price}</div> */}
              {variantLoading ? (
                <div className={styles.variantStatus}>...</div>
              ) : displayPrice ? (
                <div className={styles.priceValue}>{displayPrice}</div>
              ) : null}
              {/* <div className={styles.priceValue}>{variantPrice ?? "--"}</div> */}
            </div>
            <div className={styles.divider} aria-hidden />
          </>
        ) : null}

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

        <button className={styles.enquire} type="button" onClick={() => router.push("/appointment")}>
          {labels.enquireNow}
        </button>
      </div>
    </aside>
  );
}
