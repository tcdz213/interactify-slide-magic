
import React, { useState } from 'react';
import { Clock, PlusCircle, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Availability {
  id: number;
  day: string;
  slots: string[];
}

interface TeacherAvailabilityProps {
  availability: Availability[];
  editMode?: boolean;
  onUpdateAvailability?: (updatedAvailability: Availability[]) => void;
}

export const TeacherAvailability = ({ 
  availability,
  editMode = false,
  onUpdateAvailability
}: TeacherAvailabilityProps) => {
  const [editingAvailability, setEditingAvailability] = useState<Availability[]>(availability);
  const [newSlot, setNewSlot] = useState<{ dayIndex: number, slot: string }>({ dayIndex: -1, slot: '' });
  
  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];
  
  const handleAddDay = () => {
    // Find a day that doesn't exist in current availability
    const existingDays = editingAvailability.map(item => item.day);
    const dayToAdd = days.find(day => !existingDays.includes(day)) || days[0];
    
    const newDay = {
      id: Date.now(),
      day: dayToAdd,
      slots: []
    };
    
    setEditingAvailability([...editingAvailability, newDay]);
  };
  
  const handleChangeDay = (index: number, newDay: string) => {
    const updated = [...editingAvailability];
    updated[index] = { ...updated[index], day: newDay };
    setEditingAvailability(updated);
  };
  
  const handleAddSlot = (dayIndex: number) => {
    if (newSlot.slot && newSlot.dayIndex === dayIndex) {
      const updated = [...editingAvailability];
      updated[dayIndex] = { 
        ...updated[dayIndex], 
        slots: [...updated[dayIndex].slots, newSlot.slot] 
      };
      setEditingAvailability(updated);
      setNewSlot({ dayIndex: -1, slot: '' });
    }
  };
  
  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...editingAvailability];
    const slots = [...updated[dayIndex].slots];
    slots.splice(slotIndex, 1);
    updated[dayIndex] = { ...updated[dayIndex], slots };
    setEditingAvailability(updated);
  };
  
  const handleRemoveDay = (index: number) => {
    const updated = [...editingAvailability];
    updated.splice(index, 1);
    setEditingAvailability(updated);
  };
  
  const saveAvailability = () => {
    if (onUpdateAvailability) {
      onUpdateAvailability(editingAvailability);
    }
  };
  
  if (editMode) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Available Teaching Hours</h3>
          <Button variant="ghost" size="sm" onClick={handleAddDay}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add Day
          </Button>
        </div>
        
        <div className="space-y-6">
          {editingAvailability.map((day, dayIndex) => (
            <div key={day.id} className="border p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <Select value={day.day} onValueChange={(value) => handleChangeDay(dayIndex, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveDay(dayIndex)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">{slot}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    placeholder="e.g. 9:00 AM - 12:00 PM" 
                    value={newSlot.dayIndex === dayIndex ? newSlot.slot : ''}
                    onChange={(e) => setNewSlot({ dayIndex, slot: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSlot(dayIndex);
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddSlot(dayIndex)}
                  >
                    Add Slot
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {editingAvailability.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button onClick={saveAvailability}>
                <Save className="h-4 w-4 mr-2" /> Save Availability
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Available Teaching Hours</h3>
      
      <div className="space-y-4">
        {availability.map((day) => (
          <div key={day.id} className="grid grid-cols-[120px_1fr] gap-4 items-start">
            <div className="font-medium">{day.day}</div>
            <div>
              {day.slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{slot}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
