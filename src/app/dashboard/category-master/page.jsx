'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import {
  createCategoryMaster,
  deleteCategoryMaster,
  fetchCategoryMasters,
  selectCategoryMasterError,
  selectCategoryMasterLoading,
  selectCategoryMasters,
  updateCategoryMaster,
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

export default function CategoryMasterPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCategoryMasters);
  const loading = useAppSelector(selectCategoryMasterLoading);
  const error = useAppSelector(selectCategoryMasterError);
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

  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [filters, setFilters] = useState({ no: "", category_name: "", category_code: "" });

  useEffect(() => {
    dispatch(fetchCategoryMasters());
  }, [dispatch]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "category_id", "categoryId"]) ?? index + 1;
      return {
        no: index + 1,
        id,
        category_name: pickValue(item, ["category_name", "categoryName", "name"]) ?? "-",
        category_code: pickValue(item, ["category_code", "categoryCode", "code"]) ?? "-",
        _raw: item,
      };
    });
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const nameQuery = normalize(filters.category_name);
    const codeQuery = normalize(filters.category_code);
    if (!noQuery && !nameQuery && !codeQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const nameMatches = nameQuery ? normalize(row.category_name).includes(nameQuery) : true;
      const codeMatches = codeQuery ? normalize(row.category_code).includes(codeQuery) : true;
      return noMatches && nameMatches && codeMatches;
    });
  }, [filters.category_code, filters.category_name, filters.no, tableRows]);

  const openCreate = () => {
    setEditingId(null);
    setCategoryName("");
    setCategoryCode("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "category_id", "categoryId"]);
    setEditingId(rawId ?? null);
    setCategoryName(String(pickValue(row, ["category_name", "categoryName", "name"]) ?? ""));
    setCategoryCode(String(pickValue(row, ["category_code", "categoryCode", "code"]) ?? ""));
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { category_name: categoryName, category_code: categoryCode };

    const action = editingId
      ? updateCategoryMaster({ id: editingId, payload })
      : createCategoryMaster(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchCategoryMasters());
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this record?")) return;
    await dispatch(deleteCategoryMaster(id));
    dispatch(fetchCategoryMasters());
  };

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "category_name", header: "Category Name", filterable: true, filterPlaceholder: "Search Name" },
    { key: "category_code", header: "Category Code", filterable: true, filterPlaceholder: "Search Code" },
    {
      key: "actions",
      header: "Action",
      filterable: false,
      render: (row) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} type="button" onClick={() => openEdit(row._raw)}>
            Edit
          </button>
          <button className={styles.iconBtn} type="button" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
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
              <h2 className={styles.title}>Category Master</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => dispatch(fetchCategoryMasters())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className={styles.cta} type="button" onClick={openCreate}>
                  Add Category
                </button>
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
        title={editingId ? "Update Category" : "Add Category"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <button className={styles.cta} type="submit" form="category-form" disabled={loading}>
              {editingId ? "Update" : "Create"}
            </button>
            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        }
      >
        <form id="category-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow2}>
            <TextField
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
            <TextField
              label="Category Code"
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
