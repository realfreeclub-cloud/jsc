import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import LazyImage from '../components/ui/LazyImage';

// eslint-disable-next-line react-refresh/only-export-components
export const blogs = [
  {
    slug: 'how-to-prepare-for-pcs-j',
    title: 'How to Prepare for PCS J: A Complete Strategy',
    excerpt: 'Discover the ultimate strategy to crack the Provincial Civil Service Judicial (PCS J) examination on your first attempt...',
    category: 'Preparation Strategy',
    author: 'Justice R. Sharma',
    date: 'Oct 15, 2026',
    readTime: '8 min read',
    thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
    tags: ['PCS J', 'Strategy', 'Preparation']
  },
  {
    slug: 'latest-amendments-ipc-crpc',
    title: 'Crucial Recent Amendments in IPC & CrPC',
    excerpt: 'A detailed breakdown of the latest amendments to the Indian Penal Code and the Code of Criminal Procedure...',
    category: 'Legal Updates',
    author: 'Dr. A. Desai',
    date: 'Oct 10, 2026',
    readTime: '12 min read',
    thumbnail: 'https://images.unsplash.com/photo-1505664177941-ac4666fc7cb9?auto=format&fit=crop&q=80&w=800',
    tags: ['IPC', 'CrPC', 'Amendments', 'Current Affairs']
  }
];

const Blog = () => {
  return (
    <>
      <SEO 
        title="Judiciary Preparation Blog & Legal Updates"
        description="Read expert articles on PCS J preparation, APO exam strategies, legal updates, and interviews from top judicial faculty."
        canonicalUrl="/blog"
      />
      <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Legal Insights & Updates</h1>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Stay ahead of the curve with our expert articles on law entrance, judicial services, and recent legal amendments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article key={blog.slug} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full">
                <div className="h-48 overflow-hidden relative">
                  <LazyImage src={blog.thumbnail} alt={blog.title} className="group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gold text-primary text-xs font-bold rounded-full">{blog.category}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col grow">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>{blog.date}</span>
                    <span>•</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-primary mb-3 leading-snug group-hover:text-gold transition-colors">
                    <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h2>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 grow">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-primary font-bold text-xs">
                        {blog.author.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{blog.author}</span>
                    </div>
                    <Link to={`/blog/${blog.slug}`} className="text-sm font-bold text-primary hover:text-gold transition-colors">Read More</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
