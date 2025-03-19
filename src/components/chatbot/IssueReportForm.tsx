
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IssueReportFormProps {
  onSubmit: (category: string, description: string) => void;
}

export const IssueReportForm = ({ onSubmit }: IssueReportFormProps) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  
  const issueCategories = [
    { value: "technical", label: "Technical Problem" },
    { value: "account", label: "Account Issue" },
    { value: "payment", label: "Payment Problem" },
    { value: "content", label: "Content Issue" },
    { value: "other", label: "Other Issue" }
  ];
  
  return (
    <div className="space-y-4 p-3">
      <h3 className="font-medium">Report an Issue</h3>
      
      <div>
        <Label htmlFor="issue-category">Issue Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="issue-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {issueCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="issue-description">Describe the issue</Label>
        <Textarea
          id="issue-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please provide details about the issue you're experiencing"
          className="resize-none"
          rows={4}
        />
      </div>
      
      <Button 
        onClick={() => onSubmit(category, description)}
        disabled={!category || !description.trim()}
        className="w-full"
      >
        Submit Report
      </Button>
    </div>
  );
};
