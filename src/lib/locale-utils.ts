/**
 * Locale utilities for react-i18next/react-intl compatibility and SEO best practices
 * Following ISO 639-1 language codes (2-letter codes) and BCP 47 for locale tags
 * Language-first approach: Languages are not tied to specific countries
 * SEO-friendly: Using proper hreflang format
 * 
 * Compatible with:
 * - react-i18next (primary)
 * - react-intl (secondary)
 * - Next.js i18n routing
 */

// Language codes follow ISO 639-1 standard (language-only, no country)
// Only use region codes when there are significant linguistic differences
export const languageCodes = {
  // Major Languages (no country specification needed)
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'ja': 'Japanese',
  'ko': 'Korean',
  'nl': 'Dutch',
  'pl': 'Polish',
  'tr': 'Turkish',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'el': 'Greek',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'uk': 'Ukrainian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sr': 'Serbian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'is': 'Icelandic',
  'ga': 'Irish',
  'mt': 'Maltese',
  'sq': 'Albanian',
  'mk': 'Macedonian',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'kk': 'Kazakh',
  'uz': 'Uzbek',
  'fa': 'Persian',
  'ur': 'Urdu',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'si': 'Sinhala',
  'ne': 'Nepali',
  'my': 'Burmese',
  'km': 'Khmer',
  'lo': 'Lao',
  'tl': 'Tagalog',
  'sw': 'Swahili',
  'am': 'Amharic',
  'ha': 'Hausa',
  'yo': 'Yoruba',
  'ig': 'Igbo',
  'zu': 'Zulu',
  'af': 'Afrikaans',
  
  // Language variants (only when linguistically necessary)
  'zh': 'Chinese (Simplified)',
  'zh-Hant': 'Chinese (Traditional)',
  'pt-BR': 'Portuguese (Brazil)', // Significant differences from European Portuguese
  'en-GB': 'English (UK)', // Only if spelling differences matter
  'es-MX': 'Spanish (Mexico)', // Only if regional differences matter
};

/**
 * Convert language code for react-intl (keeps language-first approach)
 * Only adds region when necessary for linguistic differences
 */
export function toIntlLocale(code: string): string {
  // For most languages, just use the language code
  // Only add region for specific variants
  const regionRequired = ['zh-Hant', 'pt-BR', 'en-GB', 'es-MX'];
  
  if (regionRequired.includes(code)) {
    return code;
  }
  
  // Chinese simplified is just 'zh'
  if (code === 'zh') {
    return 'zh';
  }
  
  // For all other languages, use just the language code
  return code.split('-')[0];
}

/**
 * Get language code from locale
 */
export function fromIntlLocale(locale: string): string {
  // Return the locale as-is if it's a known variant
  if (['zh-Hant', 'pt-BR', 'en-GB', 'es-MX'].includes(locale)) {
    return locale;
  }
  
  // Otherwise, return just the language part
  return locale.split('-')[0];
}

/**
 * Format for react-intl messages
 * Keys should follow the pattern: namespace.section.key
 */
