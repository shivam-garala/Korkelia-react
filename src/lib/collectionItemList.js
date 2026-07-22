// Server-side helper that rebuilds the same product subset a collection
// page's own client component shows, purely to feed an ItemList schema.org
// block. This is a separate, read-only fetch — it does not replace or touch
// the existing client-side fetch that renders the visible product grid.

const parsePriceValue = (value) => {
  const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : null;
};

const normalizeImage = (image, apiBaseUrl, siteBaseUrl) => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/")) return `${siteBaseUrl.replace(/\/$/, "")}${image}`;
  if (!apiBaseUrl) return image;
  return `${apiBaseUrl.replace(/\/$/, "")}/${String(image).replace(/^\//, "")}`;
};

const resolveProductName = (item, languageId) => {
  const design = item?.design ?? item?.design_variant ?? item?.designVariant ?? null;
  const translations = Array.isArray(design?.design_translations) ? design.design_translations : [];
  const matchingTranslation = translations.find(
    (translation) => String(translation?.language_id ?? "") === String(languageId)
  );
  return (
    matchingTranslation?.design_variant_name ??
    matchingTranslation?.product_name ??
    design?.design_translation?.design_variant_name ??
    design?.design_variant_name ??
    item?.product_name ??
    item?.name ??
    null
  );
};

const mapToSchemaProduct = (item, languageId, apiBaseUrl, siteBaseUrl) => {
  const id = item?.id ?? item?.product_id ?? null;
  if (!id) return null;
  const name = resolveProductName(item, languageId);
  const price = parsePriceValue(item?.total_price);
  if (!name || price == null) return null;
  return {
    id: String(id),
    name,
    price,
    image: normalizeImage(item?.image, apiBaseUrl, siteBaseUrl),
    url: `${siteBaseUrl.replace(/\/$/, "")}/product/${id}`,
  };
};

// Mirrors each collection page's own two-step logic: fetch that category's
// sub-categories, keep the ones matching this page's own keyword predicate
// (falling back to all of them if none match, same as every page already
// does), then fetch the category's products and keep only the ones in those
// sub-categories.
export async function fetchCollectionItemListProducts({
  apiBaseUrl,
  siteBaseUrl,
  categoryId,
  languageId = "2",
  matchesSubCategory,
  pickSubCategoryIds,
}) {
  if (!apiBaseUrl) return [];
  try {
    const subCatResponse = await fetch(
      `${apiBaseUrl}/api/subCategory/home-page?language_id=${encodeURIComponent(languageId)}&category_id=${encodeURIComponent(categoryId)}`,
      { cache: "no-store" }
    );
    if (!subCatResponse.ok) return [];
    const subCatJson = await subCatResponse.json();
    const subCatList = Array.isArray(subCatJson) ? subCatJson : subCatJson?.data ?? [];
    const mappedSubCats = subCatList
      .map((item) => {
        const id = item?.id ?? item?.sub_category_id ?? null;
        const label = item?.sub_category_name ?? item?.name ?? "";
        if (!id || !label) return null;
        return { value: String(id), label: String(label) };
      })
      .filter(Boolean);

    const filteredSubCats = mappedSubCats.filter((option) => matchesSubCategory(option.label));
    const finalOptions = filteredSubCats.length ? filteredSubCats : mappedSubCats;
    const selectedIds = new Set(
      pickSubCategoryIds ? pickSubCategoryIds(finalOptions) : finalOptions.map((option) => option.value)
    );

    const params = new URLSearchParams({
      language_id: String(languageId),
      category_id: String(categoryId),
      currency: "EU",
      currency_symbol: "€",
      prefer_white: "0",
    });
    const productsResponse = await fetch(`${apiBaseUrl}/api/product/listEcom?${params.toString()}`, {
      cache: "no-store",
    });
    if (!productsResponse.ok) return [];
    const productsJson = await productsResponse.json();
    const productsList = Array.isArray(productsJson) ? productsJson : productsJson?.data ?? [];

    return productsList
      .filter((item) => selectedIds.has(String(item?.sub_category_id ?? "")))
      .map((item) => mapToSchemaProduct(item, languageId, apiBaseUrl, siteBaseUrl))
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Mirrors the 3 "browse everything" collection pages (Lab-grown Diamonds,
// Bespoke Jewelry, Custom Jewelry Singapore): fetch every category, fetch
// that category's products, flatten, and deduplicate by product id keeping
// the first occurrence — identical to those pages' own client-side logic.
// There's no default sub-category narrowing on these pages (that only
// happens once a visitor picks a filter), so neither does this.
export async function fetchAllCategoriesItemListProducts({
  apiBaseUrl,
  siteBaseUrl,
  languageId = "1",
}) {
  if (!apiBaseUrl) return [];
  try {
    const categoriesResponse = await fetch(
      `${apiBaseUrl}/api/categoryMaster/home-page?language_id=${encodeURIComponent(languageId)}`,
      { cache: "no-store" }
    );
    if (!categoriesResponse.ok) return [];
    const categoriesJson = await categoriesResponse.json();
    const categoriesList = Array.isArray(categoriesJson) ? categoriesJson : categoriesJson?.data ?? [];
    const categoryIds = categoriesList.map((item) => item?.id).filter((id) => id != null);

    const perCategoryResults = await Promise.all(
      categoryIds.map(async (categoryId) => {
        try {
          const params = new URLSearchParams({
            language_id: String(languageId),
            category_id: String(categoryId),
            currency: "EU",
            currency_symbol: "€",
            prefer_white: "0",
          });
          const response = await fetch(`${apiBaseUrl}/api/product/listEcom?${params.toString()}`, {
            cache: "no-store",
          });
          if (!response.ok) return [];
          const json = await response.json();
          const list = Array.isArray(json) ? json : json?.data ?? [];
          return list.map((item) => mapToSchemaProduct(item, languageId, apiBaseUrl, siteBaseUrl)).filter(Boolean);
        } catch {
          return [];
        }
      })
    );

    const seen = new Set();
    const unique = [];
    perCategoryResults.flat().forEach((product) => {
      if (seen.has(product.id)) return;
      seen.add(product.id);
      unique.push(product);
    });
    return unique;
  } catch {
    return [];
  }
}

export function buildItemListJsonLd(products) {
  if (!products.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: product.url,
        image: product.image ?? undefined,
        offers: {
          "@type": "Offer",
          url: product.url,
          priceCurrency: "EUR",
          price: product.price,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}
