import { motion } from 'framer-motion';
import { Target, Eye, Shield, Award, Users, BookOpen, Scale, Quote } from 'lucide-react';

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

const About = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80" 
            alt="About Background" 
            className="w-full h-full object-cover opacity-20" 
          />
          <div className="absolute inset-0 bg-linear-to-b from-primary/80 via-primary to-primary"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
          <FadeIn>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              About <span className="text-gold">Judicial Study Centre</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Nurturing the guardians of justice since 2001. A legacy of excellence in legal education and judicial services preparation.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Director's Message Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80" 
                  alt="Ravindra Nath Rai" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gold p-8 rounded-2xl shadow-xl hidden md:block">
                <p className="text-primary font-bold text-xl uppercase tracking-widest">Est. 2001</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold mb-6">
                <Quote size={16} />
                <span className="text-sm font-semibold uppercase tracking-wider">Director's Message</span>
              </div>
              <h2 className="text-4xl font-serif font-bold text-primary mb-2">Ravindra Nath Rai</h2>
              <p className="text-gold font-medium mb-8 text-lg">R. N. Rai (Rai Sir) — Founder & Director</p>
              
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed italic">
                <p className="text-2xl text-primary font-serif mb-8 border-l-4 border-gold pl-6 py-2">
                  “The journey to the judiciary is not only a path toward a prestigious career, but a commitment to justice, integrity, and service to society.”
                </p>
              </div>
              
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Established in 2001 in Prayagraj, Judicial Study Centre was founded with a clear vision to provide dedicated, disciplined, and result-oriented guidance to aspiring judicial officers and law professionals across the country. Over the past two decades, the institute has earned the trust of thousands of students through quality education, academic excellence, and consistent mentorship in the field of judicial services preparation.
                </p>
                <p>
                  At our institute, we believe that success in examinations such as PCS-J, APO, and HJS requires far more than theoretical knowledge. It demands conceptual clarity, analytical thinking, answer-writing skills, consistency, and the right guidance at every stage of preparation.
                </p>
                <p>
                  At Judicial Study Centre, we do not merely teach subjects; we guide ambitions, shape careers, and help build future guardians of justice. I warmly welcome all aspirants to join our academic family and take a confident step toward achieving their dream career.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Institutional History Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gold/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-7">
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary mb-6">
                  <span className="text-sm font-semibold uppercase tracking-wider">Institutional History</span>
                </div>
                <h2 className="text-4xl font-serif font-bold text-primary mb-8">A Legacy of Excellence in Prayagraj</h2>
                
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 space-y-6">
                  <p className="text-xl font-medium text-primary italic border-l-4 border-gold pl-6 py-2 bg-slate-50 rounded-r-xl">
                    “प्रयरगररज वह ऐवतहरविक एवंप्रेरणरदरयी भूवि हैजहराँज्ञरन िरधनर बनतर है, िंघर्षव्यक्तित्व गढ़तर है, और वनरंतर पररश्रि िरधरण ववद्यरवथषयो ंको अिरधररण िफलतर तक पहाँचरतर है।”
                  </p>
                  <p>
                    Established in 2001 in Prayagraj, <strong>Judicial Study Centre</strong> was founded with a vision to provide sincere, disciplined, and result-oriented guidance to aspiring judicial officers and legal professionals. Situated in the historic and intellectual city of Prayagraj—the sacred land of the Triveni Sangam, where the holy rivers Ganga, Yamuna, and the invisible Saraswati converge—the institute draws inspiration from a legacy deeply rooted in knowledge, spirituality, perseverance, and transformation.
                  </p>
                  <p>
                    For decades, Prayagraj has been recognized as one of India’s most respected centers for competitive examination preparation. The city has nurtured countless scholars, judges, and leaders. Since its inception, Judicial Study Centre has remained committed to this very spirit. What began as a humble initiative has today evolved into a trusted institution for PCS-J, APO, HJS preparation.
                  </p>
                  <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 grid grid-cols-2 gap-8 my-10">
                    <div>
                      <h4 className="text-4xl font-bold text-primary mb-1">900+</h4>
                      <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Successful Selections</p>
                    </div>
                    <div>
                      <h4 className="text-4xl font-bold text-gold mb-1">24+</h4>
                      <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Years of Excellence</p>
                    </div>
                  </div>
                  <p>
                    Over the past two decades, the institute has proudly guided and mentored students from across the country, producing <strong>900+ successful selections</strong>, including several rank holders. Beyond results, we believe in nurturing resilience and discipline. The land of Prayagraj teaches us that sincere effort and perseverance never go in vain.
                  </p>
                </div>
              </FadeIn>
            </div>
            
            <div className="md:col-span-5 relative">
              <FadeIn delay={0.2}>
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1517673132405-a56a62b18acc?auto=format&fit=crop&q=80" 
                    alt="Prayagraj Sangam" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-sm font-bold uppercase tracking-widest opacity-80">City of Knowledge</p>
                    <h3 className="text-2xl font-serif font-bold">Prayagraj</h3>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl"></div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 transform translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl font-serif font-bold mb-4 italic">“आ नो भद्राः क्रतवो यन्तु ववश्वताः”</h2>
              <p className="text-gold text-xl font-medium">“Let noble thoughts and inspiring ideas come to us from all directions.”</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-12">
            <FadeIn>
              <div className="bg-white/5 backdrop-blur-lg p-10 rounded-3xl border border-white/10 h-full">
                <div className="w-16 h-16 bg-gold/20 text-gold rounded-2xl flex items-center justify-center mb-8">
                  <Eye size={32} />
                </div>
                <h3 className="text-3xl font-serif font-bold mb-6">Our Vision</h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  To become one of India’s most trusted, respected, and result-oriented institutes for Judicial Services and Law Competitive Examinations by nurturing knowledgeable, ethical, and responsible future judicial officers.
                </p>
                <p className="text-slate-400">
                  We envision creating an academic environment where students receive not only quality legal education but also the confidence, analytical ability, integrity, and guidance necessary to uphold the principles of justice and constitutional values.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white/5 backdrop-blur-lg p-10 rounded-3xl border border-white/10 h-full">
                <div className="w-16 h-16 bg-gold/20 text-gold rounded-2xl flex items-center justify-center mb-8">
                  <Target size={32} />
                </div>
                <h3 className="text-3xl font-serif font-bold mb-6">Our Mission</h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Our mission is to provide a structured, transparent, and student-centric approach to judiciary preparation while maintaining the highest standards of academic integrity and mentorship.
                </p>
                <ul className="space-y-4 text-slate-400">
                  <li className="flex gap-3">
                    <span className="text-gold font-bold">01.</span>
                    <span>Delivering comprehensive and exam-oriented teaching for PCS-J, APO, HJS.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold font-bold">02.</span>
                    <span>Building strong conceptual foundations and analytical thinking.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold font-bold">03.</span>
                    <span>Providing personalized mentorship and ethical guidance.</span>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Detailed Mission Points */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-primary mb-4">Our Commitment</h2>
              <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: BookOpen, 
                title: "Quality Legal Education", 
                desc: "Comprehensive and exam-oriented teaching for PCS-J, APO, HJS through conceptual and practical learning." 
              },
              { 
                icon: Scale, 
                title: "Conceptual Foundations", 
                desc: "Ensuring clarity in legal concepts, analytical thinking, and practical understanding." 
              },
              { 
                icon: Shield, 
                title: "Strategic Preparation", 
                desc: "Guiding aspirants through systematic study plans, updated material, and regular mock tests." 
              },
              { 
                icon: Users, 
                title: "Dedicated Mentoring", 
                desc: "Personal guidance to help students remain motivated, disciplined, and confident." 
              },
              { 
                icon: Award, 
                title: "Academic Excellence", 
                desc: "Maintaining high standards through experienced faculty and ethical teaching practices." 
              },
              { 
                icon: Scale, 
                title: "Shaping Future Officers", 
                desc: "Preparing students for the responsibilities, ethics, and dignity associated with the judiciary." 
              },
              { 
                icon: Shield, 
                title: "Trustworthy Environment", 
                desc: "Building an institution where students and parents can place their trust with confidence." 
              },
              { 
                icon: BookOpen, 
                title: "Continuous Evolution", 
                desc: "Evolving with changing examination patterns while maintaining commitment to excellence." 
              }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-gold/50 hover:shadow-xl transition-all group h-full">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-6">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-primary mb-4">Our Core Values</h2>
              <p className="text-slate-500">The pillars that define our institution</p>
            </div>
          </FadeIn>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Integrity & Ethics", 
              "Academic Excellence", 
              "Discipline & Consistency", 
              "Student-Centric Mentorship", 
              "Honest Guidance", 
              "Commitment to Justice", 
              "Trust & Transparency"
            ].map((value, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="px-8 py-4 bg-white rounded-full border border-slate-200 shadow-sm text-primary font-bold hover:border-gold hover:text-gold transition-all cursor-default">
                  {value}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
