'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTableSuspense.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import AdminSelectField from "../../../components/ui/AdminSelectField.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import Button from "../../../components/ui/Button.jsx";
import Icon from "../../../components/ui/Icon.jsx";
import RadioGroup from "../../../components/ui/RadioGroup.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import axiosClient from "../../../lib/axiosClient.js";
import fieldStyles from "../../../components/ui/Fields.module.css";
import radioStyles from "../../../components/ui/RadioGroup.module.css";
import { toast } from "react-toastify";
import {
  createDesignVariant,
  deleteDesignVariant,
  fetchCategoryDropdown,
  fetchDesignVariant,
  fetchDesignVariants,
  fetchMetalRateDropdown,
  fetchProductDropdown,
  selectDesignVariantCategories,
  selectDesignVariantError,
  selectDesignVariantLoading,
  selectDesignVariantMetalRates,
  selectDesignVariantProducts,
  selectDesignVariants,
  updateDesignVariant,
} from "../../../store/slices/designVariantSlice.js";
import { fetchCutMasters, selectCutMasters } from "../../../store/slices/cutMasterSlice.js";
import {
  fetchDiamondRateDropdown,
  selectDiamondRates,
} from "../../../store/slices/diamondRateSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";
import layout from "../../../styles/workspace.module.css";
import crudStyles from "../../../styles/crudPage.module.css";
import styles from "./page.module.css";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function normalizeDetailList(details) {
  if (Array.isArray(details)) return details;
  if (typeof details === "string") {
    try {
      const parsed = JSON.parse(details);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function isVideoAsset(value) {
  if (!value) return false;
  return /\.(mp4|webm|mov|m4v)$/i.test(String(value));
}

function formatDetailSummary(details) {
  if (!Array.isArray(details) || !details.length) return "-";
  return details
    .map((detail) => {
      const cutCode = pickValue(detail, ["cut_code", "cutCode", "code", "cut"]);
      const diamondRateName = pickValue(detail, ["diamond_rate_name", "diamondRateName", "rate_name", "name"]);
      const pcs = pickValue(detail, ["pcs", "pieces", "diamond_pcs"]);
      return [cutCode, diamondRateName, pcs ? `x${pcs}` : null].filter(Boolean).join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

function resolveProductLabel(item) {
  const translations = pickValue(item, ["product_translations", "productTranslations", "product_name_array"]);
  if (Array.isArray(translations)) {
    const english = translations.find((entry) => {
      const languageId = String(
        pickValue(entry, ["language_id", "languageId"]) ??
          pickValue(entry?.language, ["id", "language_id", "languageId"]) ??
          ""
      );
      const languageName = String(
        pickValue(entry?.language, ["language_name", "languageName", "name"]) ?? ""
      ).toLowerCase();
      return languageId === "1" || languageName === "english";
    });
    const label =
      pickValue(english, ["product_name", "productName", "name"]) ??
      pickValue(translations[0], ["product_name", "productName", "name"]);
    if (label) return String(label);
  }

  return (
    pickValue(item, ["product_name", "productName", "name", "label"]) ??
    pickValue(item?.product, ["product_name", "productName", "name"]) ??
    ""
  );
}

function extractVariantTranslations(item) {
  const list = pickValue(item, [
    "translations",
    "design_name_array",
    "designNameArray",
    "design_names",
    "designNames",
  ]);
  let nameEn = "";
  let nameFi = "";
  let descriptionEn = "";
  let descriptionFi = "";

  if (Array.isArray(list)) {
    list.forEach((entry) => {
      const languageId = String(
        pickValue(entry, ["language_id", "languageId", "lang_id", "langId"]) ??
          pickValue(entry?.language, ["id", "language_id", "languageId", "lang_id", "langId"]) ??
          ""
      );
      const languageName = String(
        pickValue(entry?.language, ["language_name", "languageName", "name", "label"]) ?? ""
      ).toLowerCase();
      const name = pickValue(entry, [
        "design_variant_name",
        "designVariantName",
        "product_name",
        "productName",
        "name",
        "label",
      ]);
      const description = pickValue(entry, ["description", "design_description", "designDescription"]);
      if (languageId === "1" || languageName === "english") {
        if (name) nameEn = String(name);
        if (description) descriptionEn = String(description);
      }
      if (languageId === "2" || languageName === "finnish") {
        if (name) nameFi = String(name);
        if (description) descriptionFi = String(description);
      }
    });
  }

  const fallbackName = pickValue(item, [
    "design_variant_name",
    "designVariantName",
    "product_name",
    "productName",
    "name",
    "label",
  ]);
  if (!nameEn && fallbackName) nameEn = String(fallbackName);
  const fallbackDescription = pickValue(item, ["description", "design_description", "designDescription"]);
  if (!descriptionEn && fallbackDescription) descriptionEn = String(fallbackDescription);

  return { nameEn, nameFi, descriptionEn, descriptionFi };
}

export default function DesignVariantPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectDesignVariants);
  const products = useAppSelector(selectDesignVariantProducts);
  const metalRates = useAppSelector(selectDesignVariantMetalRates);
  const categories = useAppSelector(selectDesignVariantCategories);
  const cutMasters = useAppSelector(selectCutMasters);
  const diamondRates = useAppSelector(selectDiamondRates);
  const loading = useAppSelector(selectDesignVariantLoading);
  const error = useAppSelector(selectDesignVariantError);
  const userName = useAppSelector(selectUserName) ?? "Admin";
  const userEmail = useAppSelector(selectEmail) ?? "";
  const avatarInitials = useMemo(() => {
    const normalizedName = (userName ?? "").trim();
    if (normalizedName.length) {
      return normalizedName
        .split(" ")
        .map((part) => part.trim()?.[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    const normalizedEmail = (userEmail ?? "").trim();
    if (normalizedEmail.length) {
      const firstChar = normalizedEmail[0];
      const domainChar = normalizedEmail.split("@")[1]?.[0];
      return [firstChar, domainChar].filter(Boolean).join("").slice(0, 2).toUpperCase() || "U";
    }
    return "U";
  }, [userEmail, userName]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [metalRateId, setMetalRateId] = useState("");
  const [metalRateName, setMetalRateName] = useState("");
  const [weight, setWeight] = useState("");
  const [markUp, setMarkUp] = useState("");
  const [priceFlag, setPriceFlag] = useState("no");
  const [designNameEn, setDesignNameEn] = useState("");
  const [designNameFi, setDesignNameFi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionFi, setDescriptionFi] = useState("");
  const [detailRows, setDetailRows] = useState([]);
  const [imageFiles, setImageFiles] = useState(() => Array(4).fill(null));
  const [localImageUrls, setLocalImageUrls] = useState(() => Array(4).fill(""));
  const [videoFile, setVideoFile] = useState(null);
  const [localVideoUrl, setLocalVideoUrl] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [listingSelection, setListingSelection] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [imageDeletingId, setImageDeletingId] = useState(null);
  const [imageDeleteTarget, setImageDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({
    no: "",
    product: "",
    metal_rate: "",
    weight: "",
    mark_up: "",
    price: "",
  });
  const fallbackImage = "/productlisting/no_image.jpg";

  useEffect(() => {
    dispatch(fetchDesignVariants());
    dispatch(fetchProductDropdown());
    dispatch(fetchMetalRateDropdown());
    dispatch(fetchCategoryDropdown());
    dispatch(fetchCutMasters());
    dispatch(fetchDiamondRateDropdown());
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "category_id", "categoryId"]);
        const label = pickValue(item, ["category_name", "categoryName", "name", "label"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [categories]);

  const productOptions = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "product_id", "productId"]);
        const label = resolveProductLabel(item);
        const catId = pickValue(item, ["category_id", "categoryId", "category_master_id", "categoryMasterId"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id: String(id), label: String(label), categoryId: catId ?? "" };
      })
      .filter(Boolean);
  }, [products]);

  const filteredProductOptions = useMemo(() => {
    if (!categoryId) return productOptions;
    return productOptions.filter((opt) => String(opt.categoryId) === String(categoryId));
  }, [categoryId, productOptions]);

  const metalRateOptions = useMemo(() => {
    const list = Array.isArray(metalRates) ? metalRates : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "metal_rate_id", "metalRateId"]);
        const label = pickValue(item, ["metal_rate_name", "metalRateName", "name", "label"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [metalRates]);

  const cutOptions = useMemo(() => {
    const list = Array.isArray(cutMasters) ? cutMasters : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "cut_id", "cutId"]);
        const code = pickValue(item, ["cut_code", "cutCode", "code"]);
        const name = pickValue(item, ["cut_name", "cutName", "name"]);
        const label = code ?? name;
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id: String(id), label: String(label), code: code ?? label };
      })
      .filter(Boolean);
  }, [cutMasters]);

  const diamondRateOptions = useMemo(() => {
    const list = Array.isArray(diamondRates) ? diamondRates : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "diamond_rate_id", "diamondRateId"]);
        const label = pickValue(item, [
          "diamond_rate_name",
          "diamondRateName",
          "rate_name",
          "name",
          "label",
        ]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [diamondRates]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "design_id", "designId"]) ?? index + 1;
      const rawProductId = pickValue(item, ["product_id", "productId"]);
      const rawMetalRateId = pickValue(item, ["metal_rate_id", "metalRateId"]);
      const productLabel =
        pickValue(item, ["product_name", "productName"]) ??
        productOptions.find((opt) => String(opt.id) === String(rawProductId))?.label ??
        (rawProductId !== null && rawProductId !== undefined ? String(rawProductId) : "-");
      const metalRateLabel =
        pickValue(item, ["metal_rate_name", "metalRateName"]) ??
        metalRateOptions.find((opt) => String(opt.id) === String(rawMetalRateId))?.label ??
        (rawMetalRateId !== null && rawMetalRateId !== undefined ? String(rawMetalRateId) : "-");
      const priceValue = pickValue(item, ["total_price", "totalPrice"]);
      const detailList = normalizeDetailList(
        pickValue(item, ["diamond_design_detail", "diamond_design_details", "diamond_details"]) ??
          item?.diamond_design_detail
      );

      return {
        no: index + 1,
        id,
        product: productLabel ?? "-",
        metal_rate: metalRateLabel ?? "-",
        weight: pickValue(item, ["weight"]) ?? "-",
        mark_up: pickValue(item, ["mark_up", "markUp"]) ?? "-",
        price: priceValue ?? "-",
        details: formatDetailSummary(detailList),
        _raw: item,
      };
    });
  }, [items, metalRateOptions, productOptions]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const productQuery = normalize(filters.product);
    const metalRateQuery = normalize(filters.metal_rate);
    const weightQuery = normalize(filters.weight);
    const markUpQuery = normalize(filters.mark_up);
    const priceQuery = normalize(filters.price);
    if (
      !noQuery &&
      !productQuery &&
      !metalRateQuery &&
      !weightQuery &&
      !markUpQuery &&
      !priceQuery
    ) {
      return tableRows;
    }

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const productMatches = productQuery ? normalize(row.product).includes(productQuery) : true;
      const metalRateMatches = metalRateQuery ? normalize(row.metal_rate).includes(metalRateQuery) : true;
      const weightMatches = weightQuery ? normalize(row.weight).includes(weightQuery) : true;
      const markUpMatches = markUpQuery ? normalize(row.mark_up).includes(markUpQuery) : true;
      const priceMatches = priceQuery ? normalize(row.price).includes(priceQuery) : true;
      return noMatches && productMatches && metalRateMatches && weightMatches && markUpMatches && priceMatches;
    });
  }, [
    filters.mark_up,
    filters.metal_rate,
    filters.no,
    filters.price,
    filters.product,
    filters.weight,
    tableRows,
  ]);

  const openCreate = () => {
    setEditingId(null);
    setImageModalOpen(false);
    setCategoryId("");
    setProductId("");
    setProductName("");
    setMetalRateId("");
    setMetalRateName("");
    setWeight("");
    setMarkUp("");
    setPriceFlag("no");
    setDesignNameEn("");
    setDesignNameFi("");
    setDescriptionEn("");
    setDescriptionFi("");
    setDetailRows([]);
    setImageFiles(Array(4).fill(null));
    setVideoFile(null);
    setExistingImages([]);
    setListingSelection("");
    setFileInputKey((prev) => prev + 1);
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    const rawId = pickValue(row, ["id", "design_id", "designId"]);
    if (!rawId) return;

    setImageModalOpen(false);

    const result = await dispatch(fetchDesignVariant(rawId));
    const response = result?.payload?.data ?? result?.payload ?? null;
    const source =
      response && typeof response === "object"
        ? response?.data ?? response
        : row;

    const rawProductId = pickValue(source, ["product_id", "productId"]);
    const rawProductName = pickValue(source, ["product_name", "productName"]);
    const rawMetalRateId = pickValue(source, ["metal_rate_id", "metalRateId"]);
    const rawMetalRateName = pickValue(source, ["metal_rate_name", "metalRateName"]);
    const rawCategoryId = pickValue(source, ["category_id", "categoryId", "category_master_id"]);
    const detailList = normalizeDetailList(
      pickValue(source, ["diamond_design_detail", "diamond_design_details", "diamond_details"]) ??
        source?.diamond_design_detail
    );
    const imageList = normalizeDetailList(
      pickValue(source, ["images", "design_images", "designImages", "designImagesList"]) ??
        source?.images
    );
    let nextListingSelection = "";
    if (Array.isArray(imageList)) {
      const listingItem = imageList.find(
        (img) => Number(pickValue(img, ["is_product_listing", "isProductListing"]) ?? 0) === 1
      );
      if (listingItem) {
        const listingSrc =
          pickValue(listingItem, ["image_url", "url", "src"]) ??
          pickValue(listingItem, ["image", "file_name", "filename"]);
        if (isVideoAsset(listingSrc)) {
          nextListingSelection = "video";
        } else {
          const orderValue = Number(pickValue(listingItem, ["order", "sort_order"]));
          const slotIndex = Number.isFinite(orderValue) ? orderValue - 1 : -1;
          if (slotIndex >= 0 && slotIndex < 4) {
            nextListingSelection = `image-${slotIndex}`;
          }
        }
      }
    }
    const {
      nameEn: nextDesignNameEn,
      nameFi: nextDesignNameFi,
      descriptionEn: nextDescriptionEn,
      descriptionFi: nextDescriptionFi,
    } = extractVariantTranslations(source);

    setEditingId(rawId ?? null);
    setCategoryId(rawCategoryId !== null && rawCategoryId !== undefined ? String(rawCategoryId) : "");
    setProductId(rawProductId !== null && rawProductId !== undefined ? String(rawProductId) : "");
    setProductName(rawProductName ? String(rawProductName) : "");
    setMetalRateId(rawMetalRateId !== null && rawMetalRateId !== undefined ? String(rawMetalRateId) : "");
    setMetalRateName(rawMetalRateName ? String(rawMetalRateName) : "");
    setWeight(String(pickValue(source, ["weight"]) ?? ""));
    setMarkUp(String(pickValue(source, ["mark_up", "markUp"]) ?? ""));
    const rawPriceFlag = pickValue(source, ["price_flag", "priceFlag", "purchase_flag", "purchaseFlag", "is_purchase", "isPurchase"]);
    const priceFlagValue = rawPriceFlag === 1 || rawPriceFlag === "1" || String(rawPriceFlag).toLowerCase() === "yes" ? "yes" : "no";
    setPriceFlag(priceFlagValue);
    setDesignNameEn(nextDesignNameEn);
    setDesignNameFi(nextDesignNameFi);
    setDescriptionEn(nextDescriptionEn);
    setDescriptionFi(nextDescriptionFi);
    setDetailRows(
      detailList.map((detail, idx) => {
        const rawIsCenter = pickValue(detail, ["is_center", "isCenter"]);
        const isCenterValue = rawIsCenter === 1 || rawIsCenter === "1" ? "1" : "0";
        return {
          key: `${Date.now()}-${idx}`,
          id: pickValue(detail, ["id", "detail_id", "diamond_design_detail_id"]) ?? null,
          cutId: String(pickValue(detail, ["cut_id", "cutId"]) ?? ""),
          cutCode: String(pickValue(detail, ["cut_code", "cutCode", "code"]) ?? ""),
          cutName: String(pickValue(detail, ["cut_name", "cutName", "name"]) ?? ""),
          diamondRateId: String(pickValue(detail, ["diamond_rate_id", "diamondRateId"]) ?? ""),
          diamondRateName: String(
            pickValue(detail, ["diamond_rate_name", "diamondRateName", "rate_name", "name"]) ?? ""
          ),
          pcs: String(pickValue(detail, ["pcs", "pieces", "diamond_pcs"]) ?? ""),
          isCenter: isCenterValue,
        };
      })
    );
    setImageFiles(Array(4).fill(null));
    setVideoFile(null);
    setExistingImages(
      Array.isArray(imageList)
        ? imageList.map((img, idx) => {
            const imageUrl = pickValue(img, ["image_url", "url", "src"]) ?? null;
            const imageName = pickValue(img, ["image", "file_name", "filename"]) ?? null;
            return {
              id: pickValue(img, ["id", "image_id"]) ?? null,
              image: imageName,
              image_url: imageUrl,
              order: pickValue(img, ["order", "sort_order"]) ?? idx + 1,
              is_product_listing: pickValue(img, ["is_product_listing", "isProductListing"]) ?? 0,
              isVideo: isVideoAsset(imageUrl ?? imageName),
            };
          })
        : []
    );
    setListingSelection(nextListingSelection);
    setFileInputKey((prev) => prev + 1);
    setModalOpen(true);
  };

  const addDetailRow = () => {
    setDetailRows((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        id: null,
        cutId: "",
        cutCode: "",
        cutName: "",
        diamondRateId: "",
        diamondRateName: "",
        pcs: "",
        isCenter: "0",
      },
    ]);
  };

  const updateImageFile = useCallback((index, file) => {
    setImageFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  }, []);

  const updateVideoFile = useCallback((file) => {
    setVideoFile(file);
  }, []);

  useEffect(() => {
    const nextUrls = imageFiles.map((file) => (file ? URL.createObjectURL(file) : ""));
    setLocalImageUrls(nextUrls);
    return () => {
      nextUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageFiles]);

  useEffect(() => {
    if (!videoFile) {
      setLocalVideoUrl("");
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setLocalVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const handleDeleteImage = useCallback(
    async (image) => {
      const imageId = image?.id ?? null;
      if (!imageId) return;
      const stringId = String(imageId);
      if (imageDeletingId === stringId) return;
      try {
        setImageDeletingId(stringId);
        await axiosClient.delete(`/api/design/delete-image/${stringId}`);
        setExistingImages((prev) =>
          prev.filter((item) => String(item?.id ?? "") !== stringId)
        );
        setListingSelection((prev) => {
          if (image?.isVideo && prev === "video") return "";
          const orderValue = Number(image?.order);
          const slotIndex = Number.isFinite(orderValue) ? orderValue - 1 : -1;
          if (slotIndex >= 0 && slotIndex < 4) {
            const slotKey = `image-${slotIndex}`;
            if (prev === slotKey) return "";
          }
          return prev;
        });
      } catch (error) {
        toast.error("Delete failed. Please try again.");
        console.error("Delete image failed", error);
      } finally {
        setImageDeletingId(null);
        setImageDeleteTarget(null);
      }
    },
    [imageDeletingId]
  );

  const requestImageDelete = useCallback((image) => {
    if (!image?.id) return;
    setImageDeleteTarget(image);
  }, []);

  const previewSlots = useMemo(() => {
    const slots = Array(4).fill(null);
    const list = Array.isArray(existingImages) ? existingImages : [];
    list.forEach((img, index) => {
      if (img?.isVideo) return;
      const orderValue = Number(img?.order);
      const slotIndex = Number.isFinite(orderValue) ? orderValue - 1 : -1;
      if (slotIndex >= 0 && slotIndex < 4 && !slots[slotIndex]) {
        slots[slotIndex] = img;
      }
      if (slotIndex < 0 && index < 4 && !slots[index]) {
        slots[index] = img;
      }
    });
    return slots;
  }, [existingImages]);

  const previewVideo = useMemo(() => {
    const list = Array.isArray(existingImages) ? existingImages : [];
    return list.find((img) => img?.isVideo) ?? null;
  }, [existingImages]);

  const handleRemoveLocalImage = useCallback(
    (index) => {
      setImageFiles((prev) => {
        if (!prev[index]) return prev;
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setListingSelection((prev) => {
        if (prev !== `image-${index}`) return prev;
        if (previewSlots[index]?.image_url) return prev;
        return "";
      });
      setFileInputKey((prev) => prev + 1);
    },
    [previewSlots]
  );

  const handleRemoveLocalVideo = useCallback(() => {
    if (!videoFile) return;
    setVideoFile(null);
    setListingSelection((prev) => {
      if (prev !== "video") return prev;
      if (previewVideo?.image_url) return prev;
      return "";
    });
    setFileInputKey((prev) => prev + 1);
  }, [previewVideo, videoFile]);

  const updateDetailRow = (key, updates) => {
    setDetailRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...updates } : row))
    );
  };

  const removeDetailRow = (key) => {
    setDetailRows((prev) => prev.filter((row) => row.key !== key));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!productId || !metalRateId) {
      toast.error("Select product and metal rate.");
      return;
    }

    if (!designNameEn || !designNameFi) {
      toast.error("Add design variant name for both languages.");
      return;
    }

    if (!descriptionEn || !descriptionFi) {
      toast.error("Add description for both languages.");
      return;
    }

    const missingDetails = detailRows.some(
      (row) => !row.cutId || !row.diamondRateId || !row.pcs
    );
    if (missingDetails) {
      toast.error("Fill cut, diamond rate, and pcs for each detail row.");
      return;
    }

    const selectedProduct = productOptions.find((opt) => opt.id === productId);
    const selectedMetalRate = metalRateOptions.find((opt) => opt.id === metalRateId);
    const detailPayload = detailRows.map((row) => {
      const cutOption = cutOptions.find((opt) => opt.id === row.cutId);
      const diamondOption = diamondRateOptions.find((opt) => opt.id === row.diamondRateId);
      const detail = {
        cut_id: row.cutId,
        cut_code: row.cutCode || cutOption?.code || cutOption?.label || "",
        cut_name: row.cutName || cutOption?.label || "",
        diamond_rate_id: row.diamondRateId,
        diamond_rate_name: row.diamondRateName || diamondOption?.label || "",
        pcs: row.pcs,
        is_center: row.isCenter === "1" ? 1 : 0,
      };
      if (row.id) detail.id = row.id;
      return detail;
    });

    const payload = new FormData();
    payload.append("product_id", productId);
    payload.append("product_name", productName || selectedProduct?.label || "");
    payload.append("metal_rate_id", metalRateId);
    payload.append("metal_rate_name", metalRateName || selectedMetalRate?.label || "");
    if (weight !== "") payload.append("weight", String(weight));
    if (markUp !== "") payload.append("mark_up", String(markUp));
    payload.append("price_flag", priceFlag === "yes" ? "1" : "0");
    if (descriptionEn) payload.append("description", descriptionEn);
    if (designNameEn) {
      payload.append("design_name_array[0][design_variant_name]", designNameEn);
      payload.append("design_name_array[0][product_name]", designNameEn);
      payload.append("design_name_array[0][description]", descriptionEn);
      payload.append("design_name_array[0][language_id]", "1");
    }
    if (designNameFi) {
      payload.append("design_name_array[1][design_variant_name]", designNameFi);
      payload.append("design_name_array[1][product_name]", designNameFi);
      payload.append("design_name_array[1][description]", descriptionFi);
      payload.append("design_name_array[1][language_id]", "2");
    }
    payload.append("diamond_design_detail", JSON.stringify(detailPayload));
    const designImages = [];
    imageFiles.forEach((file, index) => {
      if (!file) return;
      designImages.push({
        image: file.name,
        order: index + 1,
        is_product_listing: listingSelection === `image-${index}` ? 1 : 0,
      });
    });
    if (editingId) {
      previewSlots.forEach((slot, index) => {
        if (!slot || imageFiles[index]) return;
        const imageName = slot?.image ?? "";
        if (!imageName) return;
        const existingPayload = {
          image: imageName,
          order: index + 1,
          is_product_listing: listingSelection === `image-${index}` ? 1 : 0,
        };
        if (slot?.id) existingPayload.id = slot.id;
        designImages.push(existingPayload);
      });
    }
    if (videoFile) {
      designImages.push({
        image: videoFile.name,
        order: 5,
        is_product_listing: listingSelection === "video" ? 1 : 0,
      });
    }
    if (editingId && previewVideo && !videoFile) {
      const videoName = previewVideo?.image ?? "";
      if (videoName) {
        const existingVideoPayload = {
          image: videoName,
          order: 5,
          is_product_listing: listingSelection === "video" ? 1 : 0,
        };
        if (previewVideo?.id) existingVideoPayload.id = previewVideo.id;
        designImages.push(existingVideoPayload);
      }
    }
    if (designImages.length) {
      payload.append("design_images", JSON.stringify(designImages));
    }
    if (videoFile) {
      payload.append("images", videoFile);
    }
    imageFiles.filter(Boolean).forEach((file) => payload.append("images", file));

    const action = editingId
      ? updateDesignVariant({ id: editingId, payload })
      : createDesignVariant(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      setImageFiles([]);
      setFileInputKey((prev) => prev + 1);
      dispatch(fetchDesignVariants());
    }
  };

  const handleDelete = (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteDesignVariant(deleteTarget));
    dispatch(fetchDesignVariants());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "product", header: "Product", filterable: true, filterPlaceholder: "Search Product" },
    { key: "metal_rate", header: "Metal Rate", filterable: true, filterPlaceholder: "Search Metal Rate" },
    { key: "weight", header: "Weight", filterable: true, filterPlaceholder: "Search Weight" },
    { key: "mark_up", header: "Mark Up", filterable: true, filterPlaceholder: "Search Mark Up" },
    { key: "price", header: "Price", filterable: true, filterPlaceholder: "Search Price" },
    { key: "details", header: "Diamond Detail", filterable: false },
    {
      key: "actions",
      header: "Action",
      filterable: false,
      render: (row) => (
        <div className={crudStyles.actions}>
          <Button variant="ghost" size="sm" icon="edit" iconOnly onClick={() => openEdit(row._raw)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon="delete" iconOnly onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={layout.page}>
      <SidebarNav activePath={pathname} />
      <div className={layout.main}>
        <AdminHeader
          onSearch={() => setSearchOpen(true)}
          onProfile={() => setProfileOpen(true)}
          avatarText={avatarInitials}
        />

        <main className={layout.content}>
          <div className={crudStyles.panel}>
            <div className={crudStyles.headerRow}>
              <h2 className={crudStyles.title}>Design Variant</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh"
                  iconOnly
                  onClick={() => dispatch(fetchDesignVariants())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Design Variant
                </Button>
              </div>
            </div>


            <DataTable
              columns={columns}
              rows={filteredRows}
              getRowKey={(row) => row.id}
              filters={filters}
              onFiltersChange={setFilters}
              emptyMessage={loading ? "Loading..." : "No records found"}
            />
          </div>
        </main>
      </div>

      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        name={userName}
        email={userEmail}
        onLogout={async () => {
          try {
            await fetch("/api/admin/logout", { method: "POST" });
          } catch (error) {
            console.error("Logout error", error);
          }
          dispatch(clearCredentials());
          router.push("/login");
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Modal
        open={modalOpen}
        title={editingId ? "Update Design Variant" : "Add Design Variant"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setImageModalOpen(false);
        }}
        footer={
          <div className={crudStyles.formActions}>
            <Button variant="primarySoft" type="submit" form="design-variant-form" disabled={loading}>
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
                setImageModalOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <form id="design-variant-form" className={crudStyles.form} onSubmit={submit}>
          <div className={crudStyles.formRow2}>
            {/* <AdminSelectField
              label="Category"
              value={categoryId}
              onChange={(e) => {
                const nextId = e.target.value;
                setCategoryId(nextId);
                setProductId("");
                setProductName("");
              }}
              disabled={!categoryOptions.length}
              placeholder={categoryOptions.length ? "Select category" : "Loading categories..."}
              options={categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            /> */}
            <AdminSelectField
              label="Product"
              value={productId}
              onChange={(e) => {
                const nextId = e.target.value;
                const selected = filteredProductOptions.find((opt) => opt.id === nextId);
                setProductId(nextId);
                setProductName(selected?.label ?? "");
              }}
              required
              disabled={!filteredProductOptions.length}
              placeholder={filteredProductOptions.length ? "Select product" : "Loading products..."}
              options={filteredProductOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
            <AdminSelectField
              label="Metal Rate"
              value={metalRateId}
              onChange={(e) => {
                const nextId = e.target.value;
                const selected = metalRateOptions.find((opt) => opt.id === nextId);
                setMetalRateId(nextId);
                setMetalRateName(selected?.label ?? "");
              }}
              required
              disabled={!metalRateOptions.length}
              placeholder={metalRateOptions.length ? "Select metal rate" : "Loading metal rates..."}
              options={metalRateOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
          </div>

          <div className={crudStyles.formRow2}>
            <TextField
              label="Weight"
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              preventWheel
            />
            <TextField
              label="Mark Up"
              type="number"
              step="0.01"
              value={markUp}
              onChange={(e) => setMarkUp(e.target.value)}
              required
              preventWheel
            />
          </div>
          <div className={styles.priceFlagRow}>
            <RadioGroup
              label="Price Flag"
              name="price-flag"
              value={priceFlag}
              onChange={setPriceFlag}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </div>
          <div className={crudStyles.formRow2}>
            <TextField
              label="Design Variant Name (English)"
              value={designNameEn}
              onChange={(e) => setDesignNameEn(e.target.value)}
              required
            />
            <TextField
              label="Design Variant Name (Finnish)"
              value={designNameFi}
              onChange={(e) => setDesignNameFi(e.target.value)}
              required
            />
          </div>
          <div className={crudStyles.formRow2}>
            <TextField
              label="Description (English)"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              required
            />
            <TextField
              label="Description (Finnish)"
              value={descriptionFi}
              onChange={(e) => setDescriptionFi(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.mediaManagerRow}>
              <div className={styles.mediaManagerCopy}>
                <div className={styles.mediaManagerTitle}>Design Images</div>
                <div className={styles.mediaManagerHint}>
                  Upload images and choose one as the listing image.
                </div>
              </div>
              <Button variant="secondary" type="button" onClick={() => setImageModalOpen(true)}>
                Upload Images
              </Button>
            </div>
          </div>

          <div className={styles.detailHeaderRow}>
            <div className={styles.detailHeader}>Diamond Details</div>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              className={styles.detailAddButton}
              onClick={addDetailRow}
            >
              Add Diamond Detail
            </Button>
          </div>
          <div className={styles.detailList}>
            <div className={`${styles.detailRow} ${styles.detailRowHeader}`}>
              <span>Cut</span>
              <span>Diamond Rate</span>
              <span>Pcs</span>
              <span>Type</span>
              <span />
            </div>
            {detailRows.map((row) => (
              <div key={row.key} className={styles.detailRow}>
                <AdminSelectField
                  label=""
                  value={row.cutId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const selected = cutOptions.find((opt) => opt.id === nextId);
                    updateDetailRow(row.key, {
                      cutId: nextId,
                      cutCode: selected?.code ?? "",
                      cutName: selected?.label ?? "",
                    });
                  }}
                  required
                  disabled={!cutOptions.length}
                  placeholder={cutOptions.length ? "Select cut" : "Loading cuts..."}
                  options={cutOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
                />
                <AdminSelectField
                  label=""
                  value={row.diamondRateId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const selected = diamondRateOptions.find((opt) => opt.id === nextId);
                    updateDetailRow(row.key, {
                      diamondRateId: nextId,
                      diamondRateName: selected?.label ?? "",
                    });
                  }}
                  required
                  disabled={!diamondRateOptions.length}
                  placeholder={diamondRateOptions.length ? "Select diamond rate" : "Loading diamond rates..."}
                  options={diamondRateOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
                />
                <TextField
                  label=""
                  type="number"
                  step="1"
                  value={row.pcs}
                  onChange={(e) => updateDetailRow(row.key, { pcs: e.target.value })}
                  required
                  preventWheel
                />
                <AdminSelectField
                  label=""
                  value={row.isCenter}
                  onChange={(e) => updateDetailRow(row.key, { isCenter: e.target.value })}
                  required
                  placeholder="Select type"
                  options={[
                    { value: "0", label: "Other" },
                    { value: "1", label: "Center" },
                  ]}
                />
                <div className={styles.rowActions}>
                  <Button
                    variant="danger"
                    size="sm"
                    icon="delete"
                    iconOnly
                    type="button"
                    onClick={() => removeDetailRow(row.key)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>
      <Modal
        open={imageModalOpen}
        title="Design Images"
        onClose={() => setImageModalOpen(false)}
        bodyClassName={styles.imageModalBody}
        footer={
          <div className={crudStyles.formActions}>
            <Button variant="secondary" type="button" onClick={() => setImageModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className={styles.imageGrid}>
          {[0, 1, 2, 3].map((index) => {
            const localUrl = localImageUrls[index];
            const existing = previewSlots[index];
            const previewSrc = localUrl || existing?.image_url || fallbackImage;
            const hasExisting = Boolean(existing?.image_url);
            const hasLocal = Boolean(localUrl);
            const hasAny = hasExisting || hasLocal;
            const isSelected = listingSelection === `image-${index}`;
            const isDeleting = existing?.id && imageDeletingId === String(existing.id);
            const allowListing = hasAny;
            return (
              <div
                key={`preview-slot-${index}`}
                className={`${styles.imageCard}${isSelected ? ` ${styles.imageCardSelected}` : ""}`}
              >
                {hasLocal || existing?.id ? (
                  <button
                    type="button"
                    className={styles.imageDeleteButton}
                    onClick={() => {
                      if (hasLocal) {
                        handleRemoveLocalImage(index);
                        return;
                      }
                      requestImageDelete(existing);
                    }}
                    disabled={isDeleting}
                    aria-label={`Delete image ${index + 1}`}
                  >
                    <Icon name="delete" size={16} />
                  </button>
                ) : null}
                <label
                  className={[
                    styles.imageUploadTarget,
                    index < 2 ? styles.ratioTwoThree : styles.ratioTwoTwo,
                  ].join(" ")}
                  htmlFor={`image-slot-${index}-${fileInputKey}`}
                >
                  <img
                    className={`${styles.imageThumb}${hasAny ? "" : ` ${styles.imageThumbPlaceholder}`}`}
                    src={previewSrc}
                    alt={`Preview ${index + 1}`}
                    loading="lazy"
                  />
                </label>
                <div className={styles.imageActions}>
                  <input
                    key={`image-slot-${index}-${fileInputKey}`}
                    id={`image-slot-${index}-${fileInputKey}`}
                    className={styles.imageFileInput}
                    type="file"
                    accept="image/*"
                    onClick={(e) => {
                      e.currentTarget.value = null;
                    }}
                    onChange={(e) => updateImageFile(index, e.target.files?.[0] ?? null)}
                  />
                </div>
                <label
                  className={[
                    radioStyles.option,
                    styles.listingOption,
                    styles.listingOverlay,
                    styles.listingInline,
                    isSelected ? radioStyles.optionChecked : "",
                    !allowListing ? styles.listingDisabled : "",
                  ].join(" ")}
                >
                  <input
                    className={radioStyles.input}
                    type="radio"
                    name="listing-media"
                    checked={isSelected}
                    disabled={!allowListing}
                    onChange={() => setListingSelection(`image-${index}`)}
                  />
                  <span
                    className={[radioStyles.indicator, styles.listingIndicator].join(" ")}
                    aria-hidden
                  />
                  <span className={[radioStyles.text, styles.listingText].join(" ")}>
                    Set as listing
                  </span>
                </label>
              </div>
            );
          })}
          {(() => {
            const videoSrc = localVideoUrl || previewVideo?.image_url || "";
            const hasVideo = Boolean(videoSrc);
            const isSelected = listingSelection === "video";
            const isDeleting =
              previewVideo?.id && imageDeletingId === String(previewVideo.id);
            return (
              <div
                className={`${styles.imageCard} ${styles.imageCardWide}${
                  isSelected ? ` ${styles.imageCardSelected}` : ""
                }`}
              >
                {videoFile || previewVideo?.id ? (
                  <button
                    type="button"
                    className={styles.imageDeleteButton}
                    onClick={() => {
                      if (videoFile) {
                        handleRemoveLocalVideo();
                        return;
                      }
                      requestImageDelete(previewVideo);
                    }}
                    disabled={isDeleting}
                    aria-label="Delete video"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                ) : null}
                <label
                  className={[styles.imageUploadTarget, styles.ratioOneTwo].join(" ")}
                  htmlFor={`video-slot-${fileInputKey}`}
                >
                  {hasVideo ? (
                    <video className={styles.videoThumb}>
                      <source src={videoSrc} />
                    </video>
                  ) : (
                    <img
                      className={`${styles.imageThumb} ${styles.imageThumbPlaceholder}`}
                      src={fallbackImage}
                      alt="Video placeholder"
                      loading="lazy"
                    />
                  )}
                </label>
                <div className={styles.imageActions}>
                  <input
                    key={`video-slot-${fileInputKey}`}
                    id={`video-slot-${fileInputKey}`}
                    className={styles.imageFileInput}
                    type="file"
                    accept="video/*"
                    onClick={(e) => {
                      e.currentTarget.value = null;
                    }}
                    onChange={(e) => updateVideoFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <label
                  className={[
                    radioStyles.option,
                    styles.listingOption,
                    styles.listingOverlay,
                    styles.listingInline,
                    isSelected ? radioStyles.optionChecked : "",
                    !hasVideo ? styles.listingDisabled : "",
                  ].join(" ")}
                >
                  <input
                    className={radioStyles.input}
                    type="radio"
                    name="listing-media"
                    checked={isSelected}
                    disabled={!hasVideo}
                    onChange={() => setListingSelection("video")}
                  />
                  <span
                    className={[radioStyles.indicator, styles.listingIndicator].join(" ")}
                    aria-hidden
                  />
                  <span className={[radioStyles.text, styles.listingText].join(" ")}>
                    Set as listing
                  </span>
                </label>
              </div>
            );
          })()}
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Design Variant"
        message="Delete this design variant? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={Boolean(imageDeleteTarget)}
        title="Delete Image"
        message="Delete this image? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDeleteImage(imageDeleteTarget)}
        onClose={() => setImageDeleteTarget(null)}
      />
    </div>
  );
}
