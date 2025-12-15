"use client";

import { useMemo, useState } from "react";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import FiltersBar from "../../components/Product/FiltersBar.jsx";
import ProductGrid from "../../components/Product/ProductGrid.jsx";
import styles from "./page.module.css";

export default function ProductListingPage() {
  const [leftFilter, setLeftFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("rings");

  const products = useMemo(
    () => [
      { id: 1, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/1" },
      { id: 2, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/2" },
      { id: 3, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/3" },
      { id: 4, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/4" },
      { id: 5, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/5" },
      { id: 6, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/6" },
      { id: 7, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/7" },
      { id: 8, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/8" },
      { id: 9, name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/9" },
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
            leftLabel="Alliance"
            rightLabel="Select Category"
            leftValue={leftFilter}
            rightValue={categoryFilter}
            onLeftChange={setLeftFilter}
            onRightChange={setCategoryFilter}
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

