'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Select from "react-select";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import { clearCredentials, selectUserName, selectEmail } from "../../../store/authSlice.js";
import {
  createDesign,
  fetchDesigns,
  selectDesigns,
  selectDesignsError,
  selectDesignsLoading,
} from "../../../store/slices/designSlice.js";
import {
  fetchCategoryMasters,
  selectCategoryMasters,
} from "../../../store/slices/categoryMasterSlice.js";
import { fetchStyleMasters, selectStyleMasters } from "../../../store/slices/styleMasterSlice.js";
import { fetchCutMasters, selectCutMasters } from "../../../store/slices/cutMasterSlice.js";
import { fetchDiamondMasters, selectDiamondMasters } from "../../../store/slices/diamondMasterSlice.js";
import { fetchKarats, selectKarats } from "../../../store/slices/metalRateSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import layout from "../../../styles/workspace.module.css";
import crudStyles from "../../../styles/crudPage.module.css";
import styles from "./page.module.css";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function stringifyValue(value, nestedKeys = []) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const nested = pickValue(value, nestedKeys);
    if (nested === null || nested === undefined) return null;
    if (typeof nested === "object") return null;
    return String(nested);
  }
  return null;
}

function resolveLabelFromEntity(entity, fallbackKeys) {
  if (!entity || typeof entity !== "object") return null;
  const direct =
    stringifyValue(entity, ["name", "label", "title", "code"]) ??
    pickValue(entity, fallbackKeys ?? []);
  if (direct !== null && typeof direct !== "object") return String(direct);
  return stringifyValue(entity, fallbackKeys);
}

const reactSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: 44,
    borderRadius: 10,
    borderColor: "var(--color-border)",
    boxShadow: "none",
    "&:hover": { borderColor: "var(--color-line)" },
  }),
  menu: (base) => ({ ...base, zIndex: 20 }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isFocused ? "var(--color-primary-soft)" : "white",
    color: "var(--foreground)",
  }),
  multiValue: (base) => ({ ...base, backgroundColor: "#eef2ff" }),
  multiValueRemove: (base) => ({ ...base, ":hover": { backgroundColor: "#e2e8f0", color: "black" } }),
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export default function DesignPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const designs = useAppSelector(selectDesigns);
  const loading = useAppSelector(selectDesignsLoading);
  const error = useAppSelector(selectDesignsError);
  const categories = useAppSelector(selectCategoryMasters);
  const styleMasters = useAppSelector(selectStyleMasters);
  const cutMasters = useAppSelector(selectCutMasters);
  const diamondMasters = useAppSelector(selectDiamondMasters);
  const karats = useAppSelector(selectKarats);
  const userName = useAppSelector(selectUserName) ?? "Admin";
  const userEmail = useAppSelector(selectEmail) ?? "";

  const avatarInitials = useMemo(() => {
    const base = userName || "U";
    return base
      .split(" ")
      .map((part) => part.trim()?.[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [userName]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categoryOption, setCategoryOption] = useState(null);
  const [styleOption, setStyleOption] = useState(null);
  const [selectedCutOptions, setSelectedCutOptions] = useState([]);
  const [selectedCaratOptions, setSelectedCaratOptions] = useState([]);
  const [selectedKaratOptions, setSelectedKaratOptions] = useState([]);
  const [pcsByCombo, setPcsByCombo] = useState({});
  const [filters, setFilters] = useState({
    variant: "",
    category: "",
    style: "",
    cut: "",
    carat: "",
    pcs: "",
    karat: "",
  });

  useEffect(() => {
    dispatch(fetchDesigns());
    dispatch(fetchCategoryMasters());
    dispatch(fetchStyleMasters());
    dispatch(fetchCutMasters());
    dispatch(fetchDiamondMasters());
    dispatch(fetchKarats());
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    const items = Array.isArray(categories) ? categories : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "category_id", "categoryId"]);
        const label = pickValue(item, ["category_name", "categoryName", "name"]);
        if (id === null || id === undefined || !label) return null;
        return { value: id, label: String(label) };
      })
      .filter(Boolean);
  }, [categories]);

  const styleOptions = useMemo(() => {
    const items = Array.isArray(styleMasters) ? styleMasters : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "style_id", "styleId"]);
        const label = pickValue(item, ["style_name", "styleName", "name"]);
        if (id === null || id === undefined || !label) return null;
        return { value: id, label: String(label) };
      })
      .filter(Boolean);
  }, [styleMasters]);

  const cutOptions = useMemo(() => {
    const items = Array.isArray(cutMasters) ? cutMasters : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "cut_id", "cutId"]);
        const name = pickValue(item, ["cut_name", "cutName", "name"]);
        const code = pickValue(item, ["cut_code", "cutCode", "code"]);
        const label = name ?? code;
        if (id === null || id === undefined || !label) return null;
        return { value: id, label: String(label) };
      })
      .filter(Boolean);
  }, [cutMasters]);

  const diamondOptions = useMemo(() => {
    const items = Array.isArray(diamondMasters) ? diamondMasters : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "diamond_id", "diamondId"]);
        const carat = pickValue(item, ["carat", "diamond_carat"]);
        const from = pickValue(item, ["size_from", "sizeFrom"]);
        const to = pickValue(item, ["size_to", "sizeTo"]);
        if (id === null || id === undefined) return null;
        const sizeLabel =
          from !== null && from !== undefined && to !== null && to !== undefined
            ? `(${from}-${to})`
            : "";
        const label = [carat, sizeLabel].filter(Boolean).join(" ").trim() || `Diamond ${id}`;
        return { value: id, label: String(label), carat, caratValue: parseNumber(carat) };
      })
      .filter(Boolean);
  }, [diamondMasters]);

  const karatOptions = useMemo(() => {
    const items = Array.isArray(karats) ? karats : [];
    return items
      .map((item) => {
        const id = pickValue(item, ["id", "karat_id", "karatId"]);
        const value = pickValue(item, ["karat_value", "karatValue", "karat"]);
        const label = pickValue(item, ["karat_name", "karatName", "name", "label"]) ?? value;
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { value: id, label: String(label), karatValue: value };
      })
      .filter(Boolean);
  }, [karats]);

  const cutMap = useMemo(() => {
    const items = Array.isArray(cutMasters) ? cutMasters : [];
    const map = new Map();
    items.forEach((item) => {
      const id = pickValue(item, ["id", "cut_id", "cutId"]);
      if (id !== null && id !== undefined) map.set(String(id), item);
    });
    return map;
  }, [cutMasters]);

  const diamondMap = useMemo(() => {
    const items = Array.isArray(diamondMasters) ? diamondMasters : [];
    const map = new Map();
    items.forEach((item) => {
      const id = pickValue(item, ["id", "diamond_id", "diamondId"]);
      if (id !== null && id !== undefined) map.set(String(id), item);
    });
    return map;
  }, [diamondMasters]);

  const karatMap = useMemo(() => {
    const items = Array.isArray(karats) ? karats : [];
    const map = new Map();
    items.forEach((item) => {
      const id = pickValue(item, ["id", "karat_id", "karatId"]);
      if (id !== null && id !== undefined) map.set(String(id), item);
    });
    return map;
  }, [karats]);

  const detailLines = useMemo(() => {
    return selectedCutOptions.flatMap((cutOpt) =>
      selectedCaratOptions.map((caratOpt) => {
        const cutId = cutOpt?.value ?? cutOpt;
        const caratId = caratOpt?.value ?? caratOpt;
        const comboKey = `${cutId}-${caratId}`;
        const caratValue = parseNumber(
          caratOpt?.caratValue ?? pickValue(caratOpt, ["carat", "diamond_carat"]) ?? caratOpt?.label
        );

        return {
          comboKey,
          cutId,
          caratId,
          cutLabel: cutOpt?.label ?? `Cut ${cutId}`,
          caratLabel: caratOpt?.label ?? `Carat ${caratId}`,
          caratValue,
          pcs: pcsByCombo[comboKey] ?? "",
        };
      })
    );
  }, [pcsByCombo, selectedCaratOptions, selectedCutOptions]);

  useEffect(() => {
    setPcsByCombo((prev) => {
      const validKeys = new Set(detailLines.map((line) => line.comboKey));
      let changed = false;
      const next = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (validKeys.has(key)) {
          next[key] = value;
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [detailLines]);

  const resetForm = () => {
    setCategoryOption(null);
    setStyleOption(null);
    setSelectedCutOptions([]);
    setSelectedCaratOptions([]);
    setSelectedKaratOptions([]);
    setPcsByCombo({});
  };

  const buildDetailLinesFromDesign = useCallback(
    (design) => {
      const cutDetails = Array.isArray(design?.cut_details) ? design.cut_details : [];
      const lines = [];

      const addLine = ({ cutId, cutLabel, diamond }) => {
        const diamondId = pickValue(diamond, ["diamond_master_id", "diamond_id", "diamondId"]);
        const caratValue = pickValue(diamond, ["diamond_carat", "carat", "diamond_size_from"]);
        const pcsValue = pickValue(diamond, ["diamond_pcs", "pcs", "pieces"]);
        const rawCaratLabel =
          caratValue ?? diamondOptions.find((opt) => String(opt.value) === String(diamondId))?.label;
        const caratLabel = stringifyValue(rawCaratLabel, ["diamond_carat", "carat", "diamond_size_from"]) ?? "-";

        lines.push({
          cutId,
          cutLabel,
          caratLabel,
          pcs: pcsValue ?? "-",
        });
      };

      if (cutDetails.length) {
        cutDetails.forEach((cutDetail) => {
          const cutId = pickValue(cutDetail, ["cut_master_id", "cut_id", "cutId", "id"]);
          const rawCutLabel =
            pickValue(cutDetail, ["cut_name", "cutName", "cut_code", "cutCode", "name", "code"]) ??
            cutOptions.find((opt) => String(opt.value) === String(cutId))?.label;
          const cutLabel =
            stringifyValue(rawCutLabel, ["cut_name", "cutName", "name", "cut_code", "cutCode", "code"]) ??
            (cutId ? `Cut ${cutId}` : "-");

          const diamonds = Array.isArray(cutDetail?.diamond_details) ? cutDetail.diamond_details : [];

          if (diamonds.length) {
            diamonds.forEach((diamond) => addLine({ cutId, cutLabel, diamond }));
          } else {
            lines.push({
              cutId,
              cutLabel,
              caratLabel: "-",
              pcs: "-",
            });
          }
        });
      } else {
        const singleCutId = pickValue(design?.cut, ["id", "cut_id", "cutId", "cut_master_id"]);
        const rawCutLabel =
          resolveLabelFromEntity(design?.cut, ["cut_name", "cutName", "name", "cut_code", "cutCode", "code"]) ??
          cutOptions.find((opt) => String(opt.value) === String(singleCutId))?.label;
        const cutLabel =
          stringifyValue(rawCutLabel, ["cut_name", "cutName", "name", "cut_code", "cutCode", "code"]) ??
          (singleCutId ? `Cut ${singleCutId}` : "-");
        const diamonds = Array.isArray(design?.diamond_details) ? design.diamond_details : [];

        if (diamonds.length) {
          diamonds.forEach((diamond) => addLine({ cutId: singleCutId, cutLabel, diamond }));
        } else {
          lines.push({
            cutId: singleCutId,
            cutLabel,
            caratLabel: "-",
            pcs: "-",
          });
        }
      }

      return lines;
    },
    [cutOptions, diamondOptions]
  );

  const tableRows = useMemo(() => {
    const items = Array.isArray(designs) ? designs : [];
    return items.map((item, index) => {
      const id = pickValue(item, ["id", "design_id", "designId"]) ?? index + 1;
      const categoryIdValue = pickValue(item, ["category_id", "categoryId"]);
      const styleIdValue = pickValue(item, ["style_id", "styleId"]);
      const variantName =
        pickValue(item, ["design_variant_name"]) ?? null;

      const rawCategory =
        resolveLabelFromEntity(item?.category, ["category_name", "categoryName", "name", "category_code", "categoryCode"]) ??
        pickValue(item, ["category_name", "categoryName", "category"]) ??
        categoryOptions.find((opt) => String(opt.value) === String(categoryIdValue))?.label;
      const categoryLabel =
        stringifyValue(rawCategory, ["category_name", "categoryName", "name", "category_code", "categoryCode", "code"]) ??
        "-";

      const rawStyle =
        resolveLabelFromEntity(item?.style, ["style_name", "styleName", "name", "style_code", "styleCode"]) ??
        pickValue(item, ["style_name", "styleName"]) ??
        styleOptions.find((opt) => String(opt.value) === String(styleIdValue))?.label;
      const styleLabel = stringifyValue(rawStyle, ["style_name", "styleName", "name", "style_code", "styleCode"]) ?? "-";

      const detail = buildDetailLinesFromDesign(item);
      const cutsLabel =
        Array.from(
          new Set(detail.map((d) => d.cutLabel).filter((value) => value !== null && value !== undefined))
        ).join(", ") || "-";
      const caratsLabel =
        Array.from(
          new Set(
            detail.map((d) => d.caratLabel).filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
          )
        ).join(", ") || "-";
      const pcsLabel = detail
        .map((d) => d.pcs ?? "")
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
        .join(", ");

      const karatDetails = Array.isArray(item?.karat_details) ? item.karat_details : [];
      const singleKarat = item?.karat && typeof item.karat === "object" ? [item.karat] : [];
      const karatLabels = [...karatDetails, ...singleKarat]
        .map((k) =>
          stringifyValue(
            pickValue(k, ["karat_name", "karatName", "karat_label", "karatLabel", "karat_value", "karatValue", "karat"]),
            ["karat_name", "karatName", "karat_label", "karatLabel", "karat_value", "karatValue", "karat"]
          )
        )
        .filter(Boolean);

      return {
        id,
        category: categoryLabel,
        style: styleLabel,
        cut: cutsLabel,
        carat: caratsLabel,
        pcs: pcsLabel || "-",
        karat: karatLabels.join(", ") || "-",
        detailLines: detail,
        karatValues: karatLabels,
        variant: variantName ? String(variantName) : "-",
        variantName: variantName ? String(variantName) : "",
        _raw: item,
      };
    });
  }, [buildDetailLinesFromDesign, categoryOptions, designs, styleOptions]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const variantQuery = normalize(filters.variant);
    const categoryQuery = normalize(filters.category);
    const styleQuery = normalize(filters.style);
    const cutQuery = normalize(filters.cut);
    const caratQuery = normalize(filters.carat);
    const pcsQuery = normalize(filters.pcs);
    const karatQuery = normalize(filters.karat);

    if (
      !variantQuery &&
      !categoryQuery &&
      !styleQuery &&
      !cutQuery &&
      !caratQuery &&
      !pcsQuery &&
      !karatQuery
    ) {
      return tableRows;
    }

    return tableRows.filter((row) => {
      const variantMatches = variantQuery ? normalize(row.variantName).includes(variantQuery) : true;
      const categoryMatches = categoryQuery ? normalize(row.category).includes(categoryQuery) : true;
      const styleMatches = styleQuery ? normalize(row.style).includes(styleQuery) : true;
      const cutMatches = cutQuery ? normalize(row.cut).includes(cutQuery) : true;
      const caratMatches = caratQuery ? normalize(row.carat).includes(caratQuery) : true;
      const pcsMatches = pcsQuery ? normalize(row.pcs).includes(pcsQuery) : true;
      const karatMatches = karatQuery ? normalize(row.karat).includes(karatQuery) : true;
      return (
        variantMatches &&
        categoryMatches &&
        styleMatches &&
        cutMatches &&
        caratMatches &&
        pcsMatches &&
        karatMatches
      );
    });
  }, [
    filters.carat,
    filters.category,
    filters.cut,
    filters.karat,
    filters.pcs,
    filters.style,
    filters.variant,
    tableRows,
  ]);

  const columns = [
    {
      key: "variant",
      header: "Design Variant",
      filterable: true,
      filterPlaceholder: "Search variant",
    },
    {
      key: "category",
      header: "Category",
      filterable: true,
      filterPlaceholder: "Search category",
    },
    { key: "style", header: "Style", filterable: true, filterPlaceholder: "Search style" },
    {
      key: "cut",
      header: "Cut",
      filterable: true,
      filterPlaceholder: "Search cut",
    },
    {
      key: "carat",
      header: "Carat",
      filterable: true,
      filterPlaceholder: "Search carat",
    },
    {
      key: "pcs",
      header: "Pcs",
      filterable: true,
      filterPlaceholder: "Search pcs",
    },
    {
      key: "karat",
      header: "Karat",
      filterable: true,
      filterPlaceholder: "Search karat",
    },
  ];

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCaratChange = (options) => {
    setSelectedCaratOptions(options ?? []);
  };

  const submitDesign = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (!categoryOption || !styleOption || !selectedCutOptions.length || !selectedCaratOptions.length) {
      window.alert("Please select category, style, cut(s), and carat(s).");
      return;
    }

    const missingPcs = detailLines.some((line) => {
      const value = pcsByCombo[line.comboKey];
      return value === undefined || value === null || String(value).trim() === "";
    });
    if (missingPcs) {
      window.alert("Enter PCS for each detail row.");
      return;
    }

    const cutDetailsById = {};
    detailLines.forEach((line) => {
      const cutIdNum = Number(line.cutId);
      if (Number.isNaN(cutIdNum)) return;

      if (!cutDetailsById[cutIdNum]) {
        const cutItem = cutMap.get(String(line.cutId));
        const cutName = pickValue(cutItem, ["cut_name", "cutName", "name"]);
        const cutCode = pickValue(cutItem, ["cut_code", "cutCode", "code"]);
        cutDetailsById[cutIdNum] = {
          cut_master_id: cutIdNum,
          ...(cutName ? { cut_name: cutName } : {}),
          ...(cutCode ? { cut_code: cutCode } : {}),
          diamond_details: [],
        };
      }

      const diamond = diamondMap.get(String(line.caratId));
      const diamondCarat = pickValue(diamond, ["diamond_carat", "carat"]);
      const numericFromDiamond = parseNumber(diamondCarat);
      const numericFromLine = parseNumber(line.caratValue);
      const numericFromLabel = parseNumber(line.caratLabel);
      const caratPayload = [numericFromDiamond, numericFromLine, numericFromLabel].find(
        (val) => typeof val === "number" && Number.isFinite(val)
      );
      const pcsValue = Number(pcsByCombo[line.comboKey] ?? line.pcs ?? 0) || 0;

      cutDetailsById[cutIdNum].diamond_details.push({
        diamond_master_id: Number(line.caratId),
        ...(caratPayload !== undefined ? { diamond_carat: caratPayload } : {}),
        diamond_pcs: pcsValue,
      });
    });

    const karatDetails = selectedKaratOptions.map((opt) => {
      const karatItem = karatMap.get(String(opt?.value ?? opt));
      const karatValue = opt?.karatValue ?? pickValue(karatItem, ["karat_value", "karatValue", "karat"]);
      const karatName = opt?.label ?? pickValue(karatItem, ["karat_name", "karatName", "name", "label"]);
      return {
        karat_master_id: Number(opt?.value ?? opt),
        ...(karatValue ? { karat_value: karatValue } : {}),
        ...(karatName ? { karat_name: karatName } : {}),
      };
    });

    const categoryLabel = categoryOption?.label;
    const styleLabel = styleOption?.label;

    const payload = {
      category_id: Number(categoryOption.value),
      ...(categoryLabel ? { category_name: categoryLabel } : {}),
      style_id: Number(styleOption.value),
      ...(styleLabel ? { style_name: styleLabel } : {}),
      cut_details: Object.values(cutDetailsById),
      karat_details: karatDetails,
    };

    setSaving(true);
    const result = await dispatch(createDesign(payload));
    if (!result?.error) {
      resetForm();
      setModalOpen(false);
      dispatch(fetchDesigns());
    }
    setSaving(false);
  };

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
          <div className={crudStyles.panel}>
            <div className={crudStyles.headerRow}>
              <h2 className={crudStyles.title}>Design</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className={crudStyles.secondaryBtn}
                  type="button"
                  onClick={() => dispatch(fetchDesigns())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className={crudStyles.cta} type="button" onClick={openCreate}>
                  Create Design
                </button>
              </div>
            </div>

            {error ? <div className={crudStyles.error}>{String(error)}</div> : null}

            <DataTable
              columns={columns}
              rows={filteredRows}
              getRowKey={(row) => row.id}
              filters={filters}
              onFiltersChange={setFilters}
              emptyMessage={loading ? "Loading..." : "No designs found"}
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
        title="Create Design"
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        footer={
          <div className={crudStyles.formActions}>
            <button className={crudStyles.cta} type="submit" form="design-form" disabled={saving || loading}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className={crudStyles.secondaryBtn}
              type="button"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
          </div>
        }
      >
        <form id="design-form" className={crudStyles.form} onSubmit={submitDesign}>
          <div className={crudStyles.formRow2}>
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Category</label>
              <Select
                classNamePrefix="rs"
                value={categoryOption}
                onChange={(opt) => setCategoryOption(opt ?? null)}
                options={categoryOptions}
                placeholder={categoryOptions.length ? "Select category" : "No categories"}
                isClearable
                isSearchable
                styles={reactSelectStyles}
                isDisabled={!categoryOptions.length}
              />
            </div>
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Style</label>
              <Select
                classNamePrefix="rs"
                value={styleOption}
                onChange={(opt) => setStyleOption(opt ?? null)}
                options={styleOptions}
                placeholder={styleOptions.length ? "Select style" : "No styles"}
                isClearable
                isSearchable
                styles={reactSelectStyles}
                isDisabled={!styleOptions.length}
              />
            </div>
          </div>

          <div className={crudStyles.formRow2}>
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Cut</label>
              <Select
                classNamePrefix="rs"
                value={selectedCutOptions}
                onChange={(opts) => setSelectedCutOptions(opts ?? [])}
                options={cutOptions}
                placeholder={cutOptions.length ? "Select cut(s)" : "No cuts"}
                isMulti
                isSearchable
                styles={reactSelectStyles}
                isDisabled={!cutOptions.length}
              />
            </div>
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Carat</label>
              <Select
                classNamePrefix="rs"
                value={selectedCaratOptions}
                onChange={handleCaratChange}
                options={diamondOptions}
                placeholder={diamondOptions.length ? "Select carat(s)" : "No carats"}
                isMulti
                isSearchable
                styles={reactSelectStyles}
                isDisabled={!diamondOptions.length}
              />
            </div>
          </div>

          <div className={crudStyles.formRow2}>
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Karat</label>
              <Select
                classNamePrefix="rs"
                value={selectedKaratOptions}
                onChange={(opts) => setSelectedKaratOptions(opts ?? [])}
                options={karatOptions}
                placeholder={karatOptions.length ? "Select karat(s)" : "No karats"}
                isMulti
                isSearchable
                styles={reactSelectStyles}
                isDisabled={!karatOptions.length}
              />
            </div>
          </div>

          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>Detail preview</div>
            {detailLines.length ? (
              <div className={styles.previewTable}>
                <div className={`${styles.previewRow} ${styles.previewHeadRow}`}>
                  <span>Cut</span>
                  <span>Carat</span>
                  <span>Pcs</span>
                </div>
                {detailLines.map((line, idx) => (
                  <div key={`${line.cutId}-${line.caratId}-${idx}`} className={styles.previewRow}>
                    <span>{line.cutLabel || "-"}</span>
                    <span>{line.caratLabel || "-"}</span>
                    <input
                      className={styles.pcsInput}
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min="0"
                      value={pcsByCombo[line.comboKey] ?? ""}
                      onChange={(e) =>
                        setPcsByCombo((prev) => ({ ...prev, [line.comboKey]: e.target.value }))
                      }
                      required
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.mutedBox}>Pick cut and carat to build detail rows.</div>
            )}

            <div className={styles.karatRow}>
              <span className={styles.karatLabel}>Karat</span>
              <div className={styles.chipRow}>
                {selectedKaratOptions.length ? (
                  selectedKaratOptions.map((opt) => (
                    <span key={String(opt.value)} className={styles.pill}>
                      {opt.label ?? opt.value}
                    </span>
                  ))
                ) : (
                  <span className={styles.muted}>No karat selected</span>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
