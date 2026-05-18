import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Camera, Video, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-slate-300 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div>
          <Link to="/" className="inline-block mb-6">
            <img src="/logo.svg" alt="Judicial Study Centre Logo" className="w-16 h-16 object-contain" />
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Premier coaching institute dedicated to shaping the future of the judiciary. Comprehensive preparation with expert faculty and 900+ success stories.
          </p>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/p/Judicial-Study-Centre-Allahabad100063525922398/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all shadow-lg border border-white/10" title="Facebook">
              <MessageCircle size={18} />
            </a>
            <a href="https://www.instagram.com/judicial_study_centre" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all shadow-lg border border-white/10" title="Instagram">
              <Camera size={18} />
            </a>
            <a href="https://www.youtube.com/c/JudicialStudyCentre" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all shadow-lg border border-white/10" title="YouTube">
              <Video size={18} />
            </a>
            <a href="https://t.me/judicialstudycentre" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-primary transition-all shadow-lg border border-white/10" title="Telegram">
              <Send size={18} />
            </a>
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
            <li><Link to="/notifications" className="hover:text-gold transition-colors">Exam Notifications</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Programs */}
        <div>
          <h3 className="text-white font-serif font-bold text-lg mb-6">Our Programs</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/courses" className="hover:text-gold transition-colors">PCS-J Foundation</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">APO Special Batch</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">HJS Preparation</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">General Studies for Law</Link></li>
            <li><Link to="/courses" className="hover:text-gold transition-colors">Answer Writing Skills</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-serif font-bold text-lg mb-6">Get in Touch</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="text-gold shrink-0 mt-1" size={18} />
              <span>84/140, ALLENGANJ, (Infront of Indian Bank), Prayagraj (211002), Uttar Pradesh</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-gold shrink-0" size={18} />
              <div className="flex flex-col">
                <a href="tel:+919450614241" className="hover:text-gold transition-colors">+91 9450614241</a>
                <a href="tel:+917619038175" className="hover:text-gold transition-colors">+91 7619038175</a>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-gold shrink-0" size={18} />
              <a href="mailto:contact.judicialstudycentre@gmail.com" className="hover:text-gold transition-colors break-all">contact.judicialstudycentre@gmail.com</a>
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
