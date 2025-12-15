'use client';

import Image from "next/image";
import { useMemo, useState } from "react";
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
  const [cut, setCut] = useState("round");
  const [quality, setQuality] = useState("natural");
  const [clarity, setClarity] = useState("fvs");
  const [carat, setCarat] = useState("0.05");
  const [metal, setMetal] = useState("white");
  const [metalType, setMetalType] = useState("14k");
  const [size, setSize] = useState("");
  const [engraving, setEngraving] = useState("");

  const carats = useMemo(() => ["0.05", "0.10", "0.20", "0.30", "0.50"], []);

  return (
    <aside className={styles.panel}>
      <h1 className={styles.title}>{title}</h1>
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

        <div className={styles.gridFields}>
          <div>
            <div className={styles.fieldTitle}>DIAMOND QUALITY</div>
            <select className={styles.select} value={quality} onChange={(e) => setQuality(e.target.value)}>
              <option value="natural">NATURAL BRILLIANT</option>
              <option value="lab">LAB GROWN</option>
            </select>
          </div>
          <div>
            <div className={styles.fieldTitle}>&nbsp;</div>
            <select className={styles.select} value={clarity} onChange={(e) => setClarity(e.target.value)}>
              <option value="fvs">FVS</option>
              <option value="vs1">VS1</option>
              <option value="si1">SI1</option>
            </select>
          </div>
        </div>

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

        <div className={styles.gridFields}>
          <div>
            <div className={styles.fieldTitle}>METAL TYPE</div>
            <select className={styles.select} value={metalType} onChange={(e) => setMetalType(e.target.value)}>
              <option value="14k">14K</option>
              <option value="18k">18K</option>
              <option value="22k">22K</option>
            </select>
          </div>
          <div>
            <div className={styles.fieldTitle}>RING SIZE</div>
            <select className={styles.select} value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Select Size</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>
        </div>

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

        <button className={styles.enquire} type="button">
          ENQUIRE NOW
        </button>
      </div>
    </aside>
  );
}

