"use client";

import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import Container from "../../components/ui/Container.jsx";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const contentByLanguage = {
  en: {
    heading: "CONTACT US",
    lead:
      "Whether you have a question about our jewellery, need help choosing the perfect piece or want to design something custom — we’d love to hear from you.",
    sections: {
      appointments: {
        title: "Personal Appointments",
        body: "For product inquiries or personal bespoke jewellery design sessions, our team will be happy to connect.",
        cta: "Please book an appointment",
      },
      visit: {
        title: "Visit Us",
        lines: ["We welcome you to our Boutique", "Korkeavuorenkatu 6, 00150 Helsinki"],
      },
      hours: {
        title: "Opening Hours",
        lines: ["Mon–Fri 11–18 EET", "Sat 10–15 EET"],
      },
      contact: {
        title: "Contact Details",
        phoneLabel: "Phone",
        phone: "+358 50 327 0600",
        whatsappLabel: "WhatsApp",
        whatsapp: "+358 50 327 0600",
        emailLabel: "Email",
        email: "korkeila@korkeilahelsinki.fi",
      },
      mapLink: "Open in Google Maps",
    },
  },
  fi: {
    heading: "OTA YHTEYTTÄ",
    lead:
      "Jos sinulla on kysyttävää koruistamme, tarvitset apua täydellisen korun valinnassa tai haluat suunnitella jotain täysin omaa — autamme mielellämme.",
    sections: {
      appointments: {
        title: "Henkilökohtaiset ajanvaraukset",
        body: "Tuotekysymyksiä tai yksilöllisiä korusuunnittelutapaamisia varten tiimimme palvelee sinua mielellään.",
        cta: "Varaa aika kalenteristamme",
      },
      visit: {
        title: "TULE KÄYMÄÄN",
        lines: ["Toivotamme sinut lämpimästi tervetulleeksi myymäläämme", "Korkeavuorenkatu 6, 00150 Helsinki"],
      },
      hours: {
        title: "AVOINNA",
        lines: ["Ma–pe 11–18", "La 10–15"],
      },
      contact: {
        title: "YHTEYSTIEDOT",
        phoneLabel: "Puhelin",
        phone: "+358 50 327 0600",
        whatsappLabel: "WhatsApp",
        whatsapp: "+358 50 327 0600",
        emailLabel: "Sposti",
        email: "korkeila@korkeilahelsinki.fi",
      },
      mapLink: "Avaa Google Mapsissa",
    },
  },
};

export default function ContactPage() {
  const { language } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const content = contentByLanguage[languageKey] ?? contentByLanguage.en;

  const phoneHref = "tel:+358503270600";
  const whatsappHref = "https://wa.me/358503270600";
  const emailHref = "mailto:korkeila@korkeilahelsinki.fi";

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h2 className={styles.heading}>{content.heading}</h2>
            <p className={styles.lead}>{content.lead}</p>
          </div>

          <div className={styles.content}>
            <div className={styles.info}>
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>{content.sections.appointments.title}</h3>
                <p className={styles.blockBody}>{content.sections.appointments.body}</p>
                <Link className={styles.cta} href="/appointment">
                  <span>{content.sections.appointments.cta}</span>
                </Link>
              </section>

              <section className={styles.block}>
                <h3 className={styles.blockTitle}>{content.sections.visit.title}</h3>
                {content.sections.visit.lines.map((line) => (
                  <p key={line} className={styles.blockBody}>
                    {line}
                  </p>
                ))}
              </section>

              <section className={styles.block}>
                <h3 className={styles.blockTitle}>{content.sections.hours.title}</h3>
                {content.sections.hours.lines.map((line) => (
                  <p key={line} className={styles.blockBody}>
                    {line}
                  </p>
                ))}
              </section>

              <section className={styles.block}>
                <h3 className={styles.blockTitle}>{content.sections.contact.title}</h3>
                <ul className={styles.contactList}>
                  <li className={styles.contactItem}>
                    <Image src="/icons/icon_phone_contact.png" alt="" width={16} height={16} />
                    <div className={styles.contactText}>
                      <span className={styles.contactLabel}>
                        {content.sections.contact.phoneLabel}:
                      </span>
                      <a className={styles.contactLink} href={phoneHref}>
                        {content.sections.contact.phone}
                      </a>
                    </div>
                  </li>
                  <li className={styles.contactItem}>
                    <Image src="/icons/icon_whatsapp_contact.png" alt="" width={16} height={16} />
                    <div className={styles.contactText}>
                      <span className={styles.contactLabel}>
                        {content.sections.contact.whatsappLabel}:
                      </span>
                      <a
                        className={styles.contactLink}
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {content.sections.contact.whatsapp}
                      </a>
                    </div>
                  </li>
                  <li className={styles.contactItem}>
                    <Image src="/icons/icon_email_contact.png" alt="" width={16} height={16} />
                    <div className={styles.contactText}>
                      <span className={styles.contactLabel}>
                        {content.sections.contact.emailLabel}:
                      </span>
                      <a className={styles.contactLink} href={emailHref}>
                        {content.sections.contact.email}
                      </a>
                    </div>
                  </li>
                </ul>
              </section>
            </div>

            <div className={styles.map}>
              <iframe
                className={styles.mapFrame}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2468.5883311446205!2d24.946343!3d60.1606973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46920bc81e95ce35%3A0xe295a664e0438378!2sKorkeila%20Helsinki%20Oy!5e1!3m2!1sen!2sin!4v1765612481650!5m2!1sen!2sin"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Korkeila Helsinki map"
              />
              {/* <a
                className={styles.mapLink}
                href="https://maps.app.goo.gl/oBCVEZcfPiPovWjq9"
                target="_blank"
                rel="noreferrer"
              >
                {content.sections.mapLink}
              </a> */}
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
