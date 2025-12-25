"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Skeleton from "../../app/components/ui/Skeleton.jsx";
import styles from "./ProductGallery.module.css";

const isVideoItem = (item) =>
  Boolean(item?.videoSrc) || item?.type === "video" || item?.variant === "video" || item?.badge === "play";

const readCachedProduct = (productId) => {
  if (typeof window === "undefined") return null;
  if (!productId) return null;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed[String(productId)] ?? null;
  } catch (error) {
    console.error("Product cache read failed", error);
    return null;
  }
};

const resolveImageSrc = (image) => {
  if (!image) return "";
  if (typeof image === "string") {
    if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  }
  const apiBase =
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
  const cleaned = typeof image === "string" ? image : "";
  if (!apiBase || !cleaned) return cleaned;
  return `${apiBase.replace(/\/$/, "")}/${cleaned.replace(/^\//, "")}`;
};

export default function ProductGallery({ items = [], productId = "" }) {
  const [cachedProduct, setCachedProduct] = useState(null);
  const variants = useMemo(
    () => ["square", "tall", "circle", "wide", "video"],
    []
  );

  useEffect(() => {
    const updateCachedProduct = () => {
      setCachedProduct(readCachedProduct(productId));
    };
    
    // Initial load
    updateCachedProduct();
    
    // Listen for cache updates
    const handleCacheUpdate = (event) => {
      if (event.detail?.productId === productId || !event.detail?.productId) {
        updateCachedProduct();
      }
    };
    
    window.addEventListener("productCacheUpdated", handleCacheUpdate);
    return () => {
      window.removeEventListener("productCacheUpdated", handleCacheUpdate);
    };
  }, [productId]);

  const cachedItems = useMemo(() => {
    const design =
      cachedProduct?.design ??
      cachedProduct?.design_variant ??
      cachedProduct?.designVariant ??
      null;
    const images = Array.isArray(design?.images) ? design.images : [];
    const mapped = images
      .map((image, index) => {
        const src = resolveImageSrc(
          image?.image_url ??
            image?.url ??
            image?.image ??
            image?.image_name ??
            image
        );
        if (!src) return null;
        return {
          key: image?.id ?? image?.image_id ?? src ?? index,
          variant: variants[index % variants.length],
          src,
        };
      })
      .filter(Boolean);

    if (mapped.length) return mapped;

    const fallbackSrc = resolveImageSrc(
      cachedProduct?.image ??
        design?.image ??
        design?.product?.image ??
        ""
    );
    if (!fallbackSrc) return [];
    return [{ key: "fallback", variant: "square", src: fallbackSrc }];
  }, [cachedProduct, variants]);

  const slides = useMemo(() => {
    const base = Array.isArray(items) ? items.filter(Boolean) : [];
    return cachedItems.length ? cachedItems : base;
  }, [items, cachedItems]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [loadedMap, setLoadedMap] = useState({});
  const touchStartX = useRef(null);

  const openAt = useCallback((index) => {
    setActiveIndex(index);
    setOpen(true);
    setZoomed(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setZoomed(false);
  }, []);

  const showPrev = useCallback(() => {
    if (slides.length < 2) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const showNext = useCallback(() => {
    if (slides.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open, showNext, showPrev]);

  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  useEffect(() => {
    setZoomed(false);
  }, [activeIndex]);

  useEffect(() => {
    setLoadedMap({});
  }, [slides]);

  const active = slides[activeIndex];
  const isVideo = isVideoItem(active);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current == null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) showPrev();
      else showNext();
    }
    touchStartX.current = null;
  };

  return (
    <>
      <div className={styles.grid}>
        {slides.map((item, index) => (
          <div key={item.key ?? item.src ?? index} className={`${styles.cell} ${styles[item.variant] ?? ""}`}>
            <button type="button" className={styles.cellButton} onClick={() => openAt(index)}>
              <div className={styles.media} aria-hidden>
                {!loadedMap[index] ? (
                  <Skeleton className={styles.mediaSkeleton} width="100%" height="100%" />
                ) : null}
                <Image
                  className={`${styles.image} ${loadedMap[index] ? styles.imageLoaded : styles.imageHidden}`}
                  src={item.src}
                  alt=""
                  fill
                  sizes="(max-width: 980px) 100vw, 50vw"
                  onLoadingComplete={() =>
                    setLoadedMap((prev) => ({ ...prev, [index]: true }))
                  }
                />
                {item.badge === "play" ? <div className={styles.play} aria-hidden /> : null}
              </div>
            </button>
          </div>
        ))}
      </div>

      {open && active ? (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Product media">
          <button className={styles.modalBackdropBtn} type="button" aria-label="Close" onClick={close} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Media {activeIndex + 1} / {slides.length}</div>
              <div className={styles.modalActions}>
                {!isVideo ? (
                  <button type="button" className={styles.actionButton} onClick={() => setZoomed((prev) => !prev)}>
                    {zoomed ? "Zoom out" : "Zoom in"}
                  </button>
                ) : null}
                <button type="button" className={styles.actionButton} onClick={close}>
                  Close
                </button>
              </div>
            </div>
            <div className={styles.modalBody} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div className={`${styles.modalMedia} ${zoomed && !isVideo ? styles.zoomed : ""}`}>
                {isVideo ? (
                  <video
                    className={styles.modalVideo}
                    controls
                    playsInline
                    poster={active.src}
                  >
                    <source src={active.videoSrc ?? active.src} />
                  </video>
                ) : (
                  <img className={styles.modalImage} src={active.src} alt="" />
                )}
              </div>
              {slides.length > 1 ? (
                <>
                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.navPrev}`}
                    onClick={showPrev}
                    aria-label="Previous"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
                      <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.navNext}`}
                    onClick={showNext}
                    aria-label="Next"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
                      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
