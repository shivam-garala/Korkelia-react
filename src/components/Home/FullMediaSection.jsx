"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import styles from "./FullMediaSection.module.css";

export default function FullMediaSection({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  mediaPosition = "center",
  sectionClassName = "",
  mediaClassName = "",
  contentClassName = "",
  videoClassName = "",
  imageClassName = "",
  eyebrow,
  title,
  subtitle,
  description,
  ctaLabel = "DISCOVER (LÖYDÄ)",
  href = "#",
  tone = "dark",
  align = "left",
  startTimeSeconds,
}) {
  const isVideo = mediaType === "video";
  const videoRef = useRef(null);

  const handleLoadedMetadata = () => {
    if (!startTimeSeconds) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = startTimeSeconds;
  };

  const handleTimeUpdate = () => {
    if (!startTimeSeconds) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime < startTimeSeconds) {
      video.currentTime = startTimeSeconds;
    }
  };

  return (
    <section
      className={[
        styles.section,
        tone === "light" ? styles.toneLight : styles.toneDark,
        align === "right" ? styles.alignRight : styles.alignLeft,
        sectionClassName,
      ].join(" ")}
    >
      <div className={[styles.media, mediaClassName].join(" ")} aria-hidden>
        {isVideo ? (
          <video
            key={mediaSrc}
            ref={videoRef}
            className={[styles.video, videoClassName].join(" ")}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
            style={{ objectPosition: mediaPosition }}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          >
            <source src={mediaSrc} />
          </video>
        ) : (
          <Image
            className={[styles.image, imageClassName].join(" ")}
            src={mediaSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: mediaPosition }}
          />
        )}
        <div className={styles.overlay} />
      </div>

      <div className={[styles.content, contentClassName].join(" ")}>
        <div className={styles.text}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
          {ctaLabel ? (
            <Link className={styles.cta} href={href}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
