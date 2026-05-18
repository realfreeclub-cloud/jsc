import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import LazyImage from '../components/ui/LazyImage';

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2 } from 'lucide-react';

interface BlogType {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: { name?: string; [key: string]: unknown } | string;
  createdAt: string;
  thumbnail: string;
  tags: string[];
}

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/blogs?isPublished=true')
      .then(res => {
        setBlogs(res.data.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch blogs:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={40} className="animate-spin text-gold" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p className="text-xl font-medium">No articles published yet.</p>
              <p>Check back later for new insights and updates.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article key={blog.slug} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden relative">
                    <LazyImage src={blog.thumbnail || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800'} alt={blog.title} className="group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-gold text-primary text-xs font-bold rounded-full">{blog.category || 'Article'}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{Math.max(1, Math.ceil((blog.excerpt?.length || 100) / 100))} min read</span>
                    </div>
                    <h2 className="text-xl font-bold text-primary mb-3 leading-snug group-hover:text-gold transition-colors">
                      <Link to={`/blogs/${blog.slug}`}>{blog.title || 'Untitled'}</Link>
                    </h2>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 grow">
                      {blog.excerpt || 'No description available for this article.'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {((typeof blog.author === 'string' ? blog.author : blog.author?.name) || 'Admin').charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{(typeof blog.author === 'string' ? blog.author : blog.author?.name) || 'Admin'}</span>
                      </div>
                      <Link to={`/blogs/${blog.slug}`} className="text-sm font-bold text-primary hover:text-gold transition-colors">Read More</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
