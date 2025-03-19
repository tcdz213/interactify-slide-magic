
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrowseCategoryButton = () => {
  return (
    <Link to="/categories">
      <Button variant="outline" className="flex items-center gap-2">
        Browse by Category
        <ChevronRight className="h-4 w-4" />
      </Button>
    </Link>
  );
};

export default BrowseCategoryButton;
