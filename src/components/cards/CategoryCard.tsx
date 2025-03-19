
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  color: string;
  href: string;
}

const CategoryCard = ({ title, icon: Icon, description, color, href }: CategoryCardProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(href)}
    >
      <Card className="h-full cursor-pointer border-0 shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center text-center h-full">
          <div className={`h-14 w-14 rounded-full ${color} flex items-center justify-center mb-5`}>
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm flex-grow">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;
