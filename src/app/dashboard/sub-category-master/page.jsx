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
import {
  createSubCategory,
  deleteSubCategory,
  fetchSubCategories,
  selectSubCategoryError,
  selectSubCategoryLoading,
  selectSubCategories,
  updateSubCategory,
} from "../../../store/slices/subCategorySlice.js";
import {
  fetchCategoryMasters,
  selectCategoryMasters,
} from "../../../store/slices/categoryMasterSlice.js";
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

export default function SubCategoryMasterPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectSubCategories);
  const categories = useAppSelector(selectCategoryMasters);
  const loading = useAppSelector(selectSubCategoryLoading);
  const error = useAppSelector(selectSubCategoryError);
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
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryCode, setSubCategoryCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [filters, setFilters] = useState({
    no: "",
    category: "",
    sub_category_name: "",
    sub_category_code: "",
  });

  useEffect(() => {
    dispatch(fetchCategoryMasters());
    dispatch(fetchSubCategories());
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

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "sub_category_id", "subCategoryId"]) ?? index + 1;
      const rawCategoryId = pickValue(item, ["category_id", "categoryId", "category"]);
      const categoryFromRelation =
        item?.category?.category_name ?? item?.category?.categoryName ?? item?.category?.name ?? null;
      const categoryLabel =
        categoryFromRelation ??
        pickValue(item, ["category_name", "categoryName", "category_label", "categoryLabel", "name"]) ??
        categoryOptions.find((category) => String(category.id) === String(rawCategoryId))?.label ??
        (rawCategoryId !== null && rawCategoryId !== undefined ? String(rawCategoryId) : "-");
      return {
        no: index + 1,
        id,
        category: categoryLabel ?? "-",
        sub_category_name: pickValue(item, ["sub_category_name", "subCategoryName", "name"]) ?? "-",
        sub_category_code: pickValue(item, ["sub_category_code", "subCategoryCode", "code"]) ?? "-",
        _raw: item,
      };
    });
  }, [categoryOptions, items]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const categoryQuery = normalize(filters.category);
    const nameQuery = normalize(filters.sub_category_name);
    const codeQuery = normalize(filters.sub_category_code);
    if (!noQuery && !categoryQuery && !nameQuery && !codeQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const categoryMatches = categoryQuery ? normalize(row.category).includes(categoryQuery) : true;
      const nameMatches = nameQuery ? normalize(row.sub_category_name).includes(nameQuery) : true;
      const codeMatches = codeQuery ? normalize(row.sub_category_code).includes(codeQuery) : true;
      return noMatches && categoryMatches && nameMatches && codeMatches;
    });
  }, [filters.category, filters.no, filters.sub_category_code, filters.sub_category_name, tableRows]);


  const openCreate = () => {
    setEditingId(null);
    setSubCategoryName("");
    setSubCategoryCode("");
    setCategoryId("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "sub_category_id", "subCategoryId"]);
    setEditingId(rawId ?? null);
    setSubCategoryName(String(pickValue(row, ["sub_category_name", "subCategoryName", "name"]) ?? ""));
    setSubCategoryCode(String(pickValue(row, ["sub_category_code", "subCategoryCode", "code"]) ?? ""));
    setCategoryId(
      String(pickValue(row, ["category_id", "categoryId", "category"]) ?? "")
    );
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      sub_category_name: subCategoryName,
      sub_category_code: subCategoryCode,
      category_id: Number(categoryId),
    };

    const action = editingId
      ? updateSubCategory({ id: editingId, payload })
      : createSubCategory(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchSubCategories());
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteSubCategory(deleteTarget));
    dispatch(fetchSubCategories());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "category", header: "Category", filterable: true, filterPlaceholder: "Search Category" },
    {
      key: "sub_category_name",
      header: "Sub Category Name",
      filterable: true,
      filterPlaceholder: "Search Name",
    },
    {
      key: "sub_category_code",
      header: "Sub Category Code",
      filterable: true,
      filterPlaceholder: "Search Code",
    },
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
              <h2 className={styles.title}>Sub Category Master</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh" iconOnly
                  onClick={() => dispatch(fetchSubCategories())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Sub Category
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
        title={editingId ? "Update Sub Category" : "Add Sub Category"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant="primarySoft" type="submit" form="sub-category-form" disabled={loading}>
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
        <form id="sub-category-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow3}>
            <AdminSelectField
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={!categoryOptions.length}
              placeholder={categoryOptions.length ? "Select category" : "Loading categories..."}
              options={categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
            <TextField
              label="Sub Category Name"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              required
            />
            <TextField
              label="Sub Category Code"
              value={subCategoryCode}
              onChange={(e) => setSubCategoryCode(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Sub Category"
        message="Delete this sub category? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
