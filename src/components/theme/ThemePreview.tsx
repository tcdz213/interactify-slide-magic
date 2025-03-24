
import React from "react";
import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  themeValue: string;
  systemTheme?: 'light' | 'dark';
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ themeValue, systemTheme }) => {
  // For system theme, use the detected system preference
  const isDarkVariant = 
    themeValue === 'dark' || 
    (themeValue === 'system' && systemTheme === 'dark');
  
  const isHighContrast = themeValue === 'high-contrast';

  if (themeValue === 'high-contrast') {
    return (
      <div className="w-full h-24 rounded-md overflow-hidden border shadow-sm">
        <div className="w-full h-6 bg-black flex items-center px-2">
          <div className="w-3 h-3 rounded-full bg-[#f2e200] mr-1"></div>
          <div className="w-3 h-3 rounded-full bg-[#00c3ff] mr-1"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffffff]"></div>
        </div>
        <div className="p-2 bg-black h-full">
          <div className="h-4 w-3/4 mb-2 bg-[#f2e200] rounded-sm"></div>
          <div className="h-3 w-full mb-1 bg-[#00c3ff] rounded-sm"></div>
          <div className="h-3 w-5/6 bg-[#00c3ff] rounded-sm"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-24 rounded-md overflow-hidden border shadow-sm">
      <div className={`w-full h-6 ${isDarkVariant ? 'bg-[#122620]' : 'bg-[#f4ebd0]'} flex items-center px-2`}>
        <div className="w-3 h-3 rounded-full bg-[#93732f] mr-1"></div>
        <div className="w-3 h-3 rounded-full bg-[#c3973f] mr-1"></div>
        <div className={`w-3 h-3 rounded-full ${isDarkVariant ? 'bg-[#f4ebd0]' : 'bg-[#122620]'}`}></div>
      </div>
      <div className={`p-2 ${isDarkVariant ? 'bg-[#122620]' : 'bg-[#f4ebd0]'} h-full`}>
        <div className="h-4 w-3/4 mb-2 bg-[#93732f] rounded-sm"></div>
        <div className="h-3 w-full mb-1 bg-[#d6ad60]/50 rounded-sm"></div>
        <div className="h-3 w-5/6 bg-[#d6ad60]/50 rounded-sm"></div>
      </div>
    </div>
  );
};

export default ThemePreview;
