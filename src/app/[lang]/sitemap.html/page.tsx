import Link from "next/link";
import {
  codeToId,
  getLocalizedPath,
  slugify,
  supportedLanguages,
} from "@/lib/utils";
import {
  getCategoryIdForLanguage,
  type Category as MappingCategory,
} from "@/lib/categoryMappings";

export const dynamic = "force-static";
export const revalidate = 3600;

const REPORT_PREVIEW_LIMIT = 100;

type Category = MappingCategory & {
  category_reference_id?: string | number;
};

type Report = {
  report_reference_id?: string | number;
  report_reference_title?: string;
  report_identity?: {
    report_reference_id?: string | number;
  };
  id?: string | number;
  title?: string;
};

type HomePageData = {
  navbar?: {
    item_one_name?: string;
    item_two?: string;
    button_text?: string;
    home?: string;
  };
  footer?: {
    menu?: {
      Legal?: Array<{ slug?: string; menu_name?: string }>;
    };
  };
};

const languageCodes = supportedLanguages.map((lang) => lang.code);

function getLanguageParam(rawLang?: string) {
  if (rawLang && languageCodes.includes(rawLang)) {
    return rawLang;
  }
  return "en";
}

function getLanguageId(language: string) {
  return codeToId[language as keyof typeof codeToId] || codeToId.en;
}

async function getHomepageData(
  languageId: string,
): Promise<HomePageData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return null;
    const res = await fetch(`${baseUrl}homepage/${languageId}`, {
      next: { revalidate: 3600 },
    });
    return (await res.json()) as HomePageData;
  } catch (error) {
    console.error("Error fetching homepage data for HTML sitemap:", error);
    return null;
  }
}

async function getAllCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return [];

    const results = await Promise.allSettled(
      supportedLanguages.map(async (lang) => {
        const languageId = getLanguageId(lang.code);
        const res = await fetch(`${baseUrl}homepage/${languageId}`, {
          next: { revalidate: 3600 },
        });
        const data = await res.json();
        return Array.isArray(data?.report_store_dropdown)
          ? (data.report_store_dropdown as Category[])
          : [];
      }),
    );

    const all: Category[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        all.push(...result.value);
      }
    });

    const unique = new Map<string, Category>();
    all.forEach((category) => {
      const languageId = String(category.language_id ?? "");
      const categoryId = String(category.category_id ?? "");
      if (!languageId || !categoryId) return;
      const key = `${languageId}-${categoryId}`;
      if (!unique.has(key)) {
        unique.set(key, category);
      }
    });

    return Array.from(unique.values());
  } catch (error) {
    console.error("Error fetching categories for HTML sitemap:", error);
    return [];
  }
}

function dedupeBaseCategories(categories: Category[]): Category[] {
  const unique = new Map<string, Category>();
  categories.forEach((category) => {
    const refId = category.category_reference_id ?? category.category_id;
    if (!refId) return;
    const key = String(refId);
    if (!unique.has(key)) {
      unique.set(key, category);
    }
  });
  return Array.from(unique.values());
}

function resolveCategoryForLanguage(
  category: Category,
  targetLanguageId: string,
  allCategories: Category[],
) {
  const referenceId = category.category_reference_id ?? category.category_id;
  const byReference = allCategories.find(
    (item) =>
      String(item.language_id) === String(targetLanguageId) &&
      String(item.category_reference_id ?? item.category_id) ===
        String(referenceId),
  );
  if (byReference) return byReference;

  const mappedId = getCategoryIdForLanguage(
    category.category_id,
    category.language_id,
    targetLanguageId,
    allCategories,
  );
  const byMappedId = allCategories.find(
    (item) =>
      String(item.language_id) === String(targetLanguageId) &&
      String(item.category_id) === String(mappedId),
  );

  return byMappedId || category;
}

