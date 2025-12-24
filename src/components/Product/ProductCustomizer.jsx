"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import Select from "react-select";
import axiosClient from "../../lib/axiosClient.js";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./ProductCustomizer.module.css";

const fallbackCutOptions = [
  { id: "round", label: "ROUND", src: "/diamondcuts/round_cut.png" },
  { id: "pear", label: "PEAR", src: "/diamondcuts/pear_cut.png" },
  { id: "cushion", label: "CUSHION", src: "/diamondcuts/cusion.png" },
  { id: "radiant", label: "RADIANT", src: "/diamondcuts/radiant.png" },
  { id: "oval", label: "OVAL", src: "/diamondcuts/oval.png" },
  { id: "emerald", label: "EMERALD", src: "/diamondcuts/emreld.png" },
  { id: "princess", label: "PRINCESS", src: "/diamondcuts/princess.png" },
  { id: "marquise", label: "MARQUISE", src: "/diamondcuts/marqus.png" },
];
const fallbackQualityOptions = [
  { value: "natural", label: "NATURAL BRILLIANT" },
  { value: "lab", label: "LAB GROWN" },
];
const fallbackClarityOptions = [
  { value: "fvs", label: "FVS" },
  { value: "vs1", label: "VS1" },
  { value: "si1", label: "SI1" },
];
const fallbackCarats = ["0.05", "0.10", "0.20", "0.30", "0.50"];
const fallbackMetalOptions = [
  { value: "white", label: "WHITE", color: "#f4f4f5" },
  { value: "yellow", label: "YELLOW", color: "#eab308" },
  { value: "rose", label: "ROSE", color: "#fca5a5" },
  { value: "platinum", label: "PLATINUM", color: "#d4d4d8" },
];
const fallbackMetalTypeOptions = [
  { value: "14k", label: "14K" },
  { value: "18k", label: "18K" },
  { value: "22k", label: "22K" },
];
const fallbackSizeOptions = [
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
];
const cutImageByCode = {
  RD: "/diamondcuts/round_cut.png",
  PR: "/diamondcuts/princess.png",
  EM: "/diamondcuts/emreld.png",
  HR: "/diamondcuts/round_cut.png",
  OL: "/diamondcuts/oval.png",
  MQ: "/diamondcuts/marqus.png",
  PE: "/diamondcuts/pear_cut.png",
  CU: "/diamondcuts/cusion.png",
  RA: "/diamondcuts/radiant.png",
};
const cutImageByName = {
  ROUND: "/diamondcuts/round_cut.png",
  PRINCESS: "/diamondcuts/princess.png",
  EMERALD: "/diamondcuts/emreld.png",
  HEART: "/diamondcuts/round_cut.png",
  OVAL: "/diamondcuts/oval.png",
  MARQUISE: "/diamondcuts/marqus.png",
  PEAR: "/diamondcuts/pear_cut.png",
  CUSHION: "/diamondcuts/cusion.png",
  RADIANT: "/diamondcuts/radiant.png",
};
const metalColorByCode = {
  YG: "#eab308",
  RG: "#fca5a5",
  WG: "#f4f4f5",
  PT: "#d4d4d8",
};

