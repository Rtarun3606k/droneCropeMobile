import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import i18n, { changeLocale, getAvailableLocales } from '../i18n';

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: string[];
  changeLanguage: (language: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  getTranslationData: (key: string) => any;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'user_selected_language';

// Language configurations
const languageConfigs = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', isRTL: false },
  ta:{ name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', isRTL: false },
  te :{ name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', isRTL: false },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRTL: false },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', isRTL: false },
 
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const availableLanguages = getAvailableLocales();

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // Check for saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (savedLanguage && availableLanguages.includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        changeLocale(savedLanguage);
        setIsRTL(languageConfigs[savedLanguage as keyof typeof languageConfigs]?.isRTL || false);
      } else {
        // Use device locale
        const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
        const supportedLocale = availableLanguages.includes(deviceLocale) ? deviceLocale : 'en';
        
        setCurrentLanguage(supportedLocale);
        changeLocale(supportedLocale);
        setIsRTL(languageConfigs[supportedLocale as keyof typeof languageConfigs]?.isRTL || false);
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      setCurrentLanguage('en');
      changeLocale('en');
      setIsRTL(false);
    }
  };

  const changeLanguage = async (language: string) => {
    try {
      if (availableLanguages.includes(language)) {
        setCurrentLanguage(language);
        changeLocale(language);
        setIsRTL(languageConfigs[language as keyof typeof languageConfigs]?.isRTL || false);
        
        // Save language preference
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const t = (key: string, options?: any) => i18n.t(key, options);
  
  // Helper function to get direct access to translation objects
  const getTranslationData = (key: string): any => {
    const translations = i18n.translations[currentLanguage] || i18n.translations[i18n.defaultLocale];
    const keys = key.split('.');
    let result = translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return null;
      }
    }
    
    return result;
  };

  const value: LanguageContextType = {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    t,
    getTranslationData,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to get language display info
export const getLanguageInfo = (languageCode: string) => {
  return languageConfigs[languageCode as keyof typeof languageConfigs] || languageConfigs.en;
};
