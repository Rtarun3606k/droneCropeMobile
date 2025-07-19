import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import ta from './locales/ta.json';
import te from './locales/te.json';


// Set up the i18n instance
const i18n = new I18n({
  en,
  ta,
  kn,
  hi,
  ml,
  te
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';

// When a value is missing from a language it'll fall back to another language with the key present
i18n.enableFallback = true;

// Default fallback language
i18n.defaultLocale = 'en';

// Set locale preferences
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';

export default i18n;

// Helper function to get current locale
export const getCurrentLocale = () => i18n.locale;

// Helper function to change locale
export const changeLocale = (locale: string) => {
  i18n.locale = locale;
};

// Helper function to get available locales
export const getAvailableLocales = () => Object.keys(i18n.translations);

// Type-safe translation function
export const t = (key: string, options?: any) => i18n.t(key, options);
