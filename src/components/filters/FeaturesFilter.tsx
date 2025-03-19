
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CheckboxFilterGroup from './CheckboxFilterGroup';
import { availableFeatures } from './types';

type FeaturesFilterProps = {
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
};

const FeaturesFilter = ({ selectedFeatures, onChange }: FeaturesFilterProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="features">
        <AccordionTrigger className="text-sm font-medium py-2">Features</AccordionTrigger>
        <AccordionContent>
          <CheckboxFilterGroup
            title=""
            options={availableFeatures}
            selectedValues={selectedFeatures}
            onChange={onChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FeaturesFilter;
