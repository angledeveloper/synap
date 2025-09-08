import { useMutation } from '@tanstack/react-query';
import { Filters, ReportsResponse } from '@/types/reports';

// Local type for dummy data
interface DummyReport {
  id: string;
  title_en: string;
  title_ja: string;
  summary_en: string;
  summary_ja: string;
  date: string;
  price: number;
  currency: string;
  category: string;
  language: string;
  region: string;
}

// Dummy data for development - replace with actual API call when ready
const generateDummyReports = (filters: Filters, lang: string = 'en'): Promise<ReportsResponse> => {
  const dummyReports: DummyReport[] = [
    {
      id: "1",
      title_en: "Asia-Pacific Technology Market Analysis 2025",
      title_ja: "アジア太平洋テクノロジー市場分析 2025",
      summary_en: "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch.",
      summary_ja: "アジアでフラッグシップデバイスを発売する際、クライアントは第2都市での価格の明確さを欠いていました。SYNAPSeaの消費者行動モデリングは未開拓の価格閾値を明らかにし、発売後最初の四半期で32％の収益増加をもたらしました。",
      date: "2025-06-12",
      price: 1000,
      currency: "USD",
      category: "Technology & Software",
      language: "English",
      region: "Asia Pacific",
    },
    {
      id: "2",
      title_en: "European Healthcare Digital Transformation",
      title_ja: "ヨーロッパのヘルスケアデジタルトランスフォーメーション",
      summary_en: "Comprehensive analysis of digital transformation trends in European healthcare sector, covering regulatory changes, technology adoption, and market opportunities across major European markets.",
      summary_ja: "ヨーロッパのヘルスケア分野におけるデジタルトランスフォーメーションの動向を包括的に分析し、規制の変化、技術導入、主要市場での機会をカバーします。",
      date: "2025-05-28",
      price: 1500,
      currency: "USD",
      category: "Healthcare",
      language: "English",
      region: "Europe",
    },
    {
      id: "3",
      title_en: "North American Fintech Innovation Report",
      title_ja: "北米フィンテックイノベーションレポート",
      summary_en: "Deep dive into fintech innovation across North America, examining emerging technologies, regulatory landscape, and investment patterns in the financial services sector.",
      summary_ja: "北米のフィンテックイノベーションの深いダイブを行い、新興技術、規制環境、および金融サービス分野での投資パターンを調査します。",
      date: "2025-05-15",
      price: 1200,
      currency: "USD",
      category: "Finance",
      language: "English",
      region: "North America",
    },
    {
      id: "4",
      title_en: "Manufacturing Industry 4.0 Trends",
      title_ja: "製造業4.0トレンド",
      summary_en: "Analysis of Industry 4.0 adoption in manufacturing, covering smart factory implementation, IoT integration, and automation trends across global manufacturing hubs.",
      summary_ja: "製造業4.0の導入を分析し、スマートファクトリーの実装、IoT統合、およびグローバル製造拠点での自動化トレンドをカバーします。",
      date: "2025-04-30",
      price: 1800,
      currency: "USD",
      category: "Manufacturing",
      language: "English",
      region: "Global",
    },
    {
      id: "5",
      title_en: "Retail E-commerce Growth Patterns",
      title_ja: "小売電子商取引成長パターン",
      summary_en: "Comprehensive study of e-commerce growth patterns in retail sector, examining consumer behavior shifts, platform strategies, and market penetration across different regions.",
      summary_ja: "小売業の電子商取引成長パターンを包括的に研究し、消費者行動の変化、プラットフォーム戦略、および異なる地域での市場浸透を調査します。",
      date: "2025-04-18",
      price: 900,
      currency: "USD",
      category: "Retail",
      language: "English",
      region: "Global",
    },
    {
      id: "6",
      title_en: "Latin America Technology Adoption",
      title_ja: "ラテンアメリカテクノロジー導入",
      summary_en: "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch.",
      summary_ja: "アジアでフラッグシップデバイスを発売する際、クライアントは第2都市での価格の明確さを欠いていました。SYNAPSeaの消費者行動モデリングは未開拓の価格閾値を明らかにし、発売後最初の四半期で32％の収益増加をもたらしました。",
      date: "2025-04-05",
      price: 1100,
      currency: "USD",
      category: "Technology & Software",
      language: "Spanish",
      region: "Latin America",
    },
    {
      id: "7",
      title_en: "Middle East Energy Sector Analysis",
      title_ja: "中東エネルギー部門分析",
      summary_en: "Detailed analysis of energy sector transformation in Middle East, covering renewable energy adoption, oil market dynamics, and regional energy policies.",
      summary_ja: "中東のエネルギー部門の変革を詳細に分析し、再生可能エネルギーの導入、石油市場の動向、および地域エネルギー政策をカバーします。",
      date: "2025-03-22",
      price: 1600,
      currency: "USD",
      category: "Energy",
      language: "English",
      region: "Middle East & Africa",
    },
    {
      id: "8",
      title_en: "Japanese Healthcare Technology Trends",
      title_ja: "日本のヘルスケアテクノロジートレンド",
      summary_en: "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch.",
      summary_ja: "アジアでフラッグシップデバイスを発売する際、クライアントは第2都市での価格の明確さを欠いていました。SYNAPSeaの消費者行動モデリングは未開拓の価格閾値を明らかにし、発売後最初の四半期で32％の収益増加をもたらしました。",
      date: "2025-03-10",
      price: 1300,
      currency: "USD",
      category: "Healthcare",
      language: "Japanese",
      region: "Asia Pacific",
    },
    {
      id: "9",
      title_en: "European Automotive Innovation",
      title_ja: "ヨーロッパの自動車イノベーション",
      summary_en: "Analysis of automotive innovation trends in Europe, covering electric vehicle adoption, autonomous driving technologies, and regulatory developments.",
      summary_ja: "ヨーロッパの自動車イノベーションの動向を分析し、電気自動車の導入、自律走行技術、および規制開発をカバーします。",
      date: "2025-02-28",
      price: 1400,
      currency: "USD",
      category: "Automotive",
      language: "English",
      region: "Europe",
    },
    {
      id: "10",
      title_en: "Global Supply Chain Resilience",
      title_ja: "グローバル供給連鎖の弾力性",
      summary_en: "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch.",
      summary_ja: "アジアでフラッグシップデバイスを発売する際、クライアントは第2都市での価格の明確さを欠いていました。SYNAPSeaの消費者行動モデリングは未開拓の価格閾値を明らかにし、発売後最初の四半期で32％の収益増加をもたらしました。",
      date: "2025-02-15",
      price: 1700,
      currency: "USD",
      category: "Logistics",
      language: "English",
      region: "Global",
    },
    {
      id: "11",
      title_en: "Chinese Market Entry Strategies",
      title_ja: "中国市場参入戦略",
      summary_en: "Comprehensive guide to market entry strategies for Chinese markets, covering regulatory requirements, cultural considerations, and business partnership opportunities.",
      summary_ja: "中国市場への参入戦略を包括的にガイドし、規制要件、文化上の考慮事項、およびビジネスパートナーシップの機会をカバーします。",
      date: "2025-02-01",
      price: 1900,
      currency: "USD",
      category: "Strategy",
      language: "Chinese",
      region: "Asia Pacific",
    },
    {
      id: "12",
      title_en: "African Fintech Landscape",
      title_ja: "アフリカフィンテックランドスケープ",
      summary_en: "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch.",
      summary_ja: "アジアでフラッグシップデバイスを発売する際、クライアントは第2都市での価格の明確さを欠いていました。SYNAPSeaの消費者行動モデリングは未開拓の価格閾値を明らかにし、発売後最初の四半期で32％の収益増加をもたらしました。",
      date: "2025-01-20",
      price: 1000,
      currency: "USD",
      category: "Finance",
      language: "English",
      region: "Middle East & Africa",
    },
  ];

  // Filter reports based on search and filters
  let filteredReports = dummyReports;

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredReports = filteredReports.filter(report =>
      report.title_en.toLowerCase().includes(searchLower) ||
      report.summary_en.toLowerCase().includes(searchLower) ||
      report.category.toLowerCase().includes(searchLower)
    );
  }

  // Apply category filter
  if (filters.category_id && filters.category_id !== "all") {
    const categoryMap: { [key: string]: string } = {
      "1": "Technology & Software",
      "2": "Healthcare",
      "3": "Finance",
      "4": "Manufacturing",
      "5": "Retail",
      "6": "Energy",
      "7": "Automotive",
      "8": "Logistics",
      "9": "Strategy",
    };
    const selectedCategory = categoryMap[filters.category_id];
    if (selectedCategory) {
      filteredReports = filteredReports.filter(report => report.category === selectedCategory);
    }
  }

  // Apply region filter
  if (filters.region && filters.region !== "all") {
    const regionMap: { [key: string]: string } = {
      "global": "Global",
      "north-america": "North America",
      "europe": "Europe",
      "asia-pacific": "Asia Pacific",
      "latin-america": "Latin America",
      "middle-east-africa": "Middle East & Africa",
    };
    const selectedRegion = regionMap[filters.region];
    if (selectedRegion) {
      filteredReports = filteredReports.filter(report => report.region === selectedRegion);
    }
  }

  // Apply year filter
  if (filters.year && filters.year !== "all") {
    filteredReports = filteredReports.filter(report => {
      const reportYear = new Date(report.date).getFullYear().toString();
      return reportYear === filters.year;
    });
  }

  // Calculate pagination
  const totalCount = filteredReports.length;
  const totalPages = Math.ceil(totalCount / filters.per_page);
  const startIndex = (filters.page - 1) * filters.per_page;
  const endIndex = startIndex + filters.per_page;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // When mapping to the returned reports, select the correct language fields and return only the shared Report fields:
  const mappedReports = paginatedReports.map(report => ({
    id: report.id,
    title: (report[`title_${lang}` as keyof DummyReport] as string) || report.title_en,
    summary: (report[`summary_${lang}` as keyof DummyReport] as string) || report.summary_en,
    date: report.date,
    price: report.price,
    currency: report.currency,
    category: report.category,
    language: report.language,
    region: report.region,
  }));

  // Simulate API delay
  return new Promise<ReportsResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        reports: mappedReports,
        totalPages,
        currentPage: filters.page,
        totalCount,
      });
    }, 500); // 500ms delay to simulate API call
  });
};