export function formatMessageKey(namespace: string, key: string): string {
  return `${namespace}.${key}`.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Export translations in react-intl format
 */
export interface IntlMessages {
  [key: string]: string;
}

export function exportForReactIntl(
  translations: Array<{
    key: string;
    translations: Record<string, string>;
  }>
): Record<string, IntlMessages> {
  const result: Record<string, IntlMessages> = {};
  
  translations.forEach(item => {
    Object.entries(item.translations).forEach(([langCode, value]) => {
      const locale = toIntlLocale(langCode);
      if (!result[locale]) {
        result[locale] = {};
      }
      result[locale][item.key] = value;
    });
  });
  
  return result;
}

/**
 * Import from react-intl format
 */
export function importFromReactIntl(
  messages: Record<string, IntlMessages>
): Array<{ key: string; translations: Record<string, string> }> {
  const keyMap = new Map<string, Record<string, string>>();
  
  Object.entries(messages).forEach(([locale, translations]) => {
    const langCode = fromIntlLocale(locale);
    
    Object.entries(translations).forEach(([key, value]) => {
      if (!keyMap.has(key)) {
        keyMap.set(key, {});
      }
      const trans = keyMap.get(key)!;
      trans[langCode] = value;
    });
  });
  
  return Array.from(keyMap.entries()).map(([key, translations]) => ({
    key,
    translations
  }));
}

/**
 * Map of language codes to locale codes for react-i18next compatibility
 * Following BCP 47 language tags (ISO 639-1 + optional ISO 3166-1 alpha-2)
 */
export const localeMap: Record<string, string> = {
  'en': 'en',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'pt': 'pt',
  'pt-BR': 'pt-BR',
  'ru': 'ru',
  'ar': 'ar',
  'hi': 'hi',
  'ja': 'ja',
  'ko': 'ko',
  'zh': 'zh',
  'zh-Hant': 'zh-TW', // Traditional Chinese uses Taiwan locale in i18next
  'nl': 'nl',
  'pl': 'pl',
  'tr': 'tr',
  'sv': 'sv',
  'da': 'da',
  'no': 'no',
  'fi': 'fi',
  'el': 'el',
  'he': 'he',
  'th': 'th',
  'vi': 'vi',
  'id': 'id',
  'ms': 'ms',
  'cs': 'cs',
  'hu': 'hu',
  'ro': 'ro',
  'uk': 'uk',
  'bg': 'bg',
  'hr': 'hr',
  'sr': 'sr',
  'sk': 'sk',
  'sl': 'sl',
  'et': 'et',
  'lv': 'lv',
  'lt': 'lt',
  'is': 'is',
  'ga': 'ga',
  'mt': 'mt',
  'sq': 'sq',
  'mk': 'mk',
  'ka': 'ka',
  'hy': 'hy',
  'az': 'az',
  'kk': 'kk',
  'uz': 'uz',
  'fa': 'fa',
  'ur': 'ur',
  'bn': 'bn',
  'ta': 'ta',
  'te': 'te',
  'mr': 'mr',
  'gu': 'gu',
  'kn': 'kn',
  'ml': 'ml',
  'si': 'si',
  'ne': 'ne',
  'my': 'my',
  'km': 'km',
  'lo': 'lo',
  'tl': 'tl',
  'sw': 'sw',
  'am': 'am',
  'ha': 'ha',
  'yo': 'yo',
  'ig': 'ig',
  'zu': 'zu',
  'af': 'af',
  'en-GB': 'en-GB',
  'es-MX': 'es-MX',
};

/**
 * Validate if a locale is supported
 */
export function isSupportedLocale(locale: string): boolean {
  return Object.values(localeMap).includes(locale) || 
         Object.keys(localeMap).includes(locale);
}

/**
 * Get all supported locales for react-intl/react-i18next
 */
export function getSupportedLocales(): string[] {
  return Object.values(localeMap);
}

/**
 * Format number according to locale
 */
export function formatNumber(value: number, locale: string): string {
  const intlLocale = toIntlLocale(locale);
  return new Intl.NumberFormat(intlLocale).format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const intlLocale = toIntlLocale(locale);
  return new Intl.DateTimeFormat(intlLocale, options).format(date);
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const langCode = fromIntlLocale(locale);
  return rtlLocales.includes(langCode) ? 'rtl' : 'ltr';
}

/**
 * SEO-friendly hreflang tag generation
 * Following Google's hreflang guidelines
 * Language-first: avoid country codes unless necessary
 */
export function toHreflang(code: string): string {
  // Special cases for hreflang
  const hreflangMap: Record<string, string> = {
    'zh': 'zh-Hans',          // Simplified Chinese (script code, not country)
    'zh-Hant': 'zh-Hant',     // Traditional Chinese (script code, not country)
    'pt-BR': 'pt-BR',         // Brazilian Portuguese (linguistic differences)
  };
  
  // Return mapped value or just the language code
  return hreflangMap[code] || code.split('-')[0];
}

/**
 * Generate hreflang meta tags for SEO
 */
export function generateHreflangTags(
  currentUrl: string,
  availableLocales: string[],
  currentLocale: string
): Array<{ rel: string; hreflang: string; href: string }> {
  const tags = availableLocales.map(locale => ({
    rel: 'alternate',
    hreflang: toHreflang(locale),
    href: `${currentUrl}?lang=${locale}`
  }));
  
  // Add x-default for SEO (points to default/fallback version)
  if (currentLocale === 'en') {
    tags.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: currentUrl
    });
  }
  
  return tags;
}

/**
 * Get HTML lang attribute for SEO
 * Returns language code only (no country)
 */
export function getHtmlLang(locale: string): string {
  // Just return the language part for HTML lang attribute
  return locale.split('-')[0];
}

/**
 * Generate Open Graph locale for social media SEO
 * Only includes territory when linguistically necessary
 */
export function getOgLocale(locale: string): string {
  // Open Graph format uses underscores
  // Only include territory for language variants
  if (['zh-Hant', 'pt-BR', 'en-GB', 'es-MX'].includes(locale)) {
    return locale.replace('-', '_');
  }
  
  // For most languages, just use the language code
  return locale.split('-')[0];
}

