import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Loader2, Settings, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

// ─── Types ─────────────────────────────────────────────────────────────────

interface BlogSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}
interface Blog {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  category?: string;
  isPublished?: boolean;
  seo?: BlogSeo;
}
interface BlogResponse {
  data: Blog;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  isPublished: boolean;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
}

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const NAVY = '#07152F';
const GOLD = '#F4B400';

// ─── Inner Form Component ──────────────────────────────────────────────────

function BlogEditorForm({ initialData, blogId }: { initialData?: Blog; blogId?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(blogId);

  const [form, setForm] = useState<FormState>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    excerpt: initialData?.excerpt ?? '',
    thumbnail: initialData?.thumbnail ?? '',
    category: initialData?.category ?? '',
    isPublished: initialData?.isPublished ?? false,
    focusKeyword: initialData?.seo?.keywords?.[0] ?? '',
    metaTitle: initialData?.seo?.title ?? '',
    metaDescription: initialData?.seo?.description ?? '',
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (value: string) =>
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : toSlug(value),
    }));

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true })],
    content: initialData?.content ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] px-8 py-6',
        style: 'color: var(--color-navy-800); font-size: 15px; line-height: 1.7;',
      },
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
    if (!form.title || !form.slug) {
      alert('Title and Slug are required!');
      return;
    }
    saveMutation.mutate({
      title: form.title,
      slug: form.slug,
      content: editor?.getHTML() || '',
      excerpt: form.excerpt,
      thumbnail: form.thumbnail,
      category: form.category,
      isPublished: form.isPublished,
      seo: {
        title: form.metaTitle,
        description: form.metaDescription,
        keywords: form.focusKeyword ? [form.focusKeyword] : [],
      },
    });
  };

  // ── Live SEO Score ──────────────────────────────────────────────────────
  const contentText = editor?.getText() ?? '';
  const wordCount = contentText.split(/\s+/).filter((w) => w.length > 0).length;
  const kw = form.focusKeyword.toLowerCase();

  let seoScore = 100;
  const seoChecks = [
    {
      label: 'Focus keyword in Title',
      passed: kw.length > 0 && form.title.toLowerCase().includes(kw),
      penalty: 15,
    },
    {
      label: 'Focus keyword in Meta Title',
      passed: kw.length > 0 && form.metaTitle.toLowerCase().includes(kw),
      penalty: 10,
    },
    {
      label: 'Content > 300 words',
      passed: wordCount >= 300,
      penalty: 15,
    },
    {
      label: 'Keyword in first paragraph',
      passed: kw.length > 0 && contentText.slice(0, 500).toLowerCase().includes(kw),
      penalty: 10,
    },
  ];
  if (!kw) {
    seoScore = 0;
  } else {
    seoChecks.forEach((c) => {
      if (!c.passed) seoScore -= c.penalty;
    });
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 68px)',
        margin: '-28px -32px -18px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-navy-50)',
      }}
      className="animate-fade-up"
    >
      {/* Top Header Bar */}
      <div
        style={{
          height: 64,
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid var(--color-navy-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/blogs')}
            style={{
              padding: 6,
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              color: 'var(--color-navy-400)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-navy-100)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {form.isPublished ? (
              <span className="badge-active">
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Published
              </span>
            ) : (
              <span className="badge-inactive">
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-navy-300)', display: 'inline-block' }} />
                Draft
              </span>
            )}
            <p style={{ fontSize: 13, color: 'var(--color-navy-400)', fontWeight: 500 }}>
              {isEditing ? 'Editing Article' : 'Creating New Article'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setField('isPublished', !form.isPublished)}
            className="btn-outline"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            Switch to {form.isPublished ? 'Draft' : 'Publish'}
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="btn-gold"
            style={{ padding: '9px 20px', fontSize: 13, gap: 8 }}
          >
            {saveMutation.isPending ? (
              <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={15} />
            )}
            Save {form.isPublished ? 'Live' : 'Draft'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Editor Panel */}
        <div
          className="hidden-scrollbar"
          style={{ flex: 1, overflowY: 'auto', paddingBottom: 120, background: '#fff' }}
        >
          <div style={{ maxWidth: 740, margin: '0 auto', padding: '40px 24px 0' }}>
            <input
              type="text"
              placeholder="Article Title..."
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              style={{
                width: '100%',
                fontSize: 32,
                fontWeight: 800,
                color: NAVY,
                fontFamily: 'Playfair Display, Georgia, serif',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                marginBottom: 16,
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'var(--color-navy-400)',
                paddingBottom: 24,
                borderBottom: '1px solid var(--color-navy-100)',
                marginBottom: 32,
              }}
            >
              <Globe size={14} style={{ color: 'var(--color-navy-300)', flexShrink: 0 }} />
              <span>https://judicialstudycentre.com/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setField('slug', e.target.value)}
                style={{
                  background: 'var(--color-navy-50)',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  color: 'var(--color-navy-700)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  width: '100%',
                  fontWeight: 600,
                }}
                placeholder="slug-goes-here"
              />
            </div>

            {/* Rich Editor Box */}
            <div
              className="jsc-card"
              style={{
                minHeight: 520,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
                border: '1.5px solid var(--color-navy-100)',
              }}
            >
              {/* Toolbar */}
              <div
                style={{
                  background: 'var(--color-navy-50)',
                  borderBottom: '1px solid var(--color-navy-100)',
                  padding: 10,
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { label: 'Bold', action: () => editor?.chain().focus().toggleBold().run() },
                  { label: 'Italic', action: () => editor?.chain().focus().toggleItalic().run() },
                  { label: 'Heading H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
                  { label: 'List', action: () => editor?.chain().focus().toggleBulletList().run() },
                  { label: 'Quote', action: () => editor?.chain().focus().toggleBlockquote().run() },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.action}
                    type="button"
                    style={{
                      background: '#fff',
                      border: '1.5px solid var(--color-navy-200)',
                      borderRadius: 6,
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--color-navy-700)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD;
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold-50)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-navy-200)';
                      (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Right SEO Sidebar */}
        <div
          className="hidden-scrollbar"
          style={{
            width: 360,
            background: '#fff',
            borderLeft: '1px solid var(--color-navy-100)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* SEO Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-navy-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(8px)',
              zIndex: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe style={{ color: 'var(--color-navy-400)' }} size={16} />
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: NAVY }}>SEO Analysis</h3>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `3px solid ${
                  seoScore >= 80
                    ? '#10B981'
                    : seoScore >= 50
                    ? '#F59E0B'
                    : '#EF4444'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                color:
                  seoScore >= 80
                    ? '#059669'
                    : seoScore >= 50
                    ? '#D97706'
                    : '#DC2626',
              }}
            >
              {kw ? seoScore : '—'}
            </div>
          </div>

          {/* Configuration Inputs */}
          <div style={{ padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Meta Configuration */}
            <div>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: NAVY,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Settings size={13} style={{ color: GOLD }} />
                Meta Configuration
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="jsc-form-label" style={{ fontSize: 11.5 }}>
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={form.focusKeyword}
                    onChange={(e) => setField('focusKeyword', e.target.value)}
                    className="jsc-input"
                    style={{ padding: '9px 12px', fontSize: 13 }}
                    placeholder="e.g. mp civil judge tips"
                  />
                </div>

                <div>
                  <label className="jsc-form-label" style={{ fontSize: 11.5 }}>
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setField('metaTitle', e.target.value)}
                    className="jsc-input"
                    style={{ padding: '9px 12px', fontSize: 13 }}
                    placeholder="SEO Title..."
                  />
                  <p style={{ textAlign: 'right', fontSize: 10, color: 'var(--color-navy-300)', marginTop: 4 }}>
                    {form.metaTitle.length}/60 chars
                  </p>
                </div>

                <div>
                  <label className="jsc-form-label" style={{ fontSize: 11.5 }}>
                    Meta Description
                  </label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setField('metaDescription', e.target.value)}
                    className="jsc-textarea"
                    style={{ padding: '9px 12px', fontSize: 13, height: 80 }}
                    placeholder="SEO Description..."
                  />
                  <p style={{ textAlign: 'right', fontSize: 10, color: 'var(--color-navy-300)', marginTop: 4 }}>
                    {form.metaDescription.length}/160 chars
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            {kw && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'var(--color-navy-50)',
                  border: '1.5px solid var(--color-navy-100)',
                }}
              >
                <h4 style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Live Checklist
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {seoChecks.map((check, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      {check.passed ? (
                        <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0, marginTop: 1 }} />
                      ) : (
                        <AlertCircle size={15} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: check.passed ? 'var(--color-navy-700)' : 'var(--color-navy-400)',
                        }}
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General details */}
            <div style={{ borderTop: '1px solid var(--color-navy-100)', paddingTop: 20 }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                Post Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="jsc-form-label" style={{ fontSize: 11.5 }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="jsc-input"
                    style={{ padding: '9px 12px', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="jsc-form-label" style={{ fontSize: 11.5 }}>
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={(e) => setField('thumbnail', e.target.value)}
                    className="jsc-input"
                    style={{ padding: '9px 12px', fontSize: 13 }}
                  />
                  {form.thumbnail && (
                    <img
                      src={form.thumbnail}
                      alt="Preview"
                      style={{
                        marginTop: 10,
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1.5px solid var(--color-navy-100)',
                      }}
                    />
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

// ─── Outer Shell ───────────────────────────────────────────────────────────

export default function BlogEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { data: blogData, isLoading } = useQuery<BlogResponse>({
    queryKey: ['blogs', id],
    queryFn: () => api.get<BlogResponse>(`/blogs/${id}`).then((res) => res.data),
    enabled: isEditing,
  });

  if (isEditing && isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Loader2
          size={36}
          style={{ color: GOLD, animation: 'spin 1s linear infinite' }}
        />
      </div>
    );
  }

  return <BlogEditorForm key={id ?? 'new'} initialData={blogData?.data} blogId={id} />;
}