const fetchReports = async (filters: Filters): Promise<ReportsResponse> => {
  // Use language_id to determine lang code
  let lang = 'en';
  if (filters.language_id === '3') lang = 'ja';
  // TODO: Replace with actual API call when backend is ready
  // const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  
  // if (!baseUrl) {
  //   throw new Error('NEXT_PUBLIC_DB_URL is not defined');
  // }

  // // Create FormData as required by the API
  // const formData = new FormData();
  // formData.append('search', filters.search);
  // formData.append('category_id', filters.category_id);
  // formData.append('language_id', filters.language_id);
  // formData.append('region', filters.region);
  // formData.append('year', filters.year);
  // formData.append('page', filters.page.toString());
  // formData.append('per_page', filters.per_page.toString());

  // const response = await fetch(`${baseUrl}reports_page`, {
  //   method: 'POST',
  //   body: formData,
  // });

  // if (!response.ok) {
  //   const errorText = await response.text();
  //   throw new Error(`Failed to fetch reports: ${response.status} ${errorText}`);
  // }

  // const data = await response.json();
  // return data;

  // Using dummy data for now
  return generateDummyReports(filters, lang);
};

export const useReportsPage = () => {
  return useMutation<ReportsResponse, Error, Filters>({
    mutationFn: fetchReports,
    onError: (error) => {
      console.error('Reports fetch error:', error);
    },
  });
};
