'use client';

import { useEffect, useRef } from "react";
import styles from "./NotificationDrawer.module.css";

const sampleItems = [
  {
    id: "n1",
    title: "design-surname-2015.mp4",
    meta: "2.3 Mb",
    badge: "Download",
    color: "#8b5cf6",
    unread: true,
  },
  {
    id: "n2",
    title: "Angelique Morse added new tags to File manager",
    meta: "3 days · File manager",
    tags: ["Design", "Dashboard", "Design system"],
    color: "#ec4899",
  },
  {
    id: "n3",
    title: "Giana Brandt request a payment of $200",
    meta: "4 days · File manager",
    actions: ["Pay", "Decline"],
    color: "#06b6d4",
  },
  {
    id: "n4",
    title: "Your order is placed waiting for shipping",
    meta: "5 days · Order",
    color: "#f59e0b",
    unread: true,
  },
  {
    id: "n5",
    title: "Delivery processing your order is being shipped",
    meta: "6 days · Order",
    color: "#22c55e",
  },
  {
    id: "n6",
    title: "You have new message 5 unread messages",
    meta: "7 days · Communication",
    color: "#0ea5e9",
  },
  {
    id: "n7",
    title: "You have new mail",
    meta: "8 days · Communication",
    color: "#f97316",
  },
];

export default function NotificationDrawer({
  open,
  onClose,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div
      className={`${styles.overlay} ${open ? styles.open : ""}`}
      aria-hidden={!open}
    >
      <aside className={styles.drawer} ref={ref} role="dialog" aria-label="Notifications">
        <header className={styles.header}>
          <div>
            <p className={styles.title}>Notifications</p>
            <p className={styles.subtitle}>All · Unread · Archived</p>
          </div>
          <button className={styles.close} type="button" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className={styles.list}>
          {sampleItems.map((item) => (
            <article key={item.id} className={styles.item}>
              <span
                className={styles.dot}
                style={{ background: item.color }}
              />
              <div className={styles.content}>
                <p className={styles.itemTitle}>{item.title}</p>
                <p className={styles.itemMeta}>{item.meta}</p>
                {item.tags ? (
                  <div className={styles.tags}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.actions ? (
                  <div className={styles.actions}>
                    {item.actions.map((action) => (
                      <button key={action} className={styles.actionBtn}>
                        {action}
                      </button>
                    ))}
                  </div>
                ) : null}
                {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
              </div>
              {item.unread ? <span className={styles.unread} /> : null}
            </article>
          ))}
        </div>

        <footer className={styles.footer}>
          <button className={styles.viewAll}>View all</button>
        </footer>
      </aside>
    </div>
  );
}
