import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Globe, Users, MessageCircle, Smartphone, CheckCircle, ChevronDown, Download } from 'lucide-react';
import { openCourseInApp, openWhatsApp } from '../utils/appRedirect';
import { courses } from './Courses.tsx'; // Get mock data

const CourseDetails = () => {
  const { slug } = useParams();
  const course = courses.find(c => c.slug === slug) || courses[0];

  return (
    <div className="pt-20 pb-20 bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex gap-3 mb-6">
              <span className="px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full uppercase tracking-wider border border-gold/30">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full uppercase tracking-wider border border-white/20">
                {course.mode}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              Comprehensive preparation strategy engineered by top legal luminaries. Start your journey towards becoming a judge today.
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm mb-10">
              <div className="flex items-center gap-2">
                <Clock className="text-gold" size={20} />
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="text-gold" size={20} />
                <span className="font-medium">{course.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-gold" size={20} />
                <span className="font-medium">{course.studentsEnrolled} Students Enrolled</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => openCourseInApp(course.slug)}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-linear-to-r from-gold to-yellow-500 text-primary font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 text-lg"
              >
                <Smartphone size={24} /> Start Learning on App
              </button>
              
              <button 
                onClick={() => openWhatsApp(course.title)}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/10 text-white border border-white/20 font-bold hover:bg-white/20 transition-all text-lg"
              >
                <MessageCircle size={24} /> Ask on WhatsApp
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer aspect-video bg-primary-dark">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-gold group-hover:text-primary transition-all">
                  <PlayCircle size={40} className="ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="bg-primary/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/10">
                  Watch Demo Class
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">
        
        {/* Left Column (Content) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* About Course */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-serif font-bold text-primary mb-6">About the Course</h2>
            <div className="prose prose-lg text-slate-600 max-w-none">
              <p>
                The <strong>{course.title}</strong> is designed specifically for aspirants aiming to clear the judicial service examination on their first attempt. It provides a highly structured curriculum that covers both preliminary and mains syllabi in complete detail.
              </p>
              <p className="mt-4">
                What you will get:
              </p>
              <ul className="space-y-3 mt-4">
                {[
                  "Complete coverage of Substantive and Procedural Laws",
                  "Daily answer writing practice with expert evaluation",
                  "Monthly current affairs and legal updates magazines",
                  "Mock interviews with retired judges",
                  "24/7 doubt solving support on the mobile app"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Syllabus */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif font-bold text-primary">Course Syllabus</h2>
              <button className="text-primary font-bold hover:text-gold transition-colors flex items-center gap-2">
                <Download size={18} /> Download PDF
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Module 1: Constitutional Law & Polity", lessons: 24 },
                { title: "Module 2: Indian Penal Code (IPC)", lessons: 32 },
                { title: "Module 3: Code of Criminal Procedure (CrPC)", lessons: 28 },
                { title: "Module 4: Code of Civil Procedure (CPC)", lessons: 35 },
                { title: "Module 5: Evidence Act & Minor Acts", lessons: 20 },
              ].map((module, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-5 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center group">
                  <div>
                    <h3 className="font-bold text-primary text-lg">{module.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{module.lessons} Lectures</p>
                  </div>
                  <ChevronDown className="text-gray-400 group-hover:text-gold transition-colors" />
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-serif font-bold text-primary mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is the study material provided in physical form?", a: "Yes, we dispatch comprehensive physical study material to your registered address upon enrollment." },
                { q: "Can I watch classes multiple times?", a: "Yes, you can watch the recorded lectures unlimited times during your subscription validity on the mobile app." },
                { q: "Do you provide interview guidance?", a: "Yes, interview guidance program is included free of cost for students who clear the Mains examination." },
                { q: "How are doubts resolved?", a: "We have a dedicated 24/7 doubt resolution forum within the mobile app, monitored directly by our expert faculty." },
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{faq.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          
          {/* Action Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-28">
            <h3 className="text-xl font-bold text-primary mb-6 text-center">Ready to begin?</h3>
            <button 
              onClick={() => openCourseInApp(course.slug)}
              className="w-full flex justify-center items-center gap-2 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-light transition-colors mb-4 shadow-lg shadow-primary/20 text-lg"
            >
              <Smartphone size={20} /> Open in Mobile App
            </button>
            <p className="text-sm text-center text-slate-500 mb-6">
              For the best learning experience, all courses are securely delivered via our mobile application.
            </p>
            <div className="h-px bg-gray-100 w-full mb-6"></div>
            <h4 className="font-bold text-primary mb-4">Need Help?</h4>
            <button 
              onClick={() => openWhatsApp(course.title)}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-green-50 text-green-600 font-bold hover:bg-green-100 transition-colors border border-green-200"
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </button>
          </div>

          {/* Faculty Profile */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-primary mb-6">Lead Faculty</h3>
            <div className="flex items-center gap-4 mb-4">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" alt="Faculty" className="w-16 h-16 rounded-full object-cover border-2 border-gold" />
              <div>
                <h4 className="font-bold text-primary text-lg">{course.faculty}</h4>
                <p className="text-sm text-gold font-medium">Former High Court Advocate</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              With over 15 years of teaching experience, our lead faculty has guided more than 500+ students to successful selections in various state judiciaries.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
