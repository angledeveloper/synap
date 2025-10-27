import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";

interface Translations {
  [key: string]: any;
}

interface UseTranslationsParams {
  language: string;
  page: string; // 'home', 'reports', 'about', 'privacy', etc.
}

export function useTranslations({ language, page }: UseTranslationsParams) {
  const languageId = codeToId[language as keyof typeof codeToId] || 1;
  
  return useQuery({
    queryKey: ["translations", languageId, page],
    queryFn: async (): Promise<Translations> => {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_DB_URL is not defined");
      }

      try {
        // Try to fetch translations from API
        const response = await fetch(`${baseUrl}translations/${page}?language_id=${languageId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.translations || data;
        }
      } catch (error) {
        console.warn(`Translations endpoint for ${page} not available, using fallback data`);
      }

      // Fallback translations if API endpoint is not available
      const fallbackTranslations: { [key: string]: Translations } = {
        reports: {
          en: {
            breadcrumbHome: "Home",
            breadcrumbCategory: "Technology & Software",
            heading: "Technology & Software",
            description: "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch.",
            searchPlaceholder: "Search By Title",
            filters: {
              industry: "INDUSTRY",
              region: "REGION",
              year: "YEAR",
            },
            clearFilters: "Clear Filters",
            viewReport: "View Report",
            pagination: {
              previous: "Previous",
              next: "Next",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "No reports found",
            noReportsDescription: "Try adjusting your search criteria or filters.",
          },
          fr: {
            breadcrumbHome: "Accueil",
            breadcrumbCategory: "Technologie et Logiciels",
            heading: "Technologie et Logiciels",
            description: "Lors de la préparation du lancement d'un appareil phare en Asie, le client manquait de clarté sur les prix dans les villes de deuxième niveau. La modélisation du comportement des consommateurs de SYNAPSea a révélé des seuils de prix inexploités, entraînant une augmentation de 32% des revenus au premier trimestre après le lancement.",
            searchPlaceholder: "Rechercher par titre",
            filters: {
              industry: "INDUSTRIE",
              region: "RÉGION",
              year: "ANNÉE",
            },
            clearFilters: "Effacer les filtres",
            viewReport: "Voir le rapport",
            pagination: {
              previous: "Précédent",
              next: "Suivant",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "Aucun rapport trouvé",
            noReportsDescription: "Essayez d'ajuster vos critères de recherche ou vos filtres.",
          },
          es: {
            breadcrumbHome: "Inicio",
            breadcrumbCategory: "Tecnología y Software",
            heading: "Tecnología y Software",
            description: "Al preparar el lanzamiento de un dispositivo insignia en Asia, el cliente carecía de claridad de precios en las ciudades de segundo nivel. El modelado del comportamiento del consumidor de SYNAPSea reveló umbrales de precios sin explotar, impulsando un aumento del 32% en los ingresos en el primer trimestre posterior al lanzamiento.",
            searchPlaceholder: "Buscar por título",
            filters: {
              industry: "INDUSTRIA",
              region: "REGIÓN",
              year: "AÑO",
            },
            clearFilters: "Limpiar filtros",
            viewReport: "Ver informe",
            pagination: {
              previous: "Anterior",
              next: "Siguiente",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "No se encontraron informes",
            noReportsDescription: "Intenta ajustar tus criterios de búsqueda o filtros.",
          },
          de: {
            breadcrumbHome: "Startseite",
            breadcrumbCategory: "Technologie & Software",
            heading: "Technologie & Software",
            description: "Bei der Vorbereitung des Starts eines Flaggschiff-Geräts in Asien fehlte dem Kunden die Preisklarheit in Städten der zweiten Ebene. SYNAPSeas Verbraucherverhaltensmodellierung deckte ungenutzte Preisschwellen auf und führte zu einem Umsatzanstieg von 32% im ersten Quartal nach dem Start.",
            searchPlaceholder: "Nach Titel suchen",
            filters: {
              industry: "BRANCHE",
              region: "REGION",
              year: "JAHR",
            },
            clearFilters: "Filter löschen",
            viewReport: "Bericht anzeigen",
            pagination: {
              previous: "Zurück",
              next: "Weiter",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "Keine Berichte gefunden",
            noReportsDescription: "Versuchen Sie, Ihre Suchkriterien oder Filter anzupassen.",
          },
          ja: {
            breadcrumbHome: "ホーム",
            breadcrumbCategory: "テクノロジー＆ソフトウェア",
            heading: "テクノロジー＆ソフトウェア",
            description: "アジアでフラッグシップデバイスを発売する際、クライアントは第2都市での価格の明確さを欠いていました。SYNAPSeaの消費者行動モデリングは未開拓の価格閾値を明らかにし、発売後最初の四半期で32％の収益増加をもたらしました。",
            searchPlaceholder: "タイトルで検索",
            filters: {
              industry: "業界",
              region: "地域",
              year: "年",
            },
            clearFilters: "フィルターをクリア",
            viewReport: "レポートを見る",
            pagination: {
              previous: "前へ",
              next: "次へ",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "レポートが見つかりません",
            noReportsDescription: "検索条件やフィルターを調整してみてください。",
          },
          zh: {
            breadcrumbHome: "首页",
            breadcrumbCategory: "技术与软件",
            heading: "技术与软件",
            description: "在准备在亚洲推出旗舰设备时，客户在二线城市缺乏价格透明度。SYNAPSea的消费者行为建模揭示了未开发的价格阈值，在发布后第一季度推动了32%的收入增长。",
            searchPlaceholder: "按标题搜索",
            filters: {
              industry: "行业",
              region: "地区",
              year: "年份",
            },
            clearFilters: "清除筛选",
            viewReport: "查看报告",
            pagination: {
              previous: "上一页",
              next: "下一页",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "未找到报告",
            noReportsDescription: "请尝试调整您的搜索条件或筛选器。",
          },
          ko: {
            breadcrumbHome: "홈",
            breadcrumbCategory: "기술 및 소프트웨어",
            heading: "기술 및 소프트웨어",
            description: "아시아에서 플래그십 기기를 출시할 준비를 할 때, 클라이언트는 2차 도시에서 가격 명확성이 부족했습니다. SYNAPSea의 소비자 행동 모델링은 미개척 가격 임계값을 밝혀내어 출시 후 첫 분기에 32%의 수익 증가를 이끌었습니다.",
            searchPlaceholder: "제목으로 검색",
            filters: {
              industry: "산업",
              region: "지역",
              year: "연도",
            },
            clearFilters: "필터 지우기",
            viewReport: "보고서 보기",
            pagination: {
              previous: "이전",
              next: "다음",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "보고서를 찾을 수 없습니다",
            noReportsDescription: "검색 조건이나 필터를 조정해 보세요.",
          },
          ar: {
            breadcrumbHome: "الرئيسية",
            breadcrumbCategory: "التكنولوجيا والبرمجيات",
            heading: "التكنولوجيا والبرمجيات",
            description: "عند التحضير لإطلاق جهاز رئيسي في آسيا، افتقر العميل إلى وضوح الأسعار في المدن من المستوى الثاني. كشفت نمذجة سلوك المستهلك من SYNAPSea عن عتبات أسعار غير مستغلة، مما أدى إلى زيادة بنسبة 32% في الإيرادات في الربع الأول بعد الإطلاق.",
            searchPlaceholder: "البحث بالعنوان",
            filters: {
              industry: "الصناعة",
              region: "المنطقة",
              year: "السنة",
            },
            clearFilters: "مسح المرشحات",
            viewReport: "عرض التقرير",
            pagination: {
              previous: "السابق",
              next: "التالي",
            },
            reportLimit: {
              "1-10": "1-10",
              "1-50": "1-50",
              "1-100": "1-100",
            },
            noReports: "لم يتم العثور على تقارير",
            noReportsDescription: "حاول تعديل معايير البحث أو المرشحات الخاصة بك.",
          },
        },
        reportDetail: {
          en: {
            breadcrumbHome: "Home",
            breadcrumbCategory: "Technology & Software",
            lastUpdated: "Last Updated",
            baseYear: "Base Year data",
            format: "Format",
            industry: "Industry",
            forecastPeriod: "Forecast Period",
            reportId: "Report ID",
            numberOfPages: "Number of Pages",
            tocIncluded: "TOC included",
            introduction: "Introduction",
            keyHighlights: "Key Report Highlights",
            dominantSegments: "Dominant Segments",
            competitiveIntelligence: "Competitive Intelligence",
            strategicInsights: "Strategic Insights",
            regionalDynamics: "Regional Dynamics",
            oneTimeCost: "One Time Cost",
            
            getFreeSample: "GET A FREE SAMPLE",
            sampleDescription: "The sample includes market data points, trend analyses, and market estimates.",
            downloadSample: "Download Sample",
            needCustomReport: "NEED A CUSTOM REPORT?",
            customReportDescription: "Reports can be customized, including stand-alone sections or country-level reports, with discounts for start-ups and universities.",
            requestCustomReport: "Request Custom Report",
            shareAt: "SHARE AT:",
          },
          fr: {
            breadcrumbHome: "Accueil",
            breadcrumbCategory: "Technologie et Logiciels",
            lastUpdated: "Dernière mise à jour",
            baseYear: "Données de l'année de base",
            format: "Format",
            industry: "Industrie",
            forecastPeriod: "Période de prévision",
            reportId: "ID du rapport",
            numberOfPages: "Nombre de pages",
            tocIncluded: "TOC inclus",
            introduction: "Introduction",
            keyHighlights: "Points saillants du rapport",
            dominantSegments: "Segments dominants",
            competitiveIntelligence: "Intelligence concurrentielle",
            strategicInsights: "Insights stratégiques",
            regionalDynamics: "Dynamiques régionales",
            oneTimeCost: "Coût unique",
            
            getFreeSample: "OBTENIR UN ÉCHANTILLON GRATUIT",
            sampleDescription: "L'échantillon comprend des points de données de marché, des analyses de tendances et des estimations de marché.",
            downloadSample: "Télécharger l'échantillon",
            needCustomReport: "BESOIN D'UN RAPPORT PERSONNALISÉ ?",
            customReportDescription: "Les rapports peuvent être personnalisés, y compris des sections autonomes ou des rapports au niveau des pays, avec des remises pour les start-ups et les universités.",
            requestCustomReport: "Demander un rapport personnalisé",
            shareAt: "PARTAGER À :",
          },
          es: {
            breadcrumbHome: "Inicio",
            breadcrumbCategory: "Tecnología y Software",
            lastUpdated: "Última actualización",
            baseYear: "Datos del año base",
            format: "Formato",
            industry: "Industria",
            forecastPeriod: "Período de pronóstico",
            reportId: "ID del informe",
            numberOfPages: "Número de páginas",
            tocIncluded: "TOC incluido",
            introduction: "Introducción",
            keyHighlights: "Aspectos destacados del informe",
            dominantSegments: "Segmentos dominantes",
            competitiveIntelligence: "Inteligencia competitiva",
            strategicInsights: "Insights estratégicos",
            regionalDynamics: "Dinámicas regionales",
            oneTimeCost: "Costo único",
            
            getFreeSample: "OBTENER MUESTRA GRATIS",
            sampleDescription: "La muestra incluye puntos de datos de mercado, análisis de tendencias y estimaciones de mercado.",
            downloadSample: "Descargar muestra",
            needCustomReport: "¿NECESITAS UN INFORME PERSONALIZADO?",
            customReportDescription: "Los informes se pueden personalizar, incluyendo secciones independientes o informes a nivel de país, con descuentos para start-ups y universidades.",
            requestCustomReport: "Solicitar informe personalizado",
            shareAt: "COMPARTIR EN:",
          },
          de: {
            breadcrumbHome: "Startseite",
            breadcrumbCategory: "Technologie & Software",
            lastUpdated: "Zuletzt aktualisiert",
            baseYear: "Basisjahresdaten",
            format: "Format",
            industry: "Branche",
            forecastPeriod: "Prognosezeitraum",
            reportId: "Berichts-ID",
            numberOfPages: "Anzahl der Seiten",
            tocIncluded: "TOC enthalten",
            introduction: "Einführung",
            keyHighlights: "Wichtige Berichtshighlights",
            dominantSegments: "Dominante Segmente",
            competitiveIntelligence: "Wettbewerbsintelligenz",
            strategicInsights: "Strategische Einblicke",
            regionalDynamics: "Regionale Dynamik",
            oneTimeCost: "Einmalige Kosten",
            
            getFreeSample: "KOSTENLOSE PROBE ERHALTEN",
            sampleDescription: "Die Probe umfasst Marktdatenpunkte, Trendanalysen und Marktschätzungen.",
            downloadSample: "Probe herunterladen",
            needCustomReport: "BRAUCHEN SIE EINEN MAßGESCHNEIDERTEN BERICHT?",
            customReportDescription: "Berichte können angepasst werden, einschließlich eigenständiger Abschnitte oder länderspezifischer Berichte, mit Rabatten für Start-ups und Universitäten.",
            requestCustomReport: "Maßgeschneiderten Bericht anfordern",
            shareAt: "TEILEN BEI:",
          },
          ja: {
            breadcrumbHome: "ホーム",
            breadcrumbCategory: "テクノロジー＆ソフトウェア",
            lastUpdated: "最終更新",
            baseYear: "基準年データ",
            format: "フォーマット",
            industry: "業界",
            forecastPeriod: "予測期間",
            reportId: "レポートID",
            numberOfPages: "ページ数",
            tocIncluded: "目次含む",
            introduction: "はじめに",
            keyHighlights: "主要なレポートハイライト",
            dominantSegments: "主要セグメント",
            competitiveIntelligence: "競合インテリジェンス",
            strategicInsights: "戦略的インサイト",
            regionalDynamics: "地域動向",
            oneTimeCost: "一回限りのコスト",
            
            getFreeSample: "無料サンプルを取得",
            sampleDescription: "サンプルには、市場データポイント、トレンド分析、市場推定が含まれます。",
            downloadSample: "サンプルをダウンロード",
            needCustomReport: "カスタムレポートが必要ですか？",
            customReportDescription: "レポートは、スタンドアロンセクションや国レベルレポートを含めてカスタマイズでき、スタートアップや大学には割引があります。",
            requestCustomReport: "カスタムレポートをリクエスト",
            shareAt: "シェア先：",
          },
          zh: {
            breadcrumbHome: "首页",
            breadcrumbCategory: "技术与软件",
            lastUpdated: "最后更新",
            baseYear: "基准年数据",
            format: "格式",
            industry: "行业",
            forecastPeriod: "预测期间",
            reportId: "报告ID",
            numberOfPages: "页数",
            tocIncluded: "包含目录",
            introduction: "介绍",
            keyHighlights: "报告要点",
            dominantSegments: "主要细分市场",
            competitiveIntelligence: "竞争情报",
            strategicInsights: "战略洞察",
            regionalDynamics: "区域动态",
            oneTimeCost: "一次性成本",
            
            getFreeSample: "获取免费样本",
            sampleDescription: "样本包括市场数据点、趋势分析和市场估计。",
            downloadSample: "下载样本",
            needCustomReport: "需要定制报告？",
            customReportDescription: "报告可以定制，包括独立部分或国家级报告，为初创企业和大学提供折扣。",
            requestCustomReport: "请求定制报告",
            shareAt: "分享至：",
          },
          ko: {
            breadcrumbHome: "홈",
            breadcrumbCategory: "기술 및 소프트웨어",
            lastUpdated: "마지막 업데이트",
            baseYear: "기준년 데이터",
            format: "형식",
            industry: "산업",
            forecastPeriod: "예측 기간",
            reportId: "보고서 ID",
            numberOfPages: "페이지 수",
            tocIncluded: "목차 포함",
            introduction: "소개",
            keyHighlights: "주요 보고서 하이라이트",
            dominantSegments: "주요 세그먼트",
            competitiveIntelligence: "경쟁 인텔리전스",
            strategicInsights: "전략적 인사이트",
            regionalDynamics: "지역 동향",
            oneTimeCost: "일회성 비용",
            
            getFreeSample: "무료 샘플 받기",
            sampleDescription: "샘플에는 시장 데이터 포인트, 트렌드 분석 및 시장 추정이 포함됩니다.",
            downloadSample: "샘플 다운로드",
            needCustomReport: "맞춤형 보고서가 필요하신가요?",
            customReportDescription: "보고서는 독립 섹션이나 국가별 보고서를 포함하여 맞춤화할 수 있으며, 스타트업과 대학에 대한 할인이 제공됩니다.",
            requestCustomReport: "맞춤형 보고서 요청",
            shareAt: "공유 위치:",
          },
          ar: {
            breadcrumbHome: "الرئيسية",
            breadcrumbCategory: "التكنولوجيا والبرمجيات",
            lastUpdated: "آخر تحديث",
            baseYear: "بيانات السنة الأساسية",
            format: "التنسيق",
            industry: "الصناعة",
            forecastPeriod: "فترة التوقعات",
            reportId: "معرف التقرير",
            numberOfPages: "عدد الصفحات",
            tocIncluded: "جدول المحتويات مدرج",
            introduction: "مقدمة",
            keyHighlights: "أبرز نقاط التقرير",
            dominantSegments: "القطاعات المهيمنة",
            competitiveIntelligence: "الذكاء التنافسي",
            strategicInsights: "الرؤى الاستراتيجية",
            regionalDynamics: "الديناميكيات الإقليمية",
            oneTimeCost: "التكلفة لمرة واحدة",
            
            getFreeSample: "احصل على عينة مجانية",
            sampleDescription: "تشمل العينة نقاط بيانات السوق وتحليلات الاتجاهات وتقديرات السوق.",
            downloadSample: "تحميل العينة",
            needCustomReport: "هل تحتاج إلى تقرير مخصص؟",
            customReportDescription: "يمكن تخصيص التقارير، بما في ذلك الأقسام المستقلة أو التقارير على مستوى البلد، مع خصومات للشركات الناشئة والجامعات.",
            requestCustomReport: "طلب تقرير مخصص",
            shareAt: "مشاركة في:",
          },
        },
      };

      return fallbackTranslations[page]?.[language] || fallbackTranslations[page]?.en || {
        // Minimal fallback to prevent undefined errors
        filters: {
          industry: "INDUSTRY",
          region: "REGION",
          year: "YEAR",
        },
        searchPlaceholder: "Search",
        clearFilters: "Clear Filters",
      };
    },
    enabled: !!language && !!page,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}
