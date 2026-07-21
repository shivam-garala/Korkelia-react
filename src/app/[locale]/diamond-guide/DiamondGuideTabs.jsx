"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "../../diamond-guide/page.module.css";

export default function DiamondGuideTabs({ tabs, languageKey }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeKey) ?? tabs[0],
    [activeKey, tabs]
  );

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
              aria-controls="diamond-guide-panel"
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setActiveKey(tab.key)}
            >
              {tab.label[languageKey] ?? tab.label.en}
            </button>
          );
        })}
      </div>

      <div
        id="diamond-guide-panel"
        role="tabpanel"
        aria-labelledby={`diamond-guide-tab-${activeTab.key}`}
        className={styles.panel}
      >
        <div className={styles.panelText}>
          <p className={styles.panelTitle}>{activeTab.title[languageKey] ?? activeTab.title.en}</p>
          <p className={styles.panelBody}>
            {languageKey === "fi" ? activeTab.body.fi : activeTab.body.en}
          </p>
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
