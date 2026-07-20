import WeddingBandSingaporeCollectionClient  from "./weddingBandSingaporeCollectionClient";

export const metadata = {
  title:
    "Wedding Bands Singapore | Korkeila Helsinki",
  description:
    "Explore wedding bands crafted with precision and care. Elegant Nordic designs made for lasting love by Korkeila Helsinki.",
  alternates: {
    canonical: "/collections/Wedding-Band-Singapore",
  },
};

export default function WeddingBandSingaporePage() {
  return <WeddingBandSingaporeCollectionClient />;
}
