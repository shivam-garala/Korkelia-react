"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./Dropdown.module.css";

export default function Dropdown({
  value,
  options,
  onChange,
  leadingIcon,
  ariaLabel,
  triggerClassName,
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonId = useId();
  const menuId = useId();
  const ref = useRef(null);

  const active = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [ref]);

  const iconSrc =
    active?.icon ??
    (leadingIcon === "globe"
      ? "/icons/world.png"
      : leadingIcon === "currency"
      ? "/icons/euro.svg"
      : leadingIcon === "menu"
      ? "/icons/menu.png"
      : null);
  const iconAlt = active?.iconAlt ?? "";

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        id={mounted ? buttonId : undefined}
        type="button"
        className={`${styles.trigger}${triggerClassName ? ` ${triggerClassName}` : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open && mounted ? menuId : undefined}
        onClick={() => options.length > 1 && setOpen((prev) => !prev)}
      >
        {iconSrc ? (
          <Image
            className={styles.icon}
            src={iconSrc}
            alt={iconAlt}
            width={18}
            height={18}
            unoptimized
          />
        ) : null}
        <span className={styles.label}>{active?.label}</span>
        {options.length > 1 ? (
          <Image
            className={styles.caret}
            src="/icons/down_Arrow.png"
            alt=""
            width={14}
            height={9}
            unoptimized
          />
        ) : null}
      </button>

      {open ? (
        <div
          id={mounted ? menuId : undefined}
          className={styles.menu}
          role="listbox"
          aria-labelledby={mounted ? buttonId : undefined}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.item} ${option.value === value ? styles.active : ""}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className={styles.itemInner}>
                {option.icon ? (
                  <Image
                    className={styles.optionIcon}
                    src={option.icon}
                    alt={option.iconAlt ?? ""}
                    width={18}
                    height={18}
                    unoptimized
                  />
                ) : null}
                <span className={styles.optionLabel}>{option.label}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
