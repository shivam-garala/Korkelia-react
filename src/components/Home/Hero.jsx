"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./Hero.module.css";

export default function Hero({
  imageSrc,
  videoSrc,
  mobileVideoSrc,
  posterSrc,
  eyebrow,
  title,
  subcopy,
  primaryCta,
  secondaryCta,
}) {
  const mobileVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const MOBILE_START = 4;
  const MOBILE_END = 31;

  const handleMobileLoaded = () => {
    const video = mobileVideoRef.current;
    if (!video) return;
    video.currentTime = MOBILE_START;
  };

  const handleMobileTimeUpdate = () => {
    const video = mobileVideoRef.current;
    if (!video) return;
    if (video.currentTime >= MOBILE_END) {
      video.currentTime = MOBILE_START;
    }
  };

  const toggleMute = () => {
    const video = mobileVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.media} aria-hidden>
        {videoSrc ? (
          <>
            <video
              className={[
                styles.video,
                mobileVideoSrc ? styles.desktopVideo : "",
              ].join(" ")}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterSrc}
            >
              <source src={videoSrc} />
            </video>
            {mobileVideoSrc ? (
              <video
                ref={mobileVideoRef}
                className={[styles.video, styles.mobileVideo].join(" ")}
                autoPlay
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={handleMobileLoaded}
                onTimeUpdate={handleMobileTimeUpdate}
              >
                <source src={mobileVideoSrc} type="video/mp4" />
              </video>
            ) : null}
          </>
        ) : (
          <Image className={styles.image} src={imageSrc} alt="" fill priority />
        )}
        <div className={styles.overlay} />
      </div>

      {mobileVideoSrc && (
        <button
          className={styles.muteBtn}
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}

      <div className={styles.content}>
        <div className={styles.contentInner}>
          {/* {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          {title ? <h1 className={styles.title}>{title}</h1> : null}
          {subcopy ? <p className={styles.subcopy}>{subcopy}</p> : null}
          <div className={styles.ctaRow}>
            {primaryCta ? (
              <Link className={styles.cta} href={primaryCta.href}>
                {primaryCta.label}
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link className={`${styles.cta} ${styles.ctaSecondary}`} href={secondaryCta.href}>
                {secondaryCta.label}
              </Link>
            ) : null}
          </div> */}
        </div>
      </div>
    </section>
  );
}