async function getReportsPreview(
  limit: number,
  languageId: string,
  categoryRefs: Array<string | number>,
) {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  if (!baseUrl) {
    return { reports: [] as Report[], isTruncated: false };
  }

  const uniqueReports = new Map<string, Report>();
  const MAX_PAGES = 50;

  for (const catId of categoryRefs) {
    if (!catId) continue;

    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      try {
        const formData = new FormData();
        formData.append("language_id", String(languageId));
        formData.append("page", page.toString());
        formData.append("per_page", perPage.toString());
        formData.append("category_reference_id", String(catId));

        const response = await fetch(`${baseUrl}reports_store_page`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) break;

        const data = await response.json();

        let pageReports: Report[] = [];
        if (Array.isArray(data)) pageReports = data;
        else if (data.reports) pageReports = data.reports;
        else if (data.data && Array.isArray(data.data)) pageReports = data.data;

        if (!pageReports || pageReports.length === 0) {
          hasMore = false;
          continue;
        }

        pageReports.forEach((report) => {
          const refId =
            report.report_reference_id ??
            report.report_identity?.report_reference_id ??
            report.id;
          if (!refId) return;
          const key = String(refId);
          if (!uniqueReports.has(key)) {
            uniqueReports.set(key, report);
          }
        });

        if (uniqueReports.size >= limit) {
          return {
            reports: Array.from(uniqueReports.values()).slice(0, limit),
            isTruncated: true,
          };
        }

        const totalPages = data.totalPages || 0;
        if (page >= totalPages || totalPages === 0) {
          hasMore = false;
        } else {
          page += 1;
        }
      } catch (error) {
        console.error(`Error fetching reports for category ${catId}:`, error);
        hasMore = false;
      }
    }
  }

  return { reports: Array.from(uniqueReports.values()), isTruncated: false };
}

function buildReportSlug(report: Report, languageId: string) {
  const isEnglish = String(languageId) === "1";
  const titleForSlug =
    !isEnglish && report.report_reference_title
      ? report.report_reference_title
      : report.title || report.report_reference_title || "report";
  const fallbackId =
    report.report_reference_id ??
    report.report_identity?.report_reference_id ??
    report.id ??
    "0";
  const idForSlug =
    !isEnglish && report.report_identity?.report_reference_id
      ? report.report_identity.report_reference_id
      : fallbackId;
  return slugify(titleForSlug, idForSlug);
}

function getStaticLabels(homepageData: HomePageData | null) {
  const legalLinks = homepageData?.footer?.menu?.Legal || [];
  const findLegalLabel = (
    predicate: (slug: string) => boolean,
    fallback: string,
  ) => {
    const match = legalLinks.find((link) => {
      const slug = (link.slug || "").toLowerCase();
      return slug && predicate(slug);
    });
    return match?.menu_name || fallback;
  };

  return {
    home: homepageData?.navbar?.home || "Home",
    about: homepageData?.navbar?.item_one_name || "About",
    reports: homepageData?.navbar?.item_two || "Reports",
    contact: homepageData?.navbar?.button_text || "Contact",
    privacy: findLegalLabel((slug) => slug.includes("privacy"), "Privacy"),
    terms: findLegalLabel((slug) => slug.includes("terms"), "Terms"),
    sitemap: findLegalLabel((slug) => slug.includes("sitemap"), "Sitemap"),
  };
}

