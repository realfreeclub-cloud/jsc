import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Image as ImageIcon, X, ZoomIn, Calendar } from 'lucide-react';
import api from '../utils/api';
import SEO from '../components/seo/SEO';

interface GalleryItem {
  _id: string;
  title?: string;
  imageUrl: string;
  category?: string;
  createdAt?: string;
}

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

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Fetch only public gallery images (the backend handles filtering out isPrivate automatically!)
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: () => api.get('/gallerys?limit=1000').then((res) => res.data),
  });

  const images: GalleryItem[] = data?.data || [];
  const categories = ['All', ...Array.from(new Set(images.map((img) => img.category || 'General')))];

  const filteredImages =
    activeCategory === 'All' ? images : images.filter((img) => img.category === activeCategory);

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      <SEO 
        title="Media Gallery & Campus Highlights | Judicial Study Centre"
        description="Browse photo highlights, campus events, classroom sessions, student selections, and ceremony moments at Judicial Study Centre Prayagraj."
        canonicalUrl="/gallery"
      />
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Title & Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Media Gallery</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto italic">
            "Moments of excellence, campus events, and memory highlights of Judicial Study Centre"
          </p>
          <div className="w-24 h-1 bg-gold mx-auto mt-6 rounded-full" />
        </div>

        {/* Category Tabs */}
        {!isLoading && !error && categories.length > 1 && (
          <div className="flex justify-center flex-wrap gap-2.5 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  activeCategory === cat
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-slate-200 border border-slate-100 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto">
            <ImageIcon size={40} className="mx-auto text-red-400 mb-3" />
            <p className="font-semibold">Failed to load media gallery</p>
            <p className="text-sm text-slate-400 mt-1">Please check your connection and try again.</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center text-slate-500 py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto">
            <ImageIcon size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-lg text-primary">No images found</p>
            <p className="text-sm text-slate-400 mt-1">Check back later for newly added photo assets.</p>
          </div>
        ) : (
          /* Image Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((img, i) => (
              <FadeIn delay={i * 0.05} key={img._id}>
                <div 
                  onClick={() => setSelectedImage(img)}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group aspect-square flex flex-col relative"
                >
                  {/* Image Display */}
                  <div className="relative grow overflow-hidden bg-slate-100">
                    <img 
                      src={img.imageUrl} 
                      alt={img.title || 'Gallery item'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Zoom Overlay */}
                    <div className="absolute inset-0 bg-primary/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white text-primary flex items-center justify-center shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                        <ZoomIn size={18} className="text-primary hover:text-gold transition-colors" />
                      </div>
                    </div>

                    {/* Category Label */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-primary font-bold text-[10px] px-2.5 py-1 rounded-md shadow-xs">
                      {img.category || 'General'}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="p-4 shrink-0 bg-white">
                    <h3 className="font-bold text-primary text-sm truncate group-hover:text-gold transition-colors">
                      {img.title || 'Untitled Highlight'}
                    </h3>
                    <p className="text-slate-400 text-[10px] flex items-center gap-1.5 mt-1 font-medium">
                      <Calendar size={12} className="text-gold" />
                      {img.createdAt ? new Date(img.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-primary/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white hover:text-gold bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full flex flex-col gap-4"
            >
              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden p-3 shadow-2xl">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title || 'Detailed view'}
                  className="w-full max-h-[75vh] object-contain rounded-2xl mx-auto"
                />
              </div>

              <div className="text-center text-white max-w-2xl mx-auto px-4">
                <span className="bg-gold text-primary font-bold text-xs px-3 py-1 rounded-full inline-block mb-2">
                  {selectedImage.category || 'General'}
                </span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white">
                  {selectedImage.title || 'Media Highlight'}
                </h2>
                {selectedImage.createdAt && (
                  <p className="text-sm text-slate-300 mt-1">
                    Uploaded on {new Date(selectedImage.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
