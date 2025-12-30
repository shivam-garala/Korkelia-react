"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
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
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const galleryRef = useRef(null);
  const galleryScrollRaf = useRef(null);

  const openAt = useCallback((index) => {
    setActiveIndex(index);
    setGalleryIndex(index);
    setOpen(true);
    setIsZoomed(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setIsZoomed(false);
  }, []);

  const showPrev = useCallback(() => {
    if (mainSwiper) {
      mainSwiper.slidePrev();
      return;
    }
    if (slides.length < 2) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [mainSwiper, slides.length]);

  const showNext = useCallback(() => {
    if (mainSwiper) {
      mainSwiper.slideNext();
      return;
    }
    if (slides.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [mainSwiper, slides.length]);

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

  useEffect(() => {
    setLoadedMap({});
  }, [slides]);

  useEffect(() => {
    setGalleryIndex(0);
    if (slides.length) {
      requestAnimationFrame(() => scrollToGalleryIndex(0));
    }
  }, [slides, scrollToGalleryIndex]);

  useEffect(() => {
    return () => {
      if (galleryScrollRaf.current) {
        cancelAnimationFrame(galleryScrollRaf.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsZoomed(false);
  }, [activeIndex]);

  useEffect(() => {
    if (!open || !mainSwiper) return;
    mainSwiper.slideTo(activeIndex, 0);
  }, [activeIndex, mainSwiper, open]);

  const active = slides[activeIndex];

  return (
    <>
        <div className={styles.galleryWrap}>
        <div className={styles.grid} ref={galleryRef} onScroll={handleGalleryScroll}>
          {displaySlides.map((item, index) => (
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
                    {!loadedMap[index] ? (
                      <div className={styles.mediaLoader} />
                    ) : null}
                    {isVideoItem(item) ? (
                      <video
                        className={`${styles.inlineVideo} ${loadedMap[index] ? styles.imageLoaded : styles.imageHidden}`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={item.src}
                        onLoadedData={() =>
                          setLoadedMap((prev) => ({ ...prev, [index]: true }))
                        }
                      >
                        <source src={item.videoSrc ?? item.src} />
                      </video>
                    ) : (
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
                    )}
                    {/* {!isVideoItem(item) && item.badge === "play" ? (
                      <div className={styles.play} aria-hidden />
                    ) : null} */}
                  </div>
                </button>
              )}
            </div>
          ))}
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

      {open && active ? (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Product media">
          <button className={styles.modalBackdropBtn} type="button" aria-label="Close" onClick={close} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Media {activeIndex + 1} / {slides.length}</div>
              <div className={styles.modalActions}>
                <button type="button" className={`${styles.actionButton} ${styles.closeButton}`} onClick={close} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <Swiper
                modules={[Thumbs, Navigation]}
                navigation
                allowTouchMove={!isZoomed}
                thumbs={{
                  swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
                }}
                onSwiper={setMainSwiper}
                onSlideChange={(swiper) => {
                  setActiveIndex(swiper.activeIndex);
                  setIsZoomed(false);
                }}
                initialSlide={activeIndex}
                className={styles.modalSwiper}
              >
                {slides.map((item, index) => {
                  const isVideo = isVideoItem(item);
                  return (
                    <SwiperSlide key={item.key ?? item.src ?? index} className={styles.modalSlide}>
                      {isVideo ? (
                        <div className={styles.modalMedia}>
                          <video
                            className={styles.modalVideo}
                            autoPlay
                            muted
                            loop
                            controls
                            playsInline
                            poster={item.src}
                          >
                            <source src={item.videoSrc ?? item.src} />
                          </video>
                        </div>
                      ) : (
                        <TransformWrapper
                          minScale={1}
                          maxScale={4}
                          centerOnInit
                          centerZoomedOut
                          smooth
                          smoothStep={0.08}
                          doubleClick={{ mode: "zoomIn" }}
                          wheel={{ step: 0.15 }}
                          pinch={{ step: 5 }}
                          panning={{ disabled: !(isZoomed && activeIndex === index) }}
                          onZoomStop={({ state }) => {
                            if (index === activeIndex) {
                              setIsZoomed(state.scale > 1);
                            }
                          }}
                          onPanningStop={({ state }) => {
                            if (index === activeIndex && state.scale <= 1) {
                              setIsZoomed(false);
                            }
                          }}
                        >
                          {({ zoomIn, zoomOut, resetTransform }) => (
                            <div className={styles.zoomStage}>
                              {isZoomed && index === activeIndex ? (
                                <div className={styles.zoomOverlay} aria-hidden />
                              ) : null}
                              <div className={styles.zoomControls} role="group" aria-label="Zoom controls">
                                <button
                                  type="button"
                                  className={styles.zoomControlBtn}
                                  onClick={() => zoomIn()}
                                  aria-label="Zoom in"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  className={styles.zoomControlBtn}
                                  onClick={() => {
                                    resetTransform();
                                    setIsZoomed(false);
                                  }}
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
                                  onClick={() => zoomOut()}
                                  aria-label="Zoom out"
                                >
                                  -
                                </button>
                              </div>
                              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                                <img className={styles.modalImage} src={item.src} alt="" draggable="false" />
                              </TransformComponent>
                            </div>
                          )}
                        </TransformWrapper>
                      )}
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
            <div className={styles.modalFooter}>
              {slides.length > 1 ? (
                <div className={styles.modalCount}>{activeIndex + 1} / {slides.length}</div>
              ) : null}
              {slides.length > 1 ? (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  slidesPerView="auto"
                  spaceBetween={0}
                  watchSlidesProgress
                  className={styles.thumbSwiper}
                >
                  {slides.map((item, index) => (
                    <SwiperSlide key={item.key ?? item.src ?? index} className={styles.thumbSlide}>
                      <div className={styles.thumbBox}>
                        <img className={styles.thumbImage} src={item.src} alt="" loading="lazy" />
                        {isVideoItem(item) ? (
                          <span className={styles.thumbVideoBadge} aria-hidden="true" />
                        ) : null}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
