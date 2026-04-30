import axiosClient from "./axiosClient.js";

const requestCache = new Map();
const dataCache = new Map();

const buildKey = (
  prefix,
  languageId,
  categoryId,
  currencyCode,
  currencySymbol,
  preferWhite,
) =>
  `${prefix}:${String(languageId || "1")}:${String(categoryId || "")}:${String(
    currencyCode || "EU"
  )}:${preferWhite ? "1" : "0"}:${currencySymbol || ""}`;

const fetchCached = async (key, url) => {
  if (dataCache.has(key)) return dataCache.get(key);
  if (requestCache.has(key)) return requestCache.get(key);

  const request = axiosClient
    .get(url)
    .then(({ data }) => {
      const list = Array.isArray(data) ? data : data?.data ?? [];
      dataCache.set(key, list);
      requestCache.delete(key);
      return list;
    })
    .catch((error) => {
      requestCache.delete(key);
      throw error;
    });

  requestCache.set(key, request);
  return request;
};

export const fetchProductListEcom = async (
  languageId,
  categoryId,
  currencyCode,
  currencySymbol,
  preferWhite
) => {
  const key = buildKey(
    "products",
    languageId,
    categoryId,
    currencyCode,
    currencySymbol,
    preferWhite,
  );
  const params = new URLSearchParams({
    language_id: String(languageId || "1"),
    category_id: String(categoryId || ""),
    currency: String(currencyCode || "EU"),
    currency_symbol: String(currencySymbol || ""),
    prefer_white: preferWhite ? "1" : "0",
  });
  return fetchCached(key, `/api/product/listEcom?${params.toString()}`);
};

export const fetchSubCategoryHomePage = async (languageId, categoryId) => {
  const key = buildKey("subcategories", languageId, categoryId);
  const url = `/api/subCategory/home-page?language_id=${encodeURIComponent(
    languageId || "1"
  )}&category_id=${encodeURIComponent(categoryId || "")}`;
  return fetchCached(key, url);
};

export const clearProductListingCache = () => {
  requestCache.clear();
  dataCache.clear();
};
