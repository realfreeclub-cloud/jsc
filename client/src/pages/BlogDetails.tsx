import { useParams, Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import LazyImage from '../components/ui/LazyImage';
import { blogs } from './Blog';

const BlogDetails = () => {
  const { slug } = useParams();
  const blog = blogs.find(b => b.slug === slug) || blogs[0];

  // Schema Markup for Article
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "image": [blog.thumbnail],
    "datePublished": new Date(blog.date).toISOString(),
    "author": [{
        "@type": "Person",
        "name": blog.author
    }]
  };

  return (
    <>
      <SEO 
        title={blog.title}
        description={blog.excerpt}
        canonicalUrl={`/blog/${blog.slug}`}
        ogImage={blog.thumbnail}
        keywords={blog.tags.join(", ")}
        schemaMarkup={schemaMarkup}
      />
      <div className="pt-28 pb-20 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="mb-8">
            <Link to="/blog" className="text-sm text-gold font-bold hover:underline mb-6 inline-block">← Back to all articles</Link>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-slate-100 text-primary text-xs font-bold rounded-full">{blog.category}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">{blog.title}</h1>
            
            <div className="flex items-center justify-between border-y border-gray-100 py-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-gold flex items-center justify-center font-bold">
                  {blog.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{blog.author}</p>
                  <p className="text-xs text-slate-500">{blog.date} • {blog.readTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
            <LazyImage src={blog.thumbnail} alt={blog.title} />
          </div>

          <article className="prose prose-lg max-w-none text-slate-600">
            <p className="lead text-xl text-slate-700 font-medium mb-8">
              {blog.excerpt}
            </p>
            <h2>Introduction</h2>
            <p>
              Preparing for judicial services requires a strategic approach. It is not merely about reading the bare acts, but understanding the intricate connections between various substantive and procedural laws...
            </p>
            {/* Mock content */}
            <h2>Understanding the Syllabus</h2>
            <p>
              The first step in any preparation strategy is a thorough understanding of the syllabus. The PCS J examination typically comprises three stages: Preliminary, Mains, and Interview...
            </p>
          </article>

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

        </div>
      </div>
    </>
  );
};

export default BlogDetails;
