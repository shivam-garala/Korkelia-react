import { cache } from "react";
import { cookies, headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import Container from "../../../components/ui/Container.jsx";
import ProductCustomizer from "../../../components/Product/ProductCustomizer.jsx";
import ProductGallery from "../../../components/Product/ProductGallery.jsx";
import ShareProductModal from "../../../components/Product/ShareProductModal.jsx";
import RelatedProducts from "./RelatedProducts.jsx";
import styles from "./page.module.css";
import {
  buildVariantQuery,
  parsePriceValue,
  pickCheapestPerProduct,
  resolveApiBaseUrl,
} from "../../../lib/productDefaultVariant.js";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";

// Always https — see robots.js for why the x-forwarded-proto header isn't trusted.
const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
};

// Mirrors the collection pages' own image-URL normalization (see e.g.
// KihlasormusCollectionClient.jsx), but always returns an absolute URL since
// schema.org markup (unlike a browser <img src>) requires one. A "/"-prefixed
// path is a site-local asset (public folder); anything else is API-hosted.
const normalizeImage = (image, apiBaseUrl, siteBaseUrl) => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/")) return `${siteBaseUrl.replace(/\/$/, "")}${image}`;
  if (!apiBaseUrl) return image;
  return `${apiBaseUrl.replace(/\/$/, "")}/${String(image).replace(/^\//, "")}`;
};

const RING_CATEGORY_ID = 1;

const FOOTER_BRAND_DESCRIPTION = {
  en: "Korkeila Helsinki is your premier jewelry advisor, specializing in bespoke engagement rings, wedding bands, and fine jewelry, including pendants, necklaces, earrings, and bracelets. We offer a curated, immediately available selection of natural and premium lab-grown diamonds. Every piece is engineered with precision prong symmetry, from flawlessly flush-fitting ring pairings to elegantly balanced pendants. Whether you are looking for custom bespoke jewelry, rare Hamilton and Champagne yellow gold, or require a short-notice purchase, our Helsinki boutique delivers world-class craftsmanship with transparent value for money.",
  fi: "Korkeila Helsinki on ensiluokkainen koruasiantuntijasi, joka on erikoistunut kihla- ja vihkisormuksiin sekä hienokoruihin, kuten riipuksiin, kaulakoruihin, korvakoruihin ja rannekoruihin. Tarjoamme huolella valikoidun, heti saatavilla olevan valikoiman luonnon- ja huippuluokan laboratoriotimantteja. Jokainen korumme on teknisesti huippuunsa hiottu: kynsien tarkka symmetria takaa täydellisyyden niin saumattomasti istuvissa sormuksissa kuin kauniisti tasapainotetuissa riipuksissakin. Etsitpä sitten yksilöllistä tilaustyötä, harvinaista Hamilton- tai samppanjakultaa, tai tarvitset korun lyhyellä varoitusajalla, Helsingin myymälämme tarjoaa maailmanluokan käsityötaitoa ja läpinäkyvää hinta-laatusuhdetta.",
};

const RING_FOOTER_BRAND_DESCRIPTION = {
  en: "Explore our extensive collection of engagement and wedding rings, designed with technical perfection and Finnish heritage. Our advisor approach ensures you find the optimal balance of style, fit, and budget. We specialize in seamless, flush-fit ring pairings—whether you prefer a secure, low-profile diamond setting for an active lifestyle or a high-profile setting for maximum brilliance. Choose from ethically sourced natural diamonds or exceptional lab-grown diamonds, meticulously set in Platinum 950, 14K, 18K, Hamilton, or Champagne yellow gold. To guarantee your peace of mind, we offer a 6-month free resizing service and a flexible post-proposal exchange policy.",
  fi: "Tutustu laajaan kihla- ja vihkisormusten valikoimaamme, jossa yhdistyvät tekninen täydellisyys ja suomalainen perinne. Asiantuntijavetoinen lähestymistapamme varmistaa, että löydät optimaalisen tasapainon tyylin, istuvuuden ja budjetin välillä. Olemme erikoistuneet sormuksiin, jotka istuvat täydellisen saumattomasti yhteen – suositpa sitten aktiiviseen arkeen sopivaa matalaa istutusta tai maksimaalista säihkettä tuovaa korkeaa istutusta. Valitse eettisesti tuotettu luonnontimantti tai poikkeuksellinen laboratoriotimantti, joka istutetaan tarkasti platina 950:een, 14K tai 18K kultaan, tai uniikkiin Hamilton- tai samppanjakultaan. Mielenrauhasi takaamiseksi tarjoamme ilmaisen koonmuutoksen 6 kuukauden ajan sekä joustavan vaihto-oikeuden kosinnan jälkeen.",
};

const normalizeLanguage = (value) => {
  const normalized = String(value ?? "").toLowerCase();
  return normalized === "fi" ? "fi" : "en";
};

const resolveLanguage = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const headerLanguage = headerStore.get("x-site-lang");
  const cookieLanguage = cookieStore.get("siteLang")?.value;
  return normalizeLanguage(headerLanguage || cookieLanguage);
};

