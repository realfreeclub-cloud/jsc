import { useState, useEffect } from 'react';
import { Search, Info, BookOpen, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { openWhatsApp } from '../../utils/appRedirect';

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
  accessType?: 'Paid' | 'Free';
  deliveryType?: 'Online' | 'Offline';
}

interface Enrollment {
  _id: string;
  course: Course;
  status: 'pending' | 'active' | 'rejected' | 'expired';
  isLifetime?: boolean;
  expiryDate?: string;
}

const StudentCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'classroom' | 'explore'>('classroom');
  
  // Progress tracking map per course ID
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all courses
      const coursesRes = await api.get('/courses');
      const allCourses = coursesRes.data.data || [];
      setCourses(allCourses);

      // 2. Fetch my enrollments
      const enrollmentsRes = await api.get('/enrollments/my-enrollments');
      const enrollments = enrollmentsRes.data.data || [];
      setMyEnrollments(enrollments);

      // 3. Fetch progress for active courses
      const activeEnrollments = enrollments.filter((e: Enrollment) => e.status === 'active');
      const progressPromises = activeEnrollments.map(async (e: Enrollment) => {
        try {
          const progRes = await api.get(`/lesson-progress/course/${e.course._id}`);
          if (progRes.data?.data) {
            return { courseId: e.course._id, percentage: progRes.data.data.percentage };
          }
        } catch (err) {
          console.warn('Failed to load progress for course', e.course._id);
        }
        return { courseId: e.course._id, percentage: 0 };
      });

      const progressResults = await Promise.all(progressPromises);
      const newProgressMap: Record<string, number> = {};
      progressResults.forEach((res) => {
        newProgressMap[res.courseId] = res.percentage;
      });
      setProgressMap(newProgressMap);

    } catch (err) {
      console.error('Error fetching courses page data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle manual or instant enrollment
  const handleEnroll = async (course: Course) => {
    try {
      // Hit backend to create enrollment
      await api.post('/enrollments/enroll', { courseId: course._id });
      
      if (course.accessType === 'Free') {
        alert(`Instantly enrolled in "${course.title}"! Start learning immediately.`);
        fetchData();
        setActiveTab('classroom');
      } else {
        // Redirection to WhatsApp
        openWhatsApp(course.title);
        alert(`Enrollment request for "${course.title}" submitted. Please confirm payment details on WhatsApp.`);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit enrollment request.');
    }
  };

  const getCategoryName = (category: any): string => {
    if (!category) return 'Judiciary';
    if (typeof category === 'object') return category.name || 'Judiciary';
    return category;
  };

  // Filter lists based on tab & query
  const filteredMyCourses = myEnrollments.filter((enrollment) => {
    // Only active enrollments are displayed in Classroom
    if (enrollment.status !== 'active') return false;
    
    const course = enrollment.course;
    if (!course) return false;
    return course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (course.about || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredExploreCourses = courses.filter((course) => {
    // Check if user is already enrolled
    const enrollment = myEnrollments.find(e => e.course?._id === course._id);
    
    // If user has active access, do not display in Explore
    if (enrollment && enrollment.status === 'active') return false;

    return course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (course.about || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Student Classroom</h1>
          <p className="text-sm text-slate-500 mt-1">Access syllabus lessons, track completion, or enroll in advanced programs.</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-100 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('classroom')}
          className={`pb-4 text-sm font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'classroom'
              ? 'text-primary border-gold'
              : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          My Classroom ({myEnrollments.filter(e => e.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-4 text-sm font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'explore'
              ? 'text-primary border-gold'
              : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          Explore All Programs ({filteredExploreCourses.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder={activeTab === 'classroom' ? "Search inside my active classes..." : "Explore upcoming foundation and recorded courses..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-gold transition-all text-slate-800 text-sm"
          />
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-semibold">Loading courses database...</p>
        </div>
      ) : activeTab === 'classroom' ? (
        /* MY CLASSROOM TAB */
        filteredMyCourses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-xs">
            <Info size={40} className="text-slate-400 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base mb-1">Classroom is empty</h4>
            <p className="text-xs text-slate-500 mb-6">You are not actively enrolled in any courses. Explore our syllabus registry to enroll.</p>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-6 py-2.5 bg-primary text-white hover:bg-gold hover:text-primary rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Explore Courses
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredMyCourses.map((enrollment) => {
              const course = enrollment.course;
              const progress = progressMap[course._id] || 0;
              
              return (
                <div
                  key={enrollment._id}
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
                      
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary/90 backdrop-blur-xs text-gold text-[10px] font-bold rounded-full border border-gold/30 uppercase tracking-wider">
                        {getCategoryName(course.category)}
                      </span>

                      <span className="absolute top-4 right-4 px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {course.mode || 'Online'}
                      </span>
                    </div>

                    <div className="p-6 pb-2">
                      <h3 className="font-serif font-bold text-slate-800 text-lg mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                        {course.about || 'Access unlisted videos, download reading sheets, and review covered law topics.'}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {course.duration || 'Flexible Program'}
                        </span>
                        {enrollment.expiryDate && !enrollment.isLifetime && (
                          <span className="text-red-500">
                            Expires: {new Date(enrollment.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                        {enrollment.isLifetime && (
                          <span className="text-emerald-600 font-extrabold">Lifetime Access</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress details & direct study button */}
                  <div className="p-6 pt-4 border-t border-slate-50">
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] font-bold mb-1 text-slate-500">
                        <span>COURSE PROGRESS</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Student
                      </span>

                      <Link
                        to={`/student/courses/${course._id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-gold hover:text-primary text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Enter Classroom <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* EXPLORE & REGISTER TAB */
        filteredExploreCourses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-xs">
            <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base mb-1">Fully Registered</h4>
            <p className="text-xs text-slate-500">You have active access to all currently published program catalogs.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredExploreCourses.map((course) => {
              // Find enrollment info
              const enrollment = myEnrollments.find(e => e.course?._id === course._id);
              
              return (
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
                      
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary/90 backdrop-blur-xs text-gold text-[10px] font-bold rounded-full border border-gold/30 uppercase tracking-wider">
                        {getCategoryName(course.category)}
                      </span>

                      <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border shadow-sm ${
                        course.mode === 'Online'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : course.mode === 'Offline'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
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
                        {course.about || 'Acquire conceptual core parameters for PCS-J, containing interactive unlisted files and download support.'}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {course.duration || 'Flexible Program'}
                        </span>
                        <span className="flex items-center gap-1">
                          {course.accessType === 'Free' ? (
                            <span className="text-emerald-600 font-extrabold">FREE SYLLABUS</span>
                          ) : (
                            <span className="text-blue-600 font-bold">PAID SYLLABUS</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-50 flex items-center justify-between">
                    {/* Status descriptions */}
                    {enrollment?.status === 'pending' && (
                      <span className="text-[10px] text-amber-600 font-bold uppercase flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Awaiting Verification
                      </span>
                    )}
                    {enrollment?.status === 'rejected' && (
                      <span className="text-[10px] text-red-600 font-bold uppercase flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        Request Declined
                      </span>
                    )}
                    {enrollment?.status === 'expired' && (
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                        Access Expired
                      </span>
                    )}
                    {!enrollment && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Not Enrolled
                      </span>
                    )}

                    {/* Action buttons */}
                    {enrollment?.status === 'pending' ? (
                      <button
                        onClick={() => openWhatsApp(course.title)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Confirm on WhatsApp
                      </button>
                    ) : enrollment?.status === 'rejected' ? (
                      <button
                        onClick={() => openWhatsApp(course.title)}
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Contact Support
                      </button>
                    ) : enrollment?.status === 'expired' ? (
                      <button
                        onClick={() => handleEnroll(course)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Renew Access
                      </button>
                    ) : (
                      /* Not Enrolled: Trigger active enroll post */
                      <button
                        onClick={() => handleEnroll(course)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-gold hover:text-primary rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        {course.accessType === 'Free' ? 'Enroll Free' : 'Enroll Now'} <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default StudentCourses;
