"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import Select from "react-select";
import styles from "./ProductCustomizer.module.css";

const diamondCuts = [
  { id: "round", label: "ROUND", src: "/diamondcuts/round_cut.png" },
  { id: "pear", label: "PEAR", src: "/diamondcuts/pear_cut.png" },
  { id: "cushion", label: "CUSHION", src: "/diamondcuts/cusion.png" },
  { id: "radiant", label: "RADIANT", src: "/diamondcuts/radiant.png" },
  { id: "oval", label: "OVAL", src: "/diamondcuts/oval.png" },
  { id: "emerald", label: "EMERALD", src: "/diamondcuts/emreld.png" },
  { id: "princess", label: "PRINCESS", src: "/diamondcuts/princess.png" },
  { id: "marquise", label: "MARQUISE", src: "/diamondcuts/marqus.png" },
];

export default function ProductCustomizer({ title = "PRODUCT NAME" }) {
  const qualityId = useId();
  const clarityId = useId();
  const sizeId = useId();
  const [cut, setCut] = useState("round");
  const [quality, setQuality] = useState("natural");
  const [clarity, setClarity] = useState("fvs");
  const [carat, setCarat] = useState("0.05");
  const [metal, setMetal] = useState("white");
  const [metalType, setMetalType] = useState("14k");
  const [size, setSize] = useState("");
  const [engraving, setEngraving] = useState("");

  const carats = useMemo(() => ["0.05", "0.10", "0.20", "0.30", "0.50"], []);
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
  const qualityOptions = useMemo(
    () => [
      { value: "natural", label: "NATURAL BRILLIANT" },
      { value: "lab", label: "LAB GROWN" },
    ],
    []
  );
  const clarityOptions = useMemo(
    () => [
      { value: "fvs", label: "FVS" },
      { value: "vs1", label: "VS1" },
      { value: "si1", label: "SI1" },
    ],
    []
  );
  const metalTypeOptions = useMemo(
    () => [
      { value: "14k", label: "14K" },
      { value: "18k", label: "18K" },
      { value: "22k", label: "22K" },
    ],
    []
  );
  const sizeOptions = useMemo(
    () => [
      { value: "5", label: "5" },
      { value: "6", label: "6" },
      { value: "7", label: "7" },
      { value: "8", label: "8" },
    ],
    []
  );

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.copy}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
        ullamcorper, facilisis euismod elit. Fusce vel leo fermentum eget.
      </p>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>CUSTOMIZED FOR YOU</div>
        <div className={styles.fieldTitle}>SELECT DIAMOND CUT</div>
        <div className={styles.cuts}>
          {diamondCuts.map((item) => (
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
          {carats.map((value) => (
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
          {[
            { id: "white", label: "WHITE", color: "#f4f4f5" },
            { id: "yellow", label: "YELLOW", color: "#eab308" },
            { id: "rose", label: "ROSE", color: "#fca5a5" },
            { id: "platinum", label: "Platinum", color: "#d4d4d8" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.metal} ${metal === item.id ? styles.metalActive : ""}`}
              onClick={() => setMetal(item.id)}
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
