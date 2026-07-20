import ContactClient from "./ContactClient.jsx";

export const metadata = {
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
