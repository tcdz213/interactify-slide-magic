
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className="h-8 w-8 rounded-md bg-white flex items-center justify-center">
                <span className="text-primary font-semibold">TC</span>
              </span>
              <span className="font-medium text-lg text-white">TrainingCenter</span>
            </div>
            <p className="text-primary-foreground/80 mb-6">
              The ultimate platform to discover, compare, and book the perfect training centers for your learning journey.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full flex items-center justify-center transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', url: '#' },
                { name: 'Search Training Centers', url: '#' },
                { name: 'How It Works', url: '#how-it-works' },
                { name: 'Pricing', url: '#' },
                { name: 'About Us', url: '#' },
                { name: 'Contact', url: '#' },
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.url} 
                    className="text-primary-foreground/80 hover:text-white transition-colors flex items-center"
                  >
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-6">Categories</h3>
            <ul className="space-y-3">
              {[
                'Fitness & Health',
                'Technology & IT',
                'Business & Management',
                'Languages & Communication',
                'Arts & Creative Skills',
                'Professional Certifications',
              ].map((category) => (
                <li key={category}>
                  <a 
                    href="#" 
                    className="text-primary-foreground/80 hover:text-white transition-colors flex items-center"
                  >
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-6">Contact & Newsletter</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex">
                <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-primary-foreground/80">info@trainingcenter.com</span>
              </li>
              <li className="flex">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-primary-foreground/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex">
                <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-primary-foreground/80">123 Training St, San Francisco, CA 94107</span>
              </li>
            </ul>
            <div className="space-y-3">
              <p className="text-primary-foreground/80">Subscribe for updates and offers</p>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="rounded-r-none bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-offset-primary"
                />
                <Button className="rounded-l-none">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm text-center md:text-left">
            © {new Date().getFullYear()} TrainingCenter. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-primary-foreground/60 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-white text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-white text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
