import { Link } from 'react-router-dom';
import { Scale, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-primary/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Judicial Study Centre Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-xl font-serif font-bold text-white leading-tight">Judicial Study Centre</h1>
            <p className="text-[10px] text-gold tracking-widest uppercase font-semibold">Excellence in Law</p>
          </div>
        </Link>
        <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <Link to="/courses" className="hover:text-gold transition-colors">Courses</Link>
          <Link to="/demo" className="hover:text-gold transition-colors">Demo Classes</Link>
          <Link to="/study-material" className="hover:text-gold transition-colors">Study Material</Link>
          <Link to="/faculty" className="hover:text-gold transition-colors">Faculty</Link>
          <Link to="/about" className="hover:text-gold transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium px-5 py-2.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors">Login</Link>
          <Link to="/contact" className="text-sm font-bold px-5 py-2.5 rounded-full bg-linear-to-r from-gold to-yellow-500 text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5">Enroll Now</Link>
        </div>
        <button className="lg:hidden text-white hover:text-gold transition-colors">
          <Menu size={28} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
