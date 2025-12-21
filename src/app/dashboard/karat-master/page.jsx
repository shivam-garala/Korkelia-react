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
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import {
  createKaratMaster,
  deleteKaratMaster,
  fetchKaratMasters,
  selectKaratMasterError,
  selectKaratMasterLoading,
  selectKaratMasters,
  updateKaratMaster,
} from "../../../store/slices/karatMasterSlice.js";
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

export default function KaratMasterPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectKaratMasters);
  const loading = useAppSelector(selectKaratMasterLoading);
  const error = useAppSelector(selectKaratMasterError);
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
  const [karatValue, setKaratValue] = useState("");
  const [filters, setFilters] = useState({ no: "", karat: "" });

  useEffect(() => {
    dispatch(fetchKaratMasters());
  }, [dispatch]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "karat_id", "karatId"]) ?? index + 1;
      return {
        no: index + 1,
        id,
        karat: pickValue(item, ["karat", "karat_name", "karatName", "name"]) ?? "-",
        _raw: item,
      };
    });
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const karatQuery = normalize(filters.karat);
    if (!noQuery && !karatQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const karatMatches = karatQuery ? normalize(row.karat).includes(karatQuery) : true;
      return noMatches && karatMatches;
    });
  }, [filters.karat, filters.no, tableRows]);


  const openCreate = () => {
    setEditingId(null);
    setKaratValue("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "karat_id", "karatId"]);
    setEditingId(rawId ?? null);
    setKaratValue(String(pickValue(row, ["karat", "karat_name", "karatName", "name"]) ?? ""));
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { karat: karatValue };

    const action = editingId ? updateKaratMaster({ id: editingId, payload }) : createKaratMaster(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchKaratMasters());
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteKaratMaster(deleteTarget));
    dispatch(fetchKaratMasters());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "karat", header: "Karat", filterable: true, filterPlaceholder: "Search Karat" },
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
              <h2 className={styles.title}>Karat Master</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh" iconOnly
                  onClick={() => dispatch(fetchKaratMasters())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Karat
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
        title={editingId ? "Update Karat" : "Add Karat"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant={editingId ? "primary" : "primarySoft"} type="submit" form="karat-form" disabled={loading}>
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
        <form id="karat-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow2}>
            <TextField
              label="Karat"
              value={karatValue}
              onChange={(e) => setKaratValue(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Karat"
        message="Delete this karat? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