export default async function SitemapHtmlPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) || ({} as { lang?: string });
  const language = getLanguageParam(lang);
  const languageId = getLanguageId(language);

  const [homepageData, allCategories] = await Promise.all([
    getHomepageData(languageId),
    getAllCategories(),
  ]);

  const labels = getStaticLabels(homepageData);

  const baseCategories = dedupeBaseCategories(
    allCategories.filter((category) => String(category.language_id) === "1"),
  );

  const mappedCategories = baseCategories.map((category) =>
    resolveCategoryForLanguage(category, languageId, allCategories),
  );

  const categoryReferences = baseCategories
    .map((category) => category.category_reference_id ?? category.category_id)
    .filter(Boolean);

  const { reports, isTruncated } = await getReportsPreview(
    REPORT_PREVIEW_LIMIT,
    languageId,
    categoryReferences,
  );

  return (
    <main className="min-h-screen bg-white pt-20 text-black">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase">
            Sitemap
          </p>
          <h1
            className="mt-3 text-[36px] font-medium md:text-[52px]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] bg-clip-text text-transparent">
              Browse Synapsea Global
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-700">
            Find the main pages, report categories, and report detail pages in
            one place.
          </p>
        </header>

        <div className="grid gap-12">
          <section aria-labelledby="sitemap-main">
            <h2
              id="sitemap-main"
              className="text-2xl font-semibold md:text-3xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Main Pages
            </h2>
            <ul className="mt-4 grid gap-2 text-[16px] text-gray-800 sm:grid-cols-2 lg:grid-cols-3">
              <li className="leading-relaxed">
                <Link
                  href={getLocalizedPath("/", language)}
                  className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                >
                  {labels.home}
                </Link>
              </li>
              <li className="leading-relaxed">
                <Link
                  href={getLocalizedPath("/about", language)}
                  className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                >
                  {labels.about}
                </Link>
              </li>
              <li className="leading-relaxed">
                <Link
                  href={getLocalizedPath("/contact", language)}
                  className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                >
                  {labels.contact}
                </Link>
              </li>
              <li className="leading-relaxed">
                <Link
                  href={getLocalizedPath("/privacy", language)}
                  className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                >
                  {labels.privacy}
                </Link>
              </li>
              <li className="leading-relaxed">
                <Link
                  href={getLocalizedPath("/terms-of-service", language)}
                  className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                >
                  {labels.terms}
                </Link>
              </li>
              <li className="leading-relaxed">
                <Link
                  href={getLocalizedPath("/sitemap.html", language)}
                  className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                >
                  {labels.sitemap}
                </Link>
              </li>
              <li className="leading-relaxed">
                <Link
                  href={getLocalizedPath("/reports", language)}
                  className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                >
                  {labels.reports}
                </Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="sitemap-categories">
            <h2
              id="sitemap-categories"
              className="text-2xl font-semibold md:text-3xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Categories
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Browse report collections by industry category.
            </p>
            {mappedCategories.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Categories are unavailable right now.
              </p>
            ) : (
              <ul className="mt-4 grid gap-2 text-[16px] text-gray-800 sm:grid-cols-2 lg:grid-cols-3">
                {mappedCategories.map((category) => {
                  const label = category.category_name || "Category";
                  const categoryId =
                    category.category_id ??
                    category.category_reference_id ??
                    "1";
                  return (
                    <li
                      key={`${category.language_id}-${categoryId}`}
                      className="leading-relaxed"
                    >
                      <Link
                        href={getLocalizedPath(
                          `/reports?category=${categoryId}`,
                          language,
                        )}
                        className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="sitemap-reports">
            <h2
              id="sitemap-reports"
              className="text-2xl font-semibold md:text-3xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Reports
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isTruncated
                ? `Showing the first ${REPORT_PREVIEW_LIMIT} reports.`
                : "Explore the latest report detail pages."}{" "}
              <Link
                href={getLocalizedPath("/reports", language)}
                className="font-medium text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
              >
                View all reports
              </Link>
              .
            </p>
            {reports.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Reports are unavailable right now.
              </p>
            ) : (
              <ul className="mt-4 grid gap-2 text-[16px] text-gray-800 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => {
                  const slug = buildReportSlug(report, languageId);
                  const label =
                    report.title || report.report_reference_title || "Report";
                  return (
                    <li key={slug} className="leading-relaxed">
                      <Link
                        href={getLocalizedPath(`/reports/${slug}`, language)}
                        className="text-[#0B4BAF] underline-offset-4 transition hover:text-[#0B3B86] hover:underline"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
