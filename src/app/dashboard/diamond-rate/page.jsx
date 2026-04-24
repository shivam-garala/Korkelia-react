"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  createDiamondRate,
  deleteDiamondRate,
  fetchDiamondRates,
  selectDiamondRateError,
  selectDiamondRateLoading,
  selectDiamondRates,
  updateDiamondRate,
} from "../../../store/slices/diamondRateSlice.js";
import {
  fetchDiamondMasters,
  selectDiamondMasters,
} from "../../../store/slices/diamondMasterSlice.js";
import {
  fetchDiamondTypes,
  selectDiamondTypes,
} from "../../../store/slices/diamondTypeSlice.js";
import {
  fetchDiamondClarities,
  selectDiamondClarities,
} from "../../../store/slices/diamondClaritySlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import {
  clearCredentials,
  selectEmail,
  selectUserName,
} from "../../../store/authSlice.js";
import layout from "../../../styles/workspace.module.css";
import styles from "../../../styles/crudPage.module.css";
import { formatDecimalStringForInput } from "../../../lib/decimalString.js";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function extractTypeNames(item) {
  if (!item) return { nameEn: "", nameFi: "" };
  const list = normalizeList(
    pickValue(item, [
      "type_name_array",
      "typeNameArray",
      "type_names",
      "typeNames",
      "translations",
      "diamond_type_translations",
      "diamondTypeTranslations",
      "diamond_type_translation",
      "diamondTypeTranslation",
    ]),
  );
  let nameEn = "";
  let nameFi = "";

  list.forEach((entry) => {
    const languageId = String(
      pickValue(entry, ["language_id", "languageId", "lang_id", "langId"]) ??
        pickValue(entry?.language, [
          "id",
          "language_id",
          "languageId",
          "lang_id",
          "langId",
        ]) ??
        "",
    );
    const languageName = String(
      pickValue(entry?.language, [
        "language_name",
        "languageName",
        "name",
        "label",
      ]) ?? "",
    ).toLowerCase();
    const name = pickValue(entry, [
      "type_name",
      "typeName",
      "diamond_type_name",
      "diamondTypeName",
      "name",
      "label",
    ]);
    if (!name) return;
    if (languageId === "1" || languageName === "english") nameEn = String(name);
    if (languageId === "2" || languageName === "finnish") nameFi = String(name);
  });

  const fallbackName = pickValue(item, [
    "type_name",
    "typeName",
    "diamond_type_name",
    "diamondTypeName",
    "name",
  ]);
  if (!nameEn && fallbackName) nameEn = String(fallbackName);

  return { nameEn, nameFi };
}

function resolveTypeLabel(item) {
  if (!item) return "";
  const { nameEn, nameFi } = extractTypeNames(item);
  const combined = [nameEn, nameFi].filter(Boolean).join(" / ");
  return (
    combined ||
    String(
      pickValue(item, [
        "type_name",
        "typeName",
        "diamond_type_name",
        "diamondTypeName",
        "name",
        "label",
      ]) ?? "",
    )
  );
}

function formatDiamondMasterLabel(item, fallbackId) {
  if (!item)
    return fallbackId !== undefined && fallbackId !== null
      ? String(fallbackId)
      : "-";
  const carat = pickValue(item, ["carat"]);
  return carat !== null && carat !== undefined ? String(carat) : "-";
}

function buildDiamondRateUpdatePayload(raw, rate) {
  return {
    diamond_master_id: Number(
      pickValue(raw, [
        "diamond_master_id",
        "diamondMasterId",
        "diamond_master",
      ]),
    ),
    diamond_type_id: Number(
      pickValue(raw, ["diamond_type_id", "diamondTypeId", "diamond_type"]),
    ),
    clarity_id: Number(
      pickValue(raw, ["clarity_id", "clarityId", "diamond_clarity_id"]),
    ),
    rate: Number(rate),
  };
}

