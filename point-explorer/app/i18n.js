import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-react-native-language-detector';

import en from './locales/en.json';
import fr from './locales/fr.json';

i18n
  .use(LanguageDetector) // Detect the device language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    compatibilityJSON: 'v3', // Add this line
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

export default i18n;
