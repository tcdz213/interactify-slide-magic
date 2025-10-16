import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
export const CTASection = () => {
  const {
    t
  } = useLanguage();
  return <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 mx-3 mb-6 max-w-7xl sm:mx-4 sm:mb-7 lg:mx-6 lg:mb-8">
      
    </Card>;
};