// Isolated, read-only lookup solely to decide footer copy — kept separate from
// ProductCustomizer's own data fetching so pricing/customizer logic is untouched.
const resolveIsRingProduct = async (id) => {
  if (!id) return true;
  try {
    const baseUrl = resolveApiBaseUrl();
    if (!baseUrl) return true;

    const response = await fetch(`${baseUrl}/api/product/category/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!response.ok) return true;

    const json = await response.json();
    const categoryId = json?.data?.category_id ?? null;
    if (categoryId == null) return true;

    return Number(categoryId) === RING_CATEGORY_ID;
  } catch {
    return true;
  }
};

// Resolves the cheapest variant for a product — its redirect path, plus the
// name/image/price used for the schema.org Product markup below, so both the
// canonical tag, the no-variant-specified redirect, and the structured data
// all describe the same representative variant. Wrapped in React's cache()
// so generateMetadata and the page component share one lookup per request
// instead of fetching twice.
const resolveCheapestVariant = cache(async (id) => {
  if (!id) return null;
  try {
    const baseUrl = resolveApiBaseUrl();
    if (!baseUrl) return null;
    const siteBaseUrl = await resolveBaseUrl();

    const categoryResponse = await fetch(
      `${baseUrl}/api/product/category/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );
    if (!categoryResponse.ok) return null;
    const categoryJson = await categoryResponse.json();
    const categoryId = categoryJson?.data?.category_id;
    if (categoryId == null) return null;

    const params = new URLSearchParams({
      language_id: "1",
      category_id: String(categoryId),
      currency: "EU",
      currency_symbol: "€",
      prefer_white: "0",
    });
    const listResponse = await fetch(
      `${baseUrl}/api/product/listEcom?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!listResponse.ok) return null;
    const listJson = await listResponse.json();
    const list = Array.isArray(listJson) ? listJson : listJson?.data ?? [];
    const matching = list.filter((item) => String(item?.id ?? item?.product_id) === String(id));
    if (!matching.length) return null;

    const cheapest = pickCheapestPerProduct(matching).get(String(id));
    if (!cheapest) return null;

    const queryString = buildVariantQuery(cheapest).toString();
    const path = queryString ? `/product/${encodeURIComponent(id)}?${queryString}` : null;
    const name =
      cheapest?.design?.design_translation?.design_variant_name ??
      cheapest?.design?.design_variant_name ??
      cheapest?.product_name ??
      cheapest?.name ??
      null;
    const price = parsePriceValue(cheapest?.total_price);

    return {
      path,
      name,
      image: normalizeImage(cheapest?.image, baseUrl, siteBaseUrl),
      price: Number.isFinite(price) ? price : null,
    };
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams ?? {};
  // Points at the plain product URL, which permanently redirects to the
  // cheapest variant (see the redirect below) — this stays stable even if
  // the cheapest variant changes later, unlike pointing at a specific one.
  return {
    alternates: {
      canonical: `/product/${encodeURIComponent(id ?? "")}`,
    },
  };
}

export default async function ProductDetailsPage({ params, searchParams }) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const { id } = resolvedParams ?? {};

  const readSearchParam = (source, key) => {
    if (!source) return "";
    if (typeof source.get === "function") {
      return source.get(key) ?? "";
    }
    const value = source[key];
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
  };

  const defaultMetalId = readSearchParam(resolvedSearchParams, "metal_id");
  const defaultKaratId = readSearchParam(resolvedSearchParams, "karat_id");
  const defaultDiamondTypeId = readSearchParam(resolvedSearchParams, "diamond_type_id");
  const defaultClarityId = readSearchParam(resolvedSearchParams, "clarity_id");
  const defaultCarat = readSearchParam(resolvedSearchParams, "carat");
  const defaultCutId = readSearchParam(resolvedSearchParams, "cut_id");
  const designId = readSearchParam(resolvedSearchParams, "design_id");

  if (!designId) {
    const cheapestVariant = await resolveCheapestVariant(id);
    if (cheapestVariant?.path) {
      permanentRedirect(cheapestVariant.path);
    }
  }

  const [language, isRingProduct, variant, siteBaseUrl] = await Promise.all([
    resolveLanguage(),
    resolveIsRingProduct(id),
    resolveCheapestVariant(id),
    resolveBaseUrl(),
  ]);
  const footerBrandDescription = isRingProduct
    ? RING_FOOTER_BRAND_DESCRIPTION[language]
    : FOOTER_BRAND_DESCRIPTION[language];

  const canonicalUrl = `${siteBaseUrl.replace(/\/$/, "")}/product/${encodeURIComponent(id ?? "")}`;
  const productJsonLd =
    variant?.name && variant?.price != null
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: variant.name,
          image: variant.image ? [variant.image] : undefined,
          url: canonicalUrl,
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "EUR",
            price: variant.price,
            availability: "https://schema.org/InStock",
          },
        }
      : null;

  return (
    <div className={styles.page}>
      {productJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      ) : null}
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topRow}>
            <ShareProductModal buttonClassName={styles.shareBtn} />
          </div>
          <div className={styles.topLine} aria-hidden />

          {/* <div className={styles.layoutContainer}> */}
            <div className={styles.layout}>
              <div className={styles.gallery}>
                <ProductGallery
                  productId={id ?? ""}
                  designId={designId ?? ""}
                />
              </div>

              <div className={styles.customizer}>
                <ProductCustomizer
                  // title={`PRODUCT NAME ${id ? `#${id}` : ""}`}
                  title={`...`}
                  productId={id ?? ""}
                  designId={designId ?? ""}
                  defaultMetalId={defaultMetalId}
                  defaultKaratId={defaultKaratId}
                  defaultDiamondTypeId={defaultDiamondTypeId}
                  defaultClarityId={defaultClarityId}
                  defaultCarat={defaultCarat}
                  defaultCutId={defaultCutId}
                />
              </div>
            </div>
          {/* </div> */}

          <RelatedProducts productId={id ?? ""} designId={designId} />
        </Container>
      </main>
      <SiteFooter brandDescription={footerBrandDescription} />
    </div>
  );
}
