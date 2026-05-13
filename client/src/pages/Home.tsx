import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Trophy, PlayCircle, Calendar, Download, MessageCircle, Star, Shield, BookMarked, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/home');
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const sliders = data?.sliders || [];
  const notifications = data?.notifications || [];
  const courses = data?.courses || [];
  const events = data?.events || [];
  const faculties = data?.faculties || [];

  // Default hero if no sliders exist
  const mainHero = sliders[0] || {
    title: "Master the Law. Secure Your Legacy.",
    subtitle: "India's premier institution for Judicial Services preparation. Join our expert-led programs and turn your judiciary dreams into reality.",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80",
    buttonText: "Explore Courses",
    buttonLink: "/courses"
  };
  return (
    <div className="bg-slate-50">
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={mainHero.imageUrl} alt="Hero Banner" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/90 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold mb-8">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                <span className="text-sm font-semibold uppercase tracking-wider">Admissions Open 2026-27</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-[1.1]">
                {mainHero.title.split('.')[0]}. <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-gold to-yellow-300">{mainHero.title.split('.')[1] || ''}</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                {mainHero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={mainHero.buttonLink || "/courses"} className="px-8 py-4 rounded-full bg-linear-to-r from-gold to-yellow-600 text-primary font-bold text-lg text-center hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  {mainHero.buttonText || "Explore Courses"} <ArrowRight size={20} />
                </Link>
                <Link to="/demo" className="px-8 py-4 rounded-full bg-white/10 text-white font-bold text-lg text-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  Watch Demo <PlayCircle size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section / Institute Intro */}
      <section className="py-16 bg-white relative z-20 -mt-10 mx-6 md:mx-auto max-w-7xl rounded-2xl shadow-xl border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          {[
            { icon: Users, label: "Selected Candidates", value: "2500+" },
            { icon: Trophy, label: "Top 10 Ranks", value: "50+" },
            { icon: Shield, label: "Expert Faculty", value: "30+" },
            { icon: Star, label: "Success Rate", value: "92%" }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="w-16 h-16 mx-auto bg-primary/5 group-hover:bg-gold/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                <stat.icon className="text-primary group-hover:text-gold transition-colors" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Course Categories */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">Premium Learning Programs</h2>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Comprehensive courses designed by legal luminaries to give you the competitive edge in judiciary examinations.</p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course: any, i: number) => (
            <FadeIn delay={i * 0.1} key={i}>
              <div className="group bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 bg-gold text-primary text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                  {course.mode}
                </div>
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 text-gold group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2 line-clamp-1">{course.title}</h3>
                <h4 className="text-gold font-semibold mb-4">{course.duration}</h4>
                <p className="text-slate-600 mb-8 grow line-clamp-3">{course.about}</p>
                <Link to={`/courses/${course.slug}`} className="inline-flex items-center text-primary font-bold group-hover:text-gold transition-colors">
                  View Details <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 3. Top Faculty */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-serif font-bold mb-4">Learn From The Best</h2>
                <div className="w-24 h-1 bg-gold rounded-full mb-6"></div>
                <p className="text-slate-300 max-w-xl text-lg">Our faculty comprises former judges, eminent lawyers, and top-tier academicians dedicated to your success.</p>
              </div>
              <Link to="/faculty" className="px-6 py-3 rounded-full border border-gold text-gold hover:bg-gold hover:text-primary transition-all font-semibold">
                View All Faculty
              </Link>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-8">
            {faculties.map((faculty: any, i: number) => (
              <FadeIn delay={i * 0.1} key={i}>
                <div className="group relative rounded-2xl overflow-hidden aspect-3/4">
                  <img src={faculty.imageUrl} alt={faculty.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/50 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-xl font-bold text-white mb-1">{faculty.name}</h3>
                    <p className="text-gold text-sm font-medium mb-3">{faculty.designation}</p>
                    <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300">
                      <p className="text-slate-300 text-sm line-clamp-2">{faculty.bio}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Glassmorphism Notification & Updates */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="grid md:grid-cols-2 gap-12 relative z-10">
          {/* Notifications */}
          <FadeIn>
            <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute"></div>
                  <span className="relative z-10 font-bold">🔔</span>
                </div>
                <h3 className="text-2xl font-bold text-primary">Important Notifications</h3>
              </div>
              <div className="space-y-6">
                {notifications.length > 0 ? (
                  notifications.map((note: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 shadow-sm">
                      <div className="text-gold font-bold text-sm shrink-0 mt-1">NEW</div>
                      <p className="text-slate-700 font-medium">{note.title}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No new notifications.</p>
                )}
              </div>
              <Link to="/notifications" className="block w-full mt-6 py-3 text-primary font-bold hover:text-gold transition-colors text-center">View All Notifications →</Link>
            </div>
          </FadeIn>

          {/* Latest Events / Updates */}
          <FadeIn delay={0.2}>
            <div className="bg-primary p-8 rounded-3xl shadow-xl text-white h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-gold flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <h3 className="text-2xl font-bold">Upcoming Events</h3>
              </div>
              <div className="space-y-6">
                {events.length > 0 ? (
                  events.map((event: any, i: number) => {
                    const eventDate = new Date(event.date);
                    const day = eventDate.getDate();
                    const month = eventDate.toLocaleString('default', { month: 'short' });
                    
                    return (
                      <div key={i} className="flex gap-6 items-center border-b border-white/10 pb-6 last:border-0 last:pb-0">
                        <div className="text-center shrink-0">
                          <div className="text-gold font-bold text-xl">{day}</div>
                          <div className="text-sm text-slate-400 uppercase">{month}</div>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-1">{event.title}</h4>
                          <p className="text-sm text-slate-400">{event.location}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 italic">No upcoming events.</p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. Demo Classes & Study Material */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-primary mb-4">Experience Our Teaching</h2>
              <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <div className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-xl h-full">
                <img src="https://images.unsplash.com/photo-1515378960530-7c0da6229678?auto=format&fit=crop&q=80&w=800" alt="Demo Class" className="w-full h-full min-h-[400px] object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/50 transition-colors flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                    <PlayCircle size={40} className="ml-2" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Free Demo Classes</h3>
                  <p className="text-white/80 font-medium">Watch recorded sessions from top faculty</p>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 flex flex-col justify-center h-full">
                <div className="w-16 h-16 bg-gold/10 text-gold rounded-2xl flex items-center justify-center mb-6">
                  <BookMarked size={32} />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-4">Premium Study Material</h3>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  Get access to our meticulously researched notes, bare acts analysis, and previous year question papers mapped with detailed solutions.
                </p>
                <ul className="space-y-4 mb-8">
                  {["Monthly Current Affairs", "Landmark Judgments Summary", "Subject-wise MCQs"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 font-medium text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/study-material" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-light transition-colors">
                  Download Free Notes <Download size={20} className="ml-2" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 6. CTAs */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <FadeIn>
            <div className="bg-linear-to-br from-primary to-primary-light rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-center h-[300px]">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <Video size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Download Our App</h3>
                <p className="text-slate-300 mb-8 max-w-md text-lg">Study anytime, anywhere. Get access to live classes, recorded lectures, and mock tests on your mobile.</p>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-colors">App Store</button>
                  <button className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-colors">Google Play</button>
                </div>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-center h-[300px]">
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                <MessageCircle size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Have Questions?</h3>
                <p className="text-green-100 mb-8 max-w-md text-lg">Connect with our academic counselors instantly on WhatsApp. Get guidance on course selection and exam strategy.</p>
                <button className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-3 text-lg w-max">
                  <MessageCircle size={24} /> Chat on WhatsApp
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
};

export default Home;
