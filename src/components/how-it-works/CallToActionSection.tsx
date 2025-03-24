
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Mail } from 'lucide-react';

const CallToActionSection = () => {
  return (
    <div className="mt-24 rounded-xl p-8 md:p-12 cta-section">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">
            Ready to Find Your <span className="cta-highlight">Perfect Training Center</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of learners who have found their ideal training path through our platform.
          </p>
          
          <div className="hidden md:block">
            <Separator className="my-6 cta-divider" />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="pl-10 py-6 cta-input" 
                />
              </div>
              <Button size="lg" className="cta-button">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg p-6 cta-card">
          <h3 className="text-xl font-semibold mb-4">Quick Start Options</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Browse Training Centers</h4>
                <p className="text-sm text-muted-foreground">
                  Explore our curated list of top-rated centers
                </p>
              </div>
            </div>
            
            <Separator className="cta-divider" />
            
            <div className="flex items-start gap-3">
              <div className="bg-secondary/10 text-secondary p-2 rounded-full">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Compare Courses</h4>
                <p className="text-sm text-muted-foreground">
                  Side-by-side comparison of different programs
                </p>
              </div>
            </div>
            
            <Separator className="cta-divider" />
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Contact Centers Directly</h4>
                <p className="text-sm text-muted-foreground">
                  Get in touch with your preferred training providers
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:hidden">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="pl-10 py-6 cta-input" 
                />
              </div>
              <Button size="lg" className="cta-button">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;
