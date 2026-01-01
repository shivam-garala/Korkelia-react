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
import styles from "./page.module.css";
import layout from "../../../styles/workspace.module.css";
import {
  createMetalRate,
  deleteMetalRate,
  fetchKarats,
  fetchMetalRate,
  fetchMetalRates,
  selectKarats,
  selectMetalRates,
  selectMetalRatesError,
  selectMetalRatesLoading,
  updateMetalRate,
} from "../../../store/slices/metalRateSlice.js";
import {
  fetchMetalMasters,
  selectMetalMasters,
} from "../../../store/slices/metalMasterSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

export default function GoldRatePage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const rates = useAppSelector(selectMetalRates);
  const karats = useAppSelector(selectKarats);
  const metals = useAppSelector(selectMetalMasters);
  const loading = useAppSelector(selectMetalRatesLoading);
  const error = useAppSelector(selectMetalRatesError);
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
  const [metalId, setMetalId] = useState("");
  const [karatId, setKaratId] = useState("");
  const [rate, setRate] = useState("");
  const [filters, setFilters] = useState({ no: "", metal: "", karat: "", rate: "" });

  useEffect(() => {
    dispatch(fetchKarats());
    dispatch(fetchMetalMasters());
    dispatch(fetchMetalRates());
  }, [dispatch]);

  const metalOptions = useMemo(() => {
    const items = Array.isArray(metals) ? metals : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "metal_id", "metalId"]);
        const label = pickValue(item, ["metal_name", "metalName", "name", "label"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id, label: String(label) };
      })
      .filter(Boolean);
  }, [metals]);

  const karatOptions = useMemo(() => {
    const items = Array.isArray(karats) ? karats : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "karat_id", "karatId"]);
        const label =
          pickValue(item, ["name", "karat", "karat_name", "title", "label"]) ??
          (id !== null ? `Karat ${id}` : null);
        if (id === null || label === null) return null;
        return { id, label: String(label) };
      })
      .filter(Boolean);
  }, [karats]);

  const tableRows = useMemo(() => {
    const items = Array.isArray(rates) ? rates : [];
    return items.map((item, index) => {
      const id = pickValue(item, ["id", "rate_id", "metal_rate_id", "metalRateId"]) ?? index + 1;
      const rawMetalId = pickValue(item, ["metal_id", "metalId", "metal"]);
      const metalFromRelation =
        item?.metal?.metal_name ?? item?.metal?.metalName ?? item?.metal?.name ?? null;
      const metalLabel =
        metalFromRelation ??
        pickValue(item, ["metal_name", "metalName", "metal_label", "metalLabel", "name"]) ??
        metalOptions.find((m) => String(m.id) === String(rawMetalId))?.label ??
        (rawMetalId !== null && rawMetalId !== undefined ? String(rawMetalId) : "-");
      const rawKaratId = pickValue(item, ["karat_id", "karatId", "karat"]);
      const karatFromRelation =
        item?.karat?.karat ?? item?.karat?.karat_name ?? item?.karat?.name ?? null;
      const karatLabel =
        karatFromRelation ??
        pickValue(item, ["karat_name", "karatName", "karat_label", "karatLabel"]) ??
        karatOptions.find((k) => String(k.id) === String(rawKaratId))?.label ??
        (rawKaratId !== null ? String(rawKaratId) : "-");
      const rateValue = pickValue(item, ["rate", "metal_rate", "metalRate", "value"]);

      return {
        no: index + 1,
        id,
        metal: metalLabel ?? "-",
        karat: karatLabel ?? "-",
        rate: rateValue ?? "-",
        _raw: item,
      };
    });
  }, [karatOptions, metalOptions, rates]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const metalQuery = normalize(filters.metal);
    const karatQuery = normalize(filters.karat);
    const rateQuery = normalize(filters.rate);

    if (!noQuery && !metalQuery && !karatQuery && !rateQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery) : true;
      const metalMatches = metalQuery ? normalize(row.metal).includes(metalQuery) : true;
      const karatMatches = karatQuery ? normalize(row.karat).includes(karatQuery) : true;
      const rateMatches = rateQuery ? normalize(row.rate).includes(rateQuery) : true;
      return noMatches && metalMatches && karatMatches && rateMatches;
    });
  }, [filters.karat, filters.metal, filters.no, filters.rate, tableRows]);


  const openCreate = () => {
    setEditingId(null);
    setMetalId("");
    setKaratId("");
    setRate("");
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    const rawId = pickValue(row, ["id", "rate_id", "metal_rate_id", "metalRateId"]);
    const rawMetalId = pickValue(row, ["metal_id", "metalId", "metal"]);
    const rawKaratId = pickValue(row, ["karat_id", "karatId", "karat"]);
    const rawRate = pickValue(row, ["rate", "metal_rate", "metalRate", "value"]);

    setEditingId(rawId ?? null);
    setMetalId(rawMetalId !== null && rawMetalId !== undefined ? String(rawMetalId) : "");
    setKaratId(rawKaratId !== null && rawKaratId !== undefined ? String(rawKaratId) : "");
    setRate(rawRate !== null && rawRate !== undefined ? String(rawRate) : "");
    setModalOpen(true);

    if (rawId !== null && rawId !== undefined) {
      const result = await dispatch(fetchMetalRate(rawId));
      if (!result?.error) {
        const payload =
          result.payload?.data?.data ?? result.payload?.data ?? result.payload;
        if (payload && typeof payload === "object") {
          const freshMetalId = pickValue(payload, ["metal_id", "metalId", "metal"]);
          const freshKaratId = pickValue(payload, ["karat_id", "karatId", "karat"]);
          const freshRate = pickValue(payload, ["rate", "metal_rate", "metalRate", "value"]);
          setMetalId(freshMetalId !== null && freshMetalId !== undefined ? String(freshMetalId) : "");
          setKaratId(freshKaratId !== null && freshKaratId !== undefined ? String(freshKaratId) : "");
          setRate(freshRate !== null && freshRate !== undefined ? String(freshRate) : "");
        }
      }
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { karat_id: Number(karatId), metal_id: Number(metalId), rate: Number(rate) };
    const action = editingId
      ? updateMetalRate({ id: editingId, payload })
      : createMetalRate(payload);
    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchMetalRates());
    }
  };

  const handleDelete = (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteMetalRate(deleteTarget));
    dispatch(fetchMetalRates());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: false, filterPlaceholder: "Search No." },
    { key: "metal", header: "Metal", filterable: true, filterPlaceholder: "Search Metal" },
    { key: "karat", header: "Karat", filterable: true, filterPlaceholder: "Search Karat" },
    { key: "rate", header: "Rate", filterable: true, filterPlaceholder: "Search Rate" },
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
              <h2 className={styles.title}>Metal Rate</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh" iconOnly
                  onClick={() => dispatch(fetchMetalRates())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Metal Rate
                </Button>
              </div>
            </div>


            <DataTable
              columns={columns}
              rows={filteredRows}
              getRowKey={(row) => row.id}
              filters={filters}
              onFiltersChange={setFilters}
              emptyMessage={loading ? "Loading..." : "No metal rates found"}
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
          } catch (logoutError) {
            console.error("Logout error", logoutError);
          }
          dispatch(clearCredentials());
          router.push("/login");
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Modal
        open={modalOpen}
        title={editingId ? "Update Metal Rate" : "Add Metal Rate"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant="primarySoft" type="submit" form="metal-rate-form" disabled={loading}>
              {editingId ? "Update" : "Save"}
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
        <form id="metal-rate-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow}>
            <AdminSelectField
              label="Metal"
              value={metalId}
              onChange={(e) => setMetalId(e.target.value)}
              required
              disabled={!metalOptions.length}
              placeholder={metalOptions.length ? "Select metal" : "Loading metals..."}
              options={metalOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
            <AdminSelectField
              label="Karat"
              value={karatId}
              onChange={(e) => setKaratId(e.target.value)}
              required
              disabled={!karatOptions.length}
              placeholder={karatOptions.length ? "Select karat" : "Loading karats..."}
              options={karatOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
            <TextField
              label="Rate"
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
              preventWheel
            />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Metal Rate"
        message="Delete this metal rate? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
