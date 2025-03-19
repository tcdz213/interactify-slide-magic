
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ratings } from './types';

type RatingFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

const RatingFilter = ({ value, onChange }: RatingFilterProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Rating</h3>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select minimum rating" />
        </SelectTrigger>
        <SelectContent>
          {ratings.map((rating) => (
            <SelectItem key={rating.value} value={rating.value}>
              {rating.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RatingFilter;
