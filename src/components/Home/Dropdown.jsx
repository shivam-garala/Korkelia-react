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
    leadingIcon === "globe"
      ? "/icons/world.png"
      : leadingIcon === "currency"
      ? "/icons/euro.png"
      : leadingIcon === "menu"
      ? "/icons/menu.png"
      : null;

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
        onClick={() => setOpen((prev) => !prev)}
      >
        {iconSrc ? (
          <Image
            className={styles.icon}
            src={iconSrc}
            alt=""
            width={16}
            height={16}
            unoptimized
          />
        ) : null}
        <span>{active?.label}</span>
        <Image
          className={styles.caret}
          src="/icons/down_Arrow.png"
          alt=""
          width={14}
          height={9}
          unoptimized
        />
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
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
