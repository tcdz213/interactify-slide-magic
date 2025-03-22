
import { Grid2X2, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SortSelect from './SortSelect';
import { Toggle } from "@/components/ui/toggle";

type ResultsCountProps = {
  totalResults: number;
  sort: string;
  onSortChange: (value: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  resultsType?: 'centers' | 'courses';
  onResultsTypeChange?: (type: 'centers' | 'courses') => void;
};

const ResultsCount = ({ 
  totalResults, 
  sort, 
  onSortChange, 
  viewMode, 
  onViewModeChange,
  resultsType,
  onResultsTypeChange
}: ResultsCountProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-sm md:text-base font-medium">{totalResults} results</h2>
        
        {/* Results type toggle */}
        {resultsType && onResultsTypeChange && (
          <div className="hidden sm:flex items-center gap-2 border rounded-lg p-1">
            <Toggle
              pressed={resultsType === 'centers'}
              onPressedChange={() => onResultsTypeChange('centers')}
              variant="outline"
              size="sm"
              className={resultsType === 'centers' ? 'bg-primary text-primary-foreground' : ''}
            >
              Centers
            </Toggle>
            <Toggle
              pressed={resultsType === 'courses'}
              onPressedChange={() => onResultsTypeChange('courses')}
              variant="outline"
              size="sm"
              className={resultsType === 'courses' ? 'bg-primary text-primary-foreground' : ''}
            >
              Courses
            </Toggle>
          </div>
        )}
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
