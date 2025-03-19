
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { categories } from '@/data/categories';
import Header from '@/components/Header';
import Sponsors from '@/components/Sponsors';
import Footer from '@/components/Footer';
import { 
  CategoriesSidebar, 
  CategoryDetail, 
  CategoryGrid,
  CategoriesHero 
} from '@/components/categories';

const Categories = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const currentLanguage = i18n.language;
  
  // Function to get translated name based on current language
  const getTranslatedName = (nameObj: { en: string; fr: string; ar: string }) => {
    return nameObj[currentLanguage as keyof typeof nameObj] || nameObj.en;
  };

  return (
    <div className={`min-h-screen flex flex-col ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <CategoriesHero currentLanguage={currentLanguage} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Categories sidebar */}
            <CategoriesSidebar 
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              currentLanguage={currentLanguage}
              getTranslatedName={getTranslatedName}
            />
            
            {/* Main content */}
            <div className="lg:col-span-2">
              {selectedCategory ? (
                // Show selected category and its subcategories
                (() => {
                  const category = categories.find(c => c.id === selectedCategory);
                  if (!category) return null;
                  
                  return (
                    <CategoryDetail 
                      category={category}
                      getTranslatedName={getTranslatedName}
                      onBack={() => setSelectedCategory(null)}
                      currentLanguage={currentLanguage}
                    />
                  );
                })()
              ) : (
                // Show all categories in tabs
                <CategoryGrid 
                  categories={categories}
                  setSelectedCategory={setSelectedCategory}
                  getTranslatedName={getTranslatedName}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Sponsors />
      <Footer />
    </div>
  );
};

export default Categories;
