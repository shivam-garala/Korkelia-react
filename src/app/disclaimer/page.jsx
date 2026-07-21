"use client";

import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import styles from "./page.module.css";

const policyContent = {
  heading: "PRODUCT IMAGES & VARIATIONS DISCLAIMER",
  sections: [
    {
      body: [
        "All images and videos are for reference only. Each piece is crafted individually, so the delivered product may differ slightly from on-screen visuals due to handcrafted processes, material characteristics, lighting conditions, and your device display settings.",
        "For designs that include small supporting diamonds (e.g., below 0.20 ct), the number and placement of stones may vary depending on the selected size (such as ring size) and technical setting requirements, while preserving the intended overall design and specifications.",
        "Please note that on-screen visuals may not scale dynamically when selecting different options. If you have any questions about proportions, stone sizes, or design details, please contact Korkeila Helsinki before placing your order.",
      ],
    },
  ],
};

const renderParagraphs = (paragraphs, className) =>
  paragraphs.map((text, index) => (
    <p key={`${text}-${index}`} className={className}>
      {text}
    </p>
  ));

export default function DisclaimerPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h2 className={styles.heading}>{policyContent.heading}</h2>
          </div>
          <div className={styles.content}>
            {policyContent.sections.map((section, index) => (
              <section key={index} className={styles.section}>
                {section.body ? renderParagraphs(section.body, styles.paragraph) : null}
              </section>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
