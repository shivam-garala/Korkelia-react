'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTableSuspense.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import Select from "react-select";
import TextField from "../../../components/ui/TextField.jsx";
import fieldStyles from "../../../components/ui/Fields.module.css";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import Icon from "../../../components/ui/Icon.jsx";
import { toast } from "react-toastify";
import axiosClient from "../../../lib/axiosClient.js";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  selectProductError,
  selectProductLoading,
  selectProducts,
  updateProduct,
} from "../../../store/slices/productSlice.js";
import {
  fetchCategoryDropdown,
  selectCategoryMasters,
} from "../../../store/slices/categoryMasterSlice.js";
import {
  fetchSubCategories,
  selectSubCategoryLoading,
  selectSubCategories,
} from "../../../store/slices/subCategorySlice.js";
import {
  fetchStyleMasters,
  selectStyleMasters,
} from "../../../store/slices/styleMasterSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";
import layout from "../../../styles/workspace.module.css";
import styles from "../../../styles/crudPage.module.css";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function normalizeDisplayValue(value) {
  if (value === true || value === "true" || value === 1 || value === "1") return "1";
  if (value === false || value === "false" || value === 0 || value === "0") return "0";
  if (value === null || value === undefined) return "";
  return String(value);
}

function resolveImageSrc(image) {
  if (!image) return "";
  if (typeof image === "string") {
    if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  }
  const apiBase =
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
  const cleaned = typeof image === "string" ? image : "";
  if (!apiBase || !cleaned) return cleaned;
  return `${apiBase.replace(/\/$/, "")}/${cleaned.replace(/^\//, "")}`;
}

function extractProductNames(item) {
  const list = pickValue(item, [
    "product_name_array",
    "productNameArray",
    "product_names",
    "productNames",
    "product_translations",
    "productTranslations",
  ]);
  let nameEn = "";
  let nameFi = "";

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
      const name = pickValue(entry, ["product_name", "productName", "name", "label"]);
      if (!name) return;
      if (languageId === "1" || languageName === "english") nameEn = String(name);
      if (languageId === "2" || languageName === "finnish") nameFi = String(name);
    });
  }

  const fallbackName = pickValue(item, ["product_name", "productName", "name"]);
  if (!nameEn && fallbackName) nameEn = String(fallbackName);

  return { nameEn, nameFi };
}

function buildStyleOptions(list) {
  const items = Array.isArray(list) ? list : [];
  return items
    .map((item) => {
      const id = pickValue(item, ["id", "style_id", "styleId"]);
      const label = pickValue(item, ["style_name", "styleName", "name", "label"]);
      if (id === null || id === undefined || label === null || label === undefined) return null;
      return { value: String(id), label: String(label) };
    })
    .filter(Boolean);
}

