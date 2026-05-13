import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login for UI demonstration
    login('mock_jwt_token', { name: 'Student', email: 'student@example.com' });
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-primary p-8 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-2">Welcome Back</h2>
          <p className="text-slate-300">Login to your student portal</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="email" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none transition-all" placeholder="Enter your email" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none transition-all" placeholder="Enter your password" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-gold focus:ring-gold border-gray-300" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-primary font-bold hover:text-gold transition-colors">Forgot Password?</a>
            </div>
            <button type="submit" className="w-full py-4 rounded-xl bg-gold text-primary font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-gold/20 flex items-center justify-center gap-2">
              <LogIn size={20} /> Login Securely
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-600">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:text-gold transition-colors">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
