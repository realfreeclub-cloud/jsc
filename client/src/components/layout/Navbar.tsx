import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-primary/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img src="/logo.png" alt="Judicial Study Centre Logo" className="w-20 h-20 md:w-24 md:h-24 -my-4 md:-my-6 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
          </Link>
          <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <Link to="/courses" className="hover:text-gold transition-colors">Courses</Link>
            <Link to="/demo" className="hover:text-gold transition-colors">Demo Classes</Link>
            <Link to="/test-series" className="hover:text-gold transition-colors">Test Series</Link>
            <Link to="/study-material" className="hover:text-gold transition-colors">Study Material</Link>
            <Link to="/faculty" className="hover:text-gold transition-colors">Faculty</Link>
            <Link to="/about" className="hover:text-gold transition-colors">About Us</Link>
            <Link to="/blogs" className="hover:text-gold transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <Link to={user.role === 'admin' ? "http://localhost:5173" : "/student/dashboard"} className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full bg-linear-to-r from-gold to-yellow-500 text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5">
                {user.role === 'admin' ? <LayoutDashboard size={18} /> : <User size={18} />}
                {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium px-5 py-2.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors">Login</Link>
                <Link to="/contact" className="text-sm font-bold px-5 py-2.5 rounded-full bg-linear-to-r from-gold to-yellow-500 text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5">Enroll Now</Link>
              </>
            )}
          </div>
          <button 
            className="lg:hidden text-white hover:text-gold transition-colors z-50 p-2"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown / Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-primary/98 backdrop-blur-lg lg:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
        style={{ top: '0', paddingTop: '80px' }}
      >
        <div className="flex flex-col h-full px-6 py-8 space-y-6 overflow-y-auto">
          {/* Navigation Links */}
          <div className="flex flex-col space-y-4 text-lg font-medium text-slate-300">
            <Link to="/" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Home</Link>
            <Link to="/courses" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Courses</Link>
            <Link to="/demo" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Demo Classes</Link>
            <Link to="/test-series" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Test Series</Link>
            <Link to="/study-material" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Study Material</Link>
            <Link to="/faculty" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Faculty</Link>
            <Link to="/about" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>About Us</Link>
            <Link to="/blogs" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Blog</Link>
            <Link to="/contact" className="hover:text-gold transition-colors border-b border-white/5 pb-2" onClick={closeMenu}>Contact</Link>
          </div>

          {/* Action / Auth Buttons */}
          <div className="flex flex-col gap-4 pt-6 mt-auto pb-10">
            {user ? (
              <Link 
                to={user.role === 'admin' ? "http://localhost:5173" : "/student/dashboard"} 
                className="flex items-center justify-center gap-2 text-center text-sm font-bold py-3.5 rounded-full bg-linear-to-r from-gold to-yellow-500 text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
                onClick={closeMenu}
              >
                {user.role === 'admin' ? <LayoutDashboard size={18} /> : <User size={18} />}
                {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-center text-sm font-medium py-3.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors" onClick={closeMenu}>Login</Link>
                <Link to="/contact" className="text-center text-sm font-bold py-3.5 rounded-full bg-linear-to-r from-gold to-yellow-500 text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all" onClick={closeMenu}>Enroll Now</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
