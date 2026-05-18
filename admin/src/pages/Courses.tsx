import React, { useState } from 'react';
import { Plus, X, Loader2, AlertCircle, Search, Save, Info, BookOpen, Layers, DollarSign, Image } from 'lucide-react';
import { Table, type Column } from '../components/ui/Table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

interface Category {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  category: Category | string;
  faculty?: string;
  mode: string;
  imageUrl?: string;
  demoVideoUrl?: string;
  duration: string;
  language: string;
  studentsEnrolled?: string;
  about?: string;
  highlights?: string[];
  features?: string[];
  suitableFor?: string[];
  states?: string[];
  fees?: {
    online?: string;
    offline?: string;
    hybrid?: string;
  };
  note?: string;
  isActive?: boolean;
  createdAt: string;
}

const NAVY = '#07152F';
const GOLD = '#F4B400';

const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'pricing' | 'lists'>('general');

  const queryClient = useQueryClient();

  // Fetch Courses
  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', searchTerm],
    queryFn: () => api.get(`/courses?search=${searchTerm}`).then((res) => res.data),
  });

  // Fetch Course Categories for Selection
  const { data: categoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => api.get('/course-categories').then((res) => res.data),
  });

  const results = data?.data || [];
  const categories = categoriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (newData: Partial<Course>) => api.post('/courses', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsModalOpen(false);
      setEditData(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: Partial<Course> & { _id: string }) =>
      api.patch(`/courses/${updateData._id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsModalOpen(false);
      setEditData(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const handleEdit = (course: Course) => {
    setEditData(course);
    setFormData({
      ...course,
      category: typeof course.category === 'object' ? course.category?._id : course.category,
      fees: course.fees || { online: '', offline: '', hybrid: '' }
    });
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleDelete = (course: Course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      deleteMutation.mutate(course._id);
    }
  };

  const handleAddNew = () => {
    setEditData(null);
    setFormData({
      title: '',
      subtitle: '',
      category: categories[0]?._id || '',
      faculty: 'R. N. Rai (Rai Sir) & Team',
      language: 'Bilingual (Hindi/English)',
      mode: 'Hybrid',
      duration: '',
      studentsEnrolled: '',
      imageUrl: '',
      demoVideoUrl: '',
      about: '',
      highlights: [],
      features: [],
      suitableFor: [],
      states: [],
      fees: { online: '', offline: '', hybrid: '' },
      note: 'Extra charges applicable for Test series + Mock',
      isActive: true,
    });
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate slug from title if new course or empty slug
    const finalData = { ...formData };
    if (!finalData.slug && finalData.title) {
      finalData.slug = finalData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (editData) {
      await updateMutation.mutateAsync({ ...finalData, _id: editData._id } as Partial<Course> & { _id: string });
    } else {
      await createMutation.mutateAsync(finalData);
    }
  };

  const arrayToString = (arr?: string[]) => {
    return arr ? arr.join('\n') : '';
  };

  const handleListChange = (field: keyof Course, value: string) => {
    const arr = value.split('\n').map(x => x.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const handleFeeChange = (key: 'online' | 'offline' | 'hybrid', value: string) => {
    setFormData(prev => ({
      ...prev,
      fees: {
        ...(prev.fees || {}),
        [key]: value
      }
    }));
  };

  const columns: Column<Course>[] = [
    {
      key: 'title',
      header: 'Course Details',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600, color: NAVY }}>{row.title}</span>
          <span style={{ fontSize: 11, color: 'var(--color-navy-400)' }}>{row.subtitle || 'No subtitle set'}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="badge-active" style={{ background: 'var(--color-gold-dim)', color: 'var(--color-gold-600)', border: '1px solid rgba(244,180,0,0.2)' }}>
          {(row.category as Category)?.name || 'General'}
        </span>
      ),
    },
    { key: 'language', header: 'Language' },
    { key: 'mode', header: 'Mode' },
    { key: 'duration', header: 'Duration' },
    {
      key: 'fees',
      header: 'Fees (₹)',
      render: (row) => (
        <div style={{ fontSize: 12, color: 'var(--color-navy-600)' }}>
          {row.fees?.online && <div>ON: ₹{row.fees.online}</div>}
          {row.fees?.offline && <div>OFF: ₹{row.fees.offline}</div>}
          {row.fees?.hybrid && <div>HY: ₹{row.fees.hybrid}</div>}
          {!row.fees?.online && !row.fees?.offline && !row.fees?.hybrid && <span style={{ color: 'red' }}>Not configured</span>}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-up">
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div className="jsc-page-header">
          <h1 className="jsc-page-title">Course Program Management</h1>
          <p className="jsc-page-subtitle">Completely customize pricing, highlights, covered states, and study options.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn-gold"
          style={{ padding: '9px 18px', fontSize: 13 }}
        >
          <Plus size={15} /> Add New Course
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="jsc-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-navy-400)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search courses by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="jsc-search-bar"
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
        {(isLoading) && (
          <Loader2
            size={16}
            style={{ animation: 'spin 1s linear infinite', color: GOLD, marginLeft: 'auto' }}
          />
        )}
      </div>

      {/* ── Table Content ── */}
      {isLoading ? (
        <div style={{ padding: '48px 24px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 56,
                background: 'var(--color-navy-50)',
                borderRadius: 10,
                marginBottom: 10,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              color: '#DC2626',
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
            Connection Error
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)' }}>
            We couldn't fetch the course list. Check the server connection.
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={results}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ── Add/Edit Slide-over ── */}
      {isModalOpen && (
        <div
          className="jsc-drawer-overlay animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div
            className="jsc-drawer animate-slide-right"
            style={{ width: '92%', maxWidth: 1350, height: '100vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="jsc-drawer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h2
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {editData ? '✏ Edit Course Details' : '+ Configure New Course'}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginTop: 4 }}>
                  Expose complete course highlights, pricing structures, and media assets.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: 8,
                  color: 'rgba(255,255,255,0.70)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,180,0,0.20)';
                  (e.currentTarget as HTMLButtonElement).style.color = GOLD;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.70)';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Horizontal Tabs Selector */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-navy-100)', padding: '0 24px', background: '#F8FAFC', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                style={{
                  padding: '16px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: activeTab === 'general' ? GOLD : 'var(--color-navy-600)',
                  borderBottom: activeTab === 'general' ? `2px solid ${GOLD}` : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <BookOpen size={15} /> General Config
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                style={{
                  padding: '16px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: activeTab === 'media' ? GOLD : 'var(--color-navy-600)',
                  borderBottom: activeTab === 'media' ? `2px solid ${GOLD}` : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Image size={15} /> Media & Description
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                style={{
                  padding: '16px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: activeTab === 'pricing' ? GOLD : 'var(--color-navy-600)',
                  borderBottom: activeTab === 'pricing' ? `2px solid ${GOLD}` : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <DollarSign size={15} /> Pricing Structure
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lists')}
                style={{
                  padding: '16px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: activeTab === 'lists' ? GOLD : 'var(--color-navy-600)',
                  borderBottom: activeTab === 'lists' ? `2px solid ${GOLD}` : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Layers size={15} /> highlights & lists
              </button>
            </div>

            {/* Scrollable Drawer Form Body */}
            <div className="jsc-drawer-body" style={{ padding: 24, overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <form id="course-form" onSubmit={handleSubmit}>
                {activeTab === 'general' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px 20px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="jsc-form-label">Course Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. Judiciary Foundation Course for PCS (J)"
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Select Course Category *</label>
                      <select
                        required
                        value={typeof formData.category === 'object' ? (formData.category as Category)?._id : formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="jsc-select"
                      >
                        <option value="" disabled>-- Select Category --</option>
                        {categories.map((cat: Category) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="jsc-form-label">Subtitle / Motto (Italic Text) *</label>
                      <input
                        type="text"
                        required
                        value={formData.subtitle || ''}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. Build a Strong Foundation for Judicial Services"
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Mode of Study *</label>
                      <select
                        value={formData.mode || 'Hybrid'}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="jsc-select"
                      >
                        <option>Online</option>
                        <option>Offline</option>
                        <option>Hybrid</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Duration *</label>
                      <input
                        type="text"
                        required
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. 20-22 Months"
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Language Support *</label>
                      <input
                        type="text"
                        required
                        value={formData.language || 'Hindi & English'}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. Hindi & English"
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Students Enrolled Badge</label>
                      <input
                        type="text"
                        value={formData.studentsEnrolled || ''}
                        onChange={(e) => setFormData({ ...formData, studentsEnrolled: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. 2.5k+"
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="jsc-form-label">Faculty in Charge</label>
                      <input
                        type="text"
                        value={formData.faculty || 'R. N. Rai (Rai Sir) & Team'}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. R. N. Rai (Rai Sir) & Team"
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Custom Route URL (Slug)</label>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. pcs-j-foundation"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div>
                        <label className="jsc-form-label">Detailed Course Overview Paragraph *</label>
                        <textarea
                          rows={8}
                          required
                          value={formData.about || ''}
                          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                          className="jsc-input"
                          placeholder="Brief paragraph describing objectives, targets, syllabus scope..."
                          style={{ resize: 'none', lineHeight: '1.5', height: '100%', minHeight: 180 }}
                        />
                      </div>

                      <div>
                        <label className="jsc-form-label">Demo Video URL (YouTube Link)</label>
                        <input
                          type="url"
                          value={formData.demoVideoUrl || ''}
                          onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                          className="jsc-input"
                          placeholder="e.g. https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label className="jsc-form-label">Thumbnail Image URL *</label>
                        <input
                          type="url"
                          required
                          value={formData.imageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="jsc-input"
                          placeholder="e.g. https://images.unsplash.com/photo-..."
                        />
                      </div>
                      {formData.imageUrl ? (
                        <div style={{ borderRadius: 16, overflow: 'hidden', flex: 1, minHeight: 200, border: '1px solid var(--color-navy-100)', position: 'relative', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      ) : (
                        <div style={{ borderRadius: 16, border: '2px dashed var(--color-navy-200)', flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--color-navy-400)' }}>
                          <Image size={32} />
                          <span style={{ fontSize: 13, fontWeight: 500 }}>No Image Loaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: '1 / -1', background: '#F0F9FF', border: '1px solid #BAE6FD', padding: 16, borderRadius: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Info size={24} style={{ color: '#0284C7' }} />
                      <span style={{ fontSize: 13.5, color: '#0369A1', fontWeight: 500 }}>
                        Configure the exact fees for different modes of learning. Empty fields will not render in website.
                      </span>
                    </div>

                    <div>
                      <label className="jsc-form-label">Online Fee (₹) (e.g. 51,500)</label>
                      <input
                        type="text"
                        value={formData.fees?.online || ''}
                        onChange={(e) => handleFeeChange('online', e.target.value)}
                        className="jsc-input"
                        placeholder="51,500"
                      />
                    </div>

                    <div>
                      <label className="jsc-form-label">Offline Fee (₹) (e.g. 72,500)</label>
                      <input
                        type="text"
                        value={formData.fees?.offline || ''}
                        onChange={(e) => handleFeeChange('offline', e.target.value)}
                        className="jsc-input"
                        placeholder="72,500"
                      />
                    </div>

                    <div>
                      <label className="jsc-form-label">Hybrid Fee (₹) (e.g. 82,500)</label>
                      <input
                        type="text"
                        value={formData.fees?.hybrid || ''}
                        onChange={(e) => handleFeeChange('hybrid', e.target.value)}
                        className="jsc-input"
                        placeholder="82,500"
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="jsc-form-label">Additional Pricing Note</label>
                      <input
                        type="text"
                        value={formData.note || ''}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="jsc-input"
                        placeholder="e.g. Extra charges applicable for Test series + Mock"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'lists' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: 'span 4', background: '#F8FAFC', padding: 12, borderRadius: 12, fontSize: 12, color: 'var(--color-navy-500)' }}>
                      <strong>Tip:</strong> Write every point on a new line. Each line will render as a distinct dynamic bullet list element in the website catalog details pages.
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Course Highlights (One/line)</label>
                      <textarea
                        rows={10}
                        value={arrayToString(formData.highlights)}
                        onChange={(e) => handleListChange('highlights', e.target.value)}
                        className="jsc-input"
                        placeholder="Comprehensive Coverage&#10;Prelims + Mains&#10;Answer Writing"
                        style={{ lineHeight: '1.4', fontFamily: 'monospace', fontSize: 12.5, minHeight: 250 }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Suitable For (One/line)</label>
                      <textarea
                        rows={10}
                        value={arrayToString(formData.suitableFor)}
                        onChange={(e) => handleListChange('suitableFor', e.target.value)}
                        className="jsc-input"
                        placeholder="LL.B. Students&#10;Final Year Students&#10;Judiciary Aspirants"
                        style={{ lineHeight: '1.4', fontFamily: 'monospace', fontSize: 12.5, minHeight: 250 }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">Features (One/line)</label>
                      <textarea
                        rows={10}
                        value={arrayToString(formData.features)}
                        onChange={(e) => handleListChange('features', e.target.value)}
                        className="jsc-input"
                        placeholder="Complete coverage&#10;Recorded Access&#10;Flexible learning"
                        style={{ lineHeight: '1.4', fontFamily: 'monospace', fontSize: 12.5, minHeight: 250 }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label className="jsc-form-label">States Covered (One/line)</label>
                      <textarea
                        rows={10}
                        value={arrayToString(formData.states)}
                        onChange={(e) => handleListChange('states', e.target.value)}
                        className="jsc-input"
                        placeholder="Uttar Pradesh&#10;Bihar&#10;Uttarakhand&#10;Madhya Pradesh"
                        style={{ lineHeight: '1.4', fontFamily: 'monospace', fontSize: 12.5, minHeight: 250 }}
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="jsc-drawer-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
                <label htmlFor="isActive" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy-700)', cursor: 'pointer' }}>
                  Enable Course Access (Is Active)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button
                  form="course-form"
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-gold"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  )}
                  <Save size={15} />
                  {editData ? 'Save Details' : 'Publish Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
