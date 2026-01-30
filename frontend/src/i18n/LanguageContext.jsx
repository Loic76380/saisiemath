import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from './translations';
import { saveSetting, getSetting } from '../utils/offlineStorage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await getSetting('language');
      if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (lang) => {
    if (lang === 'fr' || lang === 'en') {
      setLanguage(lang);
      try {
        await saveSetting('language', lang);
      } catch (error) {
        console.error('Failed to save language:', error);
      }
    }
  };

  const t = (key) => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;