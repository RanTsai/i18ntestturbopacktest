
export interface TranslationItem {
  label: string;
  translation: string;
  description: string;
  tooltip: string;
}

export type PageTranslations = {
  [key: string]: TranslationItem;
  
};