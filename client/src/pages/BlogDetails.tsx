import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import LazyImage from '../components/ui/LazyImage';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';

interface BlogType {
  _id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: { name?: string; [key: string]: unknown } | string;
  createdAt: string;
  thumbnail: string;
  tags: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/blogs?isPublished=true');
        const found = res.data.data.find((b: BlogType) => b.slug === slug);
        setBlog(found || null);
      } catch (err) {
        console.error('Failed to fetch blog details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlog();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 bg-white min-h-screen flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-gold mb-4" />
        <p className="text-slate-500">Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="pt-32 pb-20 bg-white min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Article Not Found</h1>
        <p className="text-slate-500 mb-6">The article you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/blogs')} className="btn-navy px-6 py-2">
          Browse All Articles
        </button>
      </div>
    );
  }

  // Schema Markup for Article
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.seo?.title || blog.title,
    "image": [blog.thumbnail || ''],
    "datePublished": new Date(blog.createdAt).toISOString(),
    "author": [{
        "@type": "Person",
        "name": (typeof blog.author === 'string' ? blog.author : blog.author?.name) || 'Admin'
    }]
  };

  return (
    <>
      <SEO 
        title={blog.seo?.title || blog.title}
        description={blog.seo?.description || blog.excerpt}
        canonicalUrl={`/blogs/${blog.slug}`}
        ogImage={blog.thumbnail || ''}
        keywords={blog.seo?.keywords?.join(", ") || (blog.tags || []).join(", ")}
        schemaMarkup={schemaMarkup}
      />
      <div className="pt-28 pb-20 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          
            <div className="mb-8">
            <Link to="/blogs" className="text-sm text-gold font-bold hover:underline mb-6 inline-block">← Back to all articles</Link>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-slate-100 text-primary text-xs font-bold rounded-full">{blog.category || 'Article'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">{blog.title || 'Untitled'}</h1>
            
            <div className="flex items-center justify-between border-y border-gray-100 py-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-gold flex items-center justify-center font-bold uppercase">
                  {((typeof blog.author === 'string' ? blog.author : blog.author?.name) || 'Admin').charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{(typeof blog.author === 'string' ? blog.author : blog.author?.name) || 'Admin'}</p>
                  <p className="text-xs text-slate-500">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {Math.max(1, Math.ceil((blog.content?.length || 100) / 1000))} min read</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
            <LazyImage src={blog.thumbnail || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800'} alt={blog.title} />
          </div>

          <article className="prose prose-lg max-w-none text-slate-600">
            <p className="lead text-xl text-slate-700 font-medium mb-8">
              {blog.excerpt}
            </p>
            {blog.content ? (
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <p>No content available for this article.</p>
            )}
          </article>

          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm text-slate-600 hover:border-gold hover:text-gold transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default BlogDetails;
