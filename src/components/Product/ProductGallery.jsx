"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Modal from "../ui/Modal.jsx";
import styles from "./ProductGallery.module.css";

const isVideoSrc = (value) => {
  if (!value || typeof value !== "string") return false;
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(value);
};

const isVideoItem = (item) =>
  Boolean(item?.videoSrc) ||
  item?.type === "video" ||
  item?.badge === "play" ||
  (item?.variant === "video" && isVideoSrc(item?.src));

const buildDesignCacheKey = (designId) =>
  designId ? `design:${designId}` : "";

const hasIdValue = (value) => value !== null && value !== undefined && value !== "";

const getDesignIdCandidates = (entry) => {
  if (!entry) return [];
  const candidates = [
    entry?.design?.id,
    entry?.design_variant?.id,
    entry?.designVariant?.id,
    entry?.design?.design_id,
    entry?.design?.designId,
    entry?.design_id,
    entry?.designId,
    entry?.design_variant_id,
    entry?.designVariantId,
  ];
  if (candidates.some((value) => hasIdValue(value))) return candidates;
  return [entry?.id];
};

const hasDesignId = (entry) => getDesignIdCandidates(entry).some(hasIdValue);

const matchesProductId = (entry, expectedId) => {
  if (!entry || expectedId === null || expectedId === undefined) return false;
  const expected = String(expectedId);
  const candidates = [
    entry?.id,
    entry?.product_id,
    entry?.productId,
    entry?.product?.id,
    entry?.product?.product_id,
    entry?.design?.product_id,
    entry?.design?.product?.id,
    entry?.design?.product?.product_id,
    entry?.design_variant?.product_id,
    entry?.designVariant?.product_id,
  ];
  return candidates.some((value) => value !== null && value !== undefined && String(value) === expected);
};

const matchesDesignId = (entry, expectedId) => {
  if (!entry || expectedId === null || expectedId === undefined) return false;
  const expected = String(expectedId);
  const candidates = getDesignIdCandidates(entry);
  return candidates.some((value) => value !== null && value !== undefined && String(value) === expected);
};

const readCachedProduct = (productId, designId) => {
  if (typeof window === "undefined") return null;
  if (!productId && !designId) return null;
  try {
    const raw = window.sessionStorage.getItem("product_list_cache");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const designKey = buildDesignCacheKey(designId);
    if (designKey && parsed[designKey]) {
      const byDesign = parsed[designKey];
      if (!productId || matchesProductId(byDesign, productId)) {
        return byDesign;
      }
    }
    if (productId) {
      const byProduct = parsed[String(productId)] ?? null;
      if (byProduct) {
        if (!designId) return byProduct;
        if (matchesDesignId(byProduct, designId)) return byProduct;
        if (!hasDesignId(byProduct)) return byProduct;
      }
    }
    if (productId || designId) {
      const entries = Object.values(parsed).filter(
        (entry) => entry && typeof entry === "object"
      );
      const strictMatch = entries.find(
        (entry) =>
          (!productId || matchesProductId(entry, productId)) &&
          (!designId || matchesDesignId(entry, designId))
      );
      if (strictMatch) return strictMatch;
      if (designId) {
        const designMatch = entries.find((entry) => matchesDesignId(entry, designId));
        if (designMatch) return designMatch;
      }
      if (productId) {
        const productMatch = entries.find((entry) => matchesProductId(entry, productId));
        if (productMatch) return productMatch;
      }
    }
    return null;
  } catch (error) {
    console.error("Product cache read failed", error);
    return null;
  }
};

const normalizeMediaUrl = (value) => {
  if (!value) return "";
  return encodeURI(String(value));
};

const normalizeOrderValue = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getMediaKey = (item, index) => {
  if (!item) return `media-${index}`;
  return String(
    item.key ??
      item.id ??
      item.image_id ??
      item.src ??
      item.videoSrc ??
      `media-${index}`
  );
};