export default function ProductPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategoryMasters);
  const subCategories = useAppSelector(selectSubCategories);
  const subCategoryLoading = useAppSelector(selectSubCategoryLoading);
  const stylesList = useAppSelector(selectStyleMasters);
  const loading = useAppSelector(selectProductLoading);
  const error = useAppSelector(selectProductError);
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
  const portalTarget = typeof window !== "undefined" ? document.body : null;
  const selectMenuStyles = useMemo(
    () => ({
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }),
    []
  );

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [styleId, setStyleId] = useState("");
  const [styleName, setStyleName] = useState("");
  const [productNameEn, setProductNameEn] = useState("");
  const [productNameFi, setProductNameFi] = useState("");
  const [styleDropdownItems, setStyleDropdownItems] = useState([]);
  const [styleDropdownLoading, setStyleDropdownLoading] = useState(false);
  const [isDisplay, setIsDisplay] = useState("1");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [filters, setFilters] = useState({
    no: "",
    category: "",
    sub_category: "",
    style: "",
    is_display: "",
  });
  const fallbackImage = "/productlisting/no_image.jpg";

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(nextUrl);
    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [imageFile]);

  useEffect(() => {
    dispatch(fetchCategoryDropdown());
    dispatch(fetchSubCategories());
    dispatch(fetchStyleMasters());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    let active = true;

    if (!subCategoryId) {
      setStyleDropdownItems([]);
      setStyleDropdownLoading(false);
      return () => {
        active = false;
      };
    }

    const loadStyles = async () => {
      try {
        setStyleDropdownLoading(true);
        const { data } = await axiosClient.get(
          `/api/styleMaster/dropdown-by-subcategory?sub_category_id=${encodeURIComponent(
            subCategoryId
          )}`
        );
        const payload = data?.data ?? data;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        if (active) setStyleDropdownItems(list);
      } catch (error) {
        if (active) setStyleDropdownItems([]);
        console.error("Style dropdown load failed", error);
      } finally {
        if (active) setStyleDropdownLoading(false);
      }
    };

    loadStyles();
    return () => {
      active = false;
    };
  }, [subCategoryId]);

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "category_id", "categoryId"]);
        const label = pickValue(item, ["category_name", "categoryName", "name", "label"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { value: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [categories]);

  const subCategoryOptions = useMemo(() => {
    const list = Array.isArray(subCategories) ? subCategories : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "sub_category_id", "subCategoryId"]);
        const label = pickValue(item, ["sub_category_name", "subCategoryName", "name", "label"]);
        const parentId = pickValue(item, ["category_id", "categoryId", "category"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return {
          value: String(id),
          label: String(label),
          categoryId: parentId !== null && parentId !== undefined ? String(parentId) : "",
        };
      })
      .filter(Boolean);
  }, [subCategories]);

  const filteredSubCategoryOptions = useMemo(
    () => subCategoryOptions,
    [subCategoryOptions]
  );

  const styleOptions = useMemo(() => {
    return buildStyleOptions(stylesList);
  }, [stylesList]);

  const styleDropdownOptions = useMemo(() => {
    if (!subCategoryId) return styleOptions;
    return buildStyleOptions(styleDropdownItems);
  }, [styleDropdownItems, styleOptions, subCategoryId]);

  const displayOptions = useMemo(
    () => [
      { value: "1", label: "Yes" },
      { value: "0", label: "No" },
    ],
    []
  );

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "product_id", "productId"]) ?? index + 1;
      const productName = pickValue(item, ["product_name"]);
      const rawCategoryId = pickValue(item, ["category_id", "categoryId", "category"]);
      const rawSubCategoryId = pickValue(item, ["sub_category_id", "subCategoryId", "subCategory"]);
      const rawStyleId = pickValue(item, ["style_id", "styleId", "style"]);
      const categoryLabel =
        item?.category?.category_name ??
        item?.category?.categoryName ??
        item?.category?.name ??
        pickValue(item, ["category_name", "categoryName", "category_label", "categoryLabel", "name"]) ??
        categoryOptions.find((option) => String(option.value) === String(rawCategoryId))?.label ??
        (rawCategoryId !== null && rawCategoryId !== undefined ? String(rawCategoryId) : "-");
      const subCategoryLabel =
        item?.sub_category?.sub_category_name ??
        item?.sub_category?.subCategoryName ??
        item?.sub_category?.name ??
        pickValue(item, ["sub_category_name", "subCategoryName", "sub_category_label", "subCategoryLabel"]) ??
        subCategoryOptions.find((option) => String(option.value) === String(rawSubCategoryId))?.label ??
        (rawSubCategoryId !== null && rawSubCategoryId !== undefined ? String(rawSubCategoryId) : "-");
      const styleLabel =
        item?.style?.style_name ??
        item?.style?.styleName ??
        item?.style?.name ??
        pickValue(item, ["style_name", "styleName", "style_label", "styleLabel", "name"]) ??
        styleOptions.find((option) => String(option.value) === String(rawStyleId))?.label ??
        (rawStyleId !== null && rawStyleId !== undefined ? String(rawStyleId) : "-");
      const rawDisplay = pickValue(item, ["is_display", "isDisplay", "display", "display_status"]);
      const displayValue = normalizeDisplayValue(rawDisplay);
      const displayLabel = displayValue === "1" ? "Yes" : displayValue === "0" ? "No" : displayValue || "-";
      const imageValue = pickValue(item, ["image", "image_url", "imageUrl", "image_path", "imagePath"]);

      return {
        no: index + 1,
        id,
        product_name: productName ?? "-",
        category: categoryLabel ?? "-",
        sub_category: subCategoryLabel ?? "-",
        style: styleLabel ?? "-",
        image: imageValue ?? "-",
        is_display: displayLabel,
        _raw: item,
      };
    });
  }, [categoryOptions, items, styleOptions, subCategoryOptions]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const categoryQuery = normalize(filters.category);
    const subCategoryQuery = normalize(filters.sub_category);
    const styleQuery = normalize(filters.style);
    const displayQuery = normalize(filters.is_display);
    const productNameQuery = normalize(filters.product_name);
    if (!noQuery && !categoryQuery && !subCategoryQuery && !styleQuery && !displayQuery && !productNameQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const categoryMatches = categoryQuery ? normalize(row.category).includes(categoryQuery) : true;
      const subCategoryMatches = subCategoryQuery
        ? normalize(row.sub_category).includes(subCategoryQuery)
        : true;
      const styleMatches = styleQuery ? normalize(row.style).includes(styleQuery) : true;
      const displayMatches = displayQuery ? normalize(row.is_display).includes(displayQuery) : true;
      const productNameMatches = productNameQuery ? normalize(row.product_name).includes(productNameQuery) : true;
      return noMatches && categoryMatches && subCategoryMatches && styleMatches && displayMatches && productNameMatches;
    });
  }, [filters.category, filters.is_display, filters.no, filters.style, filters.sub_category, filters.product_name, tableRows]);


  const openCreate = () => {
    setEditingId(null);
    setCategoryId("");
    setCategoryName("");
    setSubCategoryId("");
    setSubCategoryName("");
    setStyleId("");
    setStyleName("");
    setProductNameEn("");
    setProductNameFi("");
    setIsDisplay("1");
    setImageFile(null);
    setImagePreviewUrl("");
    setExistingImageUrl("");
    setFileInputKey((prev) => prev + 1);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "product_id", "productId"]);
    const rawCategoryId = pickValue(row, ["category_id", "categoryId", "category"]);
    const rawSubCategoryId = pickValue(row, ["sub_category_id", "subCategoryId", "subCategory"]);
    const rawStyleId = pickValue(row, ["style_id", "styleId", "style"]);
    const { nameEn, nameFi } = extractProductNames(row);
    const rawImage = pickValue(row, ["image", "image_url", "imageUrl", "image_path", "imagePath"]);
    const resolvedCategoryName =
      row?.category?.category_name ??
      row?.category?.categoryName ??
      row?.category?.name ??
      pickValue(row, ["category_name", "categoryName", "name"]) ??
      categoryOptions.find((option) => String(option.value) === String(rawCategoryId))?.label ??
      "";
    const resolvedSubCategoryName =
      row?.subCategory?.sub_category_name ??
      row?.subCategory?.subCategoryName ??
      row?.subCategory?.name ??
      pickValue(row, ["sub_category_name", "subCategoryName", "name"]) ??
      subCategoryOptions.find((option) => String(option.value) === String(rawSubCategoryId))?.label ??
      "";
    const resolvedStyleName =
      row?.style?.style_name ??
      row?.style?.styleName ??
      row?.style?.name ??
      pickValue(row, ["style_name", "styleName", "name"]) ??
      styleOptions.find((option) => String(option.value) === String(rawStyleId))?.label ??
      "";
    const rawDisplay = pickValue(row, ["is_display", "isDisplay", "display", "display_status"]);

    setEditingId(rawId ?? null);
    setCategoryId(rawCategoryId !== undefined && rawCategoryId !== null ? String(rawCategoryId) : "");
    setCategoryName(resolvedCategoryName ? String(resolvedCategoryName) : "");
    setSubCategoryId(rawSubCategoryId !== undefined && rawSubCategoryId !== null ? String(rawSubCategoryId) : "");
    setSubCategoryName(resolvedSubCategoryName ? String(resolvedSubCategoryName) : "");
    setStyleId(rawStyleId !== undefined && rawStyleId !== null ? String(rawStyleId) : "");
    setStyleName(resolvedStyleName ? String(resolvedStyleName) : "");
    setProductNameEn(nameEn);
    setProductNameFi(nameFi);
    setIsDisplay(normalizeDisplayValue(rawDisplay) || "1");
    setImageFile(null);
    setImagePreviewUrl("");
    setExistingImageUrl(resolveImageSrc(rawImage));
    setFileInputKey((prev) => prev + 1);
    setModalOpen(true);
  };

  const buildPayload = () => {
    const payload = new FormData();
    if (categoryId) payload.append("category_id", categoryId);
    if (categoryName) payload.append("category_name", categoryName);
    if (subCategoryId) payload.append("sub_category_id", subCategoryId);
    if (subCategoryName) payload.append("sub_category_name", subCategoryName);
    if (styleId) payload.append("style_id", styleId);
    if (styleName) payload.append("style_name", styleName);
    if (productNameEn) {
      payload.append("product_name_array[0][product_name]", productNameEn);
      payload.append("product_name_array[0][language_id]", "1");
    }
    if (productNameFi) {
      payload.append("product_name_array[1][product_name]", productNameFi);
      payload.append("product_name_array[1][language_id]", "2");
    }
    if (imageFile) payload.append("image", imageFile);
    if (isDisplay !== "") payload.append("is_display", String(isDisplay));
    return payload;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!categoryId || !subCategoryId || !styleId) {
      toast.error("Select category, sub category, and style.");
      return;
    }

    if (!productNameEn || !productNameFi) {
      toast.error("Add product name for both languages.");
      return;
    }

    if (!editingId && !imageFile) {
      toast.error("Upload product image.");
      return;
    }

    const payload = buildPayload();

    const action = editingId ? updateProduct({ id: editingId, payload }) : createProduct(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      setImageFile(null);
      setImagePreviewUrl("");
      setExistingImageUrl("");
      setFileInputKey((prev) => prev + 1);
      dispatch(fetchProducts());
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteProduct(deleteTarget));
    dispatch(fetchProducts());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: false, filterPlaceholder: "Search No." },
    { key: "product_name", header: "Product Name", filterable: true, filterPlaceholder: "Search Product Name" },
    { key: "category", header: "Category", filterable: true, filterPlaceholder: "Search Category" },
    { key: "sub_category", header: "Sub Category", filterable: true, filterPlaceholder: "Search Sub Category" },
    { key: "style", header: "Style", filterable: true, filterPlaceholder: "Search Style" },
    { key: "is_display", header: "Display", filterable: true, filterPlaceholder: "Search Display" },
    {
      key: "actions",
      header: "Action",
      filterable: false,
      render: (row) => (
        <div className={styles.actions}>
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
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>Product</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh" iconOnly
                  onClick={() => dispatch(fetchProducts())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Product
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
        title={editingId ? "Update Product" : "Add Product"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setImageFile(null);
          setImagePreviewUrl("");
          setExistingImageUrl("");
          setFileInputKey((prev) => prev + 1);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant="primarySoft" type="submit" form="product-form" disabled={loading}>
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
                setImageFile(null);
                setImagePreviewUrl("");
                setExistingImageUrl("");
                setFileInputKey((prev) => prev + 1);
              }}
            >
              Cancel
            </Button>
          </div>
        }
      >
        {(() => {
          const previewSrc = imagePreviewUrl || existingImageUrl || fallbackImage;
          const hasLocalImage = Boolean(imagePreviewUrl);
          const hasAnyImage = hasLocalImage || Boolean(existingImageUrl);
          return (
        <form id="product-form" className={styles.form} onSubmit={submit}>
          {editingId ? (
            <>
              <div className={styles.formRow3}>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Category</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={categoryOptions.find((option) => option.value === categoryId) ?? null}
                    onChange={(option) => {
                      const nextId = option?.value ?? "";
                      const selected = categoryOptions.find((opt) => opt.value === nextId);
                      setCategoryId(nextId);
                      setCategoryName(selected?.label ?? "");
                    }}
                    isDisabled={!categoryOptions.length}
                    placeholder={categoryOptions.length ? "Select category" : "Loading categories..."}
                    options={categoryOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Sub Category</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={filteredSubCategoryOptions.find((option) => option.value === subCategoryId) ?? null}
                    onChange={(option) => {
                      const nextId = option?.value ?? "";
                      const selected = filteredSubCategoryOptions.find((opt) => opt.value === nextId);
                      setSubCategoryId(nextId);
                      setSubCategoryName(selected?.label ?? "");
                      setStyleId("");
                      setStyleName("");
                    }}
                    isDisabled={!filteredSubCategoryOptions.length}
                    placeholder={
                      subCategoryLoading
                        ? "Loading sub categories..."
                        : filteredSubCategoryOptions.length
                        ? "Select sub category"
                        : "No sub categories"
                    }
                    options={filteredSubCategoryOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Style</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={styleOptions.find((option) => option.value === styleId) ?? null}
                    onChange={(option) => {
                      const nextId = option?.value ?? "";
                      const selected = styleDropdownOptions.find((opt) => opt.value === nextId);
                      setStyleId(nextId);
                      setStyleName(selected?.label ?? "");
                    }}
                    isDisabled={
                      subCategoryId
                        ? styleDropdownLoading || !styleDropdownOptions.length
                        : !styleOptions.length
                    }
                    placeholder={
                      subCategoryId
                        ? styleDropdownLoading
                          ? "Loading styles..."
                          : styleDropdownOptions.length
                          ? "Select style"
                          : "No styles found"
                        : styleOptions.length
                        ? "Select style"
                        : "Loading styles..."
                    }
                    options={styleDropdownOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
              </div>
              <div className={styles.formRow2}>
                <TextField
                  label="Product Name (English)"
                  value={productNameEn}
                  onChange={(e) => setProductNameEn(e.target.value)}
                  required
                />
                <TextField
                  label="Product Name (Finnish)"
                  value={productNameFi}
                  onChange={(e) => setProductNameFi(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formRow3}>
                <div className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Image</span>
                  <div className={styles.mediaCard}>
                    <label
                      className={styles.mediaUploadTarget}
                      htmlFor={`product-image-${fileInputKey}`}
                    >
                      <img
                        className={`${styles.mediaThumb}${hasAnyImage ? "" : ` ${styles.mediaThumbPlaceholder}`}`}
                        src={previewSrc}
                        alt="Product preview"
                        loading="lazy"
                      />
                    </label>
                    {hasLocalImage ? (
                      <button
                        type="button"
                        className={styles.mediaDeleteButton}
                        onClick={() => {
                          setImageFile(null);
                          setImagePreviewUrl("");
                          setFileInputKey((prev) => prev + 1);
                        }}
                        aria-label="Remove image"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    ) : null}
                    <input
                      key={fileInputKey}
                      id={`product-image-${fileInputKey}`}
                      className={styles.mediaFileInput}
                      type="file"
                      accept="image/*"
                      onClick={(e) => {
                        e.currentTarget.value = null;
                      }}
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Display</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={displayOptions.find((option) => option.value === isDisplay) ?? null}
                    onChange={(option) => setIsDisplay(option?.value ?? "")}
                    options={displayOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <div className={styles.formRow3}>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Category</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={categoryOptions.find((option) => option.value === categoryId) ?? null}
                    onChange={(option) => {
                      const nextId = option?.value ?? "";
                      const selected = categoryOptions.find((opt) => opt.value === nextId);
                      setCategoryId(nextId);
                      setCategoryName(selected?.label ?? "");
                    }}
                    isDisabled={!categoryOptions.length}
                    placeholder={categoryOptions.length ? "Select category" : "Loading categories..."}
                    options={categoryOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Sub Category</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={filteredSubCategoryOptions.find((option) => option.value === subCategoryId) ?? null}
                    onChange={(option) => {
                      const nextId = option?.value ?? "";
                      const selected = filteredSubCategoryOptions.find((opt) => opt.value === nextId);
                      setSubCategoryId(nextId);
                      setSubCategoryName(selected?.label ?? "");
                      setStyleId("");
                      setStyleName("");
                    }}
                    isDisabled={!filteredSubCategoryOptions.length}
                    placeholder={
                      subCategoryLoading
                        ? "Loading sub categories..."
                        : filteredSubCategoryOptions.length
                        ? "Select sub category"
                        : "No sub categories"
                    }
                    options={filteredSubCategoryOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Style</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={styleOptions.find((option) => option.value === styleId) ?? null}
                    onChange={(option) => {
                      const nextId = option?.value ?? "";
                      const selected = styleDropdownOptions.find((opt) => opt.value === nextId);
                      setStyleId(nextId);
                      setStyleName(selected?.label ?? "");
                    }}
                    isDisabled={
                      subCategoryId
                        ? styleDropdownLoading || !styleDropdownOptions.length
                        : !styleOptions.length
                    }
                    placeholder={
                      subCategoryId
                        ? styleDropdownLoading
                          ? "Loading styles..."
                          : styleDropdownOptions.length
                          ? "Select style"
                          : "No styles found"
                        : styleOptions.length
                        ? "Select style"
                        : "Loading styles..."
                    }
                    options={styleDropdownOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
              </div>
              <div className={styles.formRow2}>
                <TextField
                  label="Product Name (English)"
                  value={productNameEn}
                  onChange={(e) => setProductNameEn(e.target.value)}
                  required
                />
                <TextField
                  label="Product Name (Finnish)"
                  value={productNameFi}
                  onChange={(e) => setProductNameFi(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formRow3}>
                <div className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Image</span>
                  <div className={styles.mediaCard}>
                    <label
                      className={styles.mediaUploadTarget}
                      htmlFor={`product-image-${fileInputKey}`}
                    >
                      <img
                        className={`${styles.mediaThumb}${hasAnyImage ? "" : ` ${styles.mediaThumbPlaceholder}`}`}
                        src={previewSrc}
                        alt="Product preview"
                        loading="lazy"
                      />
                    </label>
                    {hasLocalImage ? (
                      <button
                        type="button"
                        className={styles.mediaDeleteButton}
                        onClick={() => {
                          setImageFile(null);
                          setImagePreviewUrl("");
                          setFileInputKey((prev) => prev + 1);
                        }}
                        aria-label="Remove image"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    ) : null}
                    <input
                      key={fileInputKey}
                      id={`product-image-${fileInputKey}`}
                      className={styles.mediaFileInput}
                      type="file"
                      accept="image/*"
                      onClick={(e) => {
                        e.currentTarget.value = null;
                      }}
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
                <label className={fieldStyles.field}>
                  <span className={fieldStyles.label}>Display</span>
                  <Select
                    className={styles.select}
                    classNamePrefix="adminSelect"
                    value={displayOptions.find((option) => option.value === isDisplay) ?? null}
                    onChange={(option) => setIsDisplay(option?.value ?? "")}
                    options={displayOptions}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    styles={selectMenuStyles}
                  />
                </label>
              </div>
            </>
          )}
        </form>
          );
        })()}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message="Delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
