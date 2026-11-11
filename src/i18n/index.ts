import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';

// English only for now. af, zu and nso are added with the translations work (BR18).
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
