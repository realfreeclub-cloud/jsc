import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Trophy, PlayCircle, Calendar, Download, MessageCircle, Star, Shield, BookMarked, Video } from 'lucide-react';
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

interface UnifiedCourse {
  slug: string;
  title: string;
  mode: string;
  duration: string;
  about: string;
  imageUrl?: string;
  thumbnail?: string;
}

interface HomeData {
  sliders: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  courses: UnifiedCourse[];
  events: Record<string, unknown>[];
  faculties: Record<string, unknown>[];
}

const Home = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const sliders = data?.sliders || [];
  const notifications = data?.notifications || [];
  const coursesFromApi = data?.courses || [];
  const courses: UnifiedCourse[] = coursesFromApi;
  const events = data?.events || [];
  const faculties = data?.faculties || [];

  const slides = sliders.length > 0 ? sliders : [
    {
      title: "Master the Law. Secure Your Legacy.",
      subtitle: "India's premier institution for Judicial Services preparation. Join our expert-led programs and turn your judiciary dreams into reality.",
      imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80",
      buttonText: "Explore Courses",
      buttonLink: "/courses"
    }
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeSlide = slides[currentSlide] as Record<string, unknown>;
  const isPureBannerActive = activeSlide && !(activeSlide.title && (activeSlide.title as string).trim() !== "");

  return (
    <div className="bg-slate-50">
      {/* Dynamic Hero Slider */}
      <section className="relative overflow-hidden bg-primary w-full select-none">
        {slides.length > 1 && (
          <>
            {/* Elegant Left Arrow */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 hover:bg-gold/90 text-white hover:text-primary transition-all cursor-pointer backdrop-blur-xs group shadow-lg border border-white/10"
              aria-label="Previous Slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Elegant Right Arrow */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 hover:bg-gold/90 text-white hover:text-primary transition-all cursor-pointer backdrop-blur-xs group shadow-lg border border-white/10"
              aria-label="Next Slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Premium Indicator Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 bg-black/20 px-4 py-2 rounded-full backdrop-blur-xs">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === index ? 'w-8 bg-gold' : 'w-2.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Slides Container */}
        <div className="relative w-full overflow-hidden">
          {slides.map((slideItem, index) => {
            const slide = slideItem as Record<string, unknown>;
            const hasSlideContent = Boolean(slide.title && (slide.title as string).trim() !== "");
            const isActive = currentSlide === index;

            return (
              <div
                key={slide._id as string || index}
                className={`w-full transition-all duration-700 ease-in-out ${
                  isActive ? 'opacity-100 relative z-10 block' : 'opacity-0 absolute inset-0 z-0 pointer-events-none'
                }`}
              >
                {hasSlideContent ? (
                  // Classic Hero layout with text overlays (default design)
                  <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 min-h-[90vh] flex items-center justify-center bg-primary">
                    <div className="absolute inset-0 z-0 flex items-center justify-center">
                      <img
                        src={slide.imageUrl as string}
                        alt={(slide.title as string) || "Hero Banner"}
                        className="w-full h-full object-cover opacity-20"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/90 to-transparent"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="max-w-3xl">
                        <div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold mb-8">
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                            <span className="text-sm font-semibold uppercase tracking-wider">Admissions Open 2026-27</span>
                          </div>
                          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-[1.1]">
                            {(slide.title as string)?.split('.')[0]}{((slide.title as string)?.includes('.')) ? '.' : ''} <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-gold to-yellow-300">{(slide.title as string)?.split('.')[1] || ''}</span>
                          </h1>
                          <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                            {slide.subtitle as string}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Link to={(slide.buttonLink as string) || "/courses"} className="px-8 py-4 rounded-full bg-linear-to-r from-gold to-yellow-600 text-primary font-bold text-lg text-center hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                              {(slide.buttonText as string) || "Explore Courses"} <ArrowRight size={20} />
                            </Link>
                            <Link to="/demo" className="px-8 py-4 rounded-full bg-white/10 text-white font-bold text-lg text-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                              Watch Demo <PlayCircle size={20} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Pure Image Banner Slider (100% visible on all devices, no text crop)
                  <div className="w-full bg-primary pt-[80px] lg:pt-[96px] flex items-center justify-center animate-in fade-in duration-500">
                    <div className="w-full relative">
                      <img
                        src={slide.imageUrl as string}
                        alt="Hero Banner Slide"
                        className="w-full h-auto block max-h-[85vh] object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 bg-white relative z-20 mx-6 md:mx-auto max-w-7xl rounded-2xl shadow-xl border border-gray-100 transition-all duration-500 ${isPureBannerActive ? 'mt-8' : '-mt-10'}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          {[
            { icon: Users, label: "Selected Candidates", value: "900+" },
            { icon: Trophy, label: "Top 10 Ranks", value: "30+" },
            { icon: Shield, label: "Expert Faculty", value: "8+" },
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

      {/* Director's Welcome Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gold/20 rounded-4xl blur-2xl group-hover:bg-gold/30 transition-all duration-500"></div>
              <div className="relative aspect-square md:aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/20">
                <img 
                  src="https://judicialstudycentre.in/uploads/file-1779306352088-77466141.jpeg" 
                  alt="Director Ravindra Nath Rai" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Ravindra+Nath+Rai&background=07152F&color=F4B400&size=512';
                  }}
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
                <h4 className="text-xl font-bold text-primary">Ravindra Nath Rai</h4>
                <p className="text-gold font-medium text-sm">Founder & Director</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold mb-6">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                <span className="text-sm font-semibold uppercase tracking-wider">Welcome to JSC</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">
                Shaping the <span className="text-gold italic">Future Guardians</span> of Justice
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                “The journey to the judiciary is not only a path toward a prestigious career, but a commitment to justice, integrity, and service to society.”
              </p>
              <div className="space-y-4 mb-10">
                <p className="text-slate-600">
                  Established in 2001, Judicial Study Centre has been a beacon of excellence for judiciary aspirants. We don't merely teach subjects; we guide ambitions and shape careers.
                </p>
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:text-gold transition-colors group">
                Read Director's Full Message <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">Premium Learning Programs</h2>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Comprehensive courses designed by legal luminaries to give you the competitive edge in judiciary examinations.</p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course: UnifiedCourse, i: number) => (
            <FadeIn delay={i * 0.1} key={i}>
              <div className="group bg-white rounded-3xl p-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.imageUrl || course.thumbnail || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80'} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-gold text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {course.mode}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-primary mb-2 line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-2 text-gold text-sm font-bold mb-4">
                    <Calendar size={14} />
                    <span>{course.duration}</span>
                  </div>
                  <p className="text-slate-600 mb-8 grow line-clamp-3 text-sm leading-relaxed">{course.about}</p>
                  <Link to={`/courses/${course.slug}`} className="inline-flex items-center text-primary font-bold group-hover:text-gold transition-colors text-sm">
                    Enroll Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Top Faculty */}
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
            {faculties.map((faculty: Record<string, unknown>, i: number) => (
              <FadeIn delay={i * 0.1} key={i}>
                <div className="aspect-4/5 overflow-hidden rounded-3xl relative mb-6">
                  <img src={(faculty.imageUrl as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name as string || 'F')}&background=0D1B2A&color=D4AF37`} alt={faculty.name as string} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-xl font-bold text-white mb-1">{faculty.name as string}</h3>
                    <p className="text-gold text-sm font-medium mb-3">{faculty.designation as string}</p>
                    <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300">
                      <p className="text-slate-300 text-sm line-clamp-2">{(faculty.subjectExpertise as string) || (faculty.bio as string)}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications & Updates */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="grid md:grid-cols-2 gap-12 relative z-10">
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
                  notifications.map((note: Record<string, unknown>, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 shadow-sm">
                      <div className="text-gold font-bold text-sm shrink-0 mt-1">NEW</div>
                      <p className="text-slate-700 font-medium">{note.title as string}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No new notifications.</p>
                )}
              </div>
              <Link to="/notifications" className="block w-full mt-6 py-3 text-primary font-bold hover:text-gold transition-colors text-center">View All Notifications →</Link>
            </div>
          </FadeIn>

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
                  events.map((event: Record<string, unknown>, i: number) => {
                    const eventDate = new Date(event.date as string);
                    const day = eventDate.getDate();
                    const month = eventDate.toLocaleString('default', { month: 'short' });
                    
                    return (
                      <div key={i} className="flex gap-6 items-center border-b border-white/10 pb-6 last:border-0 last:pb-0">
                        <div className="text-center shrink-0">
                          <div className="text-gold font-bold text-xl">{day}</div>
                          <div className="text-sm text-slate-400 uppercase">{month}</div>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-1">{event.title as string}</h4>
                          <p className="text-sm text-slate-400">{event.location as string}</p>
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

      {/* Demo Classes & Study Material */}
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

      {/* CTAs */}
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
