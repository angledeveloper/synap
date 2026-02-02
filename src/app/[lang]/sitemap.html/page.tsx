import Link from "next/link";
import { codeToId, getLocalizedPath, supportedLanguages } from "@/lib/utils";
import {
  getCategoryIdForLanguage,
  type Category as MappingCategory,
} from "@/lib/categoryMappings";

export const dynamic = "force-static";
export const revalidate = 3600;

type Category = MappingCategory & {
  category_reference_id?: string | number;
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
      Company?: Array<{ slug?: string; menu_name?: string }>;
      Legal?: Array<{ slug?: string; menu_name?: string }>;
    };
  };
};

const languageCodes = supportedLanguages.map((lang) => lang.code);

const sitemapCopy: Record<
  string,
  {
    kicker: string;
    heroTitle: string;
    heroSubtitle: string;
    mainPages: string;
    categories: string;
    categoriesSubtitle: string;
    categoriesEmpty: string;
    reports: string;
    viewAllReports: string;
    reportsEmpty: string;
  }
> = {
  en: {
    kicker: "Sitemap",
    heroTitle: "Browse Synapsea Global",
    heroSubtitle:
      "Find the main pages, report categories, and report detail pages in one place.",
    mainPages: "Main Pages",
    categories: "Categories",
    categoriesSubtitle: "Browse report collections by industry category.",
    categoriesEmpty: "Categories are unavailable right now.",
    reports: "Reports",
    viewAllReports: "View all reports",
    reportsEmpty: "Reports are unavailable right now.",
  },
  fr: {
    kicker: "Plan du site",
    heroTitle: "Parcourir Synapsea Global",
    heroSubtitle:
      "Retrouvez en un seul endroit les pages principales, les catégories de rapports et les pages de détails des rapports.",
    mainPages: "Pages principales",
    categories: "Catégories",
    categoriesSubtitle:
      "Consultez les collections de rapports par secteur d'activité.",
    categoriesEmpty: "Les catégories ne sont pas disponibles pour le moment.",
    reports: "Rapports",
    viewAllReports: "Voir tous les rapports",
    reportsEmpty: "Les rapports ne sont pas disponibles pour le moment.",
  },
  es: {
    kicker: "Mapa del sitio",
    heroTitle: "Explorar Synapsea Global",
    heroSubtitle:
      "Encuentre las páginas principales, categorías de informes y páginas de detalles de informes en un solo lugar.",
    mainPages: "Páginas principales",
    categories: "Categorías",
    categoriesSubtitle:
      "Explore colecciones de informes por categoría de industria.",
    categoriesEmpty:
      "Las categorías no están disponibles en este momento.",
    reports: "Informes",
    viewAllReports: "Ver todos los informes",
    reportsEmpty: "Los informes no están disponibles en este momento.",
  },
  de: {
    kicker: "Sitemap",
    heroTitle: "Durchsuchen Sie Synapsea Global",
    heroSubtitle:
      "Hauptseiten, Berichtskategorien und Berichtsdetailseiten finden Sie an einem Ort.",
    mainPages: "Hauptseiten",
    categories: "Kategorien",
    categoriesSubtitle:
      "Durchsuchen Sie Berichtssammlungen nach Branchenkategorie.",
    categoriesEmpty: "Kategorien sind momentan nicht verfügbar.",
    reports: "Berichte",
    viewAllReports: "Alle Berichte anzeigen",
    reportsEmpty: "Berichte sind momentan nicht verfügbar.",
  },
  ja: {
    kicker: "サイトマップ",
    heroTitle: "Synapsea Globalを閲覧する",
    heroSubtitle:
      "メイン ページ、レポート カテゴリ、レポートの詳細ページを 1 か所で見つけます。",
    mainPages: "メインページ",
    categories: "カテゴリー",
    categoriesSubtitle:
      "業界カテゴリ別にレポート コレクションを参照します。",
    categoriesEmpty: "カテゴリは現在利用できません。",
    reports: "レポート",
    viewAllReports: "すべてのレポートを表示",
    reportsEmpty: "現在レポートは利用できません。",
  },
  zh: {
    kicker: "网站地图",
    heroTitle: "浏览 Synapsea Global",
    heroSubtitle: "在一个地方查找主要页面、报告类别和报告详情页面。",
    mainPages: "主页",
    categories: "类别",
    categoriesSubtitle: "按行业类别浏览报告合集。",
    categoriesEmpty: "目前暂无分类选项。",
    reports: "报告",
    viewAllReports: "查看所有报告",
    reportsEmpty: "目前暂无报告可供查阅。",
  },
  ko: {
    kicker: "사이트맵",
    heroTitle: "Synapsea Global을 살펴보세요",
    heroSubtitle:
      "주요 페이지, 보고서 범주 및 보고서 상세 페이지를 한 곳에서 찾아보세요.",
    mainPages: "주요 페이지",
    categories: "카테고리",
    categoriesSubtitle: "산업 분야별 보고서 모음을 찾아보세요.",
    categoriesEmpty: "현재 카테고리를 이용할 수 없습니다.",
    reports: "보고서",
    viewAllReports: "모든 보고서 보기",
    reportsEmpty: "현재 보고서를 이용할 수 없습니다.",
  },
  ar: {
    kicker: "خريطة الموقع",
    heroTitle: "تصفح Synapsea Global",
    heroSubtitle:
      "اعثر على الصفحات الرئيسية وفئات التقارير وصفحات تفاصيل التقارير في مكان واحد.",
    mainPages: "الصفحات الرئيسية",
    categories: "فئات",
    categoriesSubtitle: "تصفح مجموعات التقارير حسب فئة الصناعة.",
    categoriesEmpty: "التصنيفات غير متاحة حاليًا.",
    reports: "التقارير",
    viewAllReports: "عرض جميع التقارير",
    reportsEmpty: "التقارير غير متوفرة حالياً.",
  },
};

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

