"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./DesignZoomModal.module.css";

export default function DesignZoomModal({ imgPath, style }) {
  const [isThumbHovered, setIsThumbHovered] = useState(false);
  const [isModalHovered, setIsModalHovered] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const resolvedPath = typeof imgPath === "string" ? imgPath.trim() : "";
  const isDisabled = !resolvedPath;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer;
    let frame1;
    let frame2;
    const isHovered = isThumbHovered || isModalHovered;

    if (isHovered) {
      setShouldRender(true);
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      if (shouldRender) {
        timer = setTimeout(() => setShouldRender(false), 400);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (frame1) cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, [isModalHovered, isThumbHovered, shouldRender]);

  const modalContent =
    resolvedPath && shouldRender ? (
      <div
        className={`${styles.modalInner}${isVisible ? ` ${styles.modalVisible}` : ""}`}
        onMouseEnter={() => setIsModalHovered(true)}
        onMouseLeave={() => setIsModalHovered(false)}
      >
        <img alt="Design preview" src={resolvedPath} className={styles.modalImage} />
      </div>
    ) : null;

  const handleEnter = () => {
    if (!isDisabled) setIsThumbHovered(true);
  };

  return (
    <>
      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
      <button
        type="button"
        className={styles.thumbButton}
        data-disabled={isDisabled ? "true" : "false"}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setIsThumbHovered(false)}
        onFocus={handleEnter}
        onBlur={() => setIsThumbHovered(false)}
        aria-label={isDisabled ? "No image available" : "Preview image"}
      >
        {resolvedPath ? (
          <img alt="Design thumbnail" src={resolvedPath} className={styles.thumbImage} style={style} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            <svg viewBox="0 0 24 24" className={styles.placeholderIcon}>
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M7 15l3-3l4 4l3-3l3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </span>
        )}
      </button>
    </>
  );
}
