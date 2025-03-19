
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locations } from './types';

type LocationSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

const LocationSelect = ({ value, onChange }: LocationSelectProps) => {
  return (
    <Select 
      value={value} 
      onValueChange={onChange}
    >
      <SelectTrigger className="min-w-[180px] py-6 rounded-lg">
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem key={location.value} value={location.value}>
            {location.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocationSelect;
