// SEO translations for multilingual support
export const seoTranslations = {
  en: {
    siteName: "Bee-Twin - Your Digital Card Spotted Anywhere",
    homeTitle: "Bee-Twin - Your Digital Card Spotted Anywhere",
    homeDescription: "Create your professional digital business card and get spotted anywhere. Connect with customers instantly, showcase your services, and grow your business with Bee-Twin.",
    favoritesTitle: "My Favorites | Saved Professionals",
    favoritesDescription: "View and manage your favorite professional business cards and services.",
    dashboardTitle: "My Dashboard | Manage Your Cards",
    dashboardDescription: "Manage your digital business cards, view analytics, and track your professional presence.",
    createTitle: "Create Your Digital Business Card",
    createDescription: "Build your professional digital business card and connect with customers instantly. Free and easy to use.",
    filtersTitle: "Search Filters | Find Professionals",
    filtersDescription: "Refine your search with advanced filters. Find the perfect professional for your needs.",
    messagesTitle: "Messages | Professional Communications",
    messagesDescription: "Connect and communicate with professionals through our secure messaging platform.",
    profileTitle: "My Profile | Account Settings",
    profileDescription: "Manage your account settings, preferences, and professional information.",
    cardDetailDescription: "View detailed professional information, contact details, reviews, and location",
  },
  ar: {
    siteName: "Bee-Twin - بطاقتك الرقمية في كل مكان",
    homeTitle: "Bee-Twin - بطاقتك الرقمية في كل مكان",
    homeDescription: "أنشئ بطاقة عملك الرقمية الاحترافية واحصل على الظهور في أي مكان. تواصل مع العملاء على الفور، اعرض خدماتك، وانمِ عملك مع Bee-Twin.",
    favoritesTitle: "مفضلاتي | المهنيون المحفوظون",
    favoritesDescription: "اعرض وأدر بطاقات الأعمال والخدمات المهنية المفضلة لديك.",
    dashboardTitle: "لوحة التحكم | إدارة بطاقاتك",
    dashboardDescription: "أدر بطاقات عملك الرقمية، اعرض الإحصائيات، وتتبع حضورك المهني.",
    createTitle: "أنشئ بطاقة عملك الرقمية",
    createDescription: "بناء بطاقة عملك الرقمية المهنية والتواصل مع العملاء على الفور. مجاني وسهل الاستخدام.",
    filtersTitle: "مرشحات البحث | ابحث عن المهنيين",
    filtersDescription: "قم بتحسين بحثك باستخدام مرشحات متقدمة. ابحث عن المحترف المثالي لاحتياجاتك.",
    messagesTitle: "الرسائل | الاتصالات المهنية",
    messagesDescription: "تواصل وتحدث مع المهنيين من خلال منصة المراسلة الآمنة لدينا.",
    profileTitle: "ملفي الشخصي | إعدادات الحساب",
    profileDescription: "أدر إعدادات حسابك وتفضيلاتك ومعلوماتك المهنية.",
    cardDetailDescription: "اعرض المعلومات المهنية التفصيلية وتفاصيل الاتصال والمراجعات والموقع",
  },
  fr: {
    siteName: "Bee-Twin - Votre Carte Numérique Repérée Partout",
    homeTitle: "Bee-Twin - Votre Carte Numérique Repérée Partout",
    homeDescription: "Créez votre carte de visite numérique professionnelle et soyez repéré partout. Connectez-vous instantanément avec les clients, présentez vos services et développez votre entreprise avec Bee-Twin.",
    favoritesTitle: "Mes Favoris | Professionnels Sauvegardés",
    favoritesDescription: "Consultez et gérez vos cartes de visite professionnelles et services favoris.",
    dashboardTitle: "Mon Tableau de Bord | Gérer Vos Cartes",
    dashboardDescription: "Gérez vos cartes de visite numériques, consultez les statistiques et suivez votre présence professionnelle.",
    createTitle: "Créez Votre Carte de Visite Numérique",
    createDescription: "Construisez votre carte de visite numérique professionnelle et connectez-vous avec les clients instantanément. Gratuit et facile à utiliser.",
    filtersTitle: "Filtres de Recherche | Trouver des Professionnels",
    filtersDescription: "Affinez votre recherche avec des filtres avancés. Trouvez le professionnel parfait pour vos besoins.",
    messagesTitle: "Messages | Communications Professionnelles",
    messagesDescription: "Connectez-vous et communiquez avec des professionnels via notre plateforme de messagerie sécurisée.",
    profileTitle: "Mon Profil | Paramètres du Compte",
    profileDescription: "Gérez les paramètres de votre compte, vos préférences et vos informations professionnelles.",
    cardDetailDescription: "Consultez les informations professionnelles détaillées, les coordonnées, les avis et l'emplacement",
  },
};

export type SupportedLanguage = 'en' | 'ar' | 'fr';

export function getSEOText(key: keyof typeof seoTranslations.en, language: SupportedLanguage = 'en'): string {
  return seoTranslations[language][key] || seoTranslations.en[key];
}