/**
 * Convert locale to react-i18next format
 * react-i18next uses hyphenated format: language-REGION (e.g., en-US, zh-CN)
 */
export function toI18nextLocale(code: string): string {
  // Map specific codes to i18next conventions
  const i18nextMap: Record<string, string> = {
    'zh': 'zh-CN',        // Simplified Chinese defaults to China
    'zh-Hant': 'zh-TW',   // Traditional Chinese defaults to Taiwan
    'pt': 'pt-PT',        // European Portuguese
    'pt-BR': 'pt-BR',     // Brazilian Portuguese
    'en': 'en',           // Generic English (no region)
    'en-GB': 'en-GB',     // British English
    'es': 'es',           // Generic Spanish
    'es-MX': 'es-MX',     // Mexican Spanish
  };
  
  return i18nextMap[code] || code;
}

/**
 * Convert from react-i18next format to our internal format
 */
export function fromI18nextLocale(locale: string): string {
  const reverseMap: Record<string, string> = {
    'zh-CN': 'zh',
    'zh-TW': 'zh-Hant',
    'pt-PT': 'pt',
    'pt-BR': 'pt-BR',
    'en-US': 'en',
    'en-GB': 'en-GB',
    'es-ES': 'es',
    'es-MX': 'es-MX',
  };
  
  return reverseMap[locale] || locale.split('-')[0];
}

/**
 * Export translations for react-i18next
 * Returns format suitable for i18next resources
 */
export function exportForI18next(
  translations: Array<{
    key: string;
    namespace?: string;
    translations: Record<string, string>;
  }>
): Record<string, any> {
  const resources: Record<string, any> = {};
  
  translations.forEach(item => {
    const namespace = item.namespace || 'translation'; // Default namespace
    
    Object.entries(item.translations).forEach(([langCode, value]) => {
      const locale = toI18nextLocale(langCode);
      
      if (!resources[locale]) {
        resources[locale] = {};
      }
      
      if (!resources[locale][namespace]) {
        resources[locale][namespace] = {};
      }
      
      resources[locale][namespace][item.key] = value;
    });
  });
  
  return resources;
}

/**
 * Import from react-i18next format
 */
export function importFromI18next(
  resources: Record<string, any>
): Array<{ key: string; namespace: string; translations: Record<string, string> }> {
  const keyMap = new Map<string, { namespace: string; translations: Record<string, string> }>();
  
  Object.entries(resources).forEach(([locale, namespaces]) => {
    const langCode = fromI18nextLocale(locale);
    
    Object.entries(namespaces as Record<string, any>).forEach(([namespace, translations]) => {
      Object.entries(translations as Record<string, string>).forEach(([key, value]) => {
        const mapKey = `${namespace}:${key}`;
        
        if (!keyMap.has(mapKey)) {
          keyMap.set(mapKey, { namespace, translations: {} });
        }
        
        const item = keyMap.get(mapKey)!;
        item.translations[langCode] = value;
      });
    });
  });
  
  return Array.from(keyMap.values()).map(item => ({
    key: item.namespace === 'translation' ? 
      Object.keys(item.translations)[0] : 
      `${item.namespace}.${Object.keys(item.translations)[0]}`,
    namespace: item.namespace,
    translations: item.translations
  }));
}

/**
 * Get alternate locales for Open Graph
 */
export function getOgAlternateLocales(
  availableLocales: string[],
  currentLocale: string
): string[] {
  return availableLocales
    .filter(locale => locale !== currentLocale)
    .map(locale => getOgLocale(locale));
}

/**
 * URL slug generation for SEO-friendly URLs
 */
export function generateLocalizedSlug(
  baseSlug: string,
  locale: string,
  useSubdomain: boolean = false,
  useSubfolder: boolean = true
): string {
  const langCode = fromIntlLocale(locale);
  
  // Skip locale in URL for default language (usually English)
  if (langCode === 'en' && !useSubdomain) {
    return `/${baseSlug}`;
  }
  
  if (useSubdomain) {
    // e.g., es.example.com/page
    return `/${baseSlug}`;
  } else if (useSubfolder) {
    // e.g., example.com/es/page
    return `/${langCode}/${baseSlug}`;
  }
  
  // Query parameter approach (not recommended for SEO)
  return `/${baseSlug}?lang=${langCode}`;
}

/**
 * Structured data for SEO (JSON-LD format)
 */
export function generateLanguageStructuredData(
  availableLanguages: Array<{ code: string; name: string }>,
  currentLanguage: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'inLanguage': toHreflang(currentLanguage),
    'availableLanguage': availableLanguages.map(lang => ({
      '@type': 'Language',
      'name': lang.name,
      'alternateName': lang.code
    }))
  };
}