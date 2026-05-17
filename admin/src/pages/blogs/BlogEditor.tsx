import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Loader2, Settings, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import { cn } from '../../../utils/cn';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Auto-generate slug from title if not editing
  useEffect(() => {
    if (!isEditing && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [title, isEditing]);

  const { data: blogData, isLoading: isFetching } = useQuery({
    queryKey: ['blogs', id],
    queryFn: () => api.get(`/blogs/${id}`).then(res => res.data),
    enabled: isEditing
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6'
      }
    }
  });

  // Populate data when editing
  useEffect(() => {
    if (blogData?.data && editor) {
      const blog = blogData.data;
      setTitle(blog.title || '');
      setSlug(blog.slug || '');
      setExcerpt(blog.excerpt || '');
      setThumbnail(blog.thumbnail || '');
      setCategory(blog.category || '');
      setIsPublished(blog.isPublished || false);
      setFocusKeyword(blog.seo?.keywords?.[0] || '');
      setMetaTitle(blog.seo?.title || '');
      setMetaDescription(blog.seo?.description || '');
      editor.commands.setContent(blog.content || '');
    }
  }, [blogData, editor]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      // Temporarily hardcode a dummy author ID for testing until auth is fully hooked up
      const finalPayload = { ...payload, author: '60d5ecb8b392d700153ee612' };
      if (isEditing) {
        return api.patch(`/blogs/${id}`, finalPayload);
      }
      return api.post('/blogs', finalPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      navigate('/blogs');
    }
  });

  const handleSave = () => {
    if (!title || !slug) {
      alert("Title and Slug are required!");
      return;
    }
    const payload = {
      title,
      slug,
      content: editor?.getHTML() || '',
      excerpt,
      thumbnail,
      category,
      isPublished,
      seo: {
        title: metaTitle,
        description: metaDescription,
        keywords: focusKeyword ? [focusKeyword] : []
      }
    };
    saveMutation.mutate(payload);
  };

  // SEO Calculation Engine
  const contentText = editor?.getText() || '';
  const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
  
  let seoScore = 100;
  const seoChecks = [
    { 
      label: 'Focus keyword in Title',
      passed: title.toLowerCase().includes(focusKeyword.toLowerCase()) && focusKeyword.length > 0,
      penalty: 15
    },
    { 
      label: 'Focus keyword in Meta Title',
      passed: metaTitle.toLowerCase().includes(focusKeyword.toLowerCase()) && focusKeyword.length > 0,
      penalty: 10
    },
    { 
      label: 'Content > 300 words',
      passed: wordCount >= 300,
      penalty: 15
    },
    { 
      label: 'Focus keyword in first paragraph',
      passed: contentText.slice(0, 500).toLowerCase().includes(focusKeyword.toLowerCase()) && focusKeyword.length > 0,
      penalty: 10
    }
  ];

  seoChecks.forEach(check => {
    if (!check.passed && focusKeyword) seoScore -= check.penalty;
  });
  if (!focusKeyword) seoScore = 0;

  return (
    <div className="h-[calc(100vh-80px)] -m-8 flex flex-col bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      {/* Top Header Bar */}
      <div className="h-16 px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/blogs')} className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
              isPublished ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50" : "bg-slate-100 text-slate-500 border border-slate-200"
            )}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
            <p className="text-sm font-medium text-slate-400">
              {isEditing ? 'Editing Article' : 'Creating New Article'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPublished(!isPublished)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2"
          >
            Switch to {isPublished ? 'Draft' : 'Publish'}
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save {isPublished ? 'Live' : 'Draft'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Section */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar pb-32 relative">
          <div className="max-w-3xl mx-auto px-8 pt-12">
            <input 
              type="text"
              placeholder="Article Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 mb-4"
            />
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 border-b border-slate-200 pb-8">
              <span>https://judicialstudycentre.com/blog/</span>
              <input 
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-600 hover:bg-slate-100 px-2 py-0.5 rounded transition-colors w-full"
                placeholder="slug-goes-here"
              />
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px]">
              {/* TipTap Toolbar Component would go here (Bold, Italic, H1, H2, Image) */}
              <div className="border-b border-slate-100 px-4 py-3 flex gap-2">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded">Bold</button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded">Italic</button>
                <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded">H2</button>
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* SEO & Settings Sidebar */}
        <div className="w-96 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-y-auto hidden-scrollbar">
          
          {/* SEO Score Circle Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
            <div className="flex items-center gap-2">
              <Globe className="text-slate-400" size={18} />
              <h3 className="font-semibold text-slate-800 dark:text-white">SEO Analysis</h3>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm",
              seoScore >= 80 ? "border-emerald-500 text-emerald-600" : 
              seoScore >= 50 ? "border-amber-500 text-amber-600" : 
              "border-rose-500 text-rose-600"
            )}>
              {focusKeyword ? seoScore : '-'}
            </div>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Meta Tags */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Settings size={14} /> Meta Configuration
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Focus Keyword</label>
                  <input 
                    type="text" 
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. upsc exam tips"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Meta Title</label>
                  <input 
                    type="text" 
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="SEO Title..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{metaTitle.length}/60 chars</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Meta Description</label>
                  <textarea 
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                    placeholder="SEO Description..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{metaDescription.length}/160 chars</p>
                </div>
              </div>
            </div>

            {/* Live Checklist */}
            {focusKeyword && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Checklist</h4>
                <div className="space-y-3">
                  {seoChecks.map((check, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {check.passed ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span className={cn(
                        "text-xs font-medium leading-relaxed",
                        check.passed ? "text-slate-600" : "text-slate-400"
                      )}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Settings */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Post Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Featured Image URL</label>
                  <input 
                    type="text" 
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                  {thumbnail && (
                    <img src={thumbnail} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
