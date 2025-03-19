
import { Checkbox } from "@/components/ui/checkbox";

type CheckboxOption = {
  id: string;
  label: string;
};

type CheckboxFilterGroupProps = {
  title: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
};

const CheckboxFilterGroup = ({
  title,
  options,
  selectedValues,
  onChange,
}: CheckboxFilterGroupProps) => {
  const toggleOption = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter(id => id !== optionId));
    } else {
      onChange([...selectedValues, optionId]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`option-${option.id}`} 
              checked={selectedValues.includes(option.id)}
              onCheckedChange={() => toggleOption(option.id)}
            />
            <label 
              htmlFor={`option-${option.id}`}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxFilterGroup;
