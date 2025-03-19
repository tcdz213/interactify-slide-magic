
// Categories with multilingual support
export type CategoryTranslation = {
  en: string;
  fr: string;
  ar: string;
};

export type SubCategory = {
  id: number;
  name: CategoryTranslation;
};

export type Category = {
  id: number;
  name: CategoryTranslation;
  subcategories: SubCategory[];
};

export const categories: Category[] = [
  {
    id: 1,
    name: {
      en: "IT & Software",
      fr: "Informatique & Logiciel",
      ar: "تكنولوجيا المعلومات والبرمجيات"
    },
    subcategories: [
      { id: 101, name: { en: "Web Development", fr: "Dév Web", ar: "تطوير الويب" } },
      { id: 102, name: { en: "App Development", fr: "Dév App", ar: "تطوير التطبيقات" } },
      { id: 103, name: { en: "Cybersecurity", fr: "Cyber sécurité", ar: "الأمن السيبراني" } },
      { id: 104, name: { en: "Cloud Computing", fr: "Cloud", ar: "الحوسبة السحابية" } },
      { id: 105, name: { en: "Data Science", fr: "Science des données", ar: "علم البيانات" } },
      { id: 106, name: { en: "AI & Machine Learning", fr: "IA & ML", ar: "الذكاء الاصطناعي" } },
      { id: 107, name: { en: "Blockchain", fr: "Blockchain", ar: "سلسلة الكتل" } },
      { id: 108, name: { en: "Ethical Hacking", fr: "Hacking Éthique", ar: "الاختراق الأخلاقي" } }
    ]
  },
  {
    id: 2,
    name: {
      en: "Business",
      fr: "Affaires",
      ar: "الأعمال"
    },
    subcategories: [
      { id: 201, name: { en: "Project Management", fr: "Gestion de projet", ar: "إدارة المشاريع" } },
      { id: 202, name: { en: "Entrepreneurship", fr: "Entrepreneuriat", ar: "ريادة الأعمال" } },
      { id: 203, name: { en: "E-commerce", fr: "E-commerce", ar: "التجارة الإلكترونية" } },
      { id: 204, name: { en: "HR & Recruiting", fr: "RH & Recrutement", ar: "الموارد البشرية" } },
      { id: 205, name: { en: "Digital Marketing", fr: "Marketing Digital", ar: "التسويق الرقمي" } },
      { id: 206, name: { en: "SEO & SEM", fr: "SEO & SEM", ar: "تحسين محركات البحث" } },
      { id: 207, name: { en: "Accounting", fr: "Comptabilité", ar: "المحاسبة" } },
      { id: 208, name: { en: "Finance", fr: "Finance", ar: "المالية" } }
    ]
  },
  {
    id: 3,
    name: {
      en: "Health & Wellness",
      fr: "Santé & Bien-être",
      ar: "الصحة والعافية"
    },
    subcategories: [
      { id: 301, name: { en: "Nursing", fr: "Infirmier", ar: "التمريض" } },
      { id: 302, name: { en: "Pharmacy", fr: "Pharmacie", ar: "الصيدلة" } },
      { id: 303, name: { en: "Fitness Training", fr: "Coaching Sportif", ar: "التدريب الرياضي" } },
      { id: 304, name: { en: "Yoga & Meditation", fr: "Yoga & Méditation", ar: "اليوغا والتأمل" } },
      { id: 305, name: { en: "Diet & Nutrition", fr: "Diététique", ar: "التغذية والحمية" } },
      { id: 306, name: { en: "First Aid", fr: "Premiers secours", ar: "الإسعافات الأولية" } },
      { id: 307, name: { en: "Mental Health", fr: "Santé mentale", ar: "الصحة النفسية" } },
      { id: 308, name: { en: "Medical Coding", fr: "Codage médical", ar: "ترميز طبي" } }
    ]
  },
  {
    id: 4,
    name: {
      en: "Engineering",
      fr: "Ingénierie",
      ar: "الهندسة"
    },
    subcategories: [
      { id: 401, name: { en: "Mechanical", fr: "Mécanique", ar: "الميكانيكية" } },
      { id: 402, name: { en: "Electrical", fr: "Électrique", ar: "الكهربائية" } },
      { id: 403, name: { en: "Civil", fr: "Civil", ar: "المدنية" } },
      { id: 404, name: { en: "Robotics", fr: "Robotique", ar: "الروبوتات" } },
      { id: 405, name: { en: "AI in Engineering", fr: "IA en Ingénierie", ar: "الذكاء الاصطناعي" } },
      { id: 406, name: { en: "Energy Systems", fr: "Systèmes Énergie", ar: "أنظمة الطاقة" } },
      { id: 407, name: { en: "Aerospace", fr: "Aérospatiale", ar: "الفضائية" } },
      { id: 408, name: { en: "Automotive", fr: "Automobile", ar: "السيارات" } }
    ]
  },
  {
    id: 5,
    name: {
      en: "Language",
      fr: "Langue",
      ar: "اللغة"
    },
    subcategories: [
      { id: 501, name: { en: "English", fr: "Anglais", ar: "الإنجليزية" } },
      { id: 502, name: { en: "French", fr: "Français", ar: "الفرنسية" } },
      { id: 503, name: { en: "Spanish", fr: "Espagnol", ar: "الإسبانية" } },
      { id: 504, name: { en: "Arabic", fr: "Arabe", ar: "العربية" } },
      { id: 505, name: { en: "Chinese", fr: "Chinois", ar: "الصينية" } },
      { id: 506, name: { en: "Public Speaking", fr: "Oratoire", ar: "التحدث العام" } },
      { id: 507, name: { en: "Sign Language", fr: "Langue des signes", ar: "لغة الإشارة" } },
      { id: 508, name: { en: "Business English", fr: "Anglais des affaires", ar: "الإنجليزية للأعمال" } }
    ]
  },
  {
    id: 6,
    name: {
      en: "Arts & Design",
      fr: "Arts & Design",
      ar: "الفنون والتصميم"
    },
    subcategories: [
      { id: 601, name: { en: "Graphic Design", fr: "Design Graphique", ar: "التصميم الجرافيكي" } },
      { id: 602, name: { en: "Fine Arts", fr: "Beaux-Arts", ar: "الفنون الجميلة" } },
      { id: 603, name: { en: "Photography", fr: "Photographie", ar: "التصوير الفوتوغرافي" } },
      { id: 604, name: { en: "Interior Design", fr: "Décoration Intérieure", ar: "تصميم الداخلي" } },
      { id: 605, name: { en: "Fashion Design", fr: "Design de Mode", ar: "تصميم الأزياء" } },
      { id: 606, name: { en: "Digital Art", fr: "Art Numérique", ar: "الفن الرقمي" } },
      { id: 607, name: { en: "Architecture", fr: "Architecture", ar: "الهندسة المعمارية" } },
      { id: 608, name: { en: "UI/UX Design", fr: "Design UI/UX", ar: "تصميم واجهة المستخدم" } }
    ]
  },
  {
    id: 7,
    name: {
      en: "Science & Research",
      fr: "Sciences & Recherche",
      ar: "العلوم والبحث"
    },
    subcategories: [
      { id: 701, name: { en: "Physics", fr: "Physique", ar: "الفيزياء" } },
      { id: 702, name: { en: "Chemistry", fr: "Chimie", ar: "الكيمياء" } },
      { id: 703, name: { en: "Biology", fr: "Biologie", ar: "الأحياء" } },
      { id: 704, name: { en: "Mathematics", fr: "Mathématiques", ar: "الرياضيات" } },
      { id: 705, name: { en: "Environmental Science", fr: "Sciences de l'environnement", ar: "علوم البيئة" } },
      { id: 706, name: { en: "Research Methods", fr: "Méthodes de recherche", ar: "مناهج البحث" } },
      { id: 707, name: { en: "Laboratory Techniques", fr: "Techniques de laboratoire", ar: "تقنيات المعمل" } },
      { id: 708, name: { en: "Scientific Writing", fr: "Rédaction scientifique", ar: "الكتابة العلمية" } }
    ]
  },
  {
    id: 8,
    name: {
      en: "Education & Teaching",
      fr: "Éducation & Enseignement",
      ar: "التعليم والتدريس"
    },
    subcategories: [
      { id: 801, name: { en: "Teaching Methods", fr: "Méthodes d'enseignement", ar: "طرق التدريس" } },
      { id: 802, name: { en: "Curriculum Design", fr: "Conception des programmes", ar: "تصميم المناهج" } },
      { id: 803, name: { en: "Classroom Management", fr: "Gestion de classe", ar: "إدارة الفصل الدراسي" } },
      { id: 804, name: { en: "Online Education", fr: "Éducation en ligne", ar: "التعليم عن بعد" } },
      { id: 805, name: { en: "Academic Writing", fr: "Rédaction académique", ar: "الكتابة الأكاديمية" } },
      { id: 806, name: { en: "Educational Technology", fr: "Technologie éducative", ar: "التكنولوجيا التعليمية" } },
      { id: 807, name: { en: "Special Education", fr: "Éducation spécialisée", ar: "التعليم الخاص" } },
      { id: 808, name: { en: "Assessment & Evaluation", fr: "Évaluation", ar: "التقييم والتقويم" } }
    ]
  },
  {
    id: 9,
    name: {
      en: "Media & Entertainment",
      fr: "Médias & Divertissement",
      ar: "الإعلام والترفيه"
    },
    subcategories: [
      { id: 901, name: { en: "Film Making", fr: "Réalisations cinématographiques", ar: "صناعة الأفلام" } },
      { id: 902, name: { en: "Music Production", fr: "Production musicale", ar: "إنتاج الموسيقى" } },
      { id: 903, name: { en: "Video Production", fr: "Production vidéo", ar: "إنتاج الفيديو" } },
      { id: 904, name: { en: "Game Development", fr: "Développement de jeux", ar: "تطوير الألعاب" } },
      { id: 905, name: { en: "Podcasting", fr: "Baladodiffusion", ar: "بث البودكاست" } },
      { id: 906, name: { en: "Social Media Content", fr: "Contenu des médias sociaux", ar: "محتوى وسائل التواصل الاجتماعي" } },
      { id: 907, name: { en: "Voice Acting", fr: "Doublage", ar: "الترجمة الصوتية" } },
      { id: 908, name: { en: "Event Planning", fr: "Organisation d'événements", ar: "تنظيم الفعاليات" } }
    ]
  },
  {
    id: 10,
    name: {
      en: "Sports & Fitness",
      fr: "Sports & Fitness",
      ar: "الرياضة واللياقة البدنية"
    },
    subcategories: [
      { id: 1001, name: { en: "Professional Sports", fr: "Sports professionnels", ar: "الرياضات المهنية" } },
      { id: 1002, name: { en: "Personal Training", fr: "Entraînement personnel", ar: "التدريب الشخصي" } },
      { id: 1003, name: { en: "Sports Coaching", fr: "Entraînement sportif", ar: "تدريب رياضي" } },
      { id: 1004, name: { en: "Nutrition & Supplements", fr: "Nutrition et suppléments", ar: "التغذية والمكملات" } },
      { id: 1005, name: { en: "Strength Training", fr: "Entraînement de force", ar: "تدريب القوة" } },
      { id: 1006, name: { en: "Team Sports", fr: "Sports d'équipe", ar: "الرياضات الجماعية" } },
      { id: 1007, name: { en: "Marathon & Running", fr: "Marathon et course", ar: "الماراثون والجري" } },
      { id: 1008, name: { en: "Martial Arts", fr: "Arts martiaux", ar: "الفنون القتالية" } }
    ]
  },
  {
    id: 11,
    name: {
      en: "Lifestyle",
      fr: "Mode de vie",
      ar: "نمط الحياة"
    },
    subcategories: [
      { id: 1101, name: { en: "Cooking", fr: "Cuisine", ar: "الطهي" } },
      { id: 1102, name: { en: "Travel", fr: "Voyage", ar: "السفر" } },
      { id: 1103, name: { en: "Fashion", fr: "Mode", ar: "الموضة" } },
      { id: 1104, name: { en: "Home Improvement", fr: "Amélioration de la maison", ar: "تحسين المنزل" } },
      { id: 1105, name: { en: "Parenting", fr: "Parentalité", ar: "الأبوة والأمومة" } },
      { id: 1106, name: { en: "Pet Care", fr: "Soins aux animaux", ar: "رعاية الحيوانات الأليفة" } },
      { id: 1107, name: { en: "DIY Projects", fr: "Projets DIY", ar: "مشاريع DIY" } },
      { id: 1108, name: { en: "Gardening", fr: "Jardinage", ar: "الزراعة" } }
    ]
  },
  {
    id: 12,
    name: {
      en: "Personal Development",
      fr: "Développement Personnel",
      ar: "التنمية الذاتية"
    },
    subcategories: [
      { id: 1201, name: { en: "Time Management", fr: "Gestion du temps", ar: "إدارة الوقت" } },
      { id: 1202, name: { en: "Productivity", fr: "Productivité", ar: "الإنتاجية" } },
      { id: 1203, name: { en: "Motivation", fr: "Motivation", ar: "التحفيز" } },
      { id: 1204, name: { en: "Leadership", fr: "Leadership", ar: "القيادة" } },
      { id: 1205, name: { en: "Communication Skills", fr: "Compétences en communication", ar: "مهارات التواصل" } },
      { id: 1206, name: { en: "Emotional Intelligence", fr: "Intelligence émotionnelle", ar: "الذكاء العاطفي" } },
      { id: 1207, name: { en: "Goal Setting", fr: "Fixation d'objectifs", ar: "إعداد الأهداف" } },
      { id: 1208, name: { en: "Self-Confidence", fr: "Confiance en soi", ar: "الثقة بالنفس" } }
    ]
  }
];
