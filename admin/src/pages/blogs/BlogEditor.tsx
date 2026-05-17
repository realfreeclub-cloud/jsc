import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Loader2, Settings, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { cn } from '../../utils/cn';

// ─── Types ─────────────────────────────────────────────────────────────────

interface BlogSeo { title?: string; description?: string; keywords?: string[] }
interface Blog {
  title?: string; slug?: string; content?: string; excerpt?: string;
  thumbnail?: string; category?: string; isPublished?: boolean; seo?: BlogSeo;
}
interface BlogResponse { data: Blog }

interface FormState {
  title: string; slug: string; excerpt: string; thumbnail: string;
  category: string; isPublished: boolean; focusKeyword: string;
  metaTitle: string; metaDescription: string;
}

const toSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// ─── Inner Form Component (no useEffect needed for initialization) ──────────

function BlogEditorForm({ initialData, blogId }: { initialData?: Blog; blogId?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(blogId);

  const [form, setForm] = useState<FormState>({
    title:           initialData?.title           ?? '',
    slug:            initialData?.slug            ?? '',
    excerpt:         initialData?.excerpt         ?? '',
    thumbnail:       initialData?.thumbnail       ?? '',
    category:        initialData?.category        ?? '',
    isPublished:     initialData?.isPublished     ?? false,
    focusKeyword:    initialData?.seo?.keywords?.[0] ?? '',
    metaTitle:       initialData?.seo?.title      ?? '',
    metaDescription: initialData?.seo?.description ?? '',
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleTitleChange = (value: string) =>
    setForm(prev => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : toSlug(value),
    }));

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true })],
    content: initialData?.content ?? '',
    editorProps: {
      attributes: { class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6' },
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      const finalPayload = { ...payload, author: '60d5ecb8b392d700153ee612' };
      if (isEditing) return api.patch(`/blogs/${blogId}`, finalPayload);
      return api.post('/blogs', finalPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      navigate('/blogs');
    },
  });

  const handleSave = () => {
    if (!form.title || !form.slug) { alert('Title and Slug are required!'); return; }
    saveMutation.mutate({
      title: form.title, slug: form.slug,
      content: editor?.getHTML() || '',
      excerpt: form.excerpt, thumbnail: form.thumbnail,
      category: form.category, isPublished: form.isPublished,
      seo: {
        title: form.metaTitle,
        description: form.metaDescription,
        keywords: form.focusKeyword ? [form.focusKeyword] : [],
      },
    });
  };

  // ── Live SEO Score ──────────────────────────────────────────────────────
  const contentText = editor?.getText() ?? '';
  const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
  const kw = form.focusKeyword.toLowerCase();

  let seoScore = 100;
  const seoChecks = [
    { label: 'Focus keyword in Title',           passed: kw.length > 0 && form.title.toLowerCase().includes(kw),          penalty: 15 },
    { label: 'Focus keyword in Meta Title',      passed: kw.length > 0 && form.metaTitle.toLowerCase().includes(kw),      penalty: 10 },
    { label: 'Content > 300 words',              passed: wordCount >= 300,                                                  penalty: 15 },
    { label: 'Keyword in first paragraph',       passed: kw.length > 0 && contentText.slice(0, 500).toLowerCase().includes(kw), penalty: 10 },
  ];
  if (!kw) { seoScore = 0; } else { seoChecks.forEach(c => { if (!c.passed) seoScore -= c.penalty; }); }

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
              'px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full',
              form.isPublished ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-slate-100 text-slate-500 border border-slate-200'
            )}>
              {form.isPublished ? 'Published' : 'Draft'}
            </span>
            <p className="text-sm font-medium text-slate-400">{isEditing ? 'Editing Article' : 'Creating New Article'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setField('isPublished', !form.isPublished)} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2">
            Switch to {form.isPublished ? 'Draft' : 'Publish'}
          </button>
          <button onClick={handleSave} disabled={saveMutation.isPending} className="flex items-center gap-2 btn-gold px-5 py-2 rounded-lg text-sm shadow-sm disabled:opacity-50">
            {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save {form.isPublished ? 'Live' : 'Draft'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar pb-32">
          <div className="max-w-3xl mx-auto px-8 pt-12">
            <input
              type="text" placeholder="Article Title..."
              value={form.title} onChange={e => handleTitleChange(e.target.value)}
              className="w-full text-4xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder:text-slate-300 mb-4"
            />
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 border-b border-slate-200 pb-8">
              <span className="shrink-0">https://judicialstudycentre.com/blog/</span>
              <input
                type="text" value={form.slug} onChange={e => setField('slug', e.target.value)}
                className="bg-transparent border-none outline-none text-slate-600 hover:bg-slate-100 px-2 py-0.5 rounded transition-colors w-full"
                placeholder="slug-goes-here"
              />
            </div>
            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px]">
              <div className="border-b border-slate-100 px-4 py-3 flex gap-2">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded hover:bg-slate-200 transition-colors">Bold</button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded hover:bg-slate-200 transition-colors">Italic</button>
                <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded hover:bg-slate-200 transition-colors">H2</button>
                <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded hover:bg-slate-200 transition-colors">List</button>
                <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className="px-3 py-1 bg-slate-100 text-sm font-medium rounded hover:bg-slate-200 transition-colors">Quote</button>
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* SEO Sidebar */}
        <div className="w-96 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-y-auto hidden-scrollbar">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
            <div className="flex items-center gap-2">
              <Globe className="text-slate-400" size={18} />
              <h3 className="font-semibold text-slate-800 dark:text-white">SEO Analysis</h3>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm',
              seoScore >= 80 ? 'border-emerald-500 text-emerald-600' :
              seoScore >= 50 ? 'border-amber-500 text-amber-600' :
                               'border-rose-500 text-rose-600'
            )}>
              {kw ? seoScore : '-'}
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Settings size={14} /> Meta Configuration
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Focus Keyword</label>
                  <input type="text" value={form.focusKeyword} onChange={e => setField('focusKeyword', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none gold-ring"
                    placeholder="e.g. upsc exam tips" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Meta Title</label>
                  <input type="text" value={form.metaTitle} onChange={e => setField('metaTitle', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none gold-ring"
                    placeholder="SEO Title..." />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{form.metaTitle.length}/60 chars</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Meta Description</label>
                  <textarea value={form.metaDescription} onChange={e => setField('metaDescription', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none gold-ring h-24 resize-none"
                    placeholder="SEO Description..." />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{form.metaDescription.length}/160 chars</p>
                </div>
              </div>
            </div>

            {kw && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Checklist</h4>
                <div className="space-y-3">
                  {seoChecks.map((check, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {check.passed
                        ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        : <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />}
                      <span className={cn('text-xs font-medium leading-relaxed', check.passed ? 'text-slate-600' : 'text-slate-400')}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Post Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <input type="text" value={form.category} onChange={e => setField('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none gold-ring" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Featured Image URL</label>
                  <input type="text" value={form.thumbnail} onChange={e => setField('thumbnail', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none gold-ring" />
                  {form.thumbnail && (
                    <img src={form.thumbnail} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-200" />
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

// ─── Outer Shell: fetches data, then mounts the form with initial values ────

export default function BlogEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { data: blogData, isLoading } = useQuery<BlogResponse>({
    queryKey: ['blogs', id],
    queryFn: () => api.get<BlogResponse>(`/blogs/${id}`).then(res => res.data),
    enabled: isEditing,
  });

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-gold-DEFAULT" />
      </div>
    );
  }

  // key={id} ensures BlogEditorForm remounts when navigating between different edit pages
  return <BlogEditorForm key={id ?? 'new'} initialData={blogData?.data} blogId={id} />;
}
