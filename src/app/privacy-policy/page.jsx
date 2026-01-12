"use client";

import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import styles from "./page.module.css";

const contactEmail = "korkeila@korkeilahelsinki.fi";

const policyContent = {
  heading: "Privacy Policy",
  intro:
    'This Privacy Policy explains how Greenbridge Oy (brand: Korkeila Helsinki) ("we", "us") processes personal data when you visit our website, request an appointment, contact us, or interact with us in-store. Data controller: Greenbridge Oy (Business ID: 3548133-4).',
  sections: [
    {
      title: "1. Scope",
      body: ["This Privacy Policy applies to personal data processed:"],
      list: [
        "on our website (including appointment booking form);",
        "when you contact us by email, phone, WhatsApp, or other channels;",
        "in-store (where relevant for receipts, warranties, resizing and after-sales support); and",
        "in communications related to our services.",
      ],
      afterList: [
        "It does not cover third-party websites or platforms that may be linked from our site (e.g., Instagram). Their privacy practices apply when you use them.",
      ],
    },
    {
      title: "2. Categories of personal data we collect",
      body: [
        "We collect and process only the personal data that is necessary for the purposes described in this policy.",
      ],
      subsections: [
        {
          title: "A) Appointment booking (website form)",
          body: ["When you request an appointment via our website, we process:"],
          list: [
            "first name and last name;",
            "country;",
            "email address;",
            "phone number;",
            "selected date and time slot;",
            "your description of the jewellery item you are interested in;",
            "CAPTCHA / anti-bot verification data (technical verification).",
          ],
          afterList: [
            "Appointment request data handling: Appointment request details are stored in our database (MySQL) and are also sent to our email address for scheduling and customer service purposes.",
            "We do not request passwords or payment card details in the appointment form.",
          ],
        },
        {
          title: "B) Communications / customer support",
          body: ["If you contact us via email, phone or WhatsApp, we process:"],
          list: [
            "your contact details;",
            "the content of your message and our replies;",
            "basic metadata (date/time, channel); and",
            "any information you provide during the conversation.",
          ],
        },
        {
          title: "C) In-store sales and administration",
          body: ["If you purchase in-store or request after-sales service, we may process:"],
          list: [
            "basic customer details needed for receipts or invoices (where applicable);",
            "purchase details (item, date, price, VAT or receipt information);",
            "warranty, resizing, or service history; and",
            "communications related to the above.",
          ],
          afterList: [
            "Card payments: card payments are processed by our payment service provider and we do not store full card details. We may receive limited transaction-related information (e.g., payment confirmation, reference number) for accounting and reconciliation.",
          ],
        },
        {
          title: "D) Website technical data",
          body: ["When you visit the website, we may process:"],
          list: [
            "IP address, device identifiers (where applicable), browser type/version;",
            "operating system;",
            "time zone and language settings;",
            "pages viewed, date/time of access;",
            "logs relevant for security and troubleshooting.",
          ],
        },
        {
          title: "E) Cookies and similar technologies",
          body: [
            "Some cookies are necessary for site functionality and security (including storing cookie preference choices).",
            "At the time of this version, we do not use analytics or marketing cookies. If analytics or marketing cookies are enabled in the future, they will be used only with your consent and you will be able to manage choices through the cookie preferences tool. See our Cookie Policy for details and cookie lists.",
          ],
        },
      ],
    },
    {
      title: "3. Sensitive data",
      body: [
        "We do not request or require special categories of personal data (e.g., health data, biometric data, religious or political beliefs). Please do not submit such information via the appointment form or communications.",
        "If you nonetheless provide it, we will process it only to the extent necessary to handle your request, and may delete it where appropriate.",
      ],
    },
    {
      title: "4. Purposes of processing and legal bases",
      body: ["We process personal data for the following purposes and legal bases:"],
      subsections: [
        {
          title: "4.1 Appointments and enquiries",
          body: [
            "Manage bookings, respond to requests, communicate with you.",
            "Legal basis: Art. 6(1)(b) and/or Art. 6(1)(f).",
          ],
        },
        {
          title: "4.2 Customer service and after-sales support",
          body: [
            "Handle support, warranty or resizing, maintain service history.",
            "Legal basis: Art. 6(1)(b) and/or Art. 6(1)(f).",
          ],
        },
        {
          title: "4.3 Sales administration, accounting and taxes (in-store / later online)",
          body: [
            "Receipts or invoices, bookkeeping, VAT compliance, audits.",
            "Legal basis: Art. 6(1)(c) and/or Art. 6(1)(b).",
          ],
        },
        {
          title: "4.4 Website operation and security",
          body: [
            "Maintain functionality, prevent abuse or bots, detect and investigate suspicious activity, troubleshoot.",
            "Legal basis: Art. 6(1)(f).",
          ],
        },
        {
          title: "4.5 Analytics or marketing cookies (if enabled in the future)",
          body: [
            "Measure website usage and marketing performance (only if you consent).",
            "Legal basis: Art. 6(1)(a) (consent). You can withdraw via cookie preferences at any time.",
          ],
        },
        {
          title: "4.6 Legal claims and compliance",
          body: [
            "Handle disputes, chargebacks, fraud investigations, and to establish, exercise, or defend legal claims.",
            "Legal basis: Art. 6(1)(f) and, where applicable, Art. 6(1)(c).",
          ],
        },
      ],
      afterList: [
        "Where we rely on legitimate interests, we balance our interests against your rights and implement safeguards.",
      ],
    },
    {
      title: "5. Source of data",
      body: ["We obtain personal data:"],
      list: [
        "directly from you (forms, communications, in-store interactions);",
        "automatically through website technical logs and cookies; and",
        "from service providers (e.g., payment confirmations) where relevant for accounting and reconciliation.",
      ],
    },
    {
      title: "6. Recipients and sharing (processors / third parties)",
      body: [
        "We share personal data only where necessary and proportionate for the purposes above, including with:",
      ],
      list: [
        "website hosting, IT, or developers (including hosting and database administration, website maintenance, and appointment-form functionality);",
        "communications providers (email or telephony services);",
        "in-store payment provider: NETS (card processing);",
        "in-store sales system: Tehden (sales or receipts administration);",
        "professional advisers: accountants, auditors, legal advisers;",
        "authorities where required by law or lawful request;",
        "e-commerce providers: payment processors, logistics or couriers, returns service providers, customer support platforms.",
      ],
      afterList: [
        "Where vendors process personal data on our behalf, they do so under contractual obligations to:",
      ],
      secondaryList: [
        "process data only on our instructions,",
        "protect confidentiality and security, and",
        "implement appropriate technical or organisational measures.",
      ],
    },
    {
      title: "7. International data transfers",
      body: [
        "Some service providers (for example, WhatsApp or Meta and some IT or hosting tools) may process personal data outside the EEA. Where personal data is transferred outside the EEA, we ensure appropriate safeguards, such as:",
      ],
      list: [
        "EU Commission approved Standard Contractual Clauses (SCCs); and",
        "additional measures where necessary, depending on the provider and transfer context.",
      ],
    },
    {
      title: "8. Retention",
      body: [
        "We retain personal data only as long as necessary for the purposes described above, then delete or anonymise it unless legal obligations require longer retention.",
        "Typical retention periods:",
      ],
      list: [
        "appointment or enquiry data: up to 24 months from last interaction;",
        "customer support communications: as needed to manage service quality and resolve issues (typically aligned with appointment retention unless a warranty or claim requires longer);",
        "technical logs: up to 12 months, unless required longer for security investigations;",
        "accounting, receipts and statutory records: retained as required under Finnish law (e.g., bookkeeping or VAT retention periods).",
      ],
      afterList: [
        "If you request deletion, we will assess the request against legal obligations and our need to retain data for claims or defence.",
      ],
    },
    {
      title: "9. Security measures",
      body: ["We implement reasonable technical and organisational measures to protect personal data, which may include:"],
      list: [
        "access controls and role-based access;",
        "secure hosting and updates;",
        "encryption in transit (TLS) where applicable;",
        "monitoring and logging for security;",
        "vendor due diligence and contractual safeguards;",
        "data minimisation and staff confidentiality.",
      ],
    },
    {
      title: "10. Your rights (GDPR)",
      body: ["Depending on the circumstances, you may have the right to:"],
      list: [
        "access your personal data;",
        "rectify inaccurate data;",
        "erase data (right to be forgotten);",
        "restrict processing;",
        "object to processing based on legitimate interests (including direct marketing);",
        "data portability;",
        "withdraw consent at any time (where processing is based on consent), including cookie preferences.",
      ],
      afterList: [
        `To exercise rights, contact ${contactEmail}. We may need to verify your identity before fulfilling certain requests.`,
      ],
    },
    {
      title: "11. Complaints",
      body: [
        "If you believe we process your personal data unlawfully, you may contact us first so we can address it. You also have the right to lodge a complaint with the Finnish Data Protection Ombudsman (Tietosuojavaltuutetun toimisto).",
      ],
    },
    {
      title: "12. Changes to this policy",
      body: [
        'We may update this Privacy Policy as our website features evolve (e.g., enabling online payments, shipping, returns workflows, marketing). The updated version will be posted on the website with a revised "Last updated" date.',
      ],
    },
    {
      title: "13. Contact",
      body: [
        "Greenbridge Oy (Business ID: 3548133-4)",
        "Korkeavuorenkatu 6, 00150 Helsinki, Finland",
        "Phone: 0503270600",
      ],
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

export default function PrivacyPolicyPage() {
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
            {policyContent.sections.map((section) => (
              <section key={section.title} className={styles.section}>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
                {section.body ? renderParagraphs(section.body, styles.paragraph) : null}
                {section.list ? renderList(section.list) : null}
                {section.afterList ? renderParagraphs(section.afterList, styles.paragraph) : null}
                {section.secondaryList ? renderList(section.secondaryList) : null}
                {section.subsections ? (
                  <div className={styles.subsections}>
                    {section.subsections.map((subsection) => (
                      <div key={subsection.title} className={styles.subsection}>
                        <h4 className={styles.subTitle}>{subsection.title}</h4>
                        {subsection.body
                          ? renderParagraphs(subsection.body, styles.paragraph)
                          : null}
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
                    Email:{" "}
                    <a className={styles.contactLink} href={`mailto:${section.contactEmail}`}>
                      {section.contactEmail}
                    </a>
                  </p>
                ) : null}
                {section.footer ? <p className={styles.updated}>{section.footer}</p> : null}
              </section>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
