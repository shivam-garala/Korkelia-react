import { Suspense } from "react";
import ProductListingClient from "./ProductListingClient.jsx";

export default function ProductListingPage() {
  return (
    <Suspense fallback={null}>
      <ProductListingClient />
    </Suspense>
  );
}
