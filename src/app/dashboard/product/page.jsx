'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import SelectField from "../../../components/ui/SelectField.jsx";
import fieldStyles from "../../../components/ui/Fields.module.css";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
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
  fetchCategoryMasters,
  selectCategoryMasters,
} from "../../../store/slices/categoryMasterSlice.js";
import {
  fetchSubCategories,
  fetchSubCategoriesByCategory,
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

export default function ProductPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategoryMasters);
  const subCategories = useAppSelector(selectSubCategories);
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
  const [isDisplay, setIsDisplay] = useState("1");
  const [imageFile, setImageFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [filters, setFilters] = useState({
    no: "",
    category: "",
    sub_category: "",
    style: "",
    is_display: "",
  });

  useEffect(() => {
    dispatch(fetchCategoryMasters());
    dispatch(fetchSubCategories());
    dispatch(fetchStyleMasters());
    dispatch(fetchProducts());
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

  const subCategoryOptions = useMemo(() => {
    const list = Array.isArray(subCategories) ? subCategories : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "sub_category_id", "subCategoryId"]);
        const label = pickValue(item, ["sub_category_name", "subCategoryName", "name", "label"]);
        const parentId = pickValue(item, ["category_id", "categoryId", "category"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return {
          id: String(id),
          label: String(label),
          categoryId: parentId !== null && parentId !== undefined ? String(parentId) : "",
        };
      })
      .filter(Boolean);
  }, [subCategories]);

  const filteredSubCategoryOptions = useMemo(() => {
    if (!categoryId) return subCategoryOptions;
    return subCategoryOptions.filter((option) => option.categoryId === String(categoryId));
  }, [categoryId, subCategoryOptions]);

  const styleOptions = useMemo(() => {
    const list = Array.isArray(stylesList) ? stylesList : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "style_id", "styleId"]);
        const label = pickValue(item, ["style_name", "styleName", "name", "label"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [stylesList]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "product_id", "productId"]) ?? index + 1;
      const rawCategoryId = pickValue(item, ["category_id", "categoryId", "category"]);
      const rawSubCategoryId = pickValue(item, ["sub_category_id", "subCategoryId", "subCategory"]);
      const rawStyleId = pickValue(item, ["style_id", "styleId", "style"]);
      const categoryLabel =
        item?.category?.category_name ??
        item?.category?.categoryName ??
        item?.category?.name ??
        pickValue(item, ["category_name", "categoryName", "category_label", "categoryLabel", "name"]) ??
        categoryOptions.find((option) => String(option.id) === String(rawCategoryId))?.label ??
        (rawCategoryId !== null && rawCategoryId !== undefined ? String(rawCategoryId) : "-");
      const subCategoryLabel =
        item?.sub_category?.sub_category_name ??
        item?.sub_category?.subCategoryName ??
        item?.sub_category?.name ??
        pickValue(item, ["sub_category_name", "subCategoryName", "sub_category_label", "subCategoryLabel"]) ??
        subCategoryOptions.find((option) => String(option.id) === String(rawSubCategoryId))?.label ??
        (rawSubCategoryId !== null && rawSubCategoryId !== undefined ? String(rawSubCategoryId) : "-");
      const styleLabel =
        item?.style?.style_name ??
        item?.style?.styleName ??
        item?.style?.name ??
        pickValue(item, ["style_name", "styleName", "style_label", "styleLabel", "name"]) ??
        styleOptions.find((option) => String(option.id) === String(rawStyleId))?.label ??
        (rawStyleId !== null && rawStyleId !== undefined ? String(rawStyleId) : "-");
      const rawDisplay = pickValue(item, ["is_display", "isDisplay", "display", "display_status"]);
      const displayValue = normalizeDisplayValue(rawDisplay);
      const displayLabel = displayValue === "1" ? "Yes" : displayValue === "0" ? "No" : displayValue || "-";
      const imageValue = pickValue(item, ["image", "image_url", "imageUrl", "image_path", "imagePath"]);

      return {
        no: index + 1,
        id,
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
    if (!noQuery && !categoryQuery && !subCategoryQuery && !styleQuery && !displayQuery) return tableRows;

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
      return noMatches && categoryMatches && subCategoryMatches && styleMatches && displayMatches;
    });
  }, [filters.category, filters.is_display, filters.no, filters.style, filters.sub_category, tableRows]);


  const openCreate = () => {
    setEditingId(null);
    setCategoryId("");
    setCategoryName("");
    setSubCategoryId("");
    setSubCategoryName("");
    setStyleId("");
    setStyleName("");
    setIsDisplay("1");
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "product_id", "productId"]);
    const rawCategoryId = pickValue(row, ["category_id", "categoryId", "category"]);
    const rawSubCategoryId = pickValue(row, ["sub_category_id", "subCategoryId", "subCategory"]);
    const rawStyleId = pickValue(row, ["style_id", "styleId", "style"]);
    const resolvedCategoryName =
      row?.category?.category_name ??
      row?.category?.categoryName ??
      row?.category?.name ??
      pickValue(row, ["category_name", "categoryName", "name"]) ??
      categoryOptions.find((option) => String(option.id) === String(rawCategoryId))?.label ??
      "";
    const resolvedSubCategoryName =
      row?.sub_category?.sub_category_name ??
      row?.sub_category?.subCategoryName ??
      row?.sub_category?.name ??
      pickValue(row, ["sub_category_name", "subCategoryName", "name"]) ??
      subCategoryOptions.find((option) => String(option.id) === String(rawSubCategoryId))?.label ??
      "";
    const resolvedStyleName =
      row?.style?.style_name ??
      row?.style?.styleName ??
      row?.style?.name ??
      pickValue(row, ["style_name", "styleName", "name"]) ??
      styleOptions.find((option) => String(option.id) === String(rawStyleId))?.label ??
      "";
    const rawDisplay = pickValue(row, ["is_display", "isDisplay", "display", "display_status"]);

    setEditingId(rawId ?? null);
    setCategoryId(rawCategoryId !== undefined && rawCategoryId !== null ? String(rawCategoryId) : "");
    setCategoryName(resolvedCategoryName ? String(resolvedCategoryName) : "");
    setSubCategoryId(rawSubCategoryId !== undefined && rawSubCategoryId !== null ? String(rawSubCategoryId) : "");
    setSubCategoryName(resolvedSubCategoryName ? String(resolvedSubCategoryName) : "");
    setStyleId(rawStyleId !== undefined && rawStyleId !== null ? String(rawStyleId) : "");
    setStyleName(resolvedStyleName ? String(resolvedStyleName) : "");
    setIsDisplay(normalizeDisplayValue(rawDisplay) || "1");
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    if (rawCategoryId !== undefined && rawCategoryId !== null) {
      dispatch(fetchSubCategoriesByCategory(rawCategoryId));
    }
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
    if (imageFile) payload.append("image", imageFile);
    if (isDisplay !== "") payload.append("is_display", String(isDisplay));
    return payload;
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = buildPayload();

    const action = editingId ? updateProduct({ id: editingId, payload }) : createProduct(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      setImageFile(null);
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
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
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

            {error ? <div className={styles.error}>{String(error)}</div> : null}

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
          setFileInputKey((prev) => prev + 1);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant={editingId ? "primary" : "primarySoft"} type="submit" form="product-form" disabled={loading}>
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
                setImageFile(null);
                setFileInputKey((prev) => prev + 1);
              }}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <form id="product-form" className={styles.form} onSubmit={submit}>
          {editingId ? (
            <div className={styles.formRow3}>
              <SelectField
                label="Category"
                value={categoryId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const selected = categoryOptions.find((option) => option.id === nextId);
                  setCategoryId(nextId);
                  setCategoryName(selected?.label ?? "");
                  setSubCategoryId("");
                  setSubCategoryName("");
                  if (nextId) dispatch(fetchSubCategoriesByCategory(nextId));
                }}
                required
                disabled={!categoryOptions.length}
                placeholder={categoryOptions.length ? "Select category" : "Loading categories..."}
                options={categoryOptions.map((option) => ({ value: option.id, label: option.label }))}
              />
              <SelectField
                label="Sub Category"
                value={subCategoryId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const selected = filteredSubCategoryOptions.find((option) => option.id === nextId);
                  setSubCategoryId(nextId);
                  setSubCategoryName(selected?.label ?? "");
                }}
                required
                disabled={!filteredSubCategoryOptions.length}
                placeholder={
                  filteredSubCategoryOptions.length
                    ? "Select sub category"
                    : "Loading sub categories..."
                }
                options={filteredSubCategoryOptions.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
              />
              <SelectField
                label="Style"
                value={styleId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const selected = styleOptions.find((option) => option.id === nextId);
                  setStyleId(nextId);
                  setStyleName(selected?.label ?? "");
                }}
                required
                disabled={!styleOptions.length}
                placeholder={styleOptions.length ? "Select style" : "Loading styles..."}
                options={styleOptions.map((option) => ({ value: option.id, label: option.label }))}
              />
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Image</span>
                <input
                  key={fileInputKey}
                  className={fieldStyles.control}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <SelectField
                label="Display"
                value={isDisplay}
                onChange={(e) => setIsDisplay(e.target.value)}
                required
                options={[
                  { value: "1", label: "Yes" },
                  { value: "0", label: "No" },
                ]}
              />
            </div>
          ) : (
            <div className={styles.formRow3}>
              <SelectField
                label="Category"
                value={categoryId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const selected = categoryOptions.find((option) => option.id === nextId);
                  setCategoryId(nextId);
                  setCategoryName(selected?.label ?? "");
                  setSubCategoryId("");
                  setSubCategoryName("");
                  if (nextId) dispatch(fetchSubCategoriesByCategory(nextId));
                }}
                required
                disabled={!categoryOptions.length}
                placeholder={categoryOptions.length ? "Select category" : "Loading categories..."}
                options={categoryOptions.map((option) => ({ value: option.id, label: option.label }))}
              />
              <SelectField
                label="Sub Category"
                value={subCategoryId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const selected = filteredSubCategoryOptions.find((option) => option.id === nextId);
                  setSubCategoryId(nextId);
                  setSubCategoryName(selected?.label ?? "");
                }}
                required
                disabled={!filteredSubCategoryOptions.length}
                placeholder={
                  filteredSubCategoryOptions.length
                    ? "Select sub category"
                    : "Loading sub categories..."
                }
                options={filteredSubCategoryOptions.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
              />
              <SelectField
                label="Style"
                value={styleId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const selected = styleOptions.find((option) => option.id === nextId);
                  setStyleId(nextId);
                  setStyleName(selected?.label ?? "");
                }}
                required
                disabled={!styleOptions.length}
                placeholder={styleOptions.length ? "Select style" : "Loading styles..."}
                options={styleOptions.map((option) => ({ value: option.id, label: option.label }))}
              />
              <label className={fieldStyles.field}>
                <span className={fieldStyles.label}>Image</span>
                <input
                  key={fileInputKey}
                  className={fieldStyles.control}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  required
                />
              </label>
              <SelectField
                label="Display"
                value={isDisplay}
                onChange={(e) => setIsDisplay(e.target.value)}
                required
                options={[
                  { value: "1", label: "Yes" },
                  { value: "0", label: "No" },
                ]}
              />
            </div>
          )}
        </form>
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

