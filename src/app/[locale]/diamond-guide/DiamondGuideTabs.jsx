"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "../../diamond-guide/page.module.css";

export default function DiamondGuideTabs({ tabs, languageKey }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="Diamond guide sections">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              id={`diamond-guide-tab-${tab.key}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`diamond-guide-panel-${tab.key}`}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setActiveKey(tab.key)}
            >
              {tab.label[languageKey] ?? tab.label.en}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <div
            key={tab.key}
            id={`diamond-guide-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`diamond-guide-tab-${tab.key}`}
            className={`${styles.panel} ${!isActive ? styles.panelHidden : ""}`}
          >
            <div className={styles.panelText}>
              <p className={styles.panelTitle}>{tab.title[languageKey] ?? tab.title.en}</p>
              <p className={styles.panelBody}>
                {languageKey === "fi" ? tab.body.fi : tab.body.en}
              </p>
            </div>
            <div className={styles.panelMedia}>
              <Image
                className={styles.panelImage}
                src={tab.image}
                alt={tab.alt}
                width={520}
                height={360}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
