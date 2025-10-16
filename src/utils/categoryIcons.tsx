import { Icon, IconName } from '@/components/ui/icon';
import React from 'react';

// Category icon mapping function - now works with domain keys
export const getDomainIcon = (domainKey: string): React.ReactNode => {
  const iconName = getDomainIconName(domainKey);
  return <Icon name={iconName} className="inline-block" />;
};

// Get icon name for a domain key
export const getDomainIconName = (domainKey: string): IconName => {
  switch (domainKey) {
    case "automobile":
      return "autoServices";
    case "construction":
      return "construction";
    case "stores":
      return "commerce";
    case "professional":
      return "administrative";
    case "education":
      return "graduation";
    case "real_estate":
      return "realEstate";
    case "health":
      return "health";
    case "events":
      return "events";
    case "technology":
      return "technology";
    case "animals":
      return "agriculture";
    case "logistics":
      return "transport";
    case "home_services":
      return "tools";
    case "food":
      return "restaurant";
    case "beauty":
      return "sports";
    case "other_services":
      return "legal";
    default:
      return "defaultCategory";
  }
};

// Beautiful color palette for categories
const beautifulColors = [
  // Vibrant Blues & Cyans
  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  "bg-sky-500/15 text-sky-400 border-sky-500/25",
  
  // Rich Purples & Violets  
  "bg-purple-500/15 text-purple-400 border-purple-500/25",
  "bg-violet-500/15 text-violet-400 border-violet-500/25",
  "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  
  // Warm Pinks & Roses
  "bg-pink-500/15 text-pink-400 border-pink-500/25",
  "bg-rose-500/15 text-rose-400 border-rose-500/25",
  "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25",
  
  // Fresh Greens
  "bg-green-500/15 text-green-400 border-green-500/25",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "bg-teal-500/15 text-teal-400 border-teal-500/25",
  
  // Energetic Oranges & Yellows
  "bg-orange-500/15 text-orange-400 border-orange-500/25",
  "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  
  // Bold Reds
  "bg-red-500/15 text-red-400 border-red-500/25",
  
  // Premium Grays & Slates
  "bg-slate-500/15 text-slate-400 border-slate-500/25",
  "bg-gray-500/15 text-gray-400 border-gray-500/25",
  
  // Unique Colors
  "bg-lime-500/15 text-lime-400 border-lime-500/25",
  "bg-stone-500/15 text-stone-400 border-stone-500/25",
];

// Generate a hash from ID to ensure consistent color assignment
const hashNumber = (num: number): number => {
  return Math.abs(num * 2654435761) % 2147483647;
};

// Category colors mapping with dynamic beautiful colors
export const getDomainColor = (domainKey: string): string => {
  // Predefined colors for known domains
  const predefinedColors: Record<string, string> = {
    "automobile": "bg-slate-500/15 text-slate-400 border-slate-500/25",
    "construction": "bg-amber-500/15 text-amber-400 border-amber-500/25",
    "stores": "bg-purple-500/15 text-purple-400 border-purple-500/25",
    "professional": "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
    "education": "bg-green-500/15 text-green-400 border-green-500/25",
    "real_estate": "bg-orange-500/15 text-orange-400 border-orange-500/25",
    "health": "bg-blue-500/15 text-blue-400 border-blue-500/25",
    "events": "bg-pink-500/15 text-pink-400 border-pink-500/25",
    "technology": "bg-purple-500/15 text-purple-400 border-purple-500/25",
    "animals": "bg-green-500/15 text-green-400 border-green-500/25",
    "logistics": "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    "home_services": "bg-rose-500/15 text-rose-400 border-rose-500/25",
    "food": "bg-orange-500/15 text-orange-400 border-orange-500/25",
    "beauty": "bg-teal-500/15 text-teal-400 border-teal-500/25",
    "other_services": "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  };
  
  // Return predefined color if exists
  if (predefinedColors[domainKey]) {
    return predefinedColors[domainKey];
  }
  
  // For new domains, use hash-based color selection for consistency
  const hash = domainKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % beautifulColors.length;
  return beautifulColors[colorIndex];
};

// Get background gradient for icon containers (enhanced visual appeal)
export const getDomainGradient = (domainKey: string): string => {
  const gradients = [
    "bg-gradient-to-br from-blue-500/20 to-cyan-500/10",
    "bg-gradient-to-br from-purple-500/20 to-pink-500/10", 
    "bg-gradient-to-br from-green-500/20 to-teal-500/10",
    "bg-gradient-to-br from-orange-500/20 to-red-500/10",
    "bg-gradient-to-br from-indigo-500/20 to-purple-500/10",
    "bg-gradient-to-br from-pink-500/20 to-rose-500/10",
    "bg-gradient-to-br from-teal-500/20 to-green-500/10",
    "bg-gradient-to-br from-amber-500/20 to-orange-500/10",
    "bg-gradient-to-br from-violet-500/20 to-purple-500/10",
    "bg-gradient-to-br from-cyan-500/20 to-blue-500/10",
    "bg-gradient-to-br from-emerald-500/20 to-teal-500/10",
    "bg-gradient-to-br from-rose-500/20 to-pink-500/10",
    "bg-gradient-to-br from-sky-500/20 to-blue-500/10",
    "bg-gradient-to-br from-lime-500/20 to-green-500/10",
    "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/10",
    "bg-gradient-to-br from-yellow-500/20 to-amber-500/10",
    "bg-gradient-to-br from-red-500/20 to-rose-500/10",
    "bg-gradient-to-br from-slate-500/20 to-gray-500/10",
    "bg-gradient-to-br from-stone-500/20 to-slate-500/10",
    "bg-gradient-to-br from-gray-500/20 to-slate-500/10",
  ];
  
  const hash = domainKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = hash % gradients.length;
  return gradients[gradientIndex];
};
