"use client";

import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import styles from "./page.module.css";

const contactEmail = "korkeila@korkeilahelsinki.fi";

const policyContent = {
  heading: "Shipping & Returns Policy",
  intro:
    "This Shipping & Returns Policy applies to online purchases made via the Korkeila Helsinki website. For in-store purchases, different rules may apply.",
  sections: [
    {
      title: "1) Shipping - general",
      subsections: [
        {
          title: "1.1 Free shipping",
          body: ["We offer free shipping on all online purchases, subject to:"],
          list: [
            "delivery being available to the destination at checkout; and",
            "any restrictions shown at checkout (e.g., remote areas or special delivery requirements).",
          ],
        },
        {
          title: "1.2 Delivery countries / regions",
          body: [
            "We currently ship to: Finland. We reserve the right to change available delivery destinations at any time.",
            "Available destinations will always be shown at checkout. If international shipping is enabled later, additional terms (customs, taxes, processing) will apply (see Section 11).",
          ],
        },
        {
          title: "1.3 Courier and delivery method",
          body: [
            "We use reputable couriers and/or delivery partners (e.g., FedEx, DHL or other providers shown at checkout).",
            "Delivery method and estimated delivery timeframe will be displayed at checkout.",
          ],
        },
        {
          title: "1.4 When delivery is considered completed",
          body: ["Delivery is considered completed when the courier confirms delivery to:"],
          list: [
            "the delivery address provided by the customer; or",
            "the customer's designated recipient (if applicable).",
          ],
          afterList: [
            "Where the courier uses collection points or parcel lockers, delivery is considered completed when the parcel is made available for collection and confirmation is registered by the courier (subject to mandatory consumer rules).",
          ],
        },
        {
          title: "1.5 Customer responsibility - address accuracy and availability",
          body: [
            "You are responsible for ensuring that your delivery information is correct and that you (or your recipient) are available to receive the parcel. If delivery fails due to incorrect address details or failure to collect, additional costs may arise (e.g., re-delivery), to the extent permitted by law.",
          ],
        },
        {
          title: "1.6 Delivery delays / force majeure",
          body: [
            "Estimated delivery dates are estimates only. Delays may occur due to factors outside our reasonable control (e.g., courier delays, severe weather, customs processing, strikes, security checks). This does not affect mandatory consumer rights.",
          ],
        },
        {
          title: "1.7 Delivery safeguards (high-value items)",
          body: [
            "For security reasons, certain orders may require signature-on-delivery, ID verification, and/or insured shipping. Where applicable, this will be indicated at checkout or in delivery instructions.",
          ],
        },
      ],
    },
    {
      title: "2) Damage in transit / missing items (reporting)",
      subsections: [
        {
          title: "2.1 Reporting timeframe",
          body: [
            "If your parcel arrives damaged, appears tampered with, or an item is missing, you must contact us within 48 hours of courier-confirmed delivery. This reporting timeframe helps us handle courier claims efficiently and does not limit your statutory rights.",
          ],
        },
        {
          title: "2.2 Evidence required",
          body: ["Please provide:"],
          list: [
            "photos of the outer packaging (including labels),",
            "photos of the inner packaging,",
            "photos or videos of the item and damage, and",
            "any courier notes (if available).",
          ],
          afterList: [
            "Please keep all packaging materials until the matter is resolved, because the courier may require them for a claim.",
          ],
        },
        {
          title: "2.3 Resolution",
          body: [
            "We will assess the case and provide remedies required by applicable law (e.g., repair, replacement, refund) depending on the circumstances and inspection outcome. We may need the item returned for inspection.",
          ],
        },
      ],
    },
    {
      title: "3) Returns (right of withdrawal) - 14 days for eligible items",
      subsections: [
        {
          title: "3.1 Eligibility and return window",
          body: [
            "Where mandatory distance-selling rules apply, you may return eligible items within 14 days from the day you (or your designated recipient) receive the goods (based on courier-confirmed delivery).",
          ],
        },
        {
          title: "3.2 How to exercise the right of withdrawal",
          body: [
            `To exercise your withdrawal right, you must notify us within the 14-day window by email: ${contactEmail} with:`,
          ],
          list: [
            "order number,",
            "item(s) you want to return,",
            "your name and contact details,",
            "(optional) reason for return.",
          ],
          afterList: ['You may use the subject line: "Withdrawal / Return Request - Order [#]".'],
        },
        {
          title: "3.3 Return shipping timeframe",
          body: [
            "After notifying us, you must send back the item without undue delay and in any event within the timeframe required by applicable law. We will provide practical return instructions and a return label (see Section 5).",
          ],
        },
      ],
    },
    {
      title: "4) Items that cannot be returned (no-withdrawal exceptions)",
      subsections: [
        {
          title: "4.1 Engraved / personalised items",
          body: [
            "No returns are accepted for items that have been engraved or personalised at the customer's request.",
          ],
        },
        {
          title: "4.2 Custom-made to customer specifications",
          body: [
            "No returns are accepted for items that are custom-made to the customer's specifications (where a statutory withdrawal exception applies).",
          ],
        },
        {
          title: "4.3 Defective items",
          body: [
            "These exclusions do not limit your statutory rights if an item is defective or not as agreed. Defect claims are handled under Section 10.",
          ],
        },
      ],
    },
    {
      title: "5) Free returns process (how it works)",
      subsections: [
        {
          title: "5.1 Return label / instructions",
          body: [
            "Return labels are expected to be issued via our courier account (currently planned: FedEx). Returns are returned to our Finland store address. We will confirm the final carrier and workflow at e-commerce launch.",
          ],
        },
        {
          title: "5.2 Packaging requirements",
          body: ["Returned items must be packaged securely to prevent damage in transit, and should include (where applicable):"],
          list: ["original packaging,", "certificates or documentation,", "all included accessories and components."],
          afterList: [
            "If you no longer have the original packaging, you must use protective packaging sufficient to prevent damage.",
          ],
        },
      ],
    },
    {
      title: "6) Condition of returned items and inspection",
      subsections: [
        {
          title: "6.1 Condition requirement",
          body: [
            "Returned items must be in original condition. You may handle the item only to the extent necessary to assess it (as you would in a store).",
          ],
        },
        {
          title: "6.2 Inspection",
          body: [
            "All returns are subject to inspection before approval. We may refuse a refund or apply a reduction in value (where permitted by mandatory law) if inspection indicates:",
          ],
          list: [
            "damage not caused by us or the courier,",
            "wear beyond reasonable inspection,",
            "missing components, packaging, or certificates,",
            "unauthorised alteration, resizing, repair, or third-party work,",
            "signs of tampering (including stones replaced or removed, or settings altered),",
            "security seals or tags removed or not intact (if applicable),",
            "hygiene or safety concerns where relevant (e.g., earrings with clear signs of use).",
          ],
        },
        {
          title: "6.3 Security and authenticity checks",
          body: [
            "For high-value items, we may perform additional checks (e.g., authenticity, weight, setting integrity). This is to protect both customers and the business from fraud and tampering.",
          ],
        },
      ],
    },
    {
      title: "7) Refunds - timing and method",
      subsections: [
        {
          title: "7.1 When refunds are issued",
          body: [
            "If a return is approved, we aim to initiate the refund within 7 days after inspection approval.",
            "Where applicable law requires a different deadline, we will comply with mandatory legal timelines. We may withhold the refund until we have received the returned goods or you have provided evidence of dispatch (where permitted under applicable law).",
          ],
        },
        {
          title: "7.2 Refund method",
          body: [
            "Refunds are normally issued to the original payment method used for the purchase (best practice for fraud and chargeback protection and required by many payment providers). Bank transfer may be used only where necessary or feasible (e.g., the original method cannot be refunded), and may require additional information from you.",
          ],
        },
        {
          title: "7.3 What is refunded",
          body: [
            "If you withdraw from an eligible online purchase, we refund the purchase price and standard delivery charges where required by mandatory law. If the item's value has been diminished due to handling beyond what is necessary to inspect it, we may reduce the refund to the extent permitted by law.",
          ],
        },
      ],
    },
    {
      title: "8) Exchanges",
      body: [
        "If we offer exchanges, the process will be described at checkout and/or in customer support instructions. Where an exchange is not possible, you may return the item (if eligible) and place a new order.",
      ],
    },
    {
      title: "9) Items returned without request / incorrect returns",
      body: [
        "Items returned without a prior return request (or outside the return window) may be refused or returned to the customer, unless mandatory law requires otherwise. In such cases, additional shipping costs may apply to the extent permitted.",
      ],
    },
    {
      title: "10) Defective items / incorrect items (statutory rights)",
      body: [`If your item is defective, damaged not due to your actions, or not as agreed, please contact us as soon as possible at ${contactEmail} with:`],
      list: ["order number,", "description of the issue,", "photos or video where appropriate."],
      afterList: [
        "We will assess and provide remedies required by applicable law (repair, replacement, price reduction, or refund depending on the case and legal requirements). This section applies also to engraved or custom items if they are defective.",
      ],
    },
    {
      title: "11) International shipping",
      body: ["If or when we enable shipping outside Finland:"],
      list: [
        "delivery times may be longer,",
        "customs clearance procedures may apply,",
        "import duties, taxes, or GST may be payable by the customer unless stated otherwise at checkout,",
        "return logistics may differ (we will clearly communicate at checkout and update this policy).",
      ],
    },
    {
      title: "12) In-store purchases",
      body: [
        "For purchases made in-store, the 14-day distance-selling withdrawal right generally does not apply. Defects are handled in accordance with mandatory consumer protection rules, and any additional commercial warranty or resizing terms offered by us.",
      ],
    },
    {
      title: "13) Contact",
      body: ["For returns, delivery issues, and questions:"],
      contactEmail,
      footer: "Last updated: 12 January 2026",
    },
  ],
};

