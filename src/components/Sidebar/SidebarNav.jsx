import Link from "next/link";
import Image from "next/image";
import styles from "./SidebarNav.module.css";

const sidebarSections = [
  // {
  //   title: "Overview",
  //   items: [
  //     { label: "App", href: "/dashboard", icon: "grid" },
  //     { label: "Ecommerce", href: "/dashboard/ecommerce", icon: "bag" },
  //     { label: "Analytics", href: "/dashboard/analytics", icon: "chart" },
  //     { label: "Banking", href: "/dashboard/banking", icon: "bank" },
  //     { label: "Booking", href: "/dashboard/booking", icon: "calendar" },
  //     { label: "File", href: "/dashboard/file", icon: "folder" },
  //     { label: "Course", href: "/dashboard/course", icon: "play" },
  //   ],
  // },
  {
    title: "Management",
    items: [
      { label: "User", href: "/dashboard/user", icon: "user" },
      // { label: "User Role", href: "/dashboard/user-role", icon: "user" },
      { label: "Metal Rate", href: "/dashboard/gold-rate", icon: "chart" },
      { label: "Diamond Master", href: "/dashboard/diamond-master", icon: "grid" },
      { label: "Cut Master", href: "/dashboard/cut-master", icon: "grid" },
      { label: "Category Master", href: "/dashboard/category-master", icon: "grid" },
      { label: "Style Master", href: "/dashboard/style-master", icon: "grid" },
      // { label: "Stock Master", href: "/dashboard/stock-master", icon: "box" },
      // { label: "Design List", href: "/dashboard/design-list", icon: "grid" },
      // { label: "Change Password", href: "/dashboard/change-password", icon: "lock" },
      // { label: "Product", href: "/dashboard/product", icon: "box" },
      // { label: "Order", href: "/dashboard/orders", icon: "cart" },
      // { label: "Invoice", href: "/dashboard/invoice", icon: "receipt" },
      // { label: "Blog", href: "/dashboard/blog", icon: "edit" },
      // { label: "Job", href: "/dashboard/job", icon: "briefcase" },
      // { label: "Tour", href: "/dashboard/tour", icon: "map" },
      // { label: "File manager", href: "/dashboard/file-manager", icon: "folder" },
    ],
  },
];

export default function SidebarNav({ activePath }) {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.brand}>
        <Image
          className={styles.brandLogo}
          src="/logo/footer_logo.png"
          alt="Korkeila"
          width={56}
          height={56}
          priority
        />
        <span className={styles.brandText}>Korkeila</span>
      </div>

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
                    <span className={`${styles.icon} ${styles[item.icon]}`} />
                    <span className={styles.label}>{item.label}</span>
                    <span className={styles.chevron}>›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
