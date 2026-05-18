import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, FileText, Info, BookOpen } from 'lucide-react';
import api from '../../utils/api';

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

const StudentMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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
    const fileUrl = material.fileUrl.startsWith('http') 
      ? material.fileUrl 
      : `http://localhost:5000${material.fileUrl.startsWith('/') ? '' : '/'}${material.fileUrl}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Study Materials & Notes</h1>
          <p className="text-sm text-slate-500 mt-1">Access all bare acts, summaries, class notes, and mock tests</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 mb-8 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Welcome to your Academic Portal!</h4>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            As a registered student, you have unlimited access to download, print, or view all premium revision lists, previous exam analyses, and practice keys compiled by the Judicial Study Centre faculty.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search resources by title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold transition-all text-slate-800 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat || 'All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat 
                  ? 'bg-gold border-gold text-primary shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of study guides */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-semibold">Loading materials...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-xs">
          <Info size={40} className="text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base mb-1">No matching documents</h4>
          <p className="text-xs text-slate-500">We couldn't find any resources matching your search query. Try another keyword!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((material, i) => (
            <motion.div
              key={material._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:border-gold/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                    {material.category || 'General'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    File: <span className="uppercase text-slate-500 font-extrabold">{material.fileType || 'pdf'}</span>
                  </span>
                </div>

                <h3 className="font-serif font-bold text-slate-800 text-base mb-1 line-clamp-2">
                  {material.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">
                  {material.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <FileText size={12} className="text-slate-400" /> Authorized Access
                </span>

                <button
                  onClick={() => handleDownload(material)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-gold hover:text-primary rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Download size={13} /> Download File
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;
