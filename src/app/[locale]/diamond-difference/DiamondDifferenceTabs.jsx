"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "../../diamond-difference/page.module.css";

export default function DiamondDifferenceTabs({ tabs, languageKey }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);

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
              aria-controls={`diamond-difference-panel-${tab.key}`}
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
            id={`diamond-difference-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`diamond-difference-tab-${tab.key}`}
            className={`${styles.panel} ${!isActive ? styles.panelHidden : ""}`}
          >
            <div className={styles.panelText}>
              <p className={styles.panelTitle}>{tab.title[languageKey] ?? tab.title.en}</p>
              {(languageKey === "fi" ? tab.body.fi : tab.body.en)?.map((paragraph) => (
                <p key={paragraph} className={styles.panelBody}>
                  {paragraph}
                </p>
              ))}
              {(languageKey === "fi" ? tab.body.fiList : tab.body.enList) ? (
                <ul className={styles.panelList}>
                  {(languageKey === "fi" ? tab.body.fiList : tab.body.enList).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {(languageKey === "fi" ? tab.body.fiAfter : tab.body.enAfter) ? (
                <p className={styles.panelBody}>
                  {languageKey === "fi" ? tab.body.fiAfter : tab.body.enAfter}
                </p>
              ) : null}
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
