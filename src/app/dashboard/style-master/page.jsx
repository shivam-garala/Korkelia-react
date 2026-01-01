'use client';

import { useEffect, useMemo, useState } from "react";
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
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import {
  createStyleMaster,
  deleteStyleMaster,
  fetchStyleMasters,
  selectStyleMasterError,
  selectStyleMasterLoading,
  selectStyleMasters,
  updateStyleMaster,
} from "../../../store/slices/styleMasterSlice.js";
import {
  fetchCategoryMasters,
  selectCategoryMasters,
} from "../../../store/slices/categoryMasterSlice.js";
import {
  fetchSubCategories,
  fetchSubCategoriesByCategory,
  selectSubCategories,
} from "../../../store/slices/subCategorySlice.js";
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

export default function StyleMasterPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectStyleMasters);
  const categories = useAppSelector(selectCategoryMasters);
  const subCategories = useAppSelector(selectSubCategories);
  const loading = useAppSelector(selectStyleMasterLoading);
  const error = useAppSelector(selectStyleMasterError);
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
  const [subCategoryId, setSubCategoryId] = useState("");
  const [styleName, setStyleName] = useState("");
  const [styleCode, setStyleCode] = useState("");
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [filters, setFilters] = useState({
    no: "",
    category: "",
    sub_category: "",
    style_name: "",
    style_code: "",
  });

  useEffect(() => {
    dispatch(fetchCategoryMasters());
    dispatch(fetchSubCategories()).then((result) => {
      if (result?.error) return;
      const payload = result?.payload;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setAllSubCategories(list);
    });
    dispatch(fetchStyleMasters());
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    const items = Array.isArray(categories) ? categories : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "category_id", "categoryId"]);
        const label = pickValue(item, ["category_name", "categoryName", "name", "label"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id, label: String(label) };
      })
      .filter(Boolean);
  }, [categories]);

  const subCategoryLookupOptions = useMemo(() => {
    const items = Array.isArray(allSubCategories) ? allSubCategories : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "sub_category_id", "subCategoryId"]);
        const label = pickValue(item, ["sub_category_name", "subCategoryName", "name", "label"]);
        const parentId = pickValue(item, ["category_id", "categoryId", "category"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id, label: String(label), categoryId: parentId ?? "" };
      })
      .filter(Boolean);
  }, [allSubCategories]);

  const filteredSubCategoryOptions = useMemo(() => {
    if (!categoryId) return [];
    const items = Array.isArray(subCategories) ? subCategories : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "sub_category_id", "subCategoryId"]);
        const label = pickValue(item, ["sub_category_name", "subCategoryName", "name", "label"]);
        const parentId = pickValue(item, ["category_id", "categoryId", "category"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id, label: String(label), categoryId: parentId ?? "" };
      })
      .filter(Boolean)
      .filter((option) => String(option.categoryId) === String(categoryId));
  }, [categoryId, subCategories]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "style_id", "styleId"]) ?? index + 1;
      const rawCategoryId = pickValue(item, [
        "category_master_id",
        "category_id",
        "categoryId",
        "categoryMasterId",
      ]);
      const categoryFromRelation =
        item?.category?.category_name ??
        item?.category?.categoryName ??
        item?.category?.name ??
        item?.category_master?.category_name ??
        item?.category_master?.categoryName ??
        item?.category_master?.name ??
        null;
      const categoryLabel =
        categoryFromRelation ??
        pickValue(item, ["category_name", "categoryName", "category_label", "categoryLabel", "name"]) ??
        categoryOptions.find((category) => String(category.id) === String(rawCategoryId))?.label ??
        (rawCategoryId !== null && rawCategoryId !== undefined ? String(rawCategoryId) : "-");
      const rawSubCategoryId = pickValue(item, ["sub_category_id", "subCategoryId", "subCategory"]);
      const subCategoryFromRelation =
        item?.sub_category?.sub_category_name ??
        item?.sub_category?.subCategoryName ??
        item?.sub_category?.name ??
        null;
      const subCategoryLabel =
        subCategoryFromRelation ??
        pickValue(item, ["sub_category_name", "subCategoryName", "sub_category_label", "subCategoryLabel"]) ??
        subCategoryLookupOptions.find((subCategory) => String(subCategory.id) === String(rawSubCategoryId))
          ?.label ??
        (rawSubCategoryId !== null && rawSubCategoryId !== undefined ? String(rawSubCategoryId) : "-");
      return {
        no: index + 1,
        id,
        category: categoryLabel ?? "-",
        sub_category: subCategoryLabel ?? "-",
        style_name: pickValue(item, ["style_name", "styleName", "name"]) ?? "-",
        style_code: pickValue(item, ["style_code", "styleCode", "code"]) ?? "-",
        _raw: item,
      };
    });
  }, [categoryOptions, items, subCategoryLookupOptions]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const categoryQuery = normalize(filters.category);
    const subCategoryQuery = normalize(filters.sub_category);
    const nameQuery = normalize(filters.style_name);
    const codeQuery = normalize(filters.style_code);
    if (!noQuery && !categoryQuery && !subCategoryQuery && !nameQuery && !codeQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const categoryMatches = categoryQuery ? normalize(row.category).includes(categoryQuery) : true;
      const subCategoryMatches = subCategoryQuery
        ? normalize(row.sub_category).includes(subCategoryQuery)
        : true;
      const nameMatches = nameQuery ? normalize(row.style_name).includes(nameQuery) : true;
      const codeMatches = codeQuery ? normalize(row.style_code).includes(codeQuery) : true;
      return noMatches && categoryMatches && subCategoryMatches && nameMatches && codeMatches;
    });
  }, [filters.category, filters.no, filters.style_code, filters.style_name, filters.sub_category, tableRows]);


  const openCreate = () => {
    setEditingId(null);
    setCategoryId("");
    setSubCategoryId("");
    setStyleName("");
    setStyleCode("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "style_id", "styleId"]);
    const rawCategoryId = pickValue(row, ["category_master_id", "category_id", "categoryId", "categoryMasterId"]);
    const rawSubCategoryId = pickValue(row, ["sub_category_id", "subCategoryId", "subCategory"]);
    setEditingId(rawId ?? null);
    setCategoryId(
      String(rawCategoryId ?? "")
    );
    setSubCategoryId(String(rawSubCategoryId ?? ""));
    setStyleName(String(pickValue(row, ["style_name", "styleName", "name"]) ?? ""));
    setStyleCode(String(pickValue(row, ["style_code", "styleCode", "code"]) ?? ""));
    if (rawCategoryId !== undefined && rawCategoryId !== null) {
      dispatch(fetchSubCategoriesByCategory(rawCategoryId));
    }
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { style_name: styleName, style_code: styleCode };
    if (categoryId) payload.category_id = Number(categoryId);
    if (subCategoryId) payload.sub_category_id = Number(subCategoryId);

    const action = editingId ? updateStyleMaster({ id: editingId, payload }) : createStyleMaster(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchStyleMasters());
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteStyleMaster(deleteTarget));
    dispatch(fetchStyleMasters());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: false, filterPlaceholder: "Search No." },
    { key: "category", header: "Category", filterable: true, filterPlaceholder: "Search Category" },
    { key: "sub_category", header: "Sub Category", filterable: true, filterPlaceholder: "Search Sub Category" },
    { key: "style_name", header: "Style Name", filterable: true, filterPlaceholder: "Search Name" },
    { key: "style_code", header: "Style Code", filterable: true, filterPlaceholder: "Search Code" },
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
              <h2 className={styles.title}>Style Master</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh" iconOnly
                  onClick={() => dispatch(fetchStyleMasters())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Style
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
        title={editingId ? "Update Style" : "Add Style"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant="primarySoft" type="submit" form="style-form" disabled={loading}>
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
        <form id="style-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow3}>
            <AdminSelectField
              label="Category"
              value={categoryId}
              onChange={(e) => {
                const nextId = e.target.value;
                setCategoryId(nextId);
                setSubCategoryId("");
                if (nextId) dispatch(fetchSubCategoriesByCategory(nextId));
              }}
              required
              disabled={!categoryOptions.length}
              placeholder={categoryOptions.length ? "Select category" : "Loading categories..."}
              options={categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
            <AdminSelectField
              label="Sub Category"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              required
              disabled={!filteredSubCategoryOptions.length}
              placeholder={
                filteredSubCategoryOptions.length ? "Select sub category" : "Loading sub categories..."
              }
              options={filteredSubCategoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
            <TextField
              label="Style Name"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              required
            />
            <TextField
              label="Style Code"
              value={styleCode}
              onChange={(e) => setStyleCode(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Style"
        message="Delete this style? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