const sortMediaByOrder = (list) =>
  list
    .map((item, index) => ({
      item,
      index,
      order: normalizeOrderValue(
        item?.order ?? item?.sort_order ?? item?.sortOrder ?? item?.position,
        index
      ),
    }))
    .sort((a, b) => (a.order - b.order) || (a.index - b.index))
    .map(({ item }) => item);

const resolveImageSrc = (image) => {
  if (!image) return "";
  if (typeof image === "string") {
    if (/^https?:\/\//i.test(image) || image.startsWith("/")) {
      return normalizeMediaUrl(image);
    }
  }
  const apiBase =
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
  const cleaned = typeof image === "string" ? image : "";
  if (!apiBase || !cleaned) return normalizeMediaUrl(cleaned);
  return normalizeMediaUrl(
    `${apiBase.replace(/\/$/, "")}/${cleaned.replace(/^\//, "")}`
  );
};

const fallbackImageSrc = "/productdetails/no_image.jpg";

const resolveProductMedia = (product, imageVariants) => {
  if (!product) return { items: [], hasExplicitImages: false };
  const design =
    product?.design ??
    product?.design_variant ??
    product?.designVariant ??
    null;
  const hasExplicitImages = Array.isArray(design?.images);
  if (hasExplicitImages) {
    const images = sortMediaByOrder(design.images);
    const mapped = images
      .map((image, index) => {
        const src = resolveImageSrc(
          image?.image_url ??
            image?.url ??
            image?.image ??
            image?.image_name ??
            image
        );
        const videoSrc = resolveImageSrc(
          image?.videoSrc ?? image?.video_url ?? image?.videoUrl ?? image?.video ?? ""
        );
        const isExplicitVideo =
          image?.isVideo === true ||
          image?.is_video === true ||
          image?.isVideo === 1 ||
          image?.is_video === 1 ||
          String(image?.is_video ?? "").toLowerCase() === "yes";
        const videoFromSrc = isVideoSrc(src);
        const wantsVideo =
          isExplicitVideo ||
          image?.type === "video" ||
          image?.badge === "play" ||
          videoFromSrc ||
          Boolean(videoSrc);
        const resolvedVideoSrc = videoSrc || (videoFromSrc ? src : "");
        if (wantsVideo && !resolvedVideoSrc) return null;
        const isVideo = Boolean(resolvedVideoSrc);
        const resolvedSrc = isVideo ? (videoFromSrc ? "" : src) : (src || fallbackImageSrc);
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
    if (mapped.length) {
      return { items: mapped, hasExplicitImages: true };
    }
    return {
      items: [{ key: "no-image", variant: "square", src: fallbackImageSrc }],
      hasExplicitImages: true,
    };
  }

  const fallbackSrc = resolveImageSrc(
    product?.image ??
      design?.image ??
      design?.product?.image ??
      ""
  );
  if (!fallbackSrc) return { items: [], hasExplicitImages: false };
  if (isVideoSrc(fallbackSrc)) {
    return {
      items: [
        {
          key: "fallback",
          variant: "video",
          src: "",
          videoSrc: fallbackSrc,
          badge: "play",
        },
      ],
      hasExplicitImages: false,
    };
  }
  return {
    items: [{ key: "fallback", variant: "square", src: fallbackSrc }],
    hasExplicitImages: false,
  };
};

export default function ProductGallery({ items, productId = "", designId = "" }) {
  const [cachedProduct, setCachedProduct] = useState(null);
  const explicitDesignId = useMemo(
    () => (designId ? String(designId) : ""),
    [designId]
  );
  const [activeDesignId, setActiveDesignId] = useState(explicitDesignId);
  const [useActiveDesign, setUseActiveDesign] = useState(false);
  const imageVariants = useMemo(
    () => ["square", "tall", "circle", "wide"],
    []
  );
  const hasArrayItems = Array.isArray(items);
  const propProduct =
    !hasArrayItems && items && typeof items === "object" ? items : null;
  const hasResponse =
    cachedProduct !== null ||
    propProduct !== null ||
    (items !== null && items !== undefined);

  useEffect(() => {
    setActiveDesignId(explicitDesignId);
    setUseActiveDesign(false);
  }, [explicitDesignId]);

  useEffect(() => {
    const updateCachedProduct = () => {
      const resolvedDesignId =
        useActiveDesign && activeDesignId
          ? activeDesignId
          : explicitDesignId || activeDesignId;
      setCachedProduct(readCachedProduct(productId, resolvedDesignId));
    };

    // Initial load
    updateCachedProduct();
    
    // Listen for cache updates
    const handleCacheUpdate = (event) => {
      const updatedProductId = event.detail?.productId ?? "";
      const updatedDesignId = event.detail?.designId ?? "";
      const forceDesign = event.detail?.forceDesign === true;
      const userInitiated = event.detail?.userInitiated === true;
      if (!event.detail || (!updatedProductId && !updatedDesignId)) {
        updateCachedProduct();
        return;
      }
      const hasExplicitDesign = Boolean(explicitDesignId);
      const canUpdateDesign =
        !hasExplicitDesign ||
        forceDesign ||
        userInitiated ||
        (updatedDesignId && String(updatedDesignId) === String(explicitDesignId));
      if (
        updatedProductId &&
        String(updatedProductId) === String(productId) &&
        updatedDesignId &&
        canUpdateDesign
      ) {
        setActiveDesignId(String(updatedDesignId));
        if (forceDesign || userInitiated) {
          setUseActiveDesign(true);
        }
      }
      const matchesProduct =
        updatedProductId && String(updatedProductId) === String(productId);
      const resolvedDesignId =
        useActiveDesign && activeDesignId
          ? activeDesignId
          : explicitDesignId || activeDesignId;
      const matchesDesign =
        updatedDesignId &&
        resolvedDesignId &&
        String(updatedDesignId) === String(resolvedDesignId);
      if (matchesProduct || (!productId && matchesDesign)) {
        updateCachedProduct();
      }
    };
    
    window.addEventListener("productCacheUpdated", handleCacheUpdate);
    return () => {
      window.removeEventListener("productCacheUpdated", handleCacheUpdate);
    };
  }, [activeDesignId, explicitDesignId, productId, useActiveDesign]);

  const { items: cachedItems, hasExplicitImages } = useMemo(
    () => resolveProductMedia(cachedProduct, imageVariants),
    [cachedProduct, imageVariants]
  );
  const { items: propItems, hasExplicitImages: hasPropImages } = useMemo(
    () => resolveProductMedia(propProduct, imageVariants),
    [propProduct, imageVariants]
  );

  const baseItems = useMemo(() => {
    if (!hasArrayItems) return [];
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
              src: "",
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
        const videoSrc = resolveImageSrc(
          item?.videoSrc ?? item?.video_url ?? item?.videoUrl ?? item?.video ?? ""
        );
        const isExplicitVideo =
          item?.isVideo === true ||
          item?.is_video === true ||
          item?.isVideo === 1 ||
          item?.is_video === 1 ||
          String(item?.is_video ?? "").toLowerCase() === "yes";
        const videoFromSrc = isVideoSrc(src);
        const wantsVideo =
          isExplicitVideo || isVideoItem(item) || videoFromSrc || Boolean(videoSrc);
        const resolvedVideoSrc = videoSrc || (videoFromSrc ? src : "");
        if (wantsVideo && !resolvedVideoSrc) return null;
        const isVideo = Boolean(resolvedVideoSrc);
        const resolvedSrc = isVideo ? (videoFromSrc ? "" : src) : (src || fallbackImageSrc);
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
  }, [hasArrayItems, items, imageVariants]);

  const slides = useMemo(() => {
    if (hasPropImages) return propItems;
    if (hasExplicitImages) return cachedItems;
    const base = propItems.length
      ? propItems
      : cachedItems.length
      ? cachedItems
      : baseItems;
    if (base.length) return base;
    if (!hasResponse) return [];
    return [{ key: "no-image", variant: "square", src: fallbackImageSrc }];
  }, [
    baseItems,
    cachedItems,
    hasExplicitImages,
    hasPropImages,
    hasResponse,
    propItems,
  ]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loadedMap, setLoadedMap] = useState({});
  const [failedMap, setFailedMap] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);
  const galleryRef = useRef(null);
  const galleryScrollRaf = useRef(null);
  const zoomRef = useRef(null);

  const filteredSlides = useMemo(() => {
    if (!slides.length) return slides;
    return slides.filter((item, index) => {
      if (!isVideoItem(item)) return true;
      const itemKey = getMediaKey(item, index);
      return !failedMap[itemKey];
    });
  }, [slides, failedMap]);

  const displaySlides = useMemo(() => {
    if (filteredSlides.length) return filteredSlides;
    if (!hasResponse || hasExplicitImages) return [];
    return [{ key: "no-image", variant: "square", src: fallbackImageSrc }];
  }, [filteredSlides, hasExplicitImages, hasResponse]);

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
  const gridSlides = useMemo(() => {
    if (showSkeleton) return skeletonSlides;
    if (!displaySlides.length) return displaySlides;
    const present = new Set(displaySlides.map((item) => item?.variant).filter(Boolean));
    const isOnlyNoImage =
      displaySlides.length === 1 && displaySlides[0]?.key === "no-image";
    const placeholders = imageVariants
      .filter((variant) => !present.has(variant))
      .map((variant) => ({
        key: `placeholder-${variant}`,
        variant,
        isPlaceholder: true,
        src: isOnlyNoImage ? fallbackImageSrc : "",
      }));
    return placeholders.length ? [...displaySlides, ...placeholders] : displaySlides;
  }, [showSkeleton, skeletonSlides, displaySlides, imageVariants]);

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
    if (displaySlides.length < 2) return;
    setActiveIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  const showNext = useCallback(() => {
    if (displaySlides.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % displaySlides.length);
  }, [displaySlides.length]);

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
      const total = displaySlides.length;
      if (!total) return;
      const nextIndex = ((index % total) + total) % total;
      setGalleryIndex(nextIndex);
      scrollToGalleryIndex(nextIndex);
    },
    [displaySlides.length, scrollToGalleryIndex]
  );

  const showGalleryPrev = useCallback(() => {
    if (displaySlides.length < 2) return;
    goToGalleryIndex(galleryIndex - 1);
  }, [galleryIndex, goToGalleryIndex, displaySlides.length]);

  const showGalleryNext = useCallback(() => {
    if (displaySlides.length < 2) return;
    goToGalleryIndex(galleryIndex + 1);
  }, [galleryIndex, goToGalleryIndex, displaySlides.length]);

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

  const handleMediaError = useCallback((mediaKey) => {
    if (!mediaKey) return;
    const key = String(mediaKey);
    setFailedMap((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
    setLoadedMap((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
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
      const itemKey = getMediaKey(item, index);
      if (isVideoItem(item)) {
        const videoSrc = item.videoSrc ?? (isVideoSrc(item.src) ? item.src : "");
        if (!videoSrc) {
          if (active) handleMediaError(itemKey);
          return;
        }
        const video = document.createElement("video");
        const handleLoaded = () => {
          if (!active) return;
          setLoadedMap((prev) => (prev[itemKey] ? prev : { ...prev, [itemKey]: true }));
        };
        const handleError = () => {
          if (!active) return;
          handleMediaError(itemKey);
        };
        video.addEventListener("loadeddata", handleLoaded);
        video.addEventListener("loadedmetadata", handleLoaded);
        video.addEventListener("error", handleError);
        video.preload = "metadata";
        video.src = videoSrc;
        cleanups.push(() => {
          video.removeEventListener("loadeddata", handleLoaded);
          video.removeEventListener("loadedmetadata", handleLoaded);
          video.removeEventListener("error", handleError);
        });
        return;
      }

      const imgSrc = item.src || fallbackImageSrc;
      const ImgCtor = typeof window !== "undefined" ? window.Image : null;
      if (!ImgCtor) {
        if (active) handleMediaError(itemKey);
        return;
      }
      const img = new ImgCtor();
      const handleLoaded = () => {
        if (!active) return;
        setLoadedMap((prev) => (prev[itemKey] ? prev : { ...prev, [itemKey]: true }));
      };
      const handleError = () => {
        if (!active) return;
        handleMediaError(itemKey);
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
    if (displaySlides.length) {
      requestAnimationFrame(() => scrollToGalleryIndex(0));
    }
  }, [displaySlides, scrollToGalleryIndex]);

  useEffect(() => {
    if (!displaySlides.length) return;
    if (activeIndex >= displaySlides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, displaySlides.length]);

  const active = displaySlides[activeIndex];
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
      {displaySlides.length > 1 ? (
        <div className={styles.modalCount}>
          {activeIndex + 1} / {displaySlides.length}
        </div>
      ) : null}
      {displaySlides.length > 1 ? (
        <div className={styles.modalDots} role="tablist" aria-label="Media previews">
          {displaySlides.map((item, index) => {
            const isVideo = isVideoItem(item);
            const dotImageSrc = isVideo ? (item.src || "") : (item.src || fallbackImageSrc);
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
          {gridSlides.map((item, index) => {
            const isVideo = isVideoItem(item);
            const itemKey = getMediaKey(item, index);
            const hasFailed = Boolean(failedMap[itemKey]);
            const isLoaded = Boolean(loadedMap[itemKey]);
            const imageSrc = isVideo
              ? (item.src || "")
              : hasFailed
              ? fallbackImageSrc
              : item.src || fallbackImageSrc;
            const isRemoteImage = !isVideo && /^https?:\/\//i.test(imageSrc);
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
                ) : item.isPlaceholder ? (
                  <div className={styles.cellButton} aria-hidden="true">
                    <div className={styles.media} aria-hidden>
                      {item.src ? (
                        <Image
                          className={styles.image}
                          src={item.src}
                          alt=""
                          fill
                          sizes="(max-width: 980px) 100vw, 50vw"
                        />
                      ) : null}
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
                          preload="metadata"
                          poster={imageSrc}
                          onLoadedData={() =>
                            setLoadedMap((prev) => ({ ...prev, [itemKey]: true }))
                          }
                          onLoadedMetadata={() =>
                            setLoadedMap((prev) => ({ ...prev, [itemKey]: true }))
                          }
                          onError={() => handleMediaError(itemKey)}
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
                            setLoadedMap((prev) => ({ ...prev, [itemKey]: true }))
                          }
                          onError={() => handleMediaError(itemKey)}
                        />
                      ) : (
                        <Image
                          className={`${styles.image} ${isLoaded ? styles.imageLoaded : styles.imageHidden}`}
                          src={imageSrc}
                          alt=""
                          fill
                          sizes="(max-width: 980px) 100vw, 50vw"
                          onLoad={() =>
                            setLoadedMap((prev) => ({ ...prev, [itemKey]: true }))
                          }
                          onLoadingComplete={() =>
                            setLoadedMap((prev) => ({ ...prev, [itemKey]: true }))
                          }
                          onError={() => handleMediaError(itemKey)}
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

        {displaySlides.length > 1 ? (
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
              {displaySlides.map((item, index) => (
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
        title={`Media ${activeIndex + 1} / ${displaySlides.length}`}
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
            {displaySlides.length > 1 ? (
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
            {displaySlides.length > 1 ? (
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
