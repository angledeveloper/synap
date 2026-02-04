import { Metadata } from "next";

import { supportedLanguages } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const seoByLang: Record<
    string,
    { title: string; description: string; keywords: string }
  > = {
    en: {
      title: "Market Research Reports | SynapSEA",
      description:
        "Discover in-depth market research reports and industry analysis to guide smarter decisions, from trend forecasts to competitive intelligence.",
      keywords:
        "market research reports, industry analysis, market intelligence, competitive intelligence, business insights, trend forecasts, market sizing, sector reports, consumer insights, strategic planning, growth opportunities",
    },
    fr: {
      title: "Rapports d’études de marché | Synapsea",
      description:
        "Découvrez des rapports d’études de marché et des analyses sectorielles pour des décisions plus avisées, des tendances aux renseignements concurrentiels.",
      keywords:
        "rapports d’études de marché, analyse sectorielle, intelligence de marché, veille concurrentielle, insights business, prévisions de tendances, taille de marché, rapports sectoriels, insights consommateurs, planification stratégique, opportunités de croissance",
    },
    es: {
      title: "Informes de investigación de mercado | Synapsea",
      description:
        "Descubre informes de investigación de mercado y análisis sectoriales para tomar mejores decisiones, desde tendencias hasta inteligencia competitiva.",
      keywords:
        "informes de investigación de mercado, análisis sectorial, inteligencia de mercado, inteligencia competitiva, insights empresariales, previsiones de tendencias, dimensionamiento de mercado, informes sectoriales, insights de consumidores, planificación estratégica, oportunidades de crecimiento",
    },
    de: {
      title: "Marktforschungsberichte | Synapsea",
      description:
        "Entdecken Sie Marktforschungsberichte und Branchenanalysen für fundierte Entscheidungen – von Trendprognosen bis Wettbewerbsinformationen.",
      keywords:
        "Marktforschungsberichte, Branchenanalyse, Marktintelligenz, Wettbewerbsanalyse, Business Insights, Trendprognosen, Marktgröße, Branchenberichte, Kundeninsights, strategische Planung, Wachstumschancen",
    },
    ja: {
      title: "市場調査レポート | Synapsea",
      description:
        "市場調査レポートと業界分析で、トレンド予測から競合インテリジェンスまで、より的確な意思決定を支援します。",
      keywords:
        "市場調査レポート, 業界分析, 市場インテリジェンス, 競合インテリジェンス, ビジネスインサイト, トレンド予測, 市場規模, 業界レポート, 消費者インサイト, 戦略立案, 成長機会",
    },
    ko: {
      title: "시장 조사 보고서 | Synapsea",
      description:
        "시장 조사 보고서와 산업 분석으로 트렌드 예측부터 경쟁 정보까지 더 나은 의사결정을 지원합니다.",
      keywords:
        "시장 조사 보고서, 산업 분석, 시장 인텔리전스, 경쟁 인텔리전스, 비즈니스 인사이트, 트렌드 예측, 시장 규모, 산업 보고서, 소비자 인사이트, 전략 기획, 성장 기회",
    },
    zh: {
      title: "市场研究报告 | Synapsea",
      description:
        "通过市场研究报告和行业分析，从趋势预测到竞争情报，帮助做出更明智的决策。",
      keywords:
        "市场研究报告, 行业分析, 市场情报, 竞争情报, 商业洞察, 趋势预测, 市场规模, 行业报告, 消费者洞察, 战略规划, 增长机会",
    },
    ar: {
      title: "تقارير أبحاث السوق | Synapsea",
      description:
        "اكتشف تقارير أبحاث السوق والتحليلات القطاعية لاتخاذ قرارات أذكى، من توقعات الاتجاهات إلى الذكاء التنافسي.",
      keywords:
        "تقارير أبحاث السوق، تحليل القطاعات، ذكاء السوق، الذكاء التنافسي، رؤى الأعمال، توقعات الاتجاهات، حجم السوق، تقارير قطاعية، رؤى المستهلك، التخطيط الاستراتيجي، فرص النمو",
    },
  };

  const seo = seoByLang[lang] ?? seoByLang.en;

  const alternates: Record<string, string> = {};
  supportedLanguages.forEach((l) => {
    alternates[l.code] = l.code === "en" ? "/reports" : `/${l.code}/reports`;
  });
  alternates["x-default"] = "/reports";

  const canonical = lang === "en" ? "/reports" : `/${lang}/reports`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
