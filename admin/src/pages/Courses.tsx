import React, { useState } from 'react';
import AppDrawer from '../components/ui/AppDrawer';
import { Plus, Loader2, AlertCircle, Search, Save, Info, Image, BookOpen, Video } from 'lucide-react';
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
  accessType?: string;
  deliveryType?: string;
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

  // Syllabus Drawer States
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editModuleData, setEditModuleData] = useState<any | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: 0 });

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editLessonData, setEditLessonData] = useState<any | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: '',
    order: 0,
    isPreview: false,
    isActive: true
  });

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

  // Fetch Syllabus for Selected Course
  const { data: syllabusData, refetch: refetchSyllabus, isLoading: isSyllabusLoading } = useQuery({
    queryKey: ['syllabus', selectedCourseForSyllabus?._id],
    queryFn: () => selectedCourseForSyllabus ? api.get(`/lessons/course/${selectedCourseForSyllabus._id}/syllabus`).then(res => res.data) : null,
    enabled: !!selectedCourseForSyllabus
  });

  const results = data?.data || [];
  const categories = categoriesData?.data || [];
  const syllabusModules = syllabusData?.data || [];
  const selectedModuleDetails = syllabusModules.find((m: any) => m._id === selectedModule?._id) || selectedModule;

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
      fees: course.fees || { online: '', offline: '', hybrid: '' },
      accessType: course.accessType || 'Paid',
      deliveryType: course.deliveryType || 'Online'
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
      accessType: 'Paid',
      deliveryType: 'Online',
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
    { key: 'mode', header: 'Mode' },
    {
      key: 'access',
      header: 'Access & Delivery',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="badge-active" style={{
            background: row.accessType === 'Free' ? '#ECFDF5' : '#FEE2E2',
            color: row.accessType === 'Free' ? '#047857' : '#B91C1C',
            border: `1px solid ${row.accessType === 'Free' ? '#A7F3D0' : '#FCA5A5'}`,
            alignSelf: 'flex-start',
            fontSize: 10,
            padding: '2px 6px'
          }}>
            {row.accessType || 'Paid'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-navy-500)', marginTop: 2 }}>
            {row.deliveryType || 'Online'}
          </span>
        </div>
      )
    },
    {
      key: 'syllabus',
      header: 'Syllabus',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedCourseForSyllabus(row);
            setSelectedModule(null);
            setIsSyllabusOpen(true);
          }}
          className="btn-outline"
          style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, borderColor: GOLD, color: NAVY }}
        >
          <BookOpen size={13} style={{ color: GOLD }} /> Manage Syllabus
        </button>
      )
    },
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
        {(isLoading || isSyllabusLoading) && (
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

      {/* ── Add/Edit Drawer — uses universal AppDrawer component ── */}
      <AppDrawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editData ? '✏ Edit Course Details' : '+ Configure New Course'}
        subtitle="Expose complete course highlights, pricing structures, and media assets."
        maxWidth={1350}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
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
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
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
        }
      >
        {/* Tabs navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-navy-100)', marginBottom: 24, background: '#F8FAFC', marginLeft: -28, marginRight: -28, paddingLeft: 28, marginTop: -28 }}>
          {[
            { key: 'general', icon: '📋', label: 'General Config' },
            { key: 'media', icon: '🖼', label: 'Media & Description' },
            { key: 'pricing', icon: '💰', label: 'Pricing Structure' },
            { key: 'lists', icon: '📝', label: 'Highlights & Lists' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                padding: '16px 12px',
                fontSize: 13,
                fontWeight: 700,
                color: activeTab === tab.key ? GOLD : 'var(--color-navy-600)',
                borderBottom: activeTab === tab.key ? `2px solid ${GOLD}` : '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Course form */}
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
                  Configure course payment structures, lifetime vs manual approval flags, and learning access rules.
                </span>
              </div>

              <div>
                <label className="jsc-form-label">Course Access Type *</label>
                <select
                  value={formData.accessType || 'Paid'}
                  onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                  className="jsc-select"
                >
                  <option value="Paid">Paid (Requires WhatsApp enrollment validation)</option>
                  <option value="Free">Free (Student enrolls instantly without confirmation)</option>
                </select>
              </div>

              <div>
                <label className="jsc-form-label">Course Delivery Type *</label>
                <select
                  value={formData.deliveryType || 'Online'}
                  onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                  className="jsc-select"
                >
                  <option value="Online">Online (Recorded + Live Stream Player)</option>
                  <option value="Offline">Offline (Physical Class Lectures)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 1' }} />

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
      </AppDrawer>

      {/* ── Syllabus Management Drawer ── */}
      <AppDrawer
        isOpen={isSyllabusOpen}
        onClose={() => {
          setIsSyllabusOpen(false);
          setSelectedCourseForSyllabus(null);
          setSelectedModule(null);
        }}
        title={`📚 Syllabus Structure: ${selectedCourseForSyllabus?.title || ''}`}
        subtitle="Manage sections (modules) and video lessons with notes."
        maxWidth={1100}
      >
        <div style={{ display: 'flex', gap: 28, height: 'calc(100vh - 200px)', minHeight: 500 }}>
          {/* Left Column: Modules */}
          <div style={{ width: '40%', borderRight: '1px solid var(--color-navy-100)', paddingRight: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Modules</h3>
              <button
                type="button"
                onClick={() => {
                  setEditModuleData(null);
                  setModuleForm({ title: '', description: '', order: syllabusModules.length });
                  setIsModuleModalOpen(true);
                }}
                className="btn-gold"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                + Add Module
              </button>
            </div>

            {isSyllabusLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Loader2 className="animate-spin" style={{ color: GOLD }} /></div>
            ) : syllabusModules.length === 0 ? (
              <div style={{ alignSelf: 'center', color: 'var(--color-navy-400)', fontSize: 13, padding: 32, textAlign: 'center' }}>No modules created yet. Add a module to start building the syllabus.</div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {syllabusModules.map((mod: any) => (
                  <div
                    key={mod._id}
                    onClick={() => setSelectedModule(mod)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid',
                      borderColor: selectedModuleDetails?._id === mod._id ? GOLD : 'var(--color-navy-100)',
                      background: selectedModuleDetails?._id === mod._id ? 'rgba(244,180,0,0.06)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: NAVY }}>{mod.title}</div>
                        {mod.description && <div style={{ fontSize: 11.5, color: 'var(--color-navy-400)', marginTop: 2 }}>{mod.description}</div>}
                        <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginTop: 4 }}>Order: {mod.order} • {mod.lessons?.length || 0} Lessons</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditModuleData(mod);
                            setModuleForm({ title: mod.title, description: mod.description || '', order: mod.order });
                            setIsModuleModalOpen(true);
                          }}
                          style={{ background: 'none', border: 'none', color: NAVY, cursor: 'pointer', padding: 4 }}
                        >
                          ✏
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Delete module "${mod.title}" and all its lessons?`)) {
                              await api.delete(`/modules/${mod._id}`);
                              if (selectedModule?.id === mod._id) setSelectedModule(null);
                              refetchSyllabus();
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: 4 }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Lessons */}
          <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedModuleDetails ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Lessons in: <span style={{ color: GOLD }}>{selectedModuleDetails.title}</span></h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditLessonData(null);
                      setLessonForm({
                        title: '',
                        description: '',
                        videoUrl: '',
                        pdfUrl: '',
                        order: selectedModuleDetails.lessons?.length || 0,
                        isPreview: false,
                        isActive: true
                      });
                      setIsLessonModalOpen(true);
                    }}
                    className="btn-gold"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    + Add Lesson
                  </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(!selectedModuleDetails.lessons || selectedModuleDetails.lessons.length === 0) ? (
                    <div style={{ color: 'var(--color-navy-400)', fontSize: 13, padding: 32, textAlign: 'center' }}>No lessons created under this module. Add a lesson to start uploading contents.</div>
                  ) : (
                    selectedModuleDetails.lessons.map((les: any) => (
                      <div
                        key={les._id}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: '1px solid var(--color-navy-100)',
                          background: 'white',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ padding: 6, borderRadius: 8, background: '#F1F5F9', color: GOLD, marginTop: 2 }}>
                              <Video size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13.5, color: NAVY }}>
                                {les.title}
                                {!les.isActive && <span style={{ marginLeft: 8, fontSize: 10, background: '#F1F5F9', color: 'var(--color-navy-400)', padding: '2px 6px', borderRadius: 4 }}>Draft</span>}
                                {les.isPreview && <span style={{ marginLeft: 6, fontSize: 10, background: '#ECFDF5', color: '#059669', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Free Preview</span>}
                              </div>
                              {les.description && <div style={{ fontSize: 11.5, color: 'var(--color-navy-400)', marginTop: 2 }}>{les.description}</div>}
                              
                              <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                                {les.videoUrl && <span style={{ fontSize: 11, color: 'var(--color-navy-500)', display: 'flex', alignItems: 'center', gap: 4 }}>🎥 YouTube: <code style={{ background: '#F1F5F9', padding: '2px 4px', borderRadius: 4 }}>{les.videoUrl}</code></span>}
                                {les.pdfUrl && <span style={{ fontSize: 11, color: '#0284C7', display: 'flex', alignItems: 'center', gap: 4 }}>📄 Notes attached</span>}
                              </div>
                              <div style={{ fontSize: 10.5, color: 'var(--color-navy-400)', marginTop: 4 }}>Order: {les.order}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditLessonData(les);
                                setLessonForm({
                                  title: les.title,
                                  description: les.description || '',
                                  videoUrl: les.videoUrl || '',
                                  pdfUrl: les.pdfUrl || '',
                                  order: les.order,
                                  isPreview: !!les.isPreview,
                                  isActive: les.isActive !== false
                                });
                                setIsLessonModalOpen(true);
                              }}
                              style={{ background: 'none', border: 'none', color: NAVY, cursor: 'pointer', padding: 4 }}
                            >
                              ✏
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Delete lesson "${les.title}"?`)) {
                                  await api.delete(`/lessons/${les._id}`);
                                  refetchSyllabus();
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: 4 }}
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-navy-200)', borderRadius: 16, color: 'var(--color-navy-400)', padding: 32, textAlign: 'center' }}>
                <BookOpen size={48} style={{ color: 'var(--color-navy-200)', marginBottom: 12 }} />
                <h4 style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>No Module Selected</h4>
                <p style={{ fontSize: 13, maxWidth: 300 }}>Please click on one of the modules on the left to manage its video lessons and downloadable study notes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Module Dialog */}
        {isModuleModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,21,47,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 20, width: '100%', maxWidth: 450, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 16 }}>{editModuleData ? '✏ Edit Module' : '+ Add New Module'}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="jsc-form-label">Module Title *</label>
                  <input
                    type="text"
                    required
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="jsc-input"
                    placeholder="e.g. Chapter 1: Introduction to CrPC"
                  />
                </div>
                <div>
                  <label className="jsc-form-label">Short Description</label>
                  <input
                    type="text"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    className="jsc-input"
                    placeholder="e.g. Fundamental concepts and definitions"
                  />
                </div>
                <div>
                  <label className="jsc-form-label">Display Order</label>
                  <input
                    type="number"
                    value={moduleForm.order}
                    onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })}
                    className="jsc-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setIsModuleModalOpen(false)} className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>Cancel</button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!moduleForm.title) return alert('Title is required');
                      if (editModuleData) {
                        await api.patch(`/modules/${editModuleData._id}`, moduleForm);
                      } else {
                        await api.post('/modules', {
                          ...moduleForm,
                          course: selectedCourseForSyllabus?._id
                        });
                      }
                      setIsModuleModalOpen(false);
                      refetchSyllabus();
                    }}
                    className="btn-gold"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    Save Module
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Lesson Dialog */}
        {isLessonModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,21,47,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 16 }}>{editLessonData ? '✏ Edit Lesson' : '+ Add New Lesson'}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="jsc-form-label">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="jsc-input"
                    placeholder="e.g. CrPC Section 1-5 Explained"
                  />
                </div>
                <div>
                  <label className="jsc-form-label">Brief Description</label>
                  <input
                    type="text"
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    className="jsc-input"
                    placeholder="e.g. Scope, extent and definitions of the code"
                  />
                </div>
                <div>
                  <label className="jsc-form-label">YouTube Video URL / ID *</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="jsc-input"
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  />
                </div>
                <div>
                  <label className="jsc-form-label">Downloadable Notes (PDF URL)</label>
                  <input
                    type="text"
                    value={lessonForm.pdfUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                    className="jsc-input"
                    placeholder="e.g. /uploads/notes-crpc-ch1.pdf"
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="jsc-form-label">Order</label>
                    <input
                      type="number"
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                      className="jsc-input"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 20 }}>
                    <input
                      type="checkbox"
                      id="isPreview"
                      checked={lessonForm.isPreview}
                      onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="isPreview" style={{ fontSize: 11, fontWeight: 700, color: NAVY, cursor: 'pointer' }}>Free Preview</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 20 }}>
                    <input
                      type="checkbox"
                      id="isActiveLesson"
                      checked={lessonForm.isActive}
                      onChange={(e) => setLessonForm({ ...lessonForm, isActive: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="isActiveLesson" style={{ fontSize: 11, fontWeight: 700, color: NAVY, cursor: 'pointer' }}>Active</label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                  <button type="button" onClick={() => setIsLessonModalOpen(false)} className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>Cancel</button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!lessonForm.title || !lessonForm.videoUrl) return alert('Title and Video URL are required');
                      if (editLessonData) {
                        await api.patch(`/lessons/${editLessonData._id}`, lessonForm);
                      } else {
                        await api.post('/lessons', {
                          ...lessonForm,
                          course: selectedCourseForSyllabus?._id,
                          module: selectedModuleDetails?._id
                        });
                      }
                      setIsLessonModalOpen(false);
                      refetchSyllabus();
                    }}
                    className="btn-gold"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    Save Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  );
};

export default Courses;