export default function DiamondRatePage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectDiamondRates);
  const diamondMasters = useAppSelector(selectDiamondMasters);
  const diamondTypes = useAppSelector(selectDiamondTypes);
  const diamondClarities = useAppSelector(selectDiamondClarities);
  const loading = useAppSelector(selectDiamondRateLoading);
  const error = useAppSelector(selectDiamondRateError);
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
      return (
        [firstChar, domainChar]
          .filter(Boolean)
          .join("")
          .slice(0, 2)
          .toUpperCase() || "U"
      );
    }
    return "U";
  }, [userEmail, userName]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [inlineRateEditId, setInlineRateEditId] = useState(null);
  const [inlineRateDraft, setInlineRateDraft] = useState("");
  const [savingRateId, setSavingRateId] = useState(null);

  const [diamondMasterId, setDiamondMasterId] = useState("");
  const [diamondTypeId, setDiamondTypeId] = useState("");
  const [clarityId, setClarityId] = useState("");
  const [rate, setRate] = useState("");
  const [filters, setFilters] = useState({
    no: "",
    diamond_master: "",
    diamond_type: "",
    clarity: "",
    rate: "",
  });

  useEffect(() => {
    dispatch(fetchDiamondMasters());
    dispatch(fetchDiamondTypes());
    dispatch(fetchDiamondClarities());
    dispatch(fetchDiamondRates());
  }, [dispatch]);

  const diamondMasterOptions = useMemo(() => {
    const list = Array.isArray(diamondMasters) ? diamondMasters : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "diamond_id", "diamondId"]);
        if (id === null || id === undefined) return null;
        return { id: String(id), label: formatDiamondMasterLabel(item, id) };
      })
      .filter(Boolean);
  }, [diamondMasters]);

  const diamondTypeOptions = useMemo(() => {
    const list = Array.isArray(diamondTypes) ? diamondTypes : [];
    return list
      .map((item) => {
        const id = pickValue(item, [
          "id",
          "type_id",
          "diamond_type_id",
          "typeId",
        ]);
        const label = resolveTypeLabel(item);
        if (
          id === null ||
          id === undefined ||
          label === null ||
          label === undefined
        )
          return null;
        return { id: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [diamondTypes]);

  const clarityOptions = useMemo(() => {
    const list = Array.isArray(diamondClarities) ? diamondClarities : [];
    return list
      .map((item) => {
        const id = pickValue(item, [
          "id",
          "clarity_id",
          "diamond_clarity_id",
          "clarityId",
        ]);
        const label = pickValue(item, [
          "clarity",
          "clarity_name",
          "clarityName",
          "name",
          "label",
        ]);
        if (
          id === null ||
          id === undefined ||
          label === null ||
          label === undefined
        )
          return null;
        return { id: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [diamondClarities]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id =
        pickValue(item, ["id", "diamond_rate_id", "diamondRateId"]) ??
        index + 1;
      const rawDiamondMasterId = pickValue(item, [
        "diamond_master_id",
        "diamondMasterId",
        "diamond_master",
      ]);
      const rawDiamondTypeId = pickValue(item, [
        "diamond_type_id",
        "diamondTypeId",
        "diamond_type",
      ]);
      const rawClarityId = pickValue(item, [
        "clarity_id",
        "clarityId",
        "diamond_clarity_id",
      ]);

      const diamondMasterFromRelation =
        item?.diamond_master ?? item?.diamondMaster ?? null;
      const diamondMasterLabel = diamondMasterFromRelation
        ? formatDiamondMasterLabel(
            diamondMasterFromRelation,
            rawDiamondMasterId,
          )
        : (diamondMasterOptions.find(
            (opt) => String(opt.id) === String(rawDiamondMasterId),
          )?.label ??
          (rawDiamondMasterId !== null && rawDiamondMasterId !== undefined
            ? String(rawDiamondMasterId)
            : "-"));

      const diamondTypeFromRelation =
        resolveTypeLabel(item?.diamond_type ?? item?.diamondType ?? null) ||
        null;
      const diamondTypeLabel =
        diamondTypeFromRelation ??
        diamondTypeOptions.find(
          (opt) => String(opt.id) === String(rawDiamondTypeId),
        )?.label ??
        (rawDiamondTypeId !== null && rawDiamondTypeId !== undefined
          ? String(rawDiamondTypeId)
          : "-");

      const clarityFromRelation =
        item?.clarity?.clarity ??
        item?.clarity?.clarity_name ??
        item?.clarity?.name ??
        null;
      const clarityLabel =
        clarityFromRelation ??
        clarityOptions.find((opt) => String(opt.id) === String(rawClarityId))
          ?.label ??
        (rawClarityId !== null && rawClarityId !== undefined
          ? String(rawClarityId)
          : "-");

      const rateValue = pickValue(item, [
        "rate",
        "diamond_rate",
        "diamondRate",
        "value",
      ]);
      const isMissing =
        rateValue === null ||
        rateValue === undefined ||
        (typeof rateValue === "string" && !String(rateValue).trim());
      const rateForRow = isMissing
        ? "-"
        : formatDecimalStringForInput(rateValue, 2);

      return {
        no: index + 1,
        id,
        diamond_master: diamondMasterLabel ?? "-",
        diamond_type: diamondTypeLabel ?? "-",
        clarity: clarityLabel ?? "-",
        rate: rateForRow,
        _raw: item,
      };
    });
  }, [clarityOptions, diamondMasterOptions, diamondTypeOptions, items]);

  const filteredRows = useMemo(() => {
    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();
    const noQuery = normalize(filters.no);
    const masterQuery = normalize(filters.diamond_master);
    const typeQuery = normalize(filters.diamond_type);
    const clarityQuery = normalize(filters.clarity);
    const rateQuery = normalize(filters.rate);
    if (!noQuery && !masterQuery && !typeQuery && !clarityQuery && !rateQuery)
      return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) ||
          normalize(row.id).includes(noQuery)
        : true;
      const masterMatches = masterQuery
        ? normalize(row.diamond_master).includes(masterQuery)
        : true;
      const typeMatches = typeQuery
        ? normalize(row.diamond_type).includes(typeQuery)
        : true;
      const clarityMatches = clarityQuery
        ? normalize(row.clarity).includes(clarityQuery)
        : true;
      const rateMatches = rateQuery
        ? normalize(row.rate).includes(rateQuery)
        : true;
      return (
        noMatches &&
        masterMatches &&
        typeMatches &&
        clarityMatches &&
        rateMatches
      );
    });
  }, [
    filters.clarity,
    filters.diamond_master,
    filters.diamond_type,
    filters.no,
    filters.rate,
    tableRows,
  ]);

  const openCreate = () => {
    setEditingId(null);
    setDiamondMasterId("");
    setDiamondTypeId("");
    setClarityId("");
    setRate("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "diamond_rate_id", "diamondRateId"]);
    const rawDiamondMasterId = pickValue(row, [
      "diamond_master_id",
      "diamondMasterId",
      "diamond_master",
    ]);
    const rawDiamondTypeId = pickValue(row, [
      "diamond_type_id",
      "diamondTypeId",
      "diamond_type",
    ]);
    const rawClarityId = pickValue(row, [
      "clarity_id",
      "clarityId",
      "diamond_clarity_id",
    ]);
    const rawRate = pickValue(row, [
      "rate",
      "diamond_rate",
      "diamondRate",
      "value",
    ]);

    setEditingId(rawId ?? null);
    setDiamondMasterId(
      rawDiamondMasterId !== null && rawDiamondMasterId !== undefined
        ? String(rawDiamondMasterId)
        : "",
    );
    setDiamondTypeId(
      rawDiamondTypeId !== null && rawDiamondTypeId !== undefined
        ? String(rawDiamondTypeId)
        : "",
    );
    setClarityId(
      rawClarityId !== null && rawClarityId !== undefined
        ? String(rawClarityId)
        : "",
    );
    setRate(
      rawRate === null || rawRate === undefined
        ? ""
        : formatDecimalStringForInput(rawRate, 2),
    );
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      diamond_master_id: Number(diamondMasterId),
      diamond_type_id: Number(diamondTypeId),
      clarity_id: Number(clarityId),
      rate: Number(rate),
    };

    const action = editingId
      ? updateDiamondRate({ id: editingId, payload })
      : createDiamondRate(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchDiamondRates());
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteDiamondRate(deleteTarget));
    dispatch(fetchDiamondRates());
    setDeleteTarget(null);
  };

  const cancelInlineRateEdit = useCallback(() => {
    setInlineRateEditId(null);
    setInlineRateDraft("");
  }, []);

  const startInlineRateEdit = useCallback(
    (row) => {
      if (savingRateId) return;
      const draft =
        row.rate === "-" || row.rate === "" || row.rate == null
          ? ""
          : formatDecimalStringForInput(row.rate, 2);
      setInlineRateEditId(row.id);
      setInlineRateDraft(draft);
    },
    [savingRateId],
  );

  const commitInlineRateEdit = useCallback(
    async (row, draftValue) => {
      if (savingRateId) return;
      const trimmed = String(draftValue ?? "").trim();
      if (trimmed === "") {
        cancelInlineRateEdit();
        return;
      }
      const next = parseFloat(trimmed);
      if (Number.isNaN(next)) {
        cancelInlineRateEdit();
        return;
      }
      const prevRaw = pickValue(row._raw, [
        "rate",
        "diamond_rate",
        "diamondRate",
        "value",
      ]);
      const prevNum = parseFloat(prevRaw);
      if (!Number.isNaN(prevNum) && prevNum === next) {
        cancelInlineRateEdit();
        return;
      }
      const raw = row._raw;
      const payload = buildDiamondRateUpdatePayload(raw, next);
      if (
        [
          payload.diamond_master_id,
          payload.diamond_type_id,
          payload.clarity_id,
        ].some((n) => Number.isNaN(n))
      ) {
        cancelInlineRateEdit();
        return;
      }
      setSavingRateId(row.id);
      const result = await dispatch(updateDiamondRate({ id: row.id, payload }));
      setSavingRateId(null);
      if (!result?.error) {
        await dispatch(fetchDiamondRates());
        cancelInlineRateEdit();
      }
    },
    [savingRateId, dispatch, cancelInlineRateEdit],
  );

  const columns = useMemo(
    () => [
      {
        key: "no",
        header: "No.",
        filterable: false,
        filterPlaceholder: "Search No.",
      },
      {
        key: "diamond_master",
        header: "Carat",
        filterable: true,
        filterPlaceholder: "Search Carat",
      },
      {
        key: "diamond_type",
        header: "Diamond Type",
        filterable: true,
        filterPlaceholder: "Search Type",
      },
      {
        key: "clarity",
        header: "Clarity",
        filterable: true,
        filterPlaceholder: "Search Clarity",
      },
      {
        key: "rate",
        header: "Rate Per Carat",
        filterable: true,
        filterPlaceholder: "Search Rate Per Carat",
        render: (row) => {
          const isEditing = inlineRateEditId === row.id;
          const isSaving = savingRateId === row.id && isEditing;
          if (isEditing) {
            return (
              <div className={styles.inlineRateCell}>
                <div className={styles.inlineFieldRow}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.inlineRateInput}
                    value={inlineRateDraft}
                    onChange={(e) => {
                      let val = e.target.value;
                      val = val.replace(/^0+(?=\d)/, "");
                      setInlineRateDraft(val);
                    }}
                    onBlur={(e) =>
                      void commitInlineRateEdit(row, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitInlineRateEdit(row, inlineRateDraft);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelInlineRateEdit();
                      }
                    }}
                    disabled={isSaving}
                    autoFocus
                    aria-label="Rate per carat"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="check"
                    iconPosition="right"
                    iconOnly
                    type="button"
                    className={styles.inlineRateSaveButton}
                    disabled={isSaving}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      void commitInlineRateEdit(row, inlineRateDraft)
                    }
                    aria-label="Save rate per carat"
                    title="Update rate"
                  >
                    Update rate
                  </Button>
                </div>
                {isSaving ? (
                  <span className={styles.inlineRateSaving}>Saving…</span>
                ) : null}
              </div>
            );
          }
          return (
            <div className={styles.inlineRateCell}>
              <div className={styles.inlineRateView}>
                <button
                  type="button"
                  className={styles.inlineRateTrigger}
                  onClick={() => startInlineRateEdit(row)}
                  disabled={Boolean(savingRateId)}
                  title="Click to edit rate"
                >
                  {row.rate}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="edit"
                  iconOnly
                  onClick={() => startInlineRateEdit(row)}
                  disabled={Boolean(savingRateId)}
                  aria-label="Edit rate per carat"
                  title="Edit rate"
                >
                  Edit rate
                </Button>
              </div>
            </div>
          );
        },
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
            <Button
              variant="danger"
              size="sm"
              icon="delete"
              iconOnly
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [
      inlineRateEditId,
      inlineRateDraft,
      savingRateId,
      cancelInlineRateEdit,
      commitInlineRateEdit,
      startInlineRateEdit,
    ],
  );

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
              <h2 className={styles.title}>Diamond Rate Master</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh"
                  iconOnly
                  onClick={() => dispatch(fetchDiamondRates())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Diamond Rate
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
        title={editingId ? "Update Diamond Rate" : "Add Diamond Rate"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button
              variant="primarySoft"
              type="submit"
              form="diamond-rate-form"
              disabled={loading}
            >
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
        <form id="diamond-rate-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow3}>
            <AdminSelectField
              label="Carat"
              value={diamondMasterId}
              onChange={(e) => setDiamondMasterId(e.target.value)}
              required
              disabled={!diamondMasterOptions.length}
              placeholder={
                diamondMasterOptions.length
                  ? "Select carat"
                  : "Loading carats..."
              }
              options={diamondMasterOptions.map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
            />
            <AdminSelectField
              label="Diamond Type"
              value={diamondTypeId}
              onChange={(e) => setDiamondTypeId(e.target.value)}
              required
              disabled={!diamondTypeOptions.length}
              placeholder={
                diamondTypeOptions.length ? "Select type" : "Loading types..."
              }
              options={diamondTypeOptions.map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
            />
            <AdminSelectField
              label="Clarity"
              value={clarityId}
              onChange={(e) => setClarityId(e.target.value)}
              required
              disabled={!clarityOptions.length}
              placeholder={
                clarityOptions.length
                  ? "Select clarity"
                  : "Loading clarities..."
              }
              options={clarityOptions.map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
            />
            <TextField
              label="Rate"
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => {
                let val = e.target.value;
                val = val.replace(/^0+(?=\d)/, "");
                setRate(val);
              }}
              required
              preventWheel
            />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Diamond Rate"
        message="Delete this diamond rate? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
