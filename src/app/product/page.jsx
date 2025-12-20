"use client";

import { useMemo, useState } from "react";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import FiltersBar from "../../components/Product/FiltersBar.jsx";
import ProductGrid from "../../components/Product/ProductGrid.jsx";
import styles from "./page.module.css";

export default function ProductListingPage() {
  const [sortFilter, setSortFilter] = useState("featured");
  const [categoryFilter, setCategoryFilter] = useState("rings");
  const sortOptions = useMemo(
    () => [
      // { value: "featured", label: "Featured" },
      // { value: "newest", label: "Newest" },
      { value: "price-asc", label: "Low to High" },
      { value: "price-desc", label: "High to Low" },
    ],
    []
  );
  const categoryOptions = useMemo(
    () => [
      { value: "rings", label: "Rings" },
      { value: "bracelets", label: "Bracelets" },
      { value: "necklaces", label: "Necklaces" },
      { value: "earrings", label: "Earrings" },
    ],
    []
  );

  const products = useMemo(
    () => [
      { id: 1, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/1" },
      { id: 2, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/2" },
      { id: 3, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/3" },
      { id: 4, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/4" },
      { id: 5, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/5" },
      { id: 6, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/6" },
      { id: 7, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/7" },
      { id: 8, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/8" },
      { id: 9, name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/9" },
    ],
    []
  );

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <h1 className={styles.heading}>RINGS</h1>

          <FiltersBar
            leftLabel="Sort By"
            rightLabel="Select Category"
            leftValue={categoryFilter}
            rightValue={sortFilter}
            onLeftChange={setCategoryFilter}
            onRightChange={setSortFilter}
            leftOptions={categoryOptions}
            rightOptions={sortOptions}
          />

          <div className={styles.gridWrap}>
            <ProductGrid products={products} columns={3} />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}





