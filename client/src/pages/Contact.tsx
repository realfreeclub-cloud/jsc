import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Camera, Video } from 'lucide-react';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Address",
      details: ["84/140, ALLENGANJ, (Infront of Indian Bank),", "Prayagraj (211002), Uttar Pradesh, India"],
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Phone,
      title: "Phone Numbers",
      details: ["+91 9450614241 (WhatsApp)", "+91 7619038175"],
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Mail,
      title: "Official Email",
      details: ["contact.judicialstudycentre@gmail.com"],
      color: "bg-red-50 text-red-600"
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday - Saturday", "09:00 AM - 07:00 PM"],
      color: "bg-gold/10 text-gold"
    }
  ];

  const socialLinks = [
    { icon: MessageCircle, link: "https://www.facebook.com/p/Judicial-Study-Centre-Allahabad100063525922398/", name: "Facebook" },
    { icon: Camera, link: "https://www.instagram.com/judicial_study_centre", name: "Instagram" },
    { icon: Video, link: "https://www.youtube.com/c/JudicialStudyCentre", name: "YouTube" },
    { icon: Send, link: "https://t.me/judicialstudycentre", name: "Telegram" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary flex items-center">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
          <FadeIn>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Get in <span className="text-gold">Touch</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about our courses or the admission process? Our team is here to guide you through your journey to the judiciary.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {contactInfo.map((info, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all h-full flex flex-col items-center text-center group">
                <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <info.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-4">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-slate-600 font-medium">{detail}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <FadeIn>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h2 className="text-3xl font-serif font-bold text-primary mb-8">Send us a Message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <input type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none" placeholder="+91 00000 00000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input type="email" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course Interest</label>
                  <select className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none">
                    <option>PCS-J Foundation</option>
                    <option>APO Special Batch</option>
                    <option>HJS Preparation</option>
                    <option>General Studies</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea rows={4} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-light transition-all shadow-lg flex items-center justify-center gap-2 group">
                  Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </FadeIn>

          {/* Map & Social */}
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="bg-white p-4 rounded-4xl shadow-xl border border-slate-100 h-[400px] overflow-hidden group">
                <iframe 
                  src="https://www.google.com/maps?q=Judicial+Study+Centre+Prayagraj&output=embed" 
                  className="w-full h-full rounded-3xl border-0" 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-2xl font-serif font-bold text-primary mb-6 text-center">Follow our Journey</h3>
                <div className="grid grid-cols-4 gap-4">
                  {socialLinks.map((social, i) => (
                    <a 
                      key={i} 
                      href={social.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-gold group-hover:text-primary transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
                        <social.icon size={24} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="bg-linear-to-br from-green-500 to-green-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Direct Support</h3>
                  <p className="text-green-50 font-medium">Chat with our academic counselor</p>
                </div>
                <a 
                  href="https://wa.me/919450614241" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-600 hover:scale-110 transition-transform shadow-lg"
                >
                  <MessageCircle size={32} />
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