export default function ProductCustomizer({ title = "PRODUCT NAME", productId = "" }) {
  const { language } = useI18n();
  const qualityId = useId();
  const clarityId = useId();
  const sizeId = useId();
  const [filterData, setFilterData] = useState(null);
  const [variantDetails, setVariantDetails] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [cut, setCut] = useState("round");
  const [quality, setQuality] = useState("natural");
  const [clarity, setClarity] = useState("fvs");
  const [carat, setCarat] = useState("0.05");
  const [metal, setMetal] = useState("white");
  const [metalType, setMetalType] = useState("14k");
  const [size, setSize] = useState("");
  const [engraving, setEngraving] = useState("");

  const languageId = language === "fi" ? "2" : "1";

  useEffect(() => {
    let active = true;

    const loadFilters = async () => {
      try {
        const query = new URLSearchParams({
          language_id: String(languageId),
        });
        if (productId) query.set("product_id", String(productId));
        const { data } = await axiosClient.get(
          `/api/design/filter-dropdowns-ecom?${query.toString()}`
        );
        const payload = data?.data ?? data;
        if (active) {
          setFilterData(payload && typeof payload === "object" ? payload : null);
        }
      } catch (error) {
        if (active) setFilterData(null);
        console.error("Product filter load failed", error);
      }
    };

    loadFilters();
    return () => {
      active = false;
    };
  }, [languageId, productId]);

  const cutOptions = useMemo(() => {
    const list = Array.isArray(filterData?.cuts)
      ? filterData.cuts
      : fallbackCutOptions;
    return list
      .map((item) => {
        const rawId = item?.id ?? item?.code ?? item?.name ?? item?.label ?? "";
        const rawLabel =
          item?.name ?? item?.label ?? item?.code ?? String(rawId ?? "");
        const id = String(rawId ?? "").trim();
        const label = String(rawLabel ?? "").trim();
        if (!id && !label) return null;
        const codeKey = String(item?.code ?? "").toUpperCase();
        const nameKey = label.toUpperCase();
        const src =
          cutImageByCode[codeKey] ||
          cutImageByName[nameKey] ||
          "/diamondcuts/round_cut.png";
        return {
          id: id || label,
          label: label.toUpperCase() || "CUT",
          src,
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const qualityOptions = useMemo(() => {
    const list = Array.isArray(filterData?.diamond_types)
      ? filterData.diamond_types
      : fallbackQualityOptions;
    return list
      .map((item) => {
        const rawValue = item?.id ?? item?.code ?? item?.value ?? "";
        const rawLabel = item?.name ?? item?.label ?? item?.code ?? "";
        const value = String(rawValue ?? "").trim();
        const label = String(rawLabel ?? value ?? "").trim();
        if (!value && !label) return null;
        return {
          value: value || label,
          label: label.toUpperCase() || "QUALITY",
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const clarityOptions = useMemo(() => {
    const list = Array.isArray(filterData?.clarities)
      ? filterData.clarities
      : fallbackClarityOptions;
    return list
      .map((item) => {
        const rawValue = item?.id ?? item?.value ?? item?.name ?? "";
        const rawLabel = item?.name ?? item?.label ?? String(rawValue ?? "");
        const value = String(rawValue ?? "").trim();
        const label = String(rawLabel ?? value ?? "").trim();
        if (!value && !label) return null;
        return {
          value: value || label,
          label: label.toUpperCase() || "CLARITY",
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const caratOptions = useMemo(() => {
    const list = Array.isArray(filterData?.carats)
      ? filterData.carats
      : fallbackCarats;
    return list
      .map((item) => {
        const value = item?.carat ?? item?.value ?? item;
        if (value === null || value === undefined) return null;
        const label = String(value);
        return label.trim() ? label : null;
      })
      .filter(Boolean);
  }, [filterData]);

  const metalOptions = useMemo(() => {
    const list = Array.isArray(filterData?.metals)
      ? filterData.metals
      : fallbackMetalOptions;
    return list
      .map((item) => {
        const rawValue = item?.id ?? item?.value ?? item?.code ?? item?.name;
        const rawLabel = item?.name ?? item?.label ?? item?.code ?? rawValue;
        const value = String(rawValue ?? "").trim();
        const label = String(rawLabel ?? "").trim();
        if (!value && !label) return null;
        const codeKey = String(item?.code ?? "").toUpperCase();
        const color =
          item?.color ?? metalColorByCode[codeKey] ?? "#e5e7eb";
        return {
          value: value || label,
          label: label.toUpperCase() || "METAL",
          color,
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const metalTypeOptions = useMemo(() => {
    const list = Array.isArray(filterData?.karats)
      ? filterData.karats
      : fallbackMetalTypeOptions;
    return list
      .map((item) => {
        const rawId = item?.id ?? item?.karat_id ?? item?.karatId ?? null;
        const rawLabel = item?.karat ?? item?.value ?? rawId ?? "";
        const label = String(rawLabel ?? "").trim();
        const value = rawId !== null && rawId !== undefined ? String(rawId) : label;
        if (!value) return null;
        return {
          value,
          label: label ? label.toUpperCase() : value.toUpperCase(),
        };
      })
      .filter(Boolean);
  }, [filterData]);

  const sizeOptions = useMemo(() => {
    const list = Array.isArray(filterData?.ring_sizes)
      ? filterData.ring_sizes
      : fallbackSizeOptions;
    return list
      .map((item) => {
        const rawValue = item?.value ?? item?.size ?? item?.id ?? "";
        const rawLabel = item?.size ?? item?.label ?? item?.value ?? rawValue;
        const value = String(rawValue ?? "").trim();
        const label = String(rawLabel ?? "").trim();
        if (!value && !label) return null;
        return { value: value || label, label: label || value };
      })
      .filter(Boolean);
  }, [filterData]);

  const dropdownStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 30,
        height: 30,
        borderColor: "var(--color-primary)",
        boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary)" : "none",
        ":hover": {
          borderColor: "var(--color-primary)",
        },
      }),
      menu: (base) => ({
        ...base,
        fontFamily: "var(--font-body)",
      }),
      menuList: (base) => ({
        ...base,
        padding: "4px",
      }),
      option: (base, state) => ({
        ...base,
        padding: "6px 8px",
        fontSize: "9px",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        lineHeight: 1.2,
        backgroundColor: state.isSelected
          ? "var(--color-primary-soft)"
          : state.isFocused
          ? "color-mix(in srgb, var(--color-primary), transparent 85%)"
          : "transparent",
        color: "var(--color-heading)",
        ":active": {
          backgroundColor: "var(--color-primary-soft)",
        },
      }),
    }),
    []
  );

  useEffect(() => {
    if (cutOptions.length && !cutOptions.some((opt) => opt.id === cut)) {
      setCut(cutOptions[0].id);
    }
  }, [cutOptions, cut]);

  useEffect(() => {
    if (
      qualityOptions.length &&
      !qualityOptions.some((opt) => opt.value === quality)
    ) {
      setQuality(qualityOptions[0].value);
    }
  }, [qualityOptions, quality]);

  useEffect(() => {
    if (
      clarityOptions.length &&
      !clarityOptions.some((opt) => opt.value === clarity)
    ) {
      setClarity(clarityOptions[0].value);
    }
  }, [clarityOptions, clarity]);

  useEffect(() => {
    if (caratOptions.length && !caratOptions.includes(carat)) {
      setCarat(caratOptions[0]);
    }
  }, [caratOptions, carat]);

  useEffect(() => {
    if (
      metalOptions.length &&
      !metalOptions.some((opt) => opt.value === metal)
    ) {
      setMetal(metalOptions[0].value);
    }
  }, [metalOptions, metal]);

  useEffect(() => {
    if (
      metalTypeOptions.length &&
      !metalTypeOptions.some((opt) => opt.value === metalType)
    ) {
      setMetalType(metalTypeOptions[0].value);
    }
  }, [metalTypeOptions, metalType]);

  useEffect(() => {
    if (size && sizeOptions.length && !sizeOptions.some((opt) => opt.value === size)) {
      setSize("");
    }
  }, [sizeOptions, size]);

  const selectedCutId = cutOptions.find((opt) => opt.id === cut)?.id ?? "";
  const selectedQualityId = qualityOptions.find((opt) => opt.value === quality)?.value ?? "";
  const selectedClarityId = clarityOptions.find((opt) => opt.value === clarity)?.value ?? "";
  const selectedMetalId = metalOptions.find((opt) => opt.value === metal)?.value ?? "";
  const selectedKaratId =
    metalTypeOptions.find((opt) => opt.value === metalType)?.value ?? "";
  const selectedCarat = carat ? String(carat) : "";
  const designId =
    filterData?.design_id ??
    filterData?.designId ??
    filterData?.design?.id ??
    "";

  useEffect(() => {
    let active = true;
    if (
      !productId ||
      !selectedMetalId ||
      !selectedKaratId ||
      !selectedQualityId ||
      !selectedClarityId ||
      !selectedCarat ||
      !selectedCutId
    ) {
      setVariantDetails(null);
      setVariantLoading(false);
      return () => {
        active = false;
      };
    }

    const params = new URLSearchParams({
      product_id: String(productId),
      metal_id: String(selectedMetalId),
      karat_id: String(selectedKaratId),
      diamond_type_id: String(selectedQualityId),
      clarity_id: String(selectedClarityId),
      carat: String(selectedCarat),
      cut_id: String(selectedCutId),
    });
    if (designId) params.set("design_id", String(designId));

    setVariantLoading(true);
    const loadVariant = async () => {
      try {
        const { data } = await axiosClient.get(
          `/api/design/variant-details-ecom?${params.toString()}`
        );
        if (active) setVariantDetails(data?.data ?? data ?? null);
      } catch (error) {
        if (active) setVariantDetails(null);
        console.error("Variant details load failed", error);
      } finally {
        if (active) setVariantLoading(false);
      }
    };

    loadVariant();
    return () => {
      active = false;
    };
  }, [
    productId,
    selectedMetalId,
    selectedKaratId,
    selectedQualityId,
    selectedClarityId,
    selectedCarat,
    selectedCutId,
    designId,
  ]);

  const variantPrice =
    variantDetails?.total_price ??
    variantDetails?.price ??
    variantDetails?.rate ??
    variantDetails?.metal_rate ??
    null;

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      {/* {variantLoading ? (
        <p className={styles.variantStatus}>Updating selection...</p>
      ) : variantPrice ? (
        <p className={styles.variantStatus}>Price: {variantPrice}</p>
      ) : null} */}
      <p className={styles.copy}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
        ullamcorper, facilisis euismod elit. Fusce vel leo fermentum eget.
      </p>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>CUSTOMIZED FOR YOU</div>
        <div className={styles.fieldTitle}>SELECT DIAMOND CUT</div>
        <div className={styles.cuts}>
          {cutOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.cut} ${cut === item.id ? styles.cutActive : ""}`}
              onClick={() => setCut(item.id)}
            >
              <div className={styles.cutIcon} aria-hidden>
                <Image src={item.src} alt="" width={28} height={28} />
              </div>
              <div className={styles.cutLabel}>{item.label}</div>
            </button>
          ))}
        </div>
        <div className={styles.divider} aria-hidden />

        <div className={styles.gridFields}>
          <div className={styles.fieldTitle}>DIAMOND QUALITY</div>
          <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
            <div>
              <Select
              className={styles.select}
              classNamePrefix="customizer"
              instanceId={qualityId}
              styles={dropdownStyles}
              value={qualityOptions.find((opt) => opt.value === quality) ?? null}
              options={qualityOptions}
              onChange={(option) => setQuality(option?.value ?? "")}
              isSearchable={false}
            />
            </div>
            <div>
              <Select
              className={styles.select}
              classNamePrefix="customizer"
              instanceId={clarityId}
              styles={dropdownStyles}
              value={clarityOptions.find((opt) => opt.value === clarity) ?? null}
              options={clarityOptions}
              onChange={(option) => setClarity(option?.value ?? "")}
              isSearchable={false}
            />
            </div>
          </div>
        </div>
        <div className={styles.divider} aria-hidden />

        <div className={styles.fieldTitle}>DIAMOND CARAT WEIGHT</div>
        <div className={styles.pills}>
          {caratOptions.map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.pill} ${carat === value ? styles.pillActive : ""}`}
              onClick={() => setCarat(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className={styles.divider} aria-hidden />

        <div className={styles.fieldTitle}>SELECT METAL COLOR</div>
        <div className={styles.metalRow}>
          {metalOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.metal} ${metal === item.value ? styles.metalActive : ""}`}
              onClick={() => setMetal(item.value)}
            >
              <span className={styles.dot} style={{ background: item.color }} aria-hidden />
              <span className={styles.dotLabel}>{item.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.divider} aria-hidden />

        <div className={styles.gridFields}>
          <div>
            <div className={styles.fieldTitle}>METAL TYPE</div>
            <div className={styles.pills}>
              {metalTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.pill} ${metalType === option.value ? styles.pillActive : ""}`}
                  onClick={() => setMetalType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.divider} aria-hidden />
          <div>
            <div className={styles.fieldTitle}>RING SIZE</div>
            <Select
              className={styles.select}
              classNamePrefix="customizer"
              instanceId={sizeId}
              styles={dropdownStyles}
              value={sizeOptions.find((opt) => opt.value === size) ?? null}
              options={sizeOptions}
              onChange={(option) => setSize(option?.value ?? "")}
              placeholder="Select Size"
              isSearchable={false}
            />
          </div>
        </div>
        <div className={styles.divider} aria-hidden />
        <div className={styles.priceBlock}>
          <div className={styles.priceLabel}>PRICE</div>
          {variantLoading ? (
            <div className={styles.variantStatus}>Updating selection...</div>
          ) : variantPrice ? (
            <div className={styles.priceValue}>{variantPrice}</div>
          ) : null}
          {/* <div className={styles.priceValue}>{variantPrice ?? "--"}</div> */}
        </div>
        <div className={styles.divider} aria-hidden />

        <div className={styles.fieldTitle}>ENGRAVING (Optional)</div>
        <div className={styles.engraveRow}>
          <input
            className={styles.input}
            value={engraving}
            onChange={(e) => setEngraving(e.target.value)}
            placeholder="Please limit word count to 10 characters"
          />
          <button className={styles.submit} type="button">
            SUBMIT
          </button>
        </div>
        <div className={styles.divider} aria-hidden />

        <button className={styles.enquire} type="button">
          ENQUIRE NOW
        </button>
      </div>
    </aside>
  );
}
