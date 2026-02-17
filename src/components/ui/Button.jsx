"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import styles from "./Button.module.css";

export default function Button({
  children,
  onClick = undefined,
  type = "button",
  variant = "primary",
  size = "md",
  icon = undefined,
  iconPosition = "left",
  iconOnly = false,
  debounceMs = 300,
  disabled = false,
  className = "",
  ...rest
}) {
  const [cooldown, setCooldown] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(
    (event) => {
      if (disabled || cooldown) return;
      if (typeof onClick === "function") {
        onClick(event);
      }
      if (debounceMs > 0) {
        setCooldown(true);
        timeoutRef.current = setTimeout(() => {
          setCooldown(false);
        }, debounceMs);
      }
    },
    [cooldown, debounceMs, disabled, onClick]
  );

  const showIconLeft = icon && iconPosition === "left";
  const showIconRight = icon && iconPosition === "right";

  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant] ?? "",
        styles[size] ?? "",
        iconOnly ? styles.iconOnly : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick ? handleClick : undefined}
      disabled={disabled || cooldown}
      {...rest}
    >
      {showIconLeft ? <Icon className={styles.icon} name={icon} size={16} /> : null}
      {iconOnly ? <span className={styles.srOnly}>{children}</span> : children}
      {showIconRight ? <Icon className={styles.icon} name={icon} size={16} /> : null}
    </button>
  );
}
