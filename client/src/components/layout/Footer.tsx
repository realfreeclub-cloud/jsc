import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-slate-300 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gold to-yellow-600 flex items-center justify-center text-primary shadow-lg">
              <Scale size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white leading-tight">Judicial Study Centre</h2>
            </div>
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Premier coaching institute dedicated to shaping the future of the judiciary. Comprehensive preparation with expert faculty and proven results.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all text-xs font-bold">FB</a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all text-xs font-bold">TW</a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all text-xs font-bold">IG</a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all text-xs font-bold">YT</a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-serif font-bold text-lg mb-6">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-gold transition-colors">About Institute</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">Our Courses</Link></li>
            <li><Link to="/faculty" className="hover:text-gold transition-colors">Expert Faculty</Link></li>
            <li><Link to="/study-material" className="hover:text-gold transition-colors">Study Material</Link></li>
            <li><Link to="/testimonials" className="hover:text-gold transition-colors">Success Stories</Link></li>
            <li><Link to="/gallery" className="hover:text-gold transition-colors">Photo Gallery</Link></li>
          </ul>
        </div>

        {/* Popular Courses */}
        <div>
          <h3 className="text-white font-serif font-bold text-lg mb-6">Popular Courses</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/courses" className="hover:text-gold transition-colors">UP PCS (J) Foundation</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">Delhi Judiciary Target Batch</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">MP Civil Judge Mains</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">Rajasthan APO Special</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">Interview Guidance Program</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-serif font-bold text-lg mb-6">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="text-gold shrink-0 mt-1" size={18} />
              <span>123 Legal Avenue, Education Hub, New Delhi - 110001</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-gold shrink-0" size={18} />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-gold shrink-0" size={18} />
              <span>info@judicialstudy.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 text-sm text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} Judicial Study Centre. All rights reserved. | <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link> | <Link to="/terms" className="hover:text-gold">Terms of Service</Link></p>
      </div>
    </footer>
  );
};

export default Footer;
