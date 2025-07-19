import { useLanguage } from '../contexts/LanguageContext';

// Custom hook that provides all i18n functionality
export const useTranslation = () => {
  const { t, currentLanguage, changeLanguage, availableLanguages, isRTL } = useLanguage();

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isRTL,
  };
};

export default useTranslation;
