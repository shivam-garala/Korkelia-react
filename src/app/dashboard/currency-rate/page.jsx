'use client';

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTableSuspense.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import AdminSelectField from "../../../components/ui/AdminSelectField.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import Button from "../../../components/ui/Button.jsx";
import styles from "./page.module.css";
import layout from "../../../styles/workspace.module.css";
import {
  createCurrencyRate,
  fetchCurrencyRate,
  fetchCurrencyRates,
  selectCurrencyRates,
  selectCurrencyRatesError,
  selectCurrencyRatesLoading,
  updateCurrencyRate,
} from "../../../store/slices/currencyRateSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";
import {
  CURRENCY_OPTIONS,
  getCurrencyOption,
} from "../../../constants/currencyOptions.js";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

export default function CurrencyRatePage() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const rates = useAppSelector(selectCurrencyRates);
  const loading = useAppSelector(selectCurrencyRatesLoading);
  const error = useAppSelector(selectCurrencyRatesError);
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
  const [currencyCode, setCurrencyCode] = useState("");
  const [rate, setRate] = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(true);
  const [filters, setFilters] = useState({ no: "", currency_code: "", rate: "", visible: "" });

  useEffect(() => {
    dispatch(fetchCurrencyRates());
  }, [dispatch]);

  const tableRows = useMemo(() => {
    const items = Array.isArray(rates) ? rates : [];
    return items.map((item, index) => {
      const id = pickValue(item, ["id"]);
      const code = String(pickValue(item, ["currency_code", "code"]) ?? "").toUpperCase();
      const rateValue = pickValue(item, ["rate", "value"]);
      const visibleRaw = pickValue(item, ["show_on_website", "visible", "is_visible"]);
      const visible =
        typeof visibleRaw === "boolean"
          ? visibleRaw
          : Number(visibleRaw) === 1 || String(visibleRaw).toLowerCase() === "true";
      return {
        no: index + 1,
        id,
        currency_code: code || "-",
        rate: rateValue ?? "-",
        visible,
        _raw: item,
      };
    });
  }, [rates]);

  const currencySelectOptions = useMemo(() => {
    const availableOptions = CURRENCY_OPTIONS.filter(
      (option) => String(option?.value ?? "").toUpperCase() !== "EUR"
    );
    const code = String(currencyCode || "").toUpperCase();
    const isListed = availableOptions.some(
      (option) => String(option?.value ?? "").toUpperCase() === code
    );
    if (code && !isListed) {
      return [
        { value: code, label: `${code} — (saved code; pick a listed currency to replace)` },
        ...availableOptions,
      ];
    }
    return availableOptions;
  }, [currencyCode]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const codeQuery = normalize(filters.currency_code);
    const rateQuery = normalize(filters.rate);
    const visibleQuery = normalize(filters.visible);

    if (!noQuery && !codeQuery && !rateQuery && !visibleQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches =
        noQuery && row.no != null
          ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
          : true;
      const codeMatches = codeQuery ? normalize(row.currency_code).includes(codeQuery) : true;
      const rateMatches = rateQuery ? normalize(row.rate).includes(rateQuery) : true;
      const visibleLabel = row.visible ? "yes" : "no";
      const visibleMatches = visibleQuery
        ? normalize(visibleLabel).includes(visibleQuery) ||
          normalize(String(row.visible)).includes(visibleQuery)
        : true;
      return noMatches && codeMatches && rateMatches && visibleMatches;
    });
  }, [filters.currency_code, filters.no, filters.rate, filters.visible, tableRows]);

  const usedCurrencyCodesForSelect = useMemo(
    () =>
      tableRows
        .filter((row) => {
          if (editingId == null) return true;
          return String(row.id) !== String(editingId);
        })
        .map((row) => String(row.currency_code ?? "").toUpperCase())
        .filter((c) => c && c !== "-"),
    [tableRows, editingId],
  );

  const openCreate = () => {
    setEditingId(null);
    setCurrencyCode("");
    setRate("");
    setShowOnWebsite(true);
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    const rawId = pickValue(row, ["id"]);
    const rawCode = pickValue(row, ["currency_code", "code"]);
    const rawRate = pickValue(row, ["rate", "value"]);
    const rawVisible = pickValue(row, ["show_on_website", "visible", "is_visible"]);

    setEditingId(rawId ?? null);
    setCurrencyCode(rawCode !== null && rawCode !== undefined ? String(rawCode).toUpperCase() : "");
    setRate(rawRate !== null && rawRate !== undefined ? String(rawRate) : "");
    setShowOnWebsite(
      typeof rawVisible === "boolean"
        ? rawVisible
        : Number(rawVisible) === 1 || String(rawVisible).toLowerCase() === "true"
    );
    setModalOpen(true);

    if (rawId !== null && rawId !== undefined) {
      const result = await dispatch(fetchCurrencyRate(rawId));
      if (!result?.error) {
        const payload = result.payload?.data?.data ?? result.payload?.data ?? result.payload;
        if (payload && typeof payload === "object") {
          const freshCode = pickValue(payload, ["currency_code", "code"]);
          const freshRate = pickValue(payload, ["rate", "value"]);
          const freshVisible = pickValue(payload, ["show_on_website", "visible", "is_visible"]);
          setCurrencyCode(
            freshCode !== null && freshCode !== undefined ? String(freshCode).toUpperCase() : ""
          );
          setRate(freshRate !== null && freshRate !== undefined ? String(freshRate) : "");
          setShowOnWebsite(
            typeof freshVisible === "boolean"
              ? freshVisible
              : Number(freshVisible) === 1 ||
                  String(freshVisible).toLowerCase() === "true"
          );
        }
      }
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      currency_code: String(currencyCode || "").toUpperCase(),
      rate: Number(rate),
      show_on_website: showOnWebsite ? 1 : 0,
    };
    const action = editingId
      ? updateCurrencyRate({ id: editingId, payload })
      : createCurrencyRate(payload);
    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchCurrencyRates());
    }
  };

  const columns = [
    { key: "no", header: "No.", filterable: false, filterPlaceholder: "Search No." },
    {
      key: "currency_code",
      header: "Currency",
      filterable: true,
      filterPlaceholder: "Search Currency",
      render: (row) => {
        const raw = row.currency_code;
        if (raw == null || raw === "" || raw === "-") return "-";
        const code = String(raw).toUpperCase();
        const meta = getCurrencyOption(code);
        if (!meta) {
          return code;
        }
        return (
          <span className={styles.currencyCell}>
            {meta.icon ? (
              <Image
                className={styles.currencyTableIcon}
                src={meta.icon}
                alt={meta.iconAlt ?? ""}
                width={22}
                height={16}
                unoptimized
              />
            ) : meta.symbol ? (
              <span className={styles.currencyTableSymbol} aria-hidden>
                {meta.symbol}
              </span>
            ) : null}
            <span>{meta.label}</span>
          </span>
        );
      },
    },
    { key: "rate", header: "Rate", filterable: true, filterPlaceholder: "Search Rate" },
    {
      key: "visible",
      header: "Show on Website",
      filterable: true,
      filterPlaceholder: "yes / no",
      render: (row) => (row.visible ? "Yes" : "No"),
    },
    {
      key: "actions",
      header: "Action",
      filterable: false,
      render: (row) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            icon="edit"
            iconOnly
            onClick={() => openEdit(row._raw)}
          >
            Edit
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
              <h2 className={styles.title}>Currency Rates</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh"
                  iconOnly
                  onClick={() => dispatch(fetchCurrencyRates())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Currency Rate
                </Button>
              </div>
            </div>

            {error && (
              <p style={{ color: "#b91c1c", marginBottom: 8, fontSize: 14 }}>
                {String(error)}
              </p>
            )}

            <DataTable
              columns={columns}
              rows={filteredRows}
              getRowKey={(row) => row.id}
              filters={filters}
              onFiltersChange={setFilters}
              emptyMessage={loading ? "Loading..." : "No currency rates found"}
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
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Modal
        open={modalOpen}
        title={editingId ? "Update Currency Rate" : "Add Currency Rate"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant="primarySoft" type="submit" form="currency-rate-form" disabled={loading}>
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
        <form id="currency-rate-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow}>
            <AdminSelectField
              label="Currency"
              placeholder="Select currency"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(String(e.target.value ?? "").toUpperCase())}
              options={currencySelectOptions}
              excludeOptionValues={usedCurrencyCodesForSelect}
              required
            />
            <TextField
              label="Rate (units per 1 EUR)"
              type="number"
              step="0.000001"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
              preventWheel
            />
            <label className={styles.toggleField}>
              <span className={styles.toggleLabel}>Show on Website</span>
              <input
                type="checkbox"
                checked={showOnWebsite}
                onChange={(event) => setShowOnWebsite(event.target.checked)}
              />
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

