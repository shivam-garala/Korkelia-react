'use client';

import { useEffect, useMemo, useState } from "react";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import SelectField from "../../../components/ui/SelectField.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";
import layout from "../../../styles/workspace.module.css";
import {
  createMetalRate,
  fetchKarats,
  fetchMetalRates,
  selectKarats,
  selectMetalRates,
  selectMetalRatesError,
  selectMetalRatesLoading,
} from "../../../store/slices/metalRateSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

export default function GoldRatePage() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const rates = useAppSelector(selectMetalRates);
  const karats = useAppSelector(selectKarats);
  const loading = useAppSelector(selectMetalRatesLoading);
  const error = useAppSelector(selectMetalRatesError);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [karatId, setKaratId] = useState("");
  const [rate, setRate] = useState("");
  const [filters, setFilters] = useState({ no: "", karat: "", rate: "" });

  useEffect(() => {
    dispatch(fetchKarats());
    dispatch(fetchMetalRates());
  }, [dispatch]);

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
      const rawKaratId = pickValue(item, ["karat_id", "karatId", "karat"]);
      const karatLabel =
        pickValue(item, ["karat_name", "karatName", "karat_label", "karatLabel"]) ??
        karatOptions.find((k) => String(k.id) === String(rawKaratId))?.label ??
        (rawKaratId !== null ? String(rawKaratId) : "-");
      const rateValue = pickValue(item, ["rate", "metal_rate", "metalRate", "value"]);

      return {
        no: index + 1,
        id,
        karat: karatLabel ?? "-",
        rate: rateValue ?? "-",
        _raw: item,
      };
    });
  }, [karatOptions, rates]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const karatQuery = normalize(filters.karat);
    const rateQuery = normalize(filters.rate);

    if (!noQuery && !karatQuery && !rateQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery) : true;
      const karatMatches = karatQuery ? normalize(row.karat).includes(karatQuery) : true;
      const rateMatches = rateQuery ? normalize(row.rate).includes(rateQuery) : true;
      return noMatches && karatMatches && rateMatches;
    });
  }, [filters.karat, filters.no, filters.rate, tableRows]);

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "karat", header: "Karat", filterable: true, filterPlaceholder: "Search Karat" },
    { key: "rate", header: "Rate", filterable: true, filterPlaceholder: "Search Rate" },
  ];

  const openCreate = () => {
    setKaratId("");
    setRate("");
    setModalOpen(true);
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    const payload = { karat_id: Number(karatId), rate: Number(rate) };
    const result = await dispatch(createMetalRate(payload));
    if (!result?.error) {
      setModalOpen(false);
      dispatch(fetchMetalRates());
    }
  };

  return (
    <div className={layout.page}>
      <SidebarNav activePath={pathname} />
      <div className={layout.main}>
        <header className={layout.headerBar}>
          <div className={layout.team} />
          <div className={layout.actionsRow}>
            <button className={layout.chip} onClick={() => setSearchOpen(true)}>
              🔍 ⌘K
            </button>
            <LanguageDropdown />
            <button className={layout.ghostIcon}>⚙️</button>
            <button className={layout.ghostIcon}>🔔</button>
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
          <h1 className={layout.pageTitle}>Metal Rate</h1>
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>Metal Rate</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => dispatch(fetchMetalRates())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className={styles.cta} type="button" onClick={openCreate}>
                  Add Metal Rate
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
              emptyMessage={loading ? "Loading..." : "No metal rates found"}
            />
          </div>
        </main>
      </div>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Modal
        open={modalOpen}
        title="Add Metal Rate"
        onClose={() => setModalOpen(false)}
        footer={
          <div className={styles.formActions}>
            <button className={styles.cta} type="submit" form="metal-rate-form" disabled={loading}>
              Save
            </button>
            <button className={styles.secondaryBtn} type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
          </div>
        }
      >
        <form id="metal-rate-form" className={styles.form} onSubmit={submitCreate}>
          <div className={styles.formRow}>
            <SelectField
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
              placeholder="6000.00"
              required
              preventWheel
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
