'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import AdminSelectField from "../../../components/ui/AdminSelectField.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import fieldStyles from "../../../components/ui/Fields.module.css";
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
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [metalRateId, setMetalRateId] = useState("");
  const [metalRateName, setMetalRateName] = useState("");
  const [weight, setWeight] = useState("");
  const [markUp, setMarkUp] = useState("");
  const [designNameEn, setDesignNameEn] = useState("");
  const [designNameFi, setDesignNameFi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionFi, setDescriptionFi] = useState("");
  const [detailRows, setDetailRows] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [filters, setFilters] = useState({
    no: "",
    product: "",
    metal_rate: "",
    weight: "",
    mark_up: "",
  });

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
    if (!noQuery && !productQuery && !metalRateQuery && !weightQuery && !markUpQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const productMatches = productQuery ? normalize(row.product).includes(productQuery) : true;
      const metalRateMatches = metalRateQuery ? normalize(row.metal_rate).includes(metalRateQuery) : true;
      const weightMatches = weightQuery ? normalize(row.weight).includes(weightQuery) : true;
      const markUpMatches = markUpQuery ? normalize(row.mark_up).includes(markUpQuery) : true;
      return noMatches && productMatches && metalRateMatches && weightMatches && markUpMatches;
    });
  }, [filters.mark_up, filters.metal_rate, filters.no, filters.product, filters.weight, tableRows]);

  const openCreate = () => {
    setEditingId(null);
    setCategoryId("");
    setProductId("");
    setProductName("");
    setMetalRateId("");
    setMetalRateName("");
    setWeight("");
    setMarkUp("");
    setDesignNameEn("");
    setDesignNameFi("");
    setDescriptionEn("");
    setDescriptionFi("");
    setDetailRows([]);
    setImageFiles([]);
    setFileInputKey((prev) => prev + 1);
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    const rawId = pickValue(row, ["id", "design_id", "designId"]);
    if (!rawId) return;

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
    setDesignNameEn(nextDesignNameEn);
    setDesignNameFi(nextDesignNameFi);
    setDescriptionEn(nextDescriptionEn);
    setDescriptionFi(nextDescriptionFi);
    setDetailRows(
      detailList.map((detail, idx) => ({
        key: `${Date.now()}-${idx}`,
        cutId: String(pickValue(detail, ["cut_id", "cutId"]) ?? ""),
        cutCode: String(pickValue(detail, ["cut_code", "cutCode", "code"]) ?? ""),
        diamondRateId: String(pickValue(detail, ["diamond_rate_id", "diamondRateId"]) ?? ""),
        diamondRateName: String(
          pickValue(detail, ["diamond_rate_name", "diamondRateName", "rate_name", "name"]) ?? ""
        ),
        pcs: String(pickValue(detail, ["pcs", "pieces", "diamond_pcs"]) ?? ""),
      }))
    );
    setImageFiles([]);
    setFileInputKey((prev) => prev + 1);
    setModalOpen(true);
  };

  const addDetailRow = () => {
    setDetailRows((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        cutId: "",
        cutCode: "",
        diamondRateId: "",
        diamondRateName: "",
        pcs: "",
      },
    ]);
  };

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
      window.alert("Select product and metal rate.");
      return;
    }

    if (!detailRows.length) {
      window.alert("Add at least one diamond detail row.");
      return;
    }

    if (!designNameEn || !designNameFi) {
      window.alert("Add design variant name for both languages.");
      return;
    }

    if (!descriptionEn || !descriptionFi) {
      window.alert("Add description for both languages.");
      return;
    }

    const missingDetails = detailRows.some(
      (row) => !row.cutId || !row.diamondRateId || !row.pcs
    );
    if (missingDetails) {
      window.alert("Fill cut, diamond rate, and pcs for each detail row.");
      return;
    }

    if (!editingId && imageFiles.length === 0) {
      window.alert("Add at least one image.");
      return;
    }

    const selectedProduct = productOptions.find((opt) => opt.id === productId);
    const selectedMetalRate = metalRateOptions.find((opt) => opt.id === metalRateId);
    const detailPayload = detailRows.map((row) => {
      const cutOption = cutOptions.find((opt) => opt.id === row.cutId);
      const diamondOption = diamondRateOptions.find((opt) => opt.id === row.diamondRateId);
      return {
        cut_id: row.cutId,
        cut_code: row.cutCode || cutOption?.code || cutOption?.label || "",
        diamond_rate_id: row.diamondRateId,
        diamond_rate_name: row.diamondRateName || diamondOption?.label || "",
        pcs: row.pcs,
      };
    });

    const payload = new FormData();
    payload.append("product_id", productId);
    payload.append("product_name", productName || selectedProduct?.label || "");
    payload.append("metal_rate_id", metalRateId);
    payload.append("metal_rate_name", metalRateName || selectedMetalRate?.label || "");
    if (weight !== "") payload.append("weight", String(weight));
    if (markUp !== "") payload.append("mark_up", String(markUp));
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
    imageFiles.forEach((file) => payload.append("images", file));

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

            {error ? <div className={crudStyles.error}>{String(error)}</div> : null}

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
            <label className={fieldStyles.field}>
              <span className={fieldStyles.label}>Images</span>
              <input
                key={fileInputKey}
                className={fieldStyles.control}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
              />
            </label>
          </div>

          <div className={styles.detailHeader}>Diamond Details</div>
          <div className={styles.detailList}>
            <div className={`${styles.detailRow} ${styles.detailRowHeader}`}>
              <span>Cut</span>
              <span>Diamond Rate</span>
              <span>Pcs</span>
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
                    updateDetailRow(row.key, { cutId: nextId, cutCode: selected?.code ?? "" });
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
          <div className={styles.addRow}>
            <Button variant="secondary" type="button" onClick={addDetailRow}>
              Add Diamond Detail
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Design Variant"
        message="Delete this design variant? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
