export const resolveApiBaseUrl = () =>
  (
    process.env.NEXT_BASE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    ""
  ).replace(/\/+$/, "");

export const parsePriceValue = (value) => {
  const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : Number.POSITIVE_INFINITY;
};

// Mirrors the design_id/metal_id/... query the collection pages already
// build for product links, since the product page's gallery needs the
// full variant to render (see ProductGrid hrefs / productListingCache.js).
export const buildVariantQuery = (item) => {
  const design = item?.design ?? item?.design_variant ?? item?.designVariant ?? null;
  const designId =
    design?.id ??
    item?.design_id ??
    item?.designId ??
    design?.design_variant_id ??
    item?.designVariantId ??
    "";
  const metalRate = design?.metal_rate ?? null;
  const primaryDetail = Array.isArray(design?.diamond_details) ? design.diamond_details[0] : null;
  const diamondRate = primaryDetail?.diamond_rate ?? null;

  const query = new URLSearchParams();
  if (designId) query.set("design_id", String(designId));
  if (metalRate?.metal_id) query.set("metal_id", String(metalRate.metal_id));
  if (metalRate?.karat_id) query.set("karat_id", String(metalRate.karat_id));
  if (diamondRate?.diamond_type_id) query.set("diamond_type_id", String(diamondRate.diamond_type_id));
  if (diamondRate?.clarity_id) query.set("clarity_id", String(diamondRate.clarity_id));
  const caratValue =
    diamondRate?.diamond_master?.carat ?? diamondRate?.diamond_master_id?.carat ?? null;
  if (caratValue !== null && caratValue !== undefined) query.set("carat", String(caratValue));
  if (primaryDetail?.cut_master_id) query.set("cut_id", String(primaryDetail.cut_master_id));
  return query;
};

// Given raw listEcom rows (any mix of products), returns a Map of
// productId -> the cheapest row for that product.
export const pickCheapestPerProduct = (rows) => {
  const cheapestById = new Map();
  rows.forEach((item) => {
    const id = item?.id ?? item?.product_id;
    if (!id) return;
    const key = String(id);
    const existing = cheapestById.get(key);
    if (!existing || parsePriceValue(item.total_price) < parsePriceValue(existing.total_price)) {
      cheapestById.set(key, item);
    }
  });
  return cheapestById;
};
