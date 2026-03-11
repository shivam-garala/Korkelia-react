"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "../ui/Icon.jsx";
import styles from "./SidebarNav.module.css";

export const sidebarSections = [
  {
    title: "User Management",
    items: [
      { label: "User Management", href: "/dashboard/user", icon: "user" },
    ],
  },
  {
    title: "Metal Management",
    items: [
      { label: "Metal Master", href: "/dashboard/metal-master", icon: "box" },
      { label: "Metal Rate", href: "/dashboard/gold-rate", icon: "chart" },
      { label: "Karat", href: "/dashboard/karat-master", icon: "bank" },
      // { label: "Gold Color", href: "/dashboard/gold-color", icon: "grid" },
    ],
  },
  {
    title: "Currency Management",
    items: [
      { label: "Currency Rate", href: "/dashboard/currency-rate", icon: "chart" },
    ],
  },
  {
    title: "Diamond Management",
    items: [
      { label: "Diamond Type", href: "/dashboard/diamond-type", icon: "grid" },
      { label: "Diamond Clarity", href: "/dashboard/diamond-clarity", icon: "receipt" },
      { label: "Diamond Master", href: "/dashboard/diamond-master", icon: "bag" },
      { label: "Diamond Rate", href: "/dashboard/diamond-rate", icon: "chart" },
      { label: "Cut Master", href: "/dashboard/cut-master", icon: "edit" },
    ],
  },
  {
    title: "Product Classification",
    items: [
      { label: "Category Master", href: "/dashboard/category-master", icon: "folder" },
      { label: "Sub Category Master", href: "/dashboard/sub-category-master", icon: "map" },
      { label: "Style Master", href: "/dashboard/style-master", icon: "play" },
    ],
  },
  {
    title: "Product Management",
    items: [
      { label: "Products", href: "/dashboard/product", icon: "cart" },
      // { label: "Design", href: "/dashboard/design", icon: "briefcase" },
      { label: "Design Variant", href: "/dashboard/design-variant", icon: "briefcase" },
    ],
  },
  {
    title: "Appointment Management",
    items: [
      { label: "Appointments", href: "/dashboard/appointment", icon: "receipt" },
    ],
  },
];

export default function SidebarNav({ activePath }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setCollapsed((prev) => !prev);
    };
    window.addEventListener("sidebar:toggle", handleToggle);
    return () => window.removeEventListener("sidebar:toggle", handleToggle);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("admin-scroll-lock");
    document.documentElement.classList.add("admin-scroll-lock");
    return () => {
      document.body.classList.remove("admin-scroll-lock");
      document.documentElement.classList.remove("admin-scroll-lock");
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className={`${styles.backdrop} ${collapsed ? "" : styles.backdropOpen}`}
        aria-label="Close menu"
        onClick={() => setCollapsed(true)}
      />
      <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        {sidebarSections.map((section) => (
          <div key={section.title} className={styles.section}>
            <p className={styles.sectionTitle}>{section.title}</p>
            <ul className={styles.list}>
              {section.items.map((item) => {
                const active =
                  activePath === item.href ||
                  activePath?.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.link} ${active ? styles.active : ""}`}
                    >
                      <span className={styles.icon}>
                        <Icon className={styles.iconSvg} name={item.icon} size={16} />
                      </span>
                      <span className={styles.label}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
