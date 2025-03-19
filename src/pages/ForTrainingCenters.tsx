import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Building2, 
  Users, 
  PieChart, 
  BarChart3, 
  BookOpen, 
  Globe, 
  CreditCard, 
  Shield, 
  ArrowRight,
  CheckCheck,
  UserPlus,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const ForTrainingCenters = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    website: '',
    description: ''
  });
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [isPartnerSubmitted, setIsPartnerSubmitted] = useState(false);
  const [isDemoSubmitted, setIsDemoSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Here you would normally send the email to your backend
    console.log('Business email submitted:', email);
    setSubmitted(true);
    toast.success("Contact information received! We'll be in touch soon.");
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Partner form submitted:', partnerFormData);
    setIsPartnerSubmitted(true);
    toast.success("Your partnership application has been received! We'll be in touch soon.");
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demo form submitted:', demoFormData);
    setIsDemoSubmitted(true);
    toast.success("Your demo request has been scheduled! Check your email for confirmation.");
  };

  const handlePartnerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPartnerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDemoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDemoFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetPartnerForm = () => {
    setIsPartnerSubmitted(false);
    setPartnerFormData({
      businessName: '',
      email: '',
      phone: '',
      website: '',
      description: ''
    });
  };

  const resetDemoForm = () => {
    setIsDemoSubmitted(false);
    setDemoFormData({
      name: '',
      email: '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                For Training Center Owners & Managers
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold mb-6">
                Grow Your Training Business With Our Platform
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Connect with more students, streamline your booking process, and increase revenue with our comprehensive platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="rounded-lg">
                      <UserPlus className="mr-2" />
                      Join as a Partner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Join Our Partner Network</DialogTitle>
                      <DialogDescription>
                        Fill out the form below to begin your partnership journey with us.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {!isPartnerSubmitted ? (
                      <form onSubmit={handlePartnerSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label htmlFor="businessName" className="text-sm font-medium">Business Name</label>
                          <Input 
                            id="businessName"
                            name="businessName"
                            value={partnerFormData.businessName}
                            onChange={handlePartnerInputChange}
                            placeholder="Your Training Center Name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">Business Email</label>
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={partnerFormData.email}
                            onChange={handlePartnerInputChange}
                            placeholder="contact@yourcompany.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                          <Input 
                            id="phone"
                            name="phone"
                            value={partnerFormData.phone}
                            onChange={handlePartnerInputChange}
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="website" className="text-sm font-medium">Website (Optional)</label>
                          <Input 
                            id="website"
                            name="website"
                            value={partnerFormData.website}
                            onChange={handlePartnerInputChange}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="description" className="text-sm font-medium">Tell us about your business</label>
                          <Textarea 
                            id="description"
                            name="description"
                            value={partnerFormData.description}
                            onChange={handlePartnerInputChange}
                            placeholder="Describe your training center, courses offered, and any other relevant information..."
                            className="min-h-[100px]"
                            required
                          />
                        </div>
                        <DialogFooter className="pt-4">
                          <Button type="submit" className="w-full">Submit Application</Button>
                        </DialogFooter>
                      </form>
                    ) : (
                      <div className="py-8 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                          <CheckCheck className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Application Received!</h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for your interest in partnering with us. Our team will review your application and contact you within 2 business days.
                        </p>
                        <DialogClose asChild>
                          <Button variant="outline" onClick={resetPartnerForm}>Close</Button>
                        </DialogClose>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="rounded-lg">
                      <Calendar className="mr-2" />
                      Schedule a Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Schedule a Platform Demo</DialogTitle>
                      <DialogDescription>
                        Book a personalized demo to see how our platform can help grow your training business.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {!isDemoSubmitted ? (
                      <form onSubmit={handleDemoSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                          <Input 
                            id="name"
                            name="name"
                            value={demoFormData.name}
                            onChange={handleDemoInputChange}
                            placeholder="Your Name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="demoEmail" className="text-sm font-medium">Email Address</label>
                          <Input 
                            id="demoEmail"
                            name="email"
                            type="email"
                            value={demoFormData.email}
                            onChange={handleDemoInputChange}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="demoPhone" className="text-sm font-medium">Phone Number</label>
                          <Input 
                            id="demoPhone"
                            name="phone"
                            value={demoFormData.phone}
                            onChange={handleDemoInputChange}
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="preferredDate" className="text-sm font-medium">Preferred Date</label>
                            <Input 
                              id="preferredDate"
                              name="preferredDate"
                              type="date"
                              value={demoFormData.preferredDate}
                              onChange={handleDemoInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="preferredTime" className="text-sm font-medium">Preferred Time</label>
                            <Input 
                              id="preferredTime"
                              name="preferredTime"
                              type="time"
                              value={demoFormData.preferredTime}
                              onChange={handleDemoInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="message" className="text-sm font-medium">Additional Information (Optional)</label>
                          <Textarea 
                            id="message"
                            name="message"
                            value={demoFormData.message}
                            onChange={handleDemoInputChange}
                            placeholder="Let us know any specific features you're interested in learning about..."
                            className="min-h-[80px]"
                          />
                        </div>
                        <DialogFooter className="pt-4">
                          <Button type="submit" className="w-full">Schedule Demo</Button>
                        </DialogFooter>
                      </form>
                    ) : (
                      <div className="py-8 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                          <CheckCheck className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Demo Scheduled!</h3>
                        <p className="text-muted-foreground mb-6">
                          Your demo request has been received. We'll send you a confirmation email with the details and a calendar invite shortly.
                        </p>
                        <DialogClose asChild>
                          <Button variant="outline" onClick={resetDemoForm}>Close</Button>
                        </DialogClose>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-4">Why Partner With Us</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Join thousands of training centers already growing their business on our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Reach More Students",
                  description: "Connect with thousands of potential students actively looking for training opportunities in your area"
                },
                {
                  icon: Building2,
                  title: "Showcase Your Facilities",
                  description: "Highlight your training center's unique features with photos, videos, and detailed descriptions"
                },
                {
                  icon: Globe,
                  title: "Increased Visibility",
                  description: "Get discovered through our targeted search and recommendation algorithms"
                },
                {
                  icon: CreditCard,
                  title: "Simplified Payments",
                  description: "Accept payments online with our secure, integrated payment processing system"
                },
                {
                  icon: BarChart3,
                  title: "Business Analytics",
                  description: "Track performance with detailed analytics on bookings, revenue, and student engagement"
                },
                {
                  icon: Shield,
                  title: "Dedicated Support",
                  description: "Get personalized support from our team to help you maximize your success"
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Get started in three simple steps and start growing your business
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block"></div>

                {[
                  {
                    number: 1,
                    title: "Create Your Profile",
                    description: "Sign up and create your training center profile with detailed information about your facilities, courses, and instructors."
                  },
                  {
                    number: 2,
                    title: "Set Your Availability",
                    description: "Configure your schedule, pricing, and booking policies to match your business operations."
                  },
                  {
                    number: 3,
                    title: "Start Accepting Bookings",
                    description: "Once approved, your profile goes live, allowing students to discover and book your services."
                  }
                ].map((step, index) => (
                  <div key={index} className="flex mb-12 last:mb-0 relative">
                    <div className="mr-8 relative">
                      <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium relative z-10">
                        {step.number}
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50 flex-grow">
                      <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-4">What Our Partners Say</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Hear from training centers already growing their business on our platform
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "Since joining the platform, we've seen a 40% increase in new student enrollments and simplified our entire booking process.",
                  name: "Sarah Johnson",
                  role: "Owner, Elite Fitness Academy",
                  image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
                },
                {
                  quote: "The platform's reach has allowed us to fill classes that would otherwise have empty spots. The analytics tools help us optimize our offerings.",
                  name: "Michael Chen",
                  role: "Director, Tech Skills Institute",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                },
                {
                  quote: "We've been able to reduce our marketing costs while reaching more qualified students. The support team is responsive and helpful.",
                  name: "Alicia Rodriguez",
                  role: "Manager, Global Language Center",
                  image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-border/50">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-muted/30">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                No hidden fees, just straightforward pricing to help your business grow
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    name: "Basic",
                    price: "$49",
                    period: "per month",
                    description: "Perfect for small training centers just getting started",
                    features: [
                      "Profile listing",
                      "Up to 5 courses/classes",
                      "Online booking",
                      "Basic analytics",
                      "Email support"
                    ],
                    featured: false
                  },
                  {
                    name: "Pro",
                    price: "$99",
                    period: "per month",
                    description: "Ideal for established training centers looking to grow",
                    features: [
                      "Everything in Basic",
                      "Unlimited courses/classes",
                      "Featured placement",
                      "Advanced analytics",
                      "Priority support",
                      "Marketing tools"
                    ],
                    featured: true
                  },
                  {
                    name: "Enterprise",
                    price: "Custom",
                    period: "pricing",
                    description: "For large training organizations with multiple locations",
                    features: [
                      "Everything in Pro",
                      "Multiple locations",
                      "Custom integration",
                      "Dedicated account manager",
                      "Advanced reporting",
                      "Custom branding"
                    ],
                    featured: false
                  }
                ].map((plan, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-xl shadow-sm border ${
                      plan.featured ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'
                    } overflow-hidden flex flex-col h-full relative`}
                  >
                    {plan.featured && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-white text-xs font-medium py-1 px-3 rounded-bl-lg">
                          Most Popular
                        </div>
                      </div>
                    )}
                    <div className="p-6 border-b border-border/50">
                      <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                      <div className="flex items-baseline mb-1">
                        <span className="text-3xl font-semibold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="p-6 flex-grow">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                      <Button 
                        variant={plan.featured ? "default" : "outline"} 
                        className="w-full"
                      >
                        Get Started
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Get answers to common questions about partnering with our platform
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {[
                  {
                    question: "How long does it take to get my training center listed?",
                    answer: "Once you complete the registration process and submit all required information, our team typically reviews and approves listings within 2-3 business days."
                  },
                  {
                    question: "What commission does the platform charge?",
                    answer: "Our platform charges a 10% commission on bookings made through the platform. There are no hidden fees, and you receive payments directly to your bank account."
                  },
                  {
                    question: "Can I manage multiple training centers under one account?",
                    answer: "Yes, our Enterprise plan allows you to manage multiple locations under a single account with centralized reporting and management tools."
                  },
                  {
                    question: "How do I receive payments for bookings?",
                    answer: "We process payments through our secure payment system and transfer funds to your designated bank account within 2-3 business days after the service is completed."
                  },
                  {
                    question: "Can I offer promotions or discounts through the platform?",
                    answer: "Yes, you can create and manage special offers, discounts, and promotions through your dashboard to attract new students or fill empty slots."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-border/50">
                    <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-primary/5">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-10">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to Grow Your Training Business?</h2>
                  <p className="text-muted-foreground mb-6">
                    Contact us today to learn more about how our platform can help you reach more students and streamline your operations.
                  </p>
                  
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Input 
                          type="text" 
                          placeholder="Business Name" 
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <Input 
                          type="email" 
                          placeholder="Business Email" 
                          className="rounded-lg"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Input 
                          type="tel" 
                          placeholder="Phone Number" 
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <Textarea 
                          placeholder="Tell us about your training center" 
                          className="rounded-lg resize-none min-h-[100px]"
                        />
                      </div>
                      <Button type="submit" size="lg" className="rounded-lg w-full">
                        Contact Us
                      </Button>
                    </form>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <CheckCheck className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Thank You!</h3>
                      <p className="text-muted-foreground">
                        We've received your information and a member of our team will be in touch shortly to discuss partnership opportunities.
                      </p>
                    </div>
                  )}
                </div>
                <div className="hidden md:block relative">
                  <img 
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                    alt="Training center manager working with students" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ForTrainingCenters;
