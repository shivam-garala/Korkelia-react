"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Carousel.module.css";

const toCssVar = (value, unit = "") => {
  if (value === null || value === undefined) return "";
  return typeof value === "number" ? `${value}${unit}` : String(value);
};

export default function Carousel({
  items = [],
  renderItem,
  getKey,
  columns = 3,
  columnsTablet = 2,
  columnsMobile = 1,
  gap = 56,
  gapTablet = 30,
  gapMobile = 44,
  className = "",
  ariaLabel = "Carousel",
}) {
  const trackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const total = Array.isArray(items) ? items.length : 0;
  const showNav = hasOverflow;

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 0);
    setCanScrollNext(track.scrollLeft < maxScrollLeft - 1);
    setHasOverflow(track.scrollWidth > track.clientWidth + 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => {
      window.removeEventListener("resize", updateScrollState);
    };
  }, [total, columns, updateScrollState]);

  const scrollByPage = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  const resolvedItems = Array.isArray(items) ? items : [];
  const styleVars = {
    "--columns": toCssVar(columns),
    "--gap": toCssVar(gap, "px"),
    "--columns-tablet": toCssVar(columnsTablet),
    "--gap-tablet": toCssVar(gapTablet, "px"),
    "--columns-mobile": toCssVar(columnsMobile),
    "--gap-mobile": toCssVar(gapMobile, "px"),
  };

  return (
    <div className={`${styles.carousel} ${className}`.trim()}>
      {showNav ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.prev}`}
          onClick={() => scrollByPage(-1)}
          aria-label="Previous slides"
          disabled={!canScrollPrev}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={updateScrollState}
        style={styleVars}
        aria-label={ariaLabel}
      >
        {resolvedItems.map((item, index) => (
          <div
            key={getKey ? getKey(item, index) : index}
            className={styles.slide}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      {showNav ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.next}`}
          onClick={() => scrollByPage(1)}
          aria-label="Next slides"
          disabled={!canScrollNext}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
