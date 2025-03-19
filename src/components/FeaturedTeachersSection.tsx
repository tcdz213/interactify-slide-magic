
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedTeachersSection = () => {
  return (
    <section id="featured-teachers" className="section-padding bg-accent/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn From Expert Teachers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform connects you with highly qualified instructors who are passionate about education
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-background rounded-xl shadow-md overflow-hidden hover-card-effect">
              <div className="h-48 bg-primary/10 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xl font-bold">T{item}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Teacher Name {item}</h3>
                <p className="text-muted-foreground mb-4">Expert in Subject Area {item}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map((star) => (
                        <div key={star} className="w-6 h-6 rounded-full bg-secondary/30 flex items-center justify-center text-xs">
                          ★
                        </div>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">4.9 (120 reviews)</span>
                  </div>
                  <Button variant="ghost" size="sm" className="group">
                    View Profile
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button variant="outline" className="rounded-full">
            Browse All Teachers <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachersSection;
