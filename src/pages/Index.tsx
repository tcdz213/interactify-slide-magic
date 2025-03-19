
import React, { useEffect, useRef } from 'react';
import { ArrowDown, ArrowRight, CheckCircle2, MousePointer } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTAButton from '@/components/CTAButton';
import ImageSlider3D from '@/components/ImageSlider3D';

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  
  // Sample images for our slider
  const imageData = [
    {
      src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      alt: "Person using MacBook Pro"
    },
    {
      src: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      alt: "Woman sitting on a bed using a laptop"
    },
    {
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      alt: "Woman in white long sleeve shirt using laptop"
    },
  ];
  
  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Apply parallax to hero elements
      if (heroRef.current) {
        const heroTitle = heroRef.current.querySelector('.hero-title');
        const heroSubtitle = heroRef.current.querySelector('.hero-subtitle');
        const heroImage = heroRef.current.querySelector('.hero-image');
        
        if (heroTitle) {
          (heroTitle as HTMLElement).style.transform = `translateY(${scrollY * 0.2}px)`;
        }
        
        if (heroSubtitle) {
          (heroSubtitle as HTMLElement).style.transform = `translateY(${scrollY * 0.1}px)`;
        }
        
        if (heroImage) {
          (heroImage as HTMLElement).style.transform = `translateY(${scrollY * -0.15}px)`;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        id="home" 
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/0 pointer-events-none z-10"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-start space-y-8">
              <p className="inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-4 py-1 text-sm font-medium text-muted-foreground animate-fade-in" style={{animationDelay: '0.2s'}}>
                <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
                Designed with precision
              </p>
              
              <h1 className="hero-title text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in" style={{animationDelay: '0.3s'}}>
                Elevate your digital <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">experience</span>
              </h1>
              
              <p className="hero-subtitle text-lg text-muted-foreground sm:text-xl max-w-md animate-fade-in" style={{animationDelay: '0.4s'}}>
                A minimalist design with maximum attention to detail. 
                Clean lines, perfect proportions, and intuitive user experience.
              </p>
              
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                <CTAButton variant="primary" arrow>
                  Get Started
                </CTAButton>
                
                <CTAButton variant="outline">
                  Learn more
                </CTAButton>
              </div>
            </div>
            
            <div className="hero-image relative px-4 sm:px-0 animate-scale-in" style={{animationDelay: '0.6s'}}>
              <div className="relative overflow-hidden rounded-xl border shadow-2xl">
                <ImageSlider3D 
                  images={imageData} 
                  autoSlideInterval={5000}
                  className="aspect-[16/10] w-full"
                />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl animate-pulse-subtle"></div>
              <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-primary/5 blur-xl animate-pulse-subtle"></div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in" style={{animationDelay: '0.8s'}}>
            <a 
              href="#features" 
              className="flex flex-col items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Scroll to features"
            >
              <span className="mb-2">Scroll to explore</span>
              <ArrowDown className="h-4 w-4 animate-float" />
            </a>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-4 py-1 text-sm font-medium text-muted-foreground mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
              Features
            </p>
            <h2 className="section-heading mb-4">Designed for excellence</h2>
            <p className="section-subheading">
              Every detail carefully considered to provide you with the best experience possible.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Intuitive Design",
                description: "Clean interface with intuitive navigation for seamless user experience.",
                icon: <MousePointer className="h-8 w-8" />
              },
              {
                title: "Precision Crafted",
                description: "Every pixel perfectly placed with meticulous attention to detail.",
                icon: <CheckCircle2 className="h-8 w-8" />
              },
              {
                title: "Minimalist Beauty",
                description: "Elegant simplicity that lets your content shine without distractions.",
                icon: <CheckCircle2 className="h-8 w-8" />
              },
              {
                title: "Thoughtful Animation",
                description: "Subtle motion that enhances usability without overwhelming.",
                icon: <CheckCircle2 className="h-8 w-8" />
              },
              {
                title: "Perfect Typography",
                description: "Carefully selected fonts for optimal readability and aesthetic appeal.",
                icon: <CheckCircle2 className="h-8 w-8" />
              },
              {
                title: "Responsive Layout",
                description: "Flawlessly adapts to any screen size for a consistent experience.",
                icon: <CheckCircle2 className="h-8 w-8" />
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Gallery Section */}
      <section id="gallery" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-4 py-1 text-sm font-medium text-muted-foreground mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
              Gallery
            </p>
            <h2 className="section-heading mb-4">See it in action</h2>
            <p className="section-subheading">
              Experience the elegance through our carefully curated gallery.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
              "https://images.unsplash.com/photo-1518770660439-4636190af475",
              "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
              "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
              "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
              "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
            ].map((image, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Gallery image ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-4 py-1 text-sm font-medium text-muted-foreground mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
              Contact
            </p>
            <h2 className="section-heading mb-4">Ready to get started?</h2>
            <p className="section-subheading mb-8">
              Take the first step towards an exceptional digital experience.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton variant="primary" arrow className="w-full sm:w-auto">
                Contact Us
              </CTAButton>
              
              <CTAButton variant="outline" className="w-full sm:w-auto">
                View Documentation
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
