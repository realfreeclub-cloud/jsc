import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Lock, Search, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/seo/SEO';

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  category?: string;
  isFree?: boolean;
  downloads?: number;
}

// Fallback materials if database is offline or empty
const fallbackMaterials: Material[] = [
  {
    _id: 'ipc-notes',
    title: 'Indian Penal Code - Quick Revision Notes',
    description: 'Complete mind-maps and bulleted summary revision notes for major chapters of IPC.',
    fileUrl: 'https://example.com/ipc-notes.pdf',
    fileType: 'pdf',
    category: 'Criminal Law',
    isFree: true,
    downloads: 1204
  },
  {
    _id: 'const-cases',
    title: 'Constitution of India - Landmark Cases Compendium',
    description: 'Top 100 landmark cases and constitutional law judgments frequently asked in PCS (J).',
    fileUrl: 'https://example.com/const-cases.pdf',
    fileType: 'pdf',
    category: 'Constitutional Law',
    isFree: true,
    downloads: 856
  },
  {
    _id: 'cpc-drafting',
    title: 'Civil Procedure Code - Pleadings & Drafting Guide',
    description: 'Practical drafting guidelines for law graduates preparing for judiciary mains exams.',
    fileUrl: 'https://example.com/cpc-drafting.pdf',
    fileType: 'pdf',
    category: 'Civil Law',
    isFree: false,
    downloads: 540
  },
  {
    _id: 'evidence-act',
    title: 'Indian Evidence Act - Section-wise Short Summary',
    description: 'Relevancy and admissibility cheat sheets for fast-track revision before prelims.',
    fileUrl: 'https://example.com/evidence-act.pdf',
    fileType: 'pdf',
    category: 'Criminal Law',
    isFree: false,
    downloads: 322
  }
];

const StudyMaterial = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/studymaterials')
      .then(res => {
        const data = res.data.data;
        if (data && data.length > 0) {
          setMaterials(data);
        } else {
          setMaterials(fallbackMaterials);
        }
      })
      .catch(err => {
        console.warn('API study materials warning, using fallback:', err.message);
        setMaterials(fallbackMaterials);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(materials.map(m => m.category).filter(Boolean)))];

  const filtered = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (material: Material) => {
    if (!material.fileUrl) return;
    if (material.isFree || isAuthenticated) {
      const fileUrl = material.fileUrl.startsWith('http') 
        ? material.fileUrl 
        : `http://localhost:5000${material.fileUrl.startsWith('/') ? '' : '/'}${material.fileUrl}`;
      window.open(fileUrl, '_blank');
    } else {
      setShowPrompt(true);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <SEO 
        title="Free Judiciary Study Material & PDF Notes | Judicial Study Centre"
        description="Boost your exam prep with revision notes on IPC, CPC, Constitutional Law, monthly current affairs, and landmark judgments compiled by Judicial Study Centre Prayagraj."
        canonicalUrl="/study-material"
      />
      {/* Premium Hero Header */}
      <div className="bg-primary text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-gold/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="px-3 py-1 bg-gold text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            Academics
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 mb-4">Study Library & Resources</h1>
          <div className="w-20 h-0.5 bg-gold mx-auto mb-6"></div>
          <p className="text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
            Boost your judicial services exam preparation with our curated bare acts, comprehensive study notes, and landmark judgment guides.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Search and Filters */}
        <div className="grid md:grid-cols-12 gap-6 mb-10 items-center">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search materials by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-gold transition-all text-slate-800 text-sm shadow-xs"
            />
          </div>

          <div className="md:col-span-6 flex flex-wrap gap-2 justify-start md:justify-end">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat || 'All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedCategory === cat 
                    ? 'bg-gold border-gold text-primary shadow-md' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-semibold">Loading materials...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-10 max-w-lg mx-auto shadow-sm">
            <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-primary mb-2">No Materials Found</h3>
            <p className="text-slate-500 text-sm">We couldn't find any documents matching your criteria. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((material, i) => (
              <motion.div
                key={material._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between group hover:shadow-xl hover:border-gold/25 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 tracking-wide uppercase">
                      {material.category || 'General'}
                    </span>
                    {material.isFree ? (
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold rounded-full uppercase border border-emerald-100">
                        Free Access
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-gold/10 text-gold text-[10px] font-extrabold rounded-full uppercase border border-gold/10 flex items-center gap-1">
                        <Lock size={10} /> Student Only
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-primary font-serif mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {material.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">
                    {material.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Type: <span className="uppercase font-bold text-slate-500">{material.fileType || 'pdf'}</span>
                  </span>
                  
                  <button
                    onClick={() => handleDownload(material)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      material.isFree || isAuthenticated
                        ? 'bg-primary text-white hover:bg-gold hover:text-primary shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-100'
                    }`}
                  >
                    {material.isFree || isAuthenticated ? (
                      <>
                        <Download size={14} /> Download PDF
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> Unlock Access
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Access Restriction Alert Dialog Prompt */}
      {showPrompt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-gold/10 border border-gold/25 text-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold font-serif text-primary mb-2">Reserved Study Material</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              This premium material is exclusively reserved for enrolled students of the Judicial Study Centre. Please log in or create an account to unlock access.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowPrompt(false)}
                className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors text-xs"
              >
                Dismiss
              </button>
              <button 
                onClick={() => {
                  setShowPrompt(false);
                  navigate('/login');
                }}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-gold hover:text-primary transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                Log In <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterial;
