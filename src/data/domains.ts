import { Domain } from "@/services/domainsApi";

export const domains: Domain[] = [
  {
    key: "home_services",
    ar: "المنزل والخدمات المنزلية",
    fr: "Maison & Services Domestiques",
    en: "Home & Domestic Services",
    keywords: {
      ar: ["منزل", "خدمة منزلية", "صيانة"],
      fr: ["maison", "services", "entretien"],
      en: ["home", "services", "maintenance"]
    },
    subcategories: [
      {
        key: "electrician",
        category_key: "home_services",
        ar: "كهربائي",
        fr: "Électricien",
        en: "Electrician",
        keywords: {
          ar: ["كهرباء", "أسلاك", "لوحة كهربائية", "تصليح"],
          fr: ["électricité", "câblage", "tableau", "réparation"],
          en: ["electric", "wiring", "panel", "repair"]
        }
      },
      {
        key: "plumber",
        category_key: "home_services",
        ar: "سباك",
        fr: "Plombier",
        en: "Plumber",
        keywords: {
          ar: ["سباكة", "أنابيب", "تسريب", "مياه"],
          fr: ["plomberie", "tuyaux", "fuite", "eau"],
          en: ["plumbing", "pipes", "leak", "water"]
        }
      },
      {
        key: "painter_decorator",
        category_key: "home_services",
        ar: "دهان ومزين",
        fr: "Peintre / Décorateur",
        en: "Painter / Decorator",
        keywords: {
          ar: ["دهان", "ديكور", "ترميم طلاء"],
          fr: ["peinture", "décoration", "rénovation"],
          en: ["painting", "decor", "renovation"]
        }
      },
      {
        key: "gardener",
        category_key: "home_services",
        ar: "بستاني / منسق حدائق",
        fr: "Jardinier / Paysagiste",
        en: "Gardener / Landscaper",
        keywords: {
          ar: ["تنسيق حدائق", "جزّاز", "ريّ"],
          fr: ["jardinage", "paysagiste", "entretien"],
          en: ["gardening", "landscaping", "maintenance"]
        }
      },
      {
        key: "ac_heating",
        category_key: "home_services",
        ar: "تكييف وتدفئة",
        fr: "Climatisation & Chauffage",
        en: "AC & Heating",
        keywords: {
          ar: ["تكييف", "صيانة مكيف", "تدفئة"],
          fr: ["climatisation", "chauffage", "installation"],
          en: ["ac", "heating", "installation"]
        }
      },
      {
        key: "appliance_repair",
        category_key: "home_services",
        ar: "إصلاح الأجهزة المنزلية",
        fr: "Réparation électroménager",
        en: "Appliance Repair",
        keywords: {
          ar: ["ثلاجة", "غسالة", "ميكروويف", "تصليح"],
          fr: ["réfrigérateur", "lave-linge", "réparation"],
          en: ["fridge", "washer", "repair"]
        }
      },
      {
        key: "cleaning",
        category_key: "home_services",
        ar: "تنظيف ومقاولات نظافة",
        fr: "Nettoyage & Ménage",
        en: "Cleaning Services",
        keywords: {
          ar: ["تنظيف", "تعقيم", "مغاسل"],
          fr: ["ménage", "nettoyage", "désinfection"],
          en: ["cleaning", "disinfection", "housekeeping"]
        }
      },
      {
        key: "security_cameras",
        category_key: "home_services",
        ar: "أنظمة أمن وكاميرات",
        fr: "Sécurité & Caméras",
        en: "Security & Cameras",
        keywords: {
          ar: ["كاميرات", "مراقبة", "أمن منزلي"],
          fr: ["caméras", "surveillance", "sécurité"],
          en: ["cctv", "surveillance", "security"]
        }
      }
    ]
  },
  {
    key: "automobile",
    ar: "السيارات والنقل",
    fr: "Automobile & Transport",
    en: "Automotive & Transport",
    keywords: {
      ar: ["سيارة", "ميكانيك", "قطع غيار"],
      fr: ["voiture", "mécanique", "pièces"],
      en: ["car", "mechanic", "spare parts"]
    },
    subcategories: [
      {
        key: "fiat_parts",
        category_key: "automobile",
        ar: "قطع غيار فيات",
        fr: "Pièces détachées - Fiat",
        en: "Fiat Spare Parts",
        keywords: {
          ar: ["فيات", "قطع غيار", "محرك", "كاربور"],
          fr: ["fiat", "pièces", "moteur"],
          en: ["fiat", "spare parts", "engine"]
        }
      },
      {
        key: "toyota_parts",
        category_key: "automobile",
        ar: "قطع غيار تويوتا",
        fr: "Pièces détachées - Toyota",
        en: "Toyota Spare Parts",
        keywords: {
          ar: ["تويوتا", "قطع غيار", "ايصال"],
          fr: ["toyota", "pièces"],
          en: ["toyota", "spare parts"]
        }
      },
      {
        key: "peugeot_parts",
        category_key: "automobile",
        ar: "قطع غيار بيجو",
        fr: "Pièces détachées - Peugeot",
        en: "Peugeot Spare Parts",
        keywords: {
          ar: ["بيجو", "قطع غيار"],
          fr: ["peugeot", "pièces"],
          en: ["peugeot", "spare parts"]
        }
      },
      {
        key: "mechanic",
        category_key: "automobile",
        ar: "ميكانيكي سيارات",
        fr: "Mécanicien automobile",
        en: "Auto Mechanic",
        keywords: {
          ar: ["ميكانيك", "محرك", "تشخيص", "صيانة"],
          fr: ["mécanique", "diagnostic", "atelier"],
          en: ["mechanic", "diagnostic", "repair"]
        }
      },
      {
        key: "auto_electrician",
        category_key: "automobile",
        ar: "كهربائي سيارات",
        fr: "Électricien auto",
        en: "Auto Electrician",
        keywords: {
          ar: ["كهرباء سيارات", "بطارية", "دينامو"],
          fr: ["électricité auto", "batterie"],
          en: ["auto electric", "battery", "alternator"]
        }
      },
      {
        key: "garage",
        category_key: "automobile",
        ar: "ورشة وصيانة عامة",
        fr: "Garage & Entretien",
        en: "Garage & Maintenance",
        keywords: {
          ar: ["ورشة", "صيانة عامة", "خدمة"],
          fr: ["garage", "entretien"],
          en: ["garage", "maintenance", "service"]
        }
      },
      {
        key: "car_wash",
        category_key: "automobile",
        ar: "غسيل وتلميع سيارات",
        fr: "Lave-auto",
        en: "Car Wash",
        keywords: {
          ar: ["غسيل", "تلميع", "نظافة السيارات"],
          fr: ["lavage", "polissage"],
          en: ["car wash", "polish"]
        }
      },
      {
        key: "tires_batteries",
        category_key: "automobile",
        ar: "إطارات وبطاريات",
        fr: "Pneus & Batteries",
        en: "Tires & Batteries",
        keywords: {
          ar: ["إطارات", "بطارية", "موازنة"],
          fr: ["pneus", "batterie"],
          en: ["tires", "battery", "balancing"]
        }
      },
      {
        key: "body_paint",
        category_key: "automobile",
        ar: "صبغ وهيكل السيارات",
        fr: "Carrosserie / Peinture",
        en: "Body & Paint",
        keywords: {
          ar: ["صبغ", "هيكل", "دهان"],
          fr: ["carrosserie", "peinture"],
          en: ["bodywork", "paint", "collision"]
        }
      },
      {
        key: "gearbox_repair",
        category_key: "automobile",
        ar: "تصليح ناقل الحركة",
        fr: "Réparation boîte de vitesse",
        en: "Gearbox Repair",
        keywords: {
          ar: ["جير", "ناقل حركة", "تصليح"],
          fr: ["boîte", "réparation"],
          en: ["gearbox", "transmission", "repair"]
        }
      },
      {
        key: "towing",
        category_key: "automobile",
        ar: "سحب وطوارئ",
        fr: "Dépannage & Remorquage",
        en: "Towing & Recovery",
        keywords: {
          ar: ["سحب", "طوارئ", "خدمة طريق"],
          fr: ["remorquage", "dépannage"],
          en: ["towing", "breakdown", "roadside"]
        }
      },
      {
        key: "used_cars",
        category_key: "automobile",
        ar: "بيع وشراء سيارات مستعملة",
        fr: "Vente de véhicules d'occasion",
        en: "Used Cars Sales",
        keywords: {
          ar: ["بيع سيارات", "مستعملة", "شراء"],
          fr: ["voitures d'occasion", "vente"],
          en: ["used cars", "sale", "purchase"]
        }
      },
      {
        key: "car_rental",
        category_key: "automobile",
        ar: "تأجير سيارات",
        fr: "Location de voitures",
        en: "Car Rental",
        keywords: {
          ar: ["تأجير", "كراء سيارات", "استئجار"],
          fr: ["location", "voiture"],
          en: ["rental", "car hire", "rent"]
        }
      }
    ]
  },
  {
    key: "construction",
    ar: "البناء والأشغال",
    fr: "Construction & Bâtiment",
    en: "Construction & Building",
    keywords: {
      ar: ["بناء", "ترميم", "مقاول"],
      fr: ["construction", "rénovation", "entrepreneur"],
      en: ["construction", "renovation", "contractor"]
    },
    subcategories: [
      {
        key: "contractor",
        category_key: "construction",
        ar: "مقاول عام",
        fr: "Entrepreneur général",
        en: "General Contractor",
        keywords: {
          ar: ["مقاول", "إنشاء", "أشغال"],
          fr: ["entrepreneur", "chantier"],
          en: ["contractor", "construction", "site"]
        }
      },
      {
        key: "architect",
        category_key: "construction",
        ar: "مهندس معماري",
        fr: "Architecte",
        en: "Architect",
        keywords: {
          ar: ["تصميم معماري", "خرائط", "رسم"],
          fr: ["architecture", "plan"],
          en: ["architecture", "design", "plans"]
        }
      },
      {
        key: "civil_engineer",
        category_key: "construction",
        ar: "مهندس مدني",
        fr: "Ingénieur civil",
        en: "Civil Engineer",
        keywords: {
          ar: ["هندسة مدنية", "أساسات", "إنشاءات"],
          fr: ["génie civil"],
          en: ["civil engineering", "structures"]
        }
      },
      {
        key: "tiler",
        category_key: "construction",
        ar: "تبليط وبلاط",
        fr: "Carreleur / Tuilier",
        en: "Tiler",
        keywords: {
          ar: ["بلاط", "تبليط", "تركيب"],
          fr: ["carrelage"],
          en: ["tiling", "tiles"]
        }
      },
      {
        key: "materials_supplier",
        category_key: "construction",
        ar: "توريد مواد البناء",
        fr: "Fournisseur de matériaux",
        en: "Materials Supplier",
        keywords: {
          ar: ["أسمنت", "حديد", "رخام"],
          fr: ["matériaux", "béton"],
          en: ["cement", "rebar", "marble"]
        }
      }
    ]
  },
  {
    key: "health",
    ar: "الصحة والعلاج",
    fr: "Santé & Soins",
    en: "Health & Care",
    keywords: {
      ar: ["طبيب", "عيادة", "صيدلية"],
      fr: ["santé", "médecin", "pharmacie"],
      en: ["health", "doctor", "pharmacy"]
    },
    subcategories: [
      {
        key: "general_doctor",
        category_key: "health",
        ar: "طبيب عام",
        fr: "Médecin généraliste",
        en: "General Doctor",
        keywords: {
          ar: ["طبيب", "استشارة", "عيادة"],
          fr: ["médecin", "consultation"],
          en: ["doctor", "clinic", "consultation"]
        }
      },
      {
        key: "dentist",
        category_key: "health",
        ar: "طبيب أسنان",
        fr: "Dentiste",
        en: "Dentist",
        keywords: {
          ar: ["أسنان", "حشوات", "قناة جذور"],
          fr: ["dentiste", "soins dentaires"],
          en: ["dentist", "fillings", "root canal"]
        }
      },
      {
        key: "ophthalmologist",
        category_key: "health",
        ar: "طبيب عيون",
        fr: "Ophtalmologue",
        en: "Ophthalmologist",
        keywords: {
          ar: ["عين", "فحص نظر", "نظارات"],
          fr: ["ophtalmologie", "lunettes"],
          en: ["eye", "vision", "glasses"]
        }
      },
      {
        key: "pediatrician",
        category_key: "health",
        ar: "طبيب أطفال",
        fr: "Pédiatre",
        en: "Pediatrician",
        keywords: {
          ar: ["أطفال", "تطعيمات", "متابعة نمو"],
          fr: ["pédiatrie"],
          en: ["pediatric", "children", "vaccination"]
        }
      },
      {
        key: "pharmacy",
        category_key: "health",
        ar: "صيدلية",
        fr: "Pharmacie",
        en: "Pharmacy",
        keywords: {
          ar: ["دواء", "وصفة", "مستحضرات"],
          fr: ["médicaments", "ordonnance"],
          en: ["medicine", "prescription"]
        }
      },
      {
        key: "laboratory",
        category_key: "health",
        ar: "مختبر تحاليل",
        fr: "Laboratoire d'analyses",
        en: "Laboratory",
        keywords: {
          ar: ["تحاليل", "مختبر", "فحوصات"],
          fr: ["analyses", "laboratoire"],
          en: ["lab", "tests", "analysis"]
        }
      }
    ]
  },
  {
    key: "stores",
    ar: "المتاجر والتجارة",
    fr: "Commerces & Boutiques",
    en: "Shops & Stores",
    keywords: {
      ar: ["متجر", "بيع", "منتجات"],
      fr: ["boutique", "magasin", "produits"],
      en: ["store", "shop", "products"]
    },
    subcategories: [
      {
        key: "clothing_store",
        category_key: "stores",
        ar: "متجر ملابس",
        fr: "Magasin de vêtements",
        en: "Clothing Store",
        keywords: {
          ar: ["ملابس", "أزياء", "بيع"],
          fr: ["vêtements", "mode"],
          en: ["clothes", "fashion", "store"]
        }
      },
      {
        key: "electronics_store",
        category_key: "stores",
        ar: "متجر إلكترونيات",
        fr: "Magasin d'électronique",
        en: "Electronics Store",
        keywords: {
          ar: ["هواتف", "حاسوب", "تلفاز"],
          fr: ["téléphones", "ordinateurs"],
          en: ["phones", "computers", "tv"]
        }
      },
      {
        key: "furniture_store",
        category_key: "stores",
        ar: "أثاث وديكور",
        fr: "Mobilier & Décoration",
        en: "Furniture & Decoration",
        keywords: {
          ar: ["أثاث", "كنب", "طاولات"],
          fr: ["meubles", "décoration"],
          en: ["furniture", "sofa", "tables"]
        }
      },
      {
        key: "auto_parts_store",
        category_key: "stores",
        ar: "متجر قطع غيار",
        fr: "Magasin de pièces",
        en: "Auto Parts Store",
        keywords: {
          ar: ["قطع غيار", "فلترات", "زيوت"],
          fr: ["pièces", "accessoires"],
          en: ["spare parts", "filters", "oils"]
        }
      }
    ]
  },
  {
    key: "technology",
    ar: "التكنولوجيا والإبداع",
    fr: "Technologie & Création",
    en: "Technology & Creativity",
    keywords: {
      ar: ["تكنولوجيا", "برمجة", "تصميم"],
      fr: ["technologie", "développement", "design"],
      en: ["technology", "development", "design"]
    },
    subcategories: [
      {
        key: "web_dev",
        category_key: "technology",
        ar: "تطوير مواقع وتطبيقات",
        fr: "Développement web / mobile",
        en: "Web / Mobile Development",
        keywords: {
          ar: ["مطور", "ويب", "تطبيقات"],
          fr: ["développement", "application"],
          en: ["developer", "web", "app"]
        }
      },
      {
        key: "graphic_design",
        category_key: "technology",
        ar: "تصميم جرافيك",
        fr: "Design graphique",
        en: "Graphic Design",
        keywords: {
          ar: ["تصميم", "لوغو", "هوية بصرية"],
          fr: ["graphisme", "logo"],
          en: ["design", "logo", "branding"]
        }
      },
      {
        key: "it_technician",
        category_key: "technology",
        ar: "فني حاسوب وشبكات",
        fr: "Technicien informatique",
        en: "IT Technician",
        keywords: {
          ar: ["صيانة حاسوب", "شبكات", "نصب"],
          fr: ["informatique", "réseau"],
          en: ["computer repair", "network", "it"]
        }
      }
    ]
  },
  {
    key: "food",
    ar: "المطاعم والأغذية",
    fr: "Restauration & Alimentation",
    en: "Food & Restaurants",
    keywords: {
      ar: ["مطعم", "طعام", "قائمة"],
      fr: ["restaurant", "cuisine"],
      en: ["restaurant", "food", "menu"]
    },
    subcategories: [
      {
        key: "restaurant",
        category_key: "food",
        ar: "مطعم",
        fr: "Restaurant",
        en: "Restaurant",
        keywords: {
          ar: ["مطعم", "طعام", "قائمة"],
          fr: ["restaurant", "cuisine"],
          en: ["restaurant", "food", "menu"]
        }
      },
      {
        key: "bakery",
        category_key: "food",
        ar: "مخبز وحلويات",
        fr: "Boulangerie / Pâtisserie",
        en: "Bakery / Patisserie",
        keywords: {
          ar: ["خبز", "حلويات", "معجنات"],
          fr: ["boulangerie", "pâtisserie"],
          en: ["bread", "pastries", "bakery"]
        }
      },
      {
        key: "cafe",
        category_key: "food",
        ar: "مقهى",
        fr: "Café",
        en: "Coffee Shop",
        keywords: {
          ar: ["قهوة", "كافيه", "مشروبات"],
          fr: ["café", "boissons"],
          en: ["coffee", "cafe", "drinks"]
        }
      }
    ]
  },
  {
    key: "education",
    ar: "التعليم والتدريب",
    fr: "Éducation & Formation",
    en: "Education & Training",
    keywords: {
      ar: ["تعليم", "دروس", "معهد"],
      fr: ["éducation", "cours", "formation"],
      en: ["education", "courses", "training"]
    },
    subcategories: [
      {
        key: "school",
        category_key: "education",
        ar: "مدرسة خاصة",
        fr: "École privée",
        en: "Private School",
        keywords: {
          ar: ["مدرسة", "تعليم", "مرحلة"],
          fr: ["école", "enseignement"],
          en: ["school", "education", "classes"]
        }
      },
      {
        key: "tutoring",
        category_key: "education",
        ar: "دروس خصوصية",
        fr: "Cours particuliers",
        en: "Private Tutor",
        keywords: {
          ar: ["دروس", "مساعدة", "مراجعة"],
          fr: ["cours", "soutien"],
          en: ["tutor", "lessons", "homework help"]
        }
      },
      {
        key: "language_center",
        category_key: "education",
        ar: "معهد لغات",
        fr: "Institut de langues",
        en: "Language Institute",
        keywords: {
          ar: ["لغات", "تعليم لغة", "انجليزية"],
          fr: ["langues", "formation"],
          en: ["languages", "courses", "school"]
        }
      }
    ]
  },
  {
    key: "beauty",
    ar: "الجمال والموضة",
    fr: "Beauté & Mode",
    en: "Beauty & Fashion",
    keywords: {
      ar: ["حلاقة", "صالون", "تجميل"],
      fr: ["beauté", "coiffure", "esthétique"],
      en: ["beauty", "hair", "cosmetics"]
    },
    subcategories: [
      {
        key: "hair_salon",
        category_key: "beauty",
        ar: "صالون حلاقة/تجميل",
        fr: "Salon de coiffure / Beauté",
        en: "Hair & Beauty Salon",
        keywords: {
          ar: ["حلاقة", "تصفيف", "ماكياج"],
          fr: ["coiffure", "beauté"],
          en: ["hair", "salon", "makeup"]
        }
      },
      {
        key: "spa",
        category_key: "beauty",
        ar: "مركز سبا وجمال",
        fr: "Spa / Institut de beauté",
        en: "Spa / Beauty Center",
        keywords: {
          ar: ["سبا", "مساج", "عناية"],
          fr: ["spa", "soins"],
          en: ["spa", "massage", "care"]
        }
      }
    ]
  },
  {
    key: "animals",
    ar: "الحيوانات والزراعة",
    fr: "Animaux & Agriculture",
    en: "Animals & Agriculture",
    keywords: {
      ar: ["حيوانات", "مزرعة", "بيطرة"],
      fr: ["animaux", "ferme", "vétérinaire"],
      en: ["animals", "farm", "veterinary"]
    },
    subcategories: [
      {
        key: "veterinary",
        category_key: "animals",
        ar: "عيادة بيطرية",
        fr: "Clinique vétérinaire",
        en: "Veterinary Clinic",
        keywords: {
          ar: ["بيطري", "حيوانات أليفة", "تلقيح"],
          fr: ["vétérinaire", "animaux"],
          en: ["vet", "pets", "vaccination"]
        }
      },
      {
        key: "pet_shop",
        category_key: "animals",
        ar: "متجر حيوانات أليفة",
        fr: "Magasin d'animaux",
        en: "Pet Shop",
        keywords: {
          ar: ["حيوانات", "طعام حيوانات", "لعب"],
          fr: ["animaux", "aliment"],
          en: ["pets", "food", "supplies"]
        }
      }
    ]
  },
  {
    key: "professional",
    ar: "الخدمات المهنية",
    fr: "Services Professionnels",
    en: "Professional Services",
    keywords: {
      ar: ["محامي", "محاسب", "استشارات"],
      fr: ["avocat", "comptable", "consultant"],
      en: ["lawyer", "accountant", "consultant"]
    },
    subcategories: [
      {
        key: "lawyer",
        category_key: "professional",
        ar: "محامي",
        fr: "Avocat",
        en: "Lawyer",
        keywords: {
          ar: ["قانون", "استشارة", "قضايا"],
          fr: ["avocat", "droit"],
          en: ["lawyer", "legal", "consultation"]
        }
      },
      {
        key: "accountant",
        category_key: "professional",
        ar: "محاسب",
        fr: "Comptable",
        en: "Accountant",
        keywords: {
          ar: ["محاسبة", "ضرائب", "تقارير"],
          fr: ["comptabilité", "fiscalité"],
          en: ["accounting", "tax", "reports"]
        }
      }
    ]
  },
  {
    key: "logistics",
    ar: "اللوجستيك والنقل",
    fr: "Logistique & Transport",
    en: "Logistics & Transport",
    keywords: {
      ar: ["شحن", "توصيل", "نقل"],
      fr: ["logistique", "livraison", "transport"],
      en: ["logistics", "delivery", "transport"]
    },
    subcategories: [
      {
        key: "courier",
        category_key: "logistics",
        ar: "خدمة توصيل و بريد",
        fr: "Service de livraison / Coursier",
        en: "Courier & Delivery",
        keywords: {
          ar: ["توصيل", "شحن", "استلام"],
          fr: ["livraison", "colis"],
          en: ["delivery", "courier", "shipping"]
        }
      },
      {
        key: "moving_company",
        category_key: "logistics",
        ar: "شركة نقل وأثاث",
        fr: "Déménagement",
        en: "Moving Company",
        keywords: {
          ar: ["نقل عفش", "ديموناج", "تحميل"],
          fr: ["déménagement"],
          en: ["moving", "furniture", "transport"]
        }
      }
    ]
  },
  {
    key: "real_estate",
    ar: "العقار والإسكان",
    fr: "Immobilier & Logement",
    en: "Real Estate & Housing",
    keywords: {
      ar: ["عقار", "إيجار", "بيع منازل"],
      fr: ["immobilier", "location", "vente"],
      en: ["real estate", "rental", "sale"]
    },
    subcategories: [
      {
        key: "real_estate_agency",
        category_key: "real_estate",
        ar: "وكالة عقارية",
        fr: "Agence immobilière",
        en: "Real Estate Agency",
        keywords: {
          ar: ["عقار", "بيع", "ايجار"],
          fr: ["immobilier", "vente", "location"],
          en: ["real estate", "sale", "rent"]
        }
      },
      {
        key: "property_management",
        category_key: "real_estate",
        ar: "إدارة عقارات",
        fr: "Gestion immobilière",
        en: "Property Management",
        keywords: {
          ar: ["إدارة عقارات", "صيانة"],
          fr: ["gestion"],
          en: ["property management", "maintenance"]
        }
      }
    ]
  },
  {
    key: "other_services",
    ar: "خدمات أخرى",
    fr: "Autres Services",
    en: "Other Services",
    keywords: {
      ar: ["خدمات", "متفرقات", "مؤقت"],
      fr: ["autres", "services", "divers"],
      en: ["other", "services", "misc"]
    },
    subcategories: [
      {
        key: "printing",
        category_key: "other_services",
        ar: "طباعة ونسخ",
        fr: "Impression & Photocopie",
        en: "Printing & Copying",
        keywords: {
          ar: ["طباعة", "فلاير", "بنر"],
          fr: ["impression", "photocopie"],
          en: ["printing", "flyer", "banner"]
        }
      },
      {
        key: "phone_repair",
        category_key: "other_services",
        ar: "تصليح هواتف",
        fr: "Réparation téléphones",
        en: "Phone Repair",
        keywords: {
          ar: ["شاشة", "صيانة هاتف", "بطارية"],
          fr: ["réparation", "téléphone"],
          en: ["screen", "repair", "battery"]
        }
      }
    ]
  },
  {
    key: "events",
    ar: "الفعاليات والتنظيم",
    fr: "Événementiel & Organisation",
    en: "Events & Organization",
    keywords: {
      ar: ["حفلات", "تنظيم فعاليات", "دي جي"],
      fr: ["événements", "organisation", "fête"],
      en: ["events", "organization", "catering"]
    },
    subcategories: [
      {
        key: "event_organizer",
        category_key: "events",
        ar: "تنظيم فعاليات",
        fr: "Organisation d'événements",
        en: "Event Organizer",
        keywords: {
          ar: ["حفلات", "زفاف", "مهرجان"],
          fr: ["événements", "mariage"],
          en: ["events", "wedding", "party"]
        }
      },
      {
        key: "catering",
        category_key: "events",
        ar: "تموين و كاترنج",
        fr: "Traiteur / Catering",
        en: "Catering",
        keywords: {
          ar: ["تموين", "طعام مناسبات"],
          fr: ["traiteur"],
          en: ["catering", "food service"]
        }
      }
    ]
  }
];
