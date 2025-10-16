import React from 'react';
import {
  Home, Search, Plus, User, BarChart3, QrCode, Filter, Heart,
  X, Check, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, MoreHorizontal,
  XCircle, Trash2, AlertTriangle, Flag, CreditCard, FolderTree,
  Phone, Mail, MessageCircle, Share2, Calendar, Globe, ExternalLink,
  MapPin, Clock, Eye, Save, Star, Edit, Settings, Menu,
  TrendingUp, Users, Zap, SlidersHorizontal,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Circle, CheckCircle, Sparkles, Scan, Languages, ShieldCheck,
  Sun, Moon, Monitor, Palette, Smartphone, Tablet, Mouse,
  Car, BookOpen, ShoppingBag, Stethoscope, Compass, Hammer,
  Store, Briefcase, GraduationCap, Building, Heart as HeartPulse, Gift,
  Laptop, Sprout, Truck, Wrench, Utensils, Dumbbell, Scale,
  House, CalendarDays, Upload, Image, Loader2, Send, type LucideIcon
} from 'lucide-react';

// Icon mapping for easy usage
export const Icons = {
  // Navigation
  home: Home,
  search: Search,
  plus: Plus,
  user: User,
  barChart: BarChart3,
  qrCode: QrCode,
  filter: Filter,
  heart: Heart,
  
  // Actions
  close: X,
  x: X,
  check: Check,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  more: MoreHorizontal,
  moreHorizontal: MoreHorizontal,
  
  // Interface
  eye: Eye,
  save: Save,
  star: Star,
  edit: Edit,
  settings: Settings,
  menu: Menu,
  sparkles: Sparkles,
  
  // Communication
  phone: Phone,
  mail: Mail,
  message: MessageCircle,
  share: Share2,
  calendar: Calendar,
  globe: Globe,
  externalLink: ExternalLink,
  
  // Location & Time
  mapPin: MapPin,
  clock: Clock,
  
  // Trends & Analytics
  trendingUp: TrendingUp,
  users: Users,
  zap: Zap,
  slidersHorizontal: SlidersHorizontal,
  
  // Chevrons
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // Shapes & Special
  circle: Circle,
  checkCircle: CheckCircle,
  gripVertical: Menu,
  panelLeft: Menu,
  
  // Theme icons
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  
  // Social Platforms
  youtube: ExternalLink,
  twitter: ExternalLink,
  instagram: ExternalLink,
  facebook: ExternalLink,
  
  // Additional icons
  scan: Scan,
  languages: Languages,
  verified: ShieldCheck,
  navigation: Compass,
  palette: Palette,
  
  // Device icons
  smartphone: Smartphone,
  tablet: Tablet,
  mouse: Mouse,
  
  // Category/Domain Icons
  healthcare: Stethoscope,
  beautyPersonalCare: Palette,
  foodBeverage: ShoppingBag,
  autoServices: Car,
  itSoftwareServices: Laptop,
  educationTraining: BookOpen,
  professionalServices: Users,
  homeServices: Wrench,
  defaultCategory: ShoppingBag,
  
  // Enhanced Category Icons
  construction: Hammer,
  commerce: Store,
  administrative: Briefcase,
  graduation: GraduationCap,
  realEstate: Building,
  health: HeartPulse,
  events: Gift,
  technology: Laptop,
  agriculture: Sprout,
  transport: Truck,
  tools: Wrench,
  restaurant: Utensils,
  sports: Dumbbell,
  legal: Scale,
  house: House,
  calendarEvent: CalendarDays,
  
  // Dot for OTP
  dot: Circle,
  
  // Admin & Management
  creditCard: CreditCard,
  folderTree: FolderTree,
  alertTriangle: AlertTriangle,
  trash: Trash2,
  xCircle: XCircle,
  flag: Flag,
  
  // Additional
  upload: Upload,
  image: Image,
  loader: Loader2,
  send: Send,
  shield: ShieldCheck,
} as const;

export type IconName = keyof typeof Icons;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

// Main Icon component using Lucide
export const Icon: React.FC<IconProps> = ({ 
  name, 
  className, 
  size = 16, 
  ...props 
}) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${String(name)}" not found`);
    return null;
  }
  
  return (
    <IconComponent 
      className={className} 
      size={size}
      {...props} 
    />
  );
};

// Export for direct usage (backward compatibility)
export { 
  Home, Search, Plus, User, BarChart3, QrCode, Filter, Heart,
  X, Check, ArrowLeft, ArrowRight, Eye, Save, Star,
  Phone, Mail, MessageCircle, Share2, Calendar, MapPin, Clock,
  TrendingUp, Users, Zap, SlidersHorizontal,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal,
  Circle, CheckCircle, Sparkles, Globe, Edit, ExternalLink,
  Scan, Languages, ShieldCheck as Verified, Compass as Navigation,
  Sun, Moon, Monitor, CreditCard, FolderTree, AlertTriangle,
  Trash2, XCircle, Flag
};