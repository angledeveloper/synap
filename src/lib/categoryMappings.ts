export interface Category {
  language_id: number;
  category_id: number;
  title: string;
  category_name: string;
  category_tagline: string;
  icon: string;
}

/**
 * Gets the corresponding category ID in the target language
 * @param currentCategoryId The current category ID
 * @param currentLanguageId The current language ID
 * @param targetLanguageId The target language ID
 * @param allCategories Array of all categories from all languages
 * @returns The corresponding category ID in the target language
 */
export function getCategoryIdForLanguage(
  currentCategoryId: string | number,
  currentLanguageId: string | number,
  targetLanguageId: string | number,
  allCategories: Category[]
): string {
  // If same language, return the same ID
  if (String(currentLanguageId) === String(targetLanguageId)) {
    return String(currentCategoryId);
  }

  // Find the current category to get its name
  const currentCategory = allCategories.find(
    cat => String(cat.category_id) === String(currentCategoryId) && 
           String(cat.language_id) === String(currentLanguageId)
  );

  if (!currentCategory) {
    // If we can't find the current category, return the first category in the target language
    const firstInTarget = allCategories.find(
      cat => String(cat.language_id) === String(targetLanguageId)
    );
    return firstInTarget ? String(firstInTarget.category_id) : String(currentCategoryId);
  }

  // Find the category with the same name in the target language
  const targetCategory = allCategories.find(
    cat => cat.category_name === currentCategory.category_name && 
           String(cat.language_id) === String(targetLanguageId)
  );

  return targetCategory ? String(targetCategory.category_id) : String(currentCategoryId);
}

/**
 * Gets the language ID for a given language code
 * @param language The language code (e.g., 'en', 'fr')
 * @returns The corresponding language ID as string
 */
export function getLanguageId(language: string): string {
  const languageMap: Record<string, string> = {
    en: '1',
    fr: '2',
    es: '3',
    de: '4',
  };

  return languageMap[language] || '1'; // Default to English
}
