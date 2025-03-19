
import React, { useState } from 'react';
import { Award, PlusCircle, Trash2, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Education {
  id: number;
  degree: string;
  institution: string;
  year: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  year: string;
}

interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
}

interface TeacherQualificationsProps {
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  editMode?: boolean;
  onUpdateExperience?: (updatedExperience: Experience[]) => void;
  onUpdateEducation?: (updatedEducation: Education[]) => void;
  onUpdateCertifications?: (updatedCertifications: Certification[]) => void;
}

export const TeacherQualifications = ({
  experience,
  education,
  certifications,
  editMode = false,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateCertifications
}: TeacherQualificationsProps) => {
  const [editingExperience, setEditingExperience] = useState<Experience[]>(experience);
  const [editingEducation, setEditingEducation] = useState<Education[]>(education);
  const [editingCertifications, setEditingCertifications] = useState<Certification[]>(certifications);
  
  // Experience functions
  const handleAddExperience = () => {
    const newExperience = {
      id: Date.now(),
      role: '',
      company: '',
      period: '',
      description: ''
    };
    setEditingExperience([...editingExperience, newExperience]);
  };

  const handleUpdateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...editingExperience];
    updated[index] = { ...updated[index], [field]: value };
    setEditingExperience(updated);
  };

  const handleRemoveExperience = (index: number) => {
    const updated = [...editingExperience];
    updated.splice(index, 1);
    setEditingExperience(updated);
  };

  const saveExperience = () => {
    if (onUpdateExperience) {
      onUpdateExperience(editingExperience);
    }
  };

  // Education functions
  const handleAddEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      institution: '',
      year: ''
    };
    setEditingEducation([...editingEducation, newEducation]);
  };

  const handleUpdateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...editingEducation];
    updated[index] = { ...updated[index], [field]: value };
    setEditingEducation(updated);
  };

  const handleRemoveEducation = (index: number) => {
    const updated = [...editingEducation];
    updated.splice(index, 1);
    setEditingEducation(updated);
  };

  const saveEducation = () => {
    if (onUpdateEducation) {
      onUpdateEducation(editingEducation);
    }
  };

  // Certification functions
  const handleAddCertification = () => {
    const newCertification = {
      id: Date.now(),
      name: '',
      issuer: '',
      year: ''
    };
    setEditingCertifications([...editingCertifications, newCertification]);
  };

  const handleUpdateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...editingCertifications];
    updated[index] = { ...updated[index], [field]: value };
    setEditingCertifications(updated);
  };

  const handleRemoveCertification = (index: number) => {
    const updated = [...editingCertifications];
    updated.splice(index, 1);
    setEditingCertifications(updated);
  };

  const saveCertifications = () => {
    if (onUpdateCertifications) {
      onUpdateCertifications(editingCertifications);
    }
  };

  // Render functions
  const renderExperience = () => {
    if (editMode) {
      return (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Work Experience</h3>
            <Button variant="ghost" size="sm" onClick={handleAddExperience}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-4">
            {editingExperience.map((exp, index) => (
              <div key={exp.id} className="border p-3 rounded-md">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveExperience(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Input 
                      value={exp.role} 
                      onChange={(e) => handleUpdateExperience(index, 'role', e.target.value)} 
                      placeholder="Position/Role"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input 
                      value={exp.company} 
                      onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)} 
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Period</label>
                    <Input 
                      value={exp.period} 
                      onChange={(e) => handleUpdateExperience(index, 'period', e.target.value)} 
                      placeholder="e.g. 2020 - Present"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      value={exp.description} 
                      onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)} 
                      placeholder="Brief description of your role"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={saveExperience}>
                <Save className="h-4 w-4 mr-2" /> Save Experience
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Work Experience</h3>
        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id} className="border-l-2 border-primary pl-4 pb-4">
              <h4 className="font-medium">{exp.role}</h4>
              <p className="text-muted-foreground">{exp.company} | {exp.period}</p>
              <p className="mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (editMode) {
      return (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Education</h3>
            <Button variant="ghost" size="sm" onClick={handleAddEducation}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-4">
            {editingEducation.map((edu, index) => (
              <div key={edu.id} className="border p-3 rounded-md">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveEducation(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Degree</label>
                    <Input 
                      value={edu.degree} 
                      onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)} 
                      placeholder="e.g. BSc Computer Science"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Institution</label>
                    <Input 
                      value={edu.institution} 
                      onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)} 
                      placeholder="University/College Name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Input 
                      value={edu.year} 
                      onChange={(e) => handleUpdateEducation(index, 'year', e.target.value)} 
                      placeholder="e.g. 2020"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={saveEducation}>
                <Save className="h-4 w-4 mr-2" /> Save Education
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Education</h3>
        <div className="space-y-3">
          {education.map((edu) => (
            <div key={edu.id} className="flex gap-2">
              <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">{edu.degree}</h4>
                <p className="text-muted-foreground">{edu.institution}, {edu.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (editMode) {
      return (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Certifications</h3>
            <Button variant="ghost" size="sm" onClick={handleAddCertification}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-4">
            {editingCertifications.map((cert, index) => (
              <div key={cert.id} className="border p-3 rounded-md">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveCertification(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Certification Name</label>
                    <Input 
                      value={cert.name} 
                      onChange={(e) => handleUpdateCertification(index, 'name', e.target.value)} 
                      placeholder="e.g. AWS Certified Developer"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Issuing Organization</label>
                    <Input 
                      value={cert.issuer} 
                      onChange={(e) => handleUpdateCertification(index, 'issuer', e.target.value)} 
                      placeholder="e.g. Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Input 
                      value={cert.year} 
                      onChange={(e) => handleUpdateCertification(index, 'year', e.target.value)} 
                      placeholder="e.g. 2022"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={saveCertifications}>
                <Save className="h-4 w-4 mr-2" /> Save Certifications
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Certifications</h3>
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex gap-2">
              <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">{cert.name}</h4>
                <p className="text-muted-foreground">{cert.issuer}, {cert.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderExperience()}
      {renderEducation()}
      {renderCertifications()}
    </div>
  );
};
