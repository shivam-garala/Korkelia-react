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
  createDiamondMaster,
  deleteDiamondMaster,
  fetchDiamondMasters,
  selectDiamondMasterError,
  selectDiamondMasterLoading,
  selectDiamondMasters,
  updateDiamondMaster,
} from "../../../store/slices/diamondMasterSlice.js";
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

export default function DiamondMasterPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectDiamondMasters);
  const loading = useAppSelector(selectDiamondMasterLoading);
  const error = useAppSelector(selectDiamondMasterError);
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

  const [carat, setCarat] = useState("");
  const [sizeFrom, setSizeFrom] = useState("");
  const [sizeTo, setSizeTo] = useState("");
  const [filters, setFilters] = useState({ no: "", carat: "", size_from: "", size_to: "" });

  useEffect(() => {
    dispatch(fetchDiamondMasters());
  }, [dispatch]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "diamond_id", "diamondId"]) ?? index + 1;
      return {
        no: index + 1,
        id,
        carat: pickValue(item, ["carat"]) ?? "-",
        size_from: pickValue(item, ["size_from", "sizeFrom"]) ?? "-",
        size_to: pickValue(item, ["size_to", "sizeTo"]) ?? "-",
        _raw: item,
      };
    });
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const caratQuery = normalize(filters.carat);
    const fromQuery = normalize(filters.size_from);
    const toQuery = normalize(filters.size_to);
    if (!noQuery && !caratQuery && !fromQuery && !toQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const caratMatches = caratQuery ? normalize(row.carat).includes(caratQuery) : true;
      const fromMatches = fromQuery ? normalize(row.size_from).includes(fromQuery) : true;
      const toMatches = toQuery ? normalize(row.size_to).includes(toQuery) : true;
      return noMatches && caratMatches && fromMatches && toMatches;
    });
  }, [filters.carat, filters.no, filters.size_from, filters.size_to, tableRows]);

  const openCreate = () => {
    setEditingId(null);
    setCarat("");
    setSizeFrom("");
    setSizeTo("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "diamond_id", "diamondId"]);
    setEditingId(rawId ?? null);
    setCarat(String(pickValue(row, ["carat"]) ?? ""));
    setSizeFrom(String(pickValue(row, ["size_from", "sizeFrom"]) ?? ""));
    setSizeTo(String(pickValue(row, ["size_to", "sizeTo"]) ?? ""));
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      carat: Number(carat),
      size_from: Number(sizeFrom),
      size_to: Number(sizeTo),
    };

    const action = editingId
      ? updateDiamondMaster({ id: editingId, payload })
      : createDiamondMaster(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchDiamondMasters());
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this record?")) return;
    await dispatch(deleteDiamondMaster(id));
    dispatch(fetchDiamondMasters());
  };

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "carat", header: "Carat", filterable: true, filterPlaceholder: "Search Carat" },
    { key: "size_from", header: "Size From", filterable: true, filterPlaceholder: "Search From" },
    { key: "size_to", header: "Size To", filterable: true, filterPlaceholder: "Search To" },
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
              <h2 className={styles.title}>Diamond Master</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => dispatch(fetchDiamondMasters())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className={styles.cta} type="button" onClick={openCreate}>
                  Add Diamond
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
        title={editingId ? "Update Diamond" : "Add Diamond"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <button className={styles.cta} type="submit" form="diamond-form" disabled={loading}>
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
        <form id="diamond-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow3}>
            <TextField
              label="Carat"
              type="number"
              step="0.01"
              value={carat}
              onChange={(e) => setCarat(e.target.value)}
              required
              preventWheel
            />
            <TextField
              label="Size From"
              type="number"
              step="0.01"
              value={sizeFrom}
              onChange={(e) => setSizeFrom(e.target.value)}
              required
              preventWheel
            />
            <TextField
              label="Size To"
              type="number"
              step="0.01"
              value={sizeTo}
              onChange={(e) => setSizeTo(e.target.value)}
              required
              preventWheel
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
