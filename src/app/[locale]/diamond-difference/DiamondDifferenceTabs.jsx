"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "../../diamond-difference/page.module.css";

export default function DiamondDifferenceTabs({ tabs, languageKey }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeKey) ?? tabs[0],
    [activeKey, tabs]
  );

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="Diamond difference sections">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              id={`diamond-difference-tab-${tab.key}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="diamond-difference-panel"
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setActiveKey(tab.key)}
            >
              {tab.label[languageKey] ?? tab.label.en}
            </button>
          );
        })}
      </div>

      <div
        id="diamond-difference-panel"
        role="tabpanel"
        aria-labelledby={`diamond-difference-tab-${activeTab.key}`}
        className={styles.panel}
      >
        <div className={styles.panelText}>
          <p className={styles.panelTitle}>{activeTab.title[languageKey] ?? activeTab.title.en}</p>
          {(languageKey === "fi" ? activeTab.body.fi : activeTab.body.en)?.map((paragraph) => (
            <p key={paragraph} className={styles.panelBody}>
              {paragraph}
            </p>
          ))}
          {(languageKey === "fi" ? activeTab.body.fiList : activeTab.body.enList) ? (
            <ul className={styles.panelList}>
              {(languageKey === "fi" ? activeTab.body.fiList : activeTab.body.enList).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {(languageKey === "fi" ? activeTab.body.fiAfter : activeTab.body.enAfter) ? (
            <p className={styles.panelBody}>
              {languageKey === "fi" ? activeTab.body.fiAfter : activeTab.body.enAfter}
            </p>
          ) : null}
        </div>
        <div className={styles.panelMedia}>
          <Image
            className={styles.panelImage}
            src={activeTab.image}
            alt={activeTab.alt}
            width={520}
            height={360}
          />
        </div>
      </div>
    </>
  );
}
