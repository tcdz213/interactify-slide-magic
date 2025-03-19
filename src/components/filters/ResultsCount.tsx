
import { Grid2X2, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SortSelect from './SortSelect';

type ResultsCountProps = {
  totalResults: number;
  sort: string;
  onSortChange: (value: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
};

const ResultsCount = ({ 
  totalResults, 
  sort, 
  onSortChange, 
  viewMode, 
  onViewModeChange 
}: ResultsCountProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-sm md:text-base font-medium">{totalResults} results</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <SortSelect 
          value={sort}
          onChange={onSortChange}
        />
        
        {viewMode && onViewModeChange && (
          <Tabs value={viewMode} onValueChange={(value) => onViewModeChange(value as 'grid' | 'list')}>
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="px-2 h-7">
                <Grid2X2 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-2 h-7">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ResultsCount;
