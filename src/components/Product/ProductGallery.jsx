"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Modal from "../ui/Modal.jsx";
import styles from "./ProductGallery.module.css";

const isVideoSrc = (value) => {
  if (!value || typeof value !== "string") return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(value);
};

const isVideoItem = (item) =>
  Boolean(item?.videoSrc) ||
  item?.type === "video" ||
  item?.badge === "play" ||
  (item?.variant === "video" && isVideoSrc(item?.src));

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

const fallbackImageSrc = "/productdetails/no_image.jpg";

export default function ProductGallery({ items, productId = "" }) {
  const [cachedProduct, setCachedProduct] = useState(null);
  const imageVariants = useMemo(
    () => ["square", "tall", "circle", "wide"],
    []
  );
  const hasItems = Array.isArray(items);
  const hasResponse = cachedProduct !== null || (items !== null && items !== undefined);

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
        const videoSrc = resolveImageSrc(image?.videoSrc ?? "");
        const isVideo =
          Boolean(videoSrc) ||
          image?.type === "video" ||
          image?.badge === "play" ||
          isVideoSrc(src);
        const resolvedVideoSrc = videoSrc || (isVideoSrc(src) ? src : "");
        const resolvedSrc = src || (isVideo ? fallbackImageSrc : "");
        if (!resolvedSrc && !resolvedVideoSrc) return null;
        const variant =
          isVideo
            ? "video"
            : image?.variant && image.variant !== "video"
            ? image.variant
            : imageVariants[index % imageVariants.length];
        const next = {
          key: image?.id ?? image?.image_id ?? resolvedSrc ?? resolvedVideoSrc ?? index,
          variant,
          src: resolvedSrc,
          badge: isVideo ? image?.badge ?? "play" : image?.badge,
        };
        if (resolvedVideoSrc) next.videoSrc = resolvedVideoSrc;
        return next;
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
    if (isVideoSrc(fallbackSrc)) {
      return [
        {
          key: "fallback",
          variant: "video",
          src: fallbackImageSrc,
          videoSrc: fallbackSrc,
          badge: "play",
        },
      ];
    }
    return [{ key: "fallback", variant: "square", src: fallbackSrc }];
  }, [cachedProduct, imageVariants]);

  const baseItems = useMemo(() => {
    if (!hasItems) return [];
    return items
      .map((item, index) => {
        if (!item) return null;
        if (typeof item === "string") {
          const src = resolveImageSrc(item);
          if (!src) return null;
          if (isVideoSrc(src)) {
            return {
              key: src,
              variant: "video",
              src: fallbackImageSrc,
              videoSrc: src,
              badge: "play",
            };
          }
          return { key: src, variant: imageVariants[index % imageVariants.length], src };
        }
        const src = resolveImageSrc(
          item?.src ??
            item?.image ??
            item?.imageSrc ??
            item?.url ??
            item?.image_url ??
            item?.image_name ??
            ""
        );
        const videoSrc = resolveImageSrc(item?.videoSrc ?? "");
        const isVideo = Boolean(videoSrc) || isVideoItem(item) || isVideoSrc(src);
        const resolvedVideoSrc = videoSrc || (isVideoSrc(src) ? src : "");
        const resolvedSrc = src || (isVideo ? fallbackImageSrc : "");
        if (!resolvedSrc && !resolvedVideoSrc) return null;
        const variant =
          isVideo
            ? "video"
            : item?.variant && item.variant !== "video"
            ? item.variant
            : imageVariants[index % imageVariants.length];
        const next = {
          ...item,
          key: item?.key ?? item?.id ?? resolvedSrc ?? resolvedVideoSrc ?? index,
          variant,
          src: resolvedSrc,
        };
        if (resolvedVideoSrc) next.videoSrc = resolvedVideoSrc;
        if (isVideo && !next.badge) next.badge = "play";
        return next;
      })
      .filter(Boolean);
  }, [hasItems, items, imageVariants]);

  const slides = useMemo(() => {
    const base = cachedItems.length ? cachedItems : baseItems;
    if (base.length) return base;
    if (!hasResponse) return [];
    return [{ key: "no-image", variant: "square", src: fallbackImageSrc }];
  }, [baseItems, cachedItems, hasResponse]);

  const showSkeleton = !hasResponse;
  const skeletonSlides = useMemo(
    () =>
      imageVariants.map((variant, index) => ({
        key: `skeleton-${variant}-${index}`,
        variant,
        isSkeleton: true,
      })),
    [imageVariants]
  );
  const displaySlides = showSkeleton ? skeletonSlides : slides;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loadedMap, setLoadedMap] = useState({});
  const [failedMap, setFailedMap] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);
  const galleryRef = useRef(null);
  const galleryScrollRaf = useRef(null);
  const zoomRef = useRef(null);

  const openAt = useCallback((index) => {
    setActiveIndex(index);
    setGalleryIndex(index);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setTouchStartX(null);
  }, []);

  const showPrev = useCallback(() => {
    if (slides.length < 2) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const showNext = useCallback(() => {
    if (slides.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handleTouchStart = useCallback((event) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  }, []);

  const handleTouchMove = useCallback(
    (event) => {
      if (touchStartX === null) return;
      const touchEndX = event.touches[0]?.clientX ?? null;
      if (touchEndX === null) return;
      const touchDeltaX = touchEndX - touchStartX;
      const sensitivity = 50;
      if (touchDeltaX > sensitivity) {
        showPrev();
        setTouchStartX(null);
      } else if (touchDeltaX < -sensitivity) {
        showNext();
        setTouchStartX(null);
      }
    },
    [showNext, showPrev, touchStartX]
  );

  const handleTouchEnd = useCallback(() => {
    setTouchStartX(null);
  }, []);

  const scrollToGalleryIndex = useCallback((index) => {
    const root = galleryRef.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-gallery-slide='true']");
    const target = items[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  const goToGalleryIndex = useCallback(
    (index) => {
      const total = slides.length;
      if (!total) return;
      const nextIndex = ((index % total) + total) % total;
      setGalleryIndex(nextIndex);
      scrollToGalleryIndex(nextIndex);
    },
    [slides.length, scrollToGalleryIndex]
  );

  const showGalleryPrev = useCallback(() => {
    if (slides.length < 2) return;
    goToGalleryIndex(galleryIndex - 1);
  }, [galleryIndex, goToGalleryIndex, slides.length]);

  const showGalleryNext = useCallback(() => {
    if (slides.length < 2) return;
    goToGalleryIndex(galleryIndex + 1);
  }, [galleryIndex, goToGalleryIndex, slides.length]);

  const handleGalleryScroll = useCallback(() => {
    if (!galleryRef.current) return;
    if (galleryScrollRaf.current) {
      cancelAnimationFrame(galleryScrollRaf.current);
    }
    galleryScrollRaf.current = requestAnimationFrame(() => {
      const root = galleryRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll("[data-gallery-slide='true']"));
      if (!items.length) return;
      const rootRect = root.getBoundingClientRect();
      const centerX = rootRect.left + rootRect.width / 2;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - centerX);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      setGalleryIndex(bestIndex);
    });
  }, []);

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

  const handleMediaError = useCallback((index) => {
    setFailedMap((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
    setLoadedMap((prev) => ({ ...prev, [index]: true }));
  }, []);

  useEffect(() => {
    setLoadedMap({});
    setFailedMap({});
  }, [slides]);

  useEffect(() => {
    if (!slides.length) return;
    let active = true;
    const cleanups = [];

    slides.forEach((item, index) => {
      if (!item || item.isSkeleton) return;
      if (isVideoItem(item)) {
        const videoSrc = item.videoSrc ?? (isVideoSrc(item.src) ? item.src : "");
        if (!videoSrc) {
          if (active) handleMediaError(index);
          return;
        }
        const video = document.createElement("video");
        const handleLoaded = () => {
          if (!active) return;
          setLoadedMap((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
        };
        const handleError = () => {
          if (!active) return;
          handleMediaError(index);
        };
        video.addEventListener("loadeddata", handleLoaded);
        video.addEventListener("error", handleError);
        video.preload = "metadata";
        video.src = videoSrc;
        cleanups.push(() => {
          video.removeEventListener("loadeddata", handleLoaded);
          video.removeEventListener("error", handleError);
        });
        return;
      }

      const imgSrc = item.src || fallbackImageSrc;
      const ImgCtor = typeof window !== "undefined" ? window.Image : null;
      if (!ImgCtor) {
        if (active) handleMediaError(index);
        return;
      }
      const img = new ImgCtor();
      const handleLoaded = () => {
        if (!active) return;
        setLoadedMap((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
      };
      const handleError = () => {
        if (!active) return;
        handleMediaError(index);
      };
      img.addEventListener("load", handleLoaded);
      img.addEventListener("error", handleError);
      img.src = imgSrc;
      cleanups.push(() => {
        img.removeEventListener("load", handleLoaded);
        img.removeEventListener("error", handleError);
      });
    });

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [handleMediaError, slides]);

  useEffect(() => {
    setGalleryIndex(0);
    if (slides.length) {
      requestAnimationFrame(() => scrollToGalleryIndex(0));
    }
  }, [slides, scrollToGalleryIndex]);

  useEffect(() => {
    if (!slides.length) return;
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const active = slides[activeIndex];
  const isActiveVideo = active ? isVideoItem(active) : false;

  useEffect(() => {
    if (!open) return;
    if (isActiveVideo) {
      zoomRef.current = null;
      return;
    }
    zoomRef.current?.resetTransform?.();
  }, [activeIndex, isActiveVideo, open]);

  const handleZoomIn = useCallback(() => {
    if (isActiveVideo) return;
    zoomRef.current?.zoomIn?.();
  }, [isActiveVideo]);

  const handleZoomOut = useCallback(() => {
    if (isActiveVideo) return;
    zoomRef.current?.zoomOut?.();
  }, [isActiveVideo]);

  const handleZoomReset = useCallback(() => {
    if (isActiveVideo) return;
    zoomRef.current?.resetTransform?.();
  }, [isActiveVideo]);

  const handleZoomImageLoad = useCallback(() => {
    if (isActiveVideo) return;
    zoomRef.current?.resetTransform?.(0);
    zoomRef.current?.centerView?.(1, 0);
  }, [isActiveVideo]);


  useEffect(() => {
    return () => {
      if (galleryScrollRaf.current) {
        cancelAnimationFrame(galleryScrollRaf.current);
      }
    };
  }, []);

  const modalFooter = (
    <div className={styles.modalFooter}>
      <div className={styles.zoomControls} role="group" aria-label="Zoom controls">
        <button
          type="button"
          className={styles.zoomControlBtn}
          onClick={handleZoomIn}
          disabled={isActiveVideo}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className={styles.zoomControlBtn}
          onClick={handleZoomReset}
          disabled={isActiveVideo}
          aria-label="Reset zoom"
        >
          <svg viewBox="0 0 24 24" className={styles.zoomIcon} aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3.3-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M21 4v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.zoomControlBtn}
          onClick={handleZoomOut}
          disabled={isActiveVideo}
          aria-label="Zoom out"
        >
          -
        </button>
      </div>
      {slides.length > 1 ? (
        <div className={styles.modalCount}>
          {activeIndex + 1} / {slides.length}
        </div>
      ) : null}
      {slides.length > 1 ? (
        <div className={styles.modalDots} role="tablist" aria-label="Media previews">
          {slides.map((item, index) => {
            const dotImageSrc = item.src || fallbackImageSrc;
            const isVideo = isVideoItem(item);
            const videoSrc = item.videoSrc ?? (isVideoSrc(item.src) ? item.src : "");
            return (
              <button
                key={item.key ?? item.src ?? index}
                type="button"
                className={`${styles.modalDot} ${index === activeIndex ? styles.modalDotActive : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show media ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                <span className={styles.modalDotInner}>
                  {isVideo && videoSrc ? (
                    <video
                      className={styles.modalDotVideo}
                      muted
                      playsInline
                      preload="metadata"
                      poster={dotImageSrc}
                      onLoadedMetadata={(event) => {
                        event.currentTarget.currentTime = 0.1;
                      }}
                    >
                      <source src={videoSrc} />
                    </video>
                  ) : (
                    <img
                      className={styles.modalDotImage}
                      src={dotImageSrc}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  {isVideo ? (
                    <span className={styles.modalDotVideoBadge} aria-hidden="true" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
        <div className={styles.galleryWrap}>
        <div className={styles.grid} ref={galleryRef} onScroll={handleGalleryScroll}>
          {displaySlides.map((item, index) => {
            const isVideo = isVideoItem(item);
            const hasFailed = Boolean(failedMap[index]);
            const isLoaded = Boolean(loadedMap[index]);
            const imageSrc = hasFailed ? fallbackImageSrc : item.src || fallbackImageSrc;
            const isRemoteImage = /^https?:\/\//i.test(imageSrc);

            return (
              <div
                key={item.key ?? item.src ?? index}
                className={`${styles.cell} ${styles[item.variant] ?? ""}`}
                data-gallery-slide="true"
              >
                {item.isSkeleton ? (
                  <div className={styles.cellButton} aria-hidden="true">
                    <div className={styles.media} aria-hidden>
                      <div className={styles.mediaLoader} />
                    </div>
                  </div>
                ) : (
                  <button type="button" className={styles.cellButton} onClick={() => openAt(index)}>
                    <div className={styles.media} aria-hidden>
                      {!isLoaded ? <div className={styles.mediaLoader} /> : null}
                      {isVideo && !hasFailed ? (
                        <video
                          className={`${styles.inlineVideo} ${isLoaded ? styles.imageLoaded : styles.imageHidden}`}
                          autoPlay
                          muted
                          loop
                          playsInline
                          poster={imageSrc}
                          onLoadedData={() =>
                            setLoadedMap((prev) => ({ ...prev, [index]: true }))
                          }
                          onError={() => handleMediaError(index)}
                        >
                          <source src={item.videoSrc ?? item.src} />
                        </video>
                      ) : isRemoteImage ? (
                        <img
                          className={`${styles.image} ${isLoaded ? styles.imageLoaded : styles.imageHidden}`}
                          src={imageSrc}
                          alt=""
                          loading="lazy"
                          onLoad={() =>
                            setLoadedMap((prev) => ({ ...prev, [index]: true }))
                          }
                          onError={() => handleMediaError(index)}
                        />
                      ) : (
                        <Image
                          className={`${styles.image} ${isLoaded ? styles.imageLoaded : styles.imageHidden}`}
                          src={imageSrc}
                          alt=""
                          fill
                          sizes="(max-width: 980px) 100vw, 50vw"
                          onLoad={() =>
                            setLoadedMap((prev) => ({ ...prev, [index]: true }))
                          }
                          onLoadingComplete={() =>
                            setLoadedMap((prev) => ({ ...prev, [index]: true }))
                          }
                          onError={() => handleMediaError(index)}
                        />
                      )}
                      {/* {!isVideoItem(item) && item.badge === "play" ? (
                        <div className={styles.play} aria-hidden />
                      ) : null} */}
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.galleryNav} ${styles.galleryPrev}`}
              onClick={showGalleryPrev}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
                <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.galleryNav} ${styles.galleryNext}`}
              onClick={showGalleryNext}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={styles.galleryDots} role="tablist" aria-label="Gallery images">
              {slides.map((item, index) => (
                <button
                  key={item.key ?? item.src ?? index}
                  type="button"
                  className={`${styles.galleryDot} ${index === galleryIndex ? styles.galleryDotActive : ""}`}
                  onClick={() => goToGalleryIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={index === galleryIndex ? "true" : undefined}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <Modal
        open={open && Boolean(active)}
        title={`Media ${activeIndex + 1} / ${slides.length}`}
        onClose={close}
        footer={modalFooter}
        className={styles.sliderModal}
        bodyClassName={styles.sliderModalBody}
        backdropClassName={styles.sliderBackdrop}
      >
        {active ? (
          <div
            className={styles.modalBody}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {slides.length > 1 ? (
              <button
                type="button"
                className={`${styles.sliderNav} ${styles.sliderPrev}`}
                onClick={showPrev}
                aria-label="Previous image"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
                  <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
            <div className={styles.sliderFrame}>
              {isVideoItem(active) ? (
                <video
                  className={styles.modalVideo}
                  autoPlay
                  muted
                  loop
                  controls
                  playsInline
                  poster={active.src}
                >
                  <source src={active.videoSrc ?? active.src} />
                </video>
              ) : (
                <TransformWrapper
                  key={active.key ?? active.src ?? activeIndex}
                  ref={(ref) => {
                    zoomRef.current = ref;
                  }}
                  centerOnInit
                  centerZoomedOut
                  minScale={1}
                >
                  <TransformComponent
                    wrapperClass={styles.zoomWrapper}
                    contentClass={styles.zoomContent}
                    wrapperStyle={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    contentStyle={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      className={styles.modalImage}
                      src={active.src}
                      alt=""
                      draggable="false"
                      onLoad={handleZoomImageLoad}
                    />
                  </TransformComponent>
                </TransformWrapper>
              )}
            </div>
            {slides.length > 1 ? (
              <button
                type="button"
                className={`${styles.sliderNav} ${styles.sliderNext}`}
                onClick={showNext}
                aria-label="Next image"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
                  <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
      </Modal>

    </>
  );
}
