import { Suspense } from "react";
import ProductListingClient from "./ProductListingClient.jsx";

export const metadata = {
  alternates: {
    canonical: "/product",
  },
};

export default function ProductListingPage() {
  return (
    <Suspense fallback={null}>
      <ProductListingClient />
    </Suspense>
  );
}
