import styles from "./Container.module.css";

export default function Container({ as: Tag = "div", className = "", children }) {
  return <Tag className={`${styles.container} ${className}`}>{children}</Tag>;
}

