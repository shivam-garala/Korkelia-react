"use client";

import { useState } from "react";
import styles from "../../faq/page.module.css";

export default function FaqAccordion({ faqs, languageKey }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className={styles.list}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${languageKey}-${index}`;
        return (
          <div
            key={faq.question}
            className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
          >
            <h3 className={styles.itemHeading}>
              <button
                type="button"
                className={styles.trigger}
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className={styles.question}>{faq.question}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              className={styles.panelWrap}
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className={styles.panelInner}>
                <p className={styles.answer}>{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