function getStaticLabels(homepageData: HomePageData | null) {
  const companyLinks = homepageData?.footer?.menu?.Company || [];
  const legalLinks = homepageData?.footer?.menu?.Legal || [];
  const findCompanyLabel = (
    predicate: (slug: string) => boolean,
    fallback: string,
  ) => {
    const match = companyLinks.find((link: { slug?: string; menu_name?: string }) => {
      const slug = (link.slug || "").toLowerCase();
      return slug && predicate(slug);
    });
    return match?.menu_name || fallback;
  };
  const findLegalLabel = (
    predicate: (slug: string) => boolean,
    fallback: string,
  ) => {
    const match = legalLinks.find((link: { slug?: string; menu_name?: string }) => {
      const slug = (link.slug || "").toLowerCase();
      return slug && predicate(slug);
    });
    return match?.menu_name || fallback;
  };

  return {
    home: findCompanyLabel(
      (slug) => slug === "/" || slug === "" || slug.includes("home"),
      homepageData?.navbar?.home || "Home",
    ),
    about: findCompanyLabel(
      (slug) => slug.includes("about"),
      homepageData?.navbar?.item_one_name || "About",
    ),
    reports: homepageData?.navbar?.item_two || "Reports",
    contact: findCompanyLabel(
      (slug) => slug.includes("contact"),
      homepageData?.navbar?.button_text || "Contact",
    ),
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
  const copy = sitemapCopy[language] || sitemapCopy.en;

  const baseCategories = dedupeBaseCategories(
    allCategories.filter((category) => String(category.language_id) === "1"),
  );

  const mappedCategories = baseCategories.map((category) =>
    resolveCategoryForLanguage(category, languageId, allCategories),
  );

  return (
    <main className="min-h-screen bg-white pt-20 text-black">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase">
            {copy.kicker}
          </p>
          <h1
            className="mt-3 text-[36px] font-medium md:text-[52px]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] bg-clip-text text-transparent">
              {copy.heroTitle}
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-700">
            {copy.heroSubtitle}
          </p>
        </header>

        <div className="grid gap-12">
          <section aria-labelledby="sitemap-main">
            <h2
              id="sitemap-main"
              className="text-2xl font-semibold md:text-3xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              {copy.mainPages}
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
              {copy.categories}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {copy.categoriesSubtitle}
            </p>
            {mappedCategories.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                {copy.categoriesEmpty}
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
        </div>
      </div>
    </main>
  );
}
