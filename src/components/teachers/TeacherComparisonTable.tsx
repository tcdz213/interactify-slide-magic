
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Star, MapPin, Clock, GraduationCap, DollarSign } from "lucide-react";
import { useTeacherComparison } from "@/hooks/teachers/useTeacherComparison";

const TeacherComparisonTable = () => {
  const { compareTeachers, removeFromComparison, clearComparison } = useTeacherComparison();
  
  if (compareTeachers.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold mb-2">No teachers to compare</h3>
        <p className="text-muted-foreground mb-6">
          Add teachers to comparison by clicking the "Compare" button on teacher cards
        </p>
      </div>
    );
  }

  // Extract all unique skills across all teachers
  const allSkills = Array.from(
    new Set(
      compareTeachers.flatMap((teacher: any) => 
        teacher.specialties || teacher.subjects || []
      )
    )
  ).sort();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teacher Comparison</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearComparison}
          className="text-muted-foreground"
        >
          Clear All
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] bg-muted/50">Teacher Details</TableHead>
              {compareTeachers.map((teacher: any) => (
                <TableHead key={String(teacher.id)} className="min-w-[200px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{teacher.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                        onClick={() => removeFromComparison(teacher.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {teacher.role || teacher.specialization || "Teacher"}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Location */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </TableCell>
              {compareTeachers.map((teacher: any) => (
                <TableCell key={`${String(teacher.id)}-location`}>
                  {teacher.location}
                </TableCell>
              ))}
            </TableRow>

            {/* Experience */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Experience
              </TableCell>
              {compareTeachers.map((teacher: any) => (
                <TableCell key={`${String(teacher.id)}-experience`} className="font-semibold">
                  {teacher.experience}
                </TableCell>
              ))}
            </TableRow>

            {/* Rating */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Rating</TableCell>
              {compareTeachers.map((teacher: any) => (
                <TableCell key={`${String(teacher.id)}-rating`}>
                  {teacher.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{teacher.rating.toFixed(1)}</span>
                      {teacher.reviewCount && (
                        <span className="text-muted-foreground text-xs">({teacher.reviewCount})</span>
                      )}
                    </div>
                  ) : (
                    "Not rated"
                  )}
                </TableCell>
              ))}
            </TableRow>

            {/* Hourly Rate */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Hourly Rate
              </TableCell>
              {compareTeachers.map((teacher: any) => (
                <TableCell key={`${String(teacher.id)}-hourlyRate`}>
                  {teacher.hourlyRate ? `$${teacher.hourlyRate}` : "Not specified"}
                </TableCell>
              ))}
            </TableRow>

            {/* Availability */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20 flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Availability
              </TableCell>
              {compareTeachers.map((teacher: any) => (
                <TableCell key={`${String(teacher.id)}-availability`}>
                  {teacher.availability}
                </TableCell>
              ))}
            </TableRow>

            {/* Bio */}
            <TableRow>
              <TableCell className="font-medium bg-muted/20">Bio</TableCell>
              {compareTeachers.map((teacher: any) => (
                <TableCell key={`${String(teacher.id)}-bio`} className="max-w-[300px]">
                  <p className="line-clamp-3 text-sm">{teacher.bio || "No bio available"}</p>
                </TableCell>
              ))}
            </TableRow>

            {/* Skills/Specialties */}
            <TableRow>
              <TableCell 
                colSpan={compareTeachers.length + 1} 
                className="font-semibold bg-muted/50 text-center"
              >
                Skills & Specialties
              </TableCell>
            </TableRow>
            
            {allSkills.map((skill) => (
              <TableRow key={String(skill)}>
                <TableCell className="font-medium bg-muted/20 capitalize">
                  {typeof skill === 'string' ? skill.replace('_', ' ') : String(skill)}
                </TableCell>
                {compareTeachers.map((teacher: any) => {
                  const hasSkill = (teacher.specialties || []).includes(skill) || 
                                  (teacher.subjects || []).includes(skill);
                  return (
                    <TableCell key={`${String(teacher.id)}-${String(skill)}`} className="text-center">
                      {hasSkill ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                          No
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeacherComparisonTable;
