
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewJobDialog = ({ open, onOpenChange }: NewJobDialogProps) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Post a New Teaching Position</DialogTitle>
        <DialogDescription>
          Create a new job listing for teachers to apply to your center.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Job Title
          </Label>
          <Input id="title" placeholder="e.g. JavaScript Instructor" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="center" className="text-right">
            Center
          </Label>
          <Select defaultValue="tech_hub">
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select center" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech_hub">Tech Training Hub</SelectItem>
              <SelectItem value="code_academy">Code Academy</SelectItem>
              <SelectItem value="digital_institute">Digital Skills Institute</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            Location
          </Label>
          <Input id="location" placeholder="e.g. San Francisco, CA" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Job Type
          </Label>
          <Select defaultValue="full_time">
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full-time</SelectItem>
              <SelectItem value="part_time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="salary" className="text-right">
            Salary Range
          </Label>
          <Input id="salary" placeholder="e.g. $70,000 - $90,000" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="text-right pt-2">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the job responsibilities, requirements, and benefits..."
            className="col-span-3"
            rows={5}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={() => onOpenChange(false)}>
          Post Job
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
