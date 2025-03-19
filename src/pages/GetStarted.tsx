
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowRight, 
  Mail, 
  User, 
  BookOpen, 
  Search, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Shield 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const GetStarted = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('learner');
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!email || !name) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(2);
      return;
    }
    
    // Here you would normally register the user
    console.log('Registration submitted:', { email, name, userType });
    setSubmitted(true);
    toast.success("Registration successful! Welcome aboard!");
  };

  const features = [
    {
      icon: Search,
      title: "Find Training Centers",
      description: "Discover centers by location, category, price, and ratings"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book sessions instantly with our calendar integration"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Pay safely online with our encrypted payment system"
    },
    {
      icon: BookOpen,
      title: "Track Progress",
      description: "Monitor your learning journey and achievements"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Sign Up Form */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-border/30">
                {!submitted ? (
                  <>
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-semibold mb-2">Get Started Today</h1>
                      <p className="text-muted-foreground">
                        Create your account to begin your learning journey
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                      {step === 1 ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                              <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="pl-10"
                                required
                              />
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="pl-10"
                                required
                              />
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <Button type="submit" className="w-full rounded-lg group">
                              <span>Continue</span>
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <Label>I am a:</Label>
                            <RadioGroup value={userType} onValueChange={setUserType} className="grid grid-cols-1 gap-4">
                              <div className="flex items-center space-x-2 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="learner" id="learner" />
                                <Label htmlFor="learner" className="flex items-center cursor-pointer">
                                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                                  <div>
                                    <span className="font-medium">Learner</span>
                                    <p className="text-sm text-muted-foreground">I want to find and book training centers</p>
                                  </div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="center" id="center" />
                                <Label htmlFor="center" className="flex items-center cursor-pointer">
                                  <User className="h-5 w-5 mr-2 text-primary" />
                                  <div>
                                    <span className="font-medium">Training Center</span>
                                    <p className="text-sm text-muted-foreground">I want to list my training center</p>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <div className="font-medium mb-2">Account Summary</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Name:</div>
                              <div>{name}</div>
                              <div className="text-muted-foreground">Email:</div>
                              <div>{email}</div>
                              <div className="text-muted-foreground">Account Type:</div>
                              <div className="capitalize">{userType}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="terms" className="rounded border-gray-300" required />
                            <label htmlFor="terms" className="text-sm">
                              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setStep(1)}
                              className="flex-grow"
                            >
                              Back
                            </Button>
                            <Button type="submit" className="flex-grow">
                              Create Account
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                        Already have an account? <a href="#" className="text-primary font-medium hover:underline">Sign In</a>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Welcome to TrainingCenter!</h2>
                    <p className="text-muted-foreground mb-6">
                      Your account has been created successfully. Check your email to verify your account and get started.
                    </p>
                    <Button size="lg" className="rounded-lg">
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Right Column - Benefits and Info */}
              <div>
                <Tabs defaultValue="benefits" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                  </TabsList>
                  <TabsContent value="benefits" className="mt-6">
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Why Join TrainingCenter</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                          <div key={index} className="flex">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-4 flex-shrink-0">
                              <feature.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{feature.title}</h3>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 rounded-xl overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                          alt="People learning in a training center"
                          className="w-full h-56 object-cover"
                        />
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg flex items-center">
                        <div className="rounded-full bg-green-100 p-2 mr-4">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Secure & Trusted</h3>
                          <p className="text-sm text-muted-foreground">Your data is encrypted and never shared with third parties</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="testimonials" className="mt-6">
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">What Our Users Say</h2>
                      <div className="space-y-4">
                        {[
                          {
                            quote: "I found my perfect coding bootcamp in minutes. The booking process was seamless, and I'm now on my way to a new career!",
                            name: "Jason K.",
                            role: "Software Developer Student"
                          },
                          {
                            quote: "As a fitness trainer, listing my classes on this platform has doubled my client base in just two months.",
                            name: "Emma R.",
                            role: "Fitness Instructor"
                          },
                          {
                            quote: "The detailed reviews helped me choose the right language center for my needs. Highly recommend!",
                            name: "David L.",
                            role: "Language Learner"
                          }
                        ].map((testimonial, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-border/30">
                            <p className="italic text-muted-foreground mb-3">"{testimonial.quote}"</p>
                            <div>
                              <div className="font-medium">{testimonial.name}</div>
                              <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <div className="font-medium">Join 10,000+ satisfied users</div>
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-muted">
                              <img 
                                src={`https://i.pravatar.cc/100?img=${i+10}`} 
                                alt="User avatar" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20 flex items-start">
                  <Lock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Privacy Guarantee</h3>
                    <p className="text-sm text-muted-foreground">
                      We're committed to protecting your personal information. Read our 
                      <a href="#" className="text-primary hover:underline ml-1">privacy policy</a> to learn more about how we handle your data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GetStarted;
