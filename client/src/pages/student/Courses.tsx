import { useState, useEffect } from 'react';
import { Search, Info, BookOpen, ArrowRight, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

interface Course {
  _id: string;
  title: string;
  about?: string;
  description?: string;
  slug: string;
  thumbnail?: string;
  imageUrl?: string;
  duration?: string;
  category?: any;
  mode?: 'Online' | 'Offline' | 'Hybrid';
  syllabus?: string[];
}

const fallbackCourses: Course[] = [
  {
    _id: 'judiciary-foundation',
    title: 'Judiciary Foundation Course for PCS (J)',
    about: 'Build a Strong Foundation for Judicial Services. The PCS-J Foundation Program is a comprehensive preparation course.',
    description: 'Build a Strong Foundation for Judicial Services. The PCS-J Foundation Program is a comprehensive and long-term preparation course designed for judiciary aspirants who aim to develop strong conceptual understanding.',
    slug: 'judiciary-foundation-course-for-pcs-j',
    duration: '12 Months',
    category: 'Foundation',
    mode: 'Hybrid'
  },
  {
    _id: 'bnss-recorded',
    title: 'BNSS Recorded Lecture Course',
    about: 'Detailed recorded lectures on the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, focusing on criminal procedure.',
    slug: 'bnss-recorded-lecture-course',
    duration: '3 Months',
    category: 'Criminal Law',
    mode: 'Online'
  },
  {
    _id: 'constitution-recorded',
    title: 'Constitution Recorded Lecture Course',
    about: 'Understand the Foundation of Indian Democracy. Covers constitutional philosophy, fundamental rights, and landmark cases.',
    slug: 'constitution-recorded-lecture-course',
    duration: '4 Months',
    category: 'Constitutional Law',
    mode: 'Offline'
  }
];

const getCategoryName = (category: any): string => {
  if (!category) return 'Judiciary';
  if (typeof category === 'object') return category.name || 'Judiciary';
  return category;
};

const StudentCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<'All' | 'Online' | 'Offline' | 'Hybrid'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        const data = res.data.data;
        if (data && data.length > 0) {
          setCourses(data);
        } else {
          setCourses(fallbackCourses);
        }
      })
      .catch(err => {
        console.warn('API courses warning, using fallback:', err.message);
        setCourses(fallbackCourses);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.about || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = selectedMode === 'All' || c.mode === selectedMode;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">My Courses & Syllabus</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and access all your registered judicial preparation programs</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 mb-8 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
          <Star size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Course Enrollment Verified</h4>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            You are currently authorized for full student access. Click on any course card to view the official syllabus, covering states covered, class duration, and dynamic study material lists.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search courses by name or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold transition-all text-slate-800 text-sm"
          />
        </div>

        {/* Mode Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
          {(['All', 'Online', 'Offline', 'Hybrid'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedMode === mode
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {mode === 'All' ? 'All Classes' : `${mode} Batches`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Courses */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-semibold">Loading courses...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-xs">
          <Info size={40} className="text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base mb-1">No courses found</h4>
          <p className="text-xs text-slate-500">We couldn't find any courses matching your search query. Try another keyword!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md hover:border-gold/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-44 bg-slate-100">
                  {course.thumbnail || course.imageUrl ? (
                    <img src={course.thumbnail || course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                      <BookOpen className="text-primary/20" size={64} />
                    </div>
                  )}
                  {/* Category Badge - Top Left */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-primary/90 backdrop-blur-xs text-gold text-[10px] font-bold rounded-full border border-gold/30 uppercase tracking-wider">
                    {getCategoryName(course.category)}
                  </span>

                  {/* Mode Badge - Top Right */}
                  <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border shadow-sm ${
                    course.mode === 'Online'
                      ? 'bg-emerald-50 text-emerald-705 border-emerald-200'
                      : course.mode === 'Offline'
                      ? 'bg-blue-50 text-blue-705 border-blue-200'
                      : 'bg-amber-50 text-amber-705 border-amber-200'
                  }`}>
                    {course.mode || 'Online'}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-serif font-bold text-slate-800 text-lg mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {course.about || 'Complete syllabus coverage, daily mock questions, and direct mentor support.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      {course.duration || 'Flexible Program'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Access
                </span>

                <Link
                  to={`/courses/${course.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-gold hover:text-primary rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  View Details <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
