
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import arTranslation from './locales/ar/translation.json';

// Import country specific translations
import { countries } from './contexts/CountryContext';
import { categories } from './data/categories';

// Initialize country-specific and category-specific content
const createCountryResources = () => {
  const countryResources = {};
  
  countries.forEach(country => {
    // For each country, create a namespace in each language
    countryResources[country.code] = {
      en: {},
      fr: {},
      ar: {}
    };
  });
  
  return countryResources;
};

const createCategoryResources = () => {
  const categoryResources = {};
  
  categories.forEach(category => {
    // For each category, create a namespace in each language
    const categoryKey = `cat_${category.id}`;
    categoryResources[categoryKey] = {
      en: {
        name: category.name.en,
        subcategories: category.subcategories.reduce((acc, sub) => {
          acc[`sub_${sub.id}`] = sub.name.en;
          return acc;
        }, {})
      },
      fr: {
        name: category.name.fr,
        subcategories: category.subcategories.reduce((acc, sub) => {
          acc[`sub_${sub.id}`] = sub.name.fr;
          return acc;
        }, {})
      },
      ar: {
        name: category.name.ar,
        subcategories: category.subcategories.reduce((acc, sub) => {
          acc[`sub_${sub.id}`] = sub.name.ar;
          return acc;
        }, {})
      }
    };
  });
  
  return categoryResources;
};

const countryResources = createCountryResources();
const categoryResources = createCategoryResources();

const resources = {
  en: {
    translation: enTranslation,
    ...Object.fromEntries(
      countries.map(country => [country.code, countryResources[country.code].en])
    ),
    ...Object.fromEntries(
      Object.keys(categoryResources).map(key => [key, categoryResources[key].en])
    )
  },
  fr: {
    translation: frTranslation,
    ...Object.fromEntries(
      countries.map(country => [country.code, countryResources[country.code].fr])
    ),
    ...Object.fromEntries(
      Object.keys(categoryResources).map(key => [key, categoryResources[key].fr])
    )
  },
  ar: {
    translation: arTranslation,
    ...Object.fromEntries(
      countries.map(country => [country.code, countryResources[country.code].ar])
    ),
    ...Object.fromEntries(
      Object.keys(categoryResources).map(key => [key, categoryResources[key].ar])
    )
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
