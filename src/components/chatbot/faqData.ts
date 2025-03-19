
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export const faqData: FAQ[] = [
  {
    id: "faq-1",
    question: "How do I create an account?",
    answer: "To create an account, click on the 'Sign Up' button in the top right corner of the page. You'll need to provide your email address, create a password, and fill in some basic profile information.",
    keywords: ["account", "create account", "sign up", "register", "new account"],
    category: "account"
  },
  {
    id: "faq-2",
    question: "How can I reset my password?",
    answer: "To reset your password, click on the 'Login' button, then select 'Forgot Password'. Enter your email address and follow the instructions sent to your email to create a new password.",
    keywords: ["password", "reset password", "forgot password", "change password", "lost password"],
    category: "account"
  },
  {
    id: "faq-3",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for center subscriptions and bookings.",
    keywords: ["payment", "pay", "credit card", "paypal", "bank transfer"],
    category: "payment"
  },
  {
    id: "faq-4",
    question: "How do I book a training session?",
    answer: "To book a training session, navigate to the center's profile page, select your preferred date and time from the availability calendar, and click 'Book Now'. Follow the checkout process to confirm your booking.",
    keywords: ["book", "booking", "session", "class", "appointment", "schedule"],
    category: "booking"
  },
  {
    id: "faq-5",
    question: "What is your cancellation policy?",
    answer: "Our cancellation policy depends on the center's individual terms. Most centers allow free cancellation up to 24 hours before the scheduled session. Check the center's profile for specific policies.",
    keywords: ["cancel", "cancellation", "refund", "reschedule"],
    category: "booking"
  },
  {
    id: "faq-6",
    question: "How do I become a training center on the platform?",
    answer: "To list your training center, go to the 'For Training Centers' section and click 'Get Started'. You'll need to complete a registration form, verify your business information, and set up your center profile.",
    keywords: ["center", "list center", "become provider", "create center"],
    category: "centers"
  },
  {
    id: "faq-7",
    question: "How does the platform match students with training centers?",
    answer: "Our platform uses location, category preferences, and specific search criteria to match students with appropriate training centers. Centers can be found through search, browsing categories, or our recommendation system.",
    keywords: ["match", "find", "discover", "recommendation"],
    category: "general"
  },
  {
    id: "faq-8",
    question: "Is my personal information secure?",
    answer: "Yes, we take security seriously. We use industry-standard encryption for all personal and payment information. Our privacy policy details how we collect, use, and protect your data.",
    keywords: ["security", "privacy", "data", "personal information", "secure"],
    category: "security"
  }
];

export const findFAQs = (query: string): FAQ[] => {
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  
  return faqData
    .map(faq => {
      // Calculate relevance score based on keyword matching
      let score = 0;
      
      // Check direct question match
      if (faq.question.toLowerCase().includes(normalizedQuery)) {
        score += 5;
      }
      
      // Check keyword matches
      faq.keywords.forEach(keyword => {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
          score += 3;
        }
        
        // Check individual word matches
        words.forEach(word => {
          if (keyword.toLowerCase().includes(word) && word.length > 2) {
            score += 1;
          }
        });
      });
      
      return { ...faq, score };
    })
    .filter(faq => faq.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};
