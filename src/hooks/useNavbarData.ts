import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";

interface NavbarData {
  searchPlaceholder: string;
  cartEmptyMessage: string;
  cartItemsCount: string;
  searchResultsCount: string;
  searchNoResults: string;
}

interface UseNavbarDataParams {
  language: string;
}

export function useNavbarData({ language }: UseNavbarDataParams) {
  const languageId = codeToId[language as keyof typeof codeToId] || 1;
  
  return useQuery({
    queryKey: ["navbar-data", languageId],
    queryFn: async (): Promise<NavbarData> => {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_DB_URL is not defined");
      }

      try {
        // Try to fetch navbar data from API
        const response = await fetch(`${baseUrl}navbar_data?language_id=${languageId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.navbar || data;
        }
      } catch (error) {
        console.warn("Navbar data endpoint not available, using fallback data");
      }

      // Fallback data if API endpoint is not available
      const fallbackData: { [key: string]: NavbarData } = {
        en: {
          searchPlaceholder: "Let's find what you need!",
          cartEmptyMessage: "Your cart is empty",
          cartItemsCount: "item",
          searchResultsCount: "result",
          searchNoResults: "No results found",
        },
        fr: {
          searchPlaceholder: "Trouvons ce dont vous avez besoin !",
          cartEmptyMessage: "Votre panier est vide",
          cartItemsCount: "article",
          searchResultsCount: "résultat",
          searchNoResults: "Aucun résultat trouvé",
        },
        es: {
          searchPlaceholder: "¡Encontremos lo que necesitas!",
          cartEmptyMessage: "Tu carrito está vacío",
          cartItemsCount: "artículo",
          searchResultsCount: "resultado",
          searchNoResults: "No se encontraron resultados",
        },
        de: {
          searchPlaceholder: "Lassen Sie uns finden, was Sie brauchen!",
          cartEmptyMessage: "Ihr Warenkorb ist leer",
          cartItemsCount: "Artikel",
          searchResultsCount: "Ergebnis",
          searchNoResults: "Keine Ergebnisse gefunden",
        },
        ja: {
          searchPlaceholder: "必要なものを探しましょう！",
          cartEmptyMessage: "カートは空です",
          cartItemsCount: "アイテム",
          searchResultsCount: "結果",
          searchNoResults: "結果が見つかりません",
        },
        zh: {
          searchPlaceholder: "让我们找到您需要的！",
          cartEmptyMessage: "您的购物车是空的",
          cartItemsCount: "项目",
          searchResultsCount: "结果",
          searchNoResults: "未找到结果",
        },
        ko: {
          searchPlaceholder: "필요한 것을 찾아보세요!",
          cartEmptyMessage: "장바구니가 비어있습니다",
          cartItemsCount: "항목",
          searchResultsCount: "결과",
          searchNoResults: "결과를 찾을 수 없습니다",
        },
        ar: {
          searchPlaceholder: "دعنا نجد ما تحتاجه!",
          cartEmptyMessage: "سلة التسوق فارغة",
          cartItemsCount: "عنصر",
          searchResultsCount: "نتيجة",
          searchNoResults: "لم يتم العثور على نتائج",
        },
      };

      return fallbackData[language] || fallbackData.en;
    },
    enabled: !!language,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}
