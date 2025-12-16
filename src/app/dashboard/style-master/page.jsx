'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import {
  createStyleMaster,
  deleteStyleMaster,
  fetchStyleMasters,
  selectStyleMasterError,
  selectStyleMasterLoading,
  selectStyleMasters,
  updateStyleMaster,
} from "../../../store/slices/styleMasterSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
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
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectStyleMasters);
  const loading = useAppSelector(selectStyleMasterLoading);
  const error = useAppSelector(selectStyleMasterError);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [styleName, setStyleName] = useState("");
  const [styleCode, setStyleCode] = useState("");
  const [filters, setFilters] = useState({ no: "", style_name: "", style_code: "" });

  useEffect(() => {
    dispatch(fetchStyleMasters());
  }, [dispatch]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "style_id", "styleId"]) ?? index + 1;
      return {
        no: index + 1,
        id,
        style_name: pickValue(item, ["style_name", "styleName", "name"]) ?? "-",
        style_code: pickValue(item, ["style_code", "styleCode", "code"]) ?? "-",
        _raw: item,
      };
    });
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const nameQuery = normalize(filters.style_name);
    const codeQuery = normalize(filters.style_code);
    if (!noQuery && !nameQuery && !codeQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const nameMatches = nameQuery ? normalize(row.style_name).includes(nameQuery) : true;
      const codeMatches = codeQuery ? normalize(row.style_code).includes(codeQuery) : true;
      return noMatches && nameMatches && codeMatches;
    });
  }, [filters.no, filters.style_code, filters.style_name, tableRows]);

  const openCreate = () => {
    setEditingId(null);
    setStyleName("");
    setStyleCode("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "style_id", "styleId"]);
    setEditingId(rawId ?? null);
    setStyleName(String(pickValue(row, ["style_name", "styleName", "name"]) ?? ""));
    setStyleCode(String(pickValue(row, ["style_code", "styleCode", "code"]) ?? ""));
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { style_name: styleName, style_code: styleCode };

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
    if (!window.confirm("Delete this record?")) return;
    await dispatch(deleteStyleMaster(id));
    dispatch(fetchStyleMasters());
  };

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "style_name", header: "Style Name", filterable: true, filterPlaceholder: "Search Name" },
    { key: "style_code", header: "Style Code", filterable: true, filterPlaceholder: "Search Code" },
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
        <header className={layout.headerBar}>
          <div className={layout.team} />
          <div className={layout.actionsRow}>
            <button className={layout.chip} onClick={() => setSearchOpen(true)}>
              Search
            </button>
            <LanguageDropdown />
            <button className={layout.ghostIcon}>?</button>
            <button className={layout.ghostIcon}>...</button>
            <button
              className={layout.avatarRing}
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              <span className={layout.avatarRingInner}>JF</span>
            </button>
          </div>
        </header>

        <main className={layout.content}>
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>Style Master</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => dispatch(fetchStyleMasters())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className={styles.cta} type="button" onClick={openCreate}>
                  Add Style
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

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
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
            <button className={styles.cta} type="submit" form="style-form" disabled={loading}>
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
        <form id="style-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow2}>
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
    </div>
  );
}