const renderParagraphs = (paragraphs, className) =>
  paragraphs.map((text, index) => (
    <p key={`${text}-${index}`} className={className}>
      {text}
    </p>
  ));

const renderList = (items) => (
  <ul className={styles.list}>
    {items.map((item, index) => (
      <li key={`${item}-${index}`} className={styles.listItem}>
        {item}
      </li>
    ))}
  </ul>
);

export default function ShippingReturnsPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h2 className={styles.heading}>{policyContent.heading}</h2>
            <p className={styles.intro}>{policyContent.intro}</p>
          </div>

          <div className={styles.content}>
            {policyContent.sections.map((section) => {
              const isContactSection = section.title === "13) Contact";
              return (
                <section
                  key={section.title}
                  className={
                    isContactSection
                      ? `${styles.section} ${styles.contactSection}`
                      : styles.section
                  }
                >
                <h3 className={styles.sectionTitle}>{section.title}</h3>
                {section.body ? renderParagraphs(section.body, styles.paragraph) : null}
                {section.list ? renderList(section.list) : null}
                {section.afterList ? renderParagraphs(section.afterList, styles.paragraph) : null}
                {section.subsections ? (
                  <div className={styles.subsections}>
                    {section.subsections.map((subsection) => (
                      <div key={subsection.title} className={styles.subsection}>
                        <h4 className={styles.subTitle}>{subsection.title}</h4>
                        {subsection.body ? renderParagraphs(subsection.body, styles.paragraph) : null}
                        {subsection.list ? renderList(subsection.list) : null}
                        {subsection.afterList
                          ? renderParagraphs(subsection.afterList, styles.paragraph)
                          : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {section.contactEmail ? (
                  <p className={styles.paragraph}>
                    <a className={styles.contactLink} href={`mailto:${section.contactEmail}`}>
                      {section.contactEmail}
                    </a>
                  </p>
                ) : null}
                {section.footer ? <p className={styles.updated}>{section.footer}</p> : null}
                </section>
              );
            })}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
