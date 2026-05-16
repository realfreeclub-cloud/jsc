import { motion } from 'framer-motion';
import { Award, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const Faculty = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['facultys'],
    queryFn: () => api.get('/facultys').then(res => res.data)
  });

  const facultyList = data?.data || [];

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Our Faculty</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto italic">
            "Experienced Mentors • Conceptual Teaching • Student-Centric Guidance"
          </p>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto mt-6">
            At Judicial Study Centre, Prayagraj, our faculty members are the backbone of our academic excellence. With years of teaching experience, subject expertise, and dedication toward judiciary education, our mentors focus on conceptual clarity, answer-writing development, and strategic preparation for Judicial Services, APO, and other law competitive examinations.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">Failed to load faculty members. Please try again later.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {facultyList.map((faculty: any, i: number) => (
              <FadeIn delay={i * 0.1} key={faculty._id || i}>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all h-full flex flex-col group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-[100px]" />
                  
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold/20 mb-6 flex-shrink-0 mx-auto">
                    <img 
                      src={faculty.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name || 'F')}&background=0D1B2A&color=D4AF37`} 
                      alt={faculty.name || 'Faculty'} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-center flex-grow">
                    <h3 className="text-2xl font-bold text-primary mb-2">{faculty.name || 'Expert Faculty'}</h3>
                    {faculty.designation && (
                      <p className="text-gold font-medium mb-4">{faculty.designation}</p>
                    )}

                    {faculty.experience && (
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-4 bg-slate-50 py-2 rounded-full">
                        <Award size={16} className="text-gold" />
                        <span className="font-medium">{faculty.experience}</span>
                      </div>
                    )}

                    {faculty.subjectExpertise && (
                      <div className="text-left mt-6">
                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                          <BookOpen size={16} className="text-gold" />
                          Subject Expertise
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-2xl p-4 shadow-inner">
                          {faculty.subjectExpertise}
                        </p>
                      </div>
                    )}

                    {faculty.bio && !faculty.subjectExpertise && (
                      <p className="text-slate-600 text-sm mt-4 italic">"{faculty.bio}"</p>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Faculty;
