
import { useState } from "react";
import { CenterFormData } from "@/types/center.types";
import { useToast } from "@/components/ui/use-toast";

const defaultFormData: CenterFormData = {
  name: "",
  location: "",
  description: "",
  status: "active",
};

export const useCenterFormState = () => {
  const [formData, setFormData] = useState<CenterFormData>(defaultFormData);
  const { toast } = useToast();

  const resetForm = () => setFormData(defaultFormData);

  return {
    formData,
    setFormData,
    resetForm,
    toast
  };
};
