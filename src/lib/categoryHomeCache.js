import axiosClient from "./axiosClient.js";

const requestCache = new Map();
const dataCache = new Map();

export const fetchCategoryHomePage = async (languageId) => {
  const key = String(languageId || "1");
  if (dataCache.has(key)) return dataCache.get(key);
  if (requestCache.has(key)) return requestCache.get(key);

  const request = axiosClient
    .get(`/api/categoryMaster/home-page?language_id=${encodeURIComponent(key)}`)
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

export const clearCategoryHomeCache = (languageId) => {
  if (languageId === undefined) {
    requestCache.clear();
    dataCache.clear();
    return;
  }
  const key = String(languageId || "1");
  requestCache.delete(key);
  dataCache.delete(key);
};
