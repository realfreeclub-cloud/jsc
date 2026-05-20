import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  FileImage, 
  ExternalLink,
  Copy,
  Check,
  Search
} from 'lucide-react';
import api from '../../utils/api';
import { cn } from '../../utils/cn';

interface GalleryItem {
  _id: string;
  title?: string;
  imageUrl: string;
  category?: string;
  isPrivate?: boolean;
  createdAt?: string;
}

interface ApiListResponse {
  data: GalleryItem[];
}


export default function GalleryManager() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [categoryType, setCategoryType] = useState<'existing' | 'new'>('existing');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [newCategory, setNewCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch gallery data
  const { data, isLoading } = useQuery<ApiListResponse>({
    queryKey: ['gallery'],
    queryFn: () => api.get<ApiListResponse>('/gallerys').then((res) => res.data),
  });

  const images: GalleryItem[] = data?.data || [];
  const existingCategories = Array.from(new Set(images.map((img) => img.category || 'General')));
  const categories = ['All', ...existingCategories];

  // Filtered images
  const filteredImages = images.filter((img) => {
    const matchesCategory = activeCategory === 'All' || img.category === activeCategory;
    const matchesSearch = !searchQuery || (img.title && img.title.toLowerCase().includes(searchQuery.toLowerCase())) || (img.category && img.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: { title: string; imageUrl: string; category: string; isPrivate: boolean }) =>
      api.post('/gallerys', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/gallerys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // Handle Drag-and-Drop or File Pick in Form
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Auto-set title if empty
      setTitle((prev) => prev || file.name.split('.')[0].replace(/[-_]/g, ' '));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select or drag an image first.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload actual file to server uploads folder
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = uploadRes.data.url;
      if (!imageUrl) {
        throw new Error('Upload response did not contain image URL.');
      }

      // 2. Determine category value
      const categoryValue = categoryType === 'new' 
        ? (newCategory.trim() || 'General') 
        : selectedCategory;

      // 3. Create gallery entry
      await createMutation.mutateAsync({
        title: title.trim() || selectedFile.name,
        imageUrl,
        category: categoryValue,
        isPrivate,
      });

      // Reset form
      setTitle('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setNewCategory('');
      setIsPrivate(false);
      alert('Image uploaded and added to gallery successfully!');
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div className="jsc-page-header">
        <h1 className="jsc-page-title font-display text-3xl">Media Gallery</h1>
        <p className="jsc-page-subtitle">Upload, categorize, and control the visibility of platform image assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Side: Redesigned Upload Panel ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="jsc-card p-6 bg-white shadow-md border border-navy-100 rounded-2xl">
            <h2 className="text-lg font-bold text-navy-900 mb-4 pb-2 border-b border-navy-50 flex items-center gap-2">
              <Upload size={18} className="text-gold-500" />
              Upload Image Asset
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="jsc-form-label">Image File <span className="required">*</span></label>
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-navy-200 aspect-video group bg-navy-50">
                    <img 
                      src={previewUrl} 
                      alt="Upload preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed border-navy-200 hover:border-gold-500 hover:bg-gold-dim rounded-xl p-6 text-center cursor-pointer transition-all",
                      isDragActive && "border-gold-500 bg-gold-dim"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gold-dim flex items-center justify-center text-gold-500">
                        <FileImage size={20} />
                      </div>
                      <p className="text-xs font-semibold text-navy-800">
                        Drag image here or <span className="text-gold-600 underline">browse</span>
                      </p>
                      <p className="text-[10px] text-navy-400">Supports JPG, PNG, WebP up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title input */}
              <div>
                <label className="jsc-form-label">Asset Title</label>
                <input
                  type="text"
                  placeholder="e.g. Director Rai Sir"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="jsc-input"
                />
              </div>

              {/* Visibility Choice */}
              <div>
                <label className="jsc-form-label">Visibility Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 px-3 border rounded-xl text-xs font-semibold transition-all",
                      !isPrivate 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-navy-100 bg-white text-navy-600 hover:bg-navy-50"
                    )}
                  >
                    <Eye size={14} /> Public (Website)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 px-3 border rounded-xl text-xs font-semibold transition-all",
                      isPrivate 
                        ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-navy-100 bg-white text-navy-600 hover:bg-navy-50"
                    )}
                  >
                    <EyeOff size={14} /> Private (Admin Only)
                  </button>
                </div>
                <p className="text-[10px] text-navy-400 mt-1">
                  {!isPrivate 
                    ? "✓ This image will be visible in the public gallery page on the website."
                    : "🔒 This image is private. It can only be used by admins and won't appear in the public gallery."}
                </p>
              </div>

              {/* Category Configuration */}
              <div>
                <label className="jsc-form-label">Category Assignment</label>
                <div className="flex bg-navy-50 p-1 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setCategoryType('existing')}
                    className={cn(
                      "flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all",
                      categoryType === 'existing' ? "bg-white text-navy-950 shadow-sm" : "text-navy-500 hover:text-navy-800"
                    )}
                  >
                    Choose Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType('new')}
                    className={cn(
                      "flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all",
                      categoryType === 'new' ? "bg-white text-navy-950 shadow-sm" : "text-navy-500 hover:text-navy-800"
                    )}
                  >
                    Create Custom
                  </button>
                </div>

                {categoryType === 'existing' ? (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="jsc-select w-full"
                  >
                    <option value="General">General</option>
                    {existingCategories.filter(cat => cat !== 'General' && cat !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter manual category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="jsc-input"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full btn-gold py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm mt-2 shadow-md animate-pulse-gold"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Uploading Assets...
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Add to Gallery
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Side: Redesigned Asset Gallery Grid ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filter / Search Bar */}
          <div className="jsc-card p-4 bg-white shadow-sm border border-navy-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-navy-300" size={16} />
              <input
                type="text"
                placeholder="Search images or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="jsc-search-bar pl-9 py-2 rounded-xl border-navy-100"
              />
            </div>

            {/* Category selection */}
            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto hidden-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap",
                    activeCategory === cat
                      ? "bg-navy-900 border-navy-900 text-white shadow-sm"
                      : "bg-white border-navy-100 text-navy-600 hover:bg-navy-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-navy-50 rounded-2xl border border-navy-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="jsc-card p-12 text-center bg-white rounded-2xl border border-navy-100 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center text-navy-300">
                <ImageIcon size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">No media assets found</h3>
                <p className="text-xs text-navy-400 mt-1 max-w-sm">
                  Try uploading an image using the form on the left or search with a different keyword.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredImages.map((img) => (
                <div
                  key={img._id}
                  className="jsc-card group relative bg-white border border-navy-100 rounded-2xl overflow-hidden shadow-sm aspect-square flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image container */}
                  <div className="relative grow overflow-hidden bg-navy-50">
                    <img
                      src={img.imageUrl}
                      alt={img.title || 'Media Asset'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Visibility overlay badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm",
                        img.isPrivate 
                          ? "bg-amber-500/90 text-white" 
                          : "bg-emerald-500/90 text-white"
                      )}>
                        {img.isPrivate ? <EyeOff size={10} /> : <Eye size={10} />}
                        {img.isPrivate ? 'Private' : 'Public'}
                      </span>

                      <span className="bg-navy-950/80 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
                        {img.category || 'General'}
                      </span>
                    </div>

                    {/* Quick copy, open and delete actions on Hover */}
                    <div className="absolute inset-0 bg-navy-900/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {/* Copy URL */}
                      <button
                        onClick={() => copyToClipboard(img.imageUrl, img._id)}
                        title="Copy image direct link"
                        className="w-9 h-9 rounded-full bg-white hover:bg-gold-500 hover:text-navy-900 text-navy-800 flex items-center justify-center shadow-md transition-colors"
                      >
                        {copiedId === img._id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>

                      {/* Open Link */}
                      <a
                        href={img.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open image in new tab"
                        className="w-9 h-9 rounded-full bg-white hover:bg-gold-500 hover:text-navy-900 text-navy-800 flex items-center justify-center shadow-md transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this media asset?')) {
                            deleteMutation.mutate(img._id);
                          }
                        }}
                        title="Delete asset"
                        className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Asset Footer Title */}
                  <div className="p-3 border-t border-navy-50 bg-white">
                    <p className="text-xs font-semibold text-navy-900 truncate">
                      {img.title || 'Untitled Asset'}
                    </p>
                    <p className="text-[10px] text-navy-400 mt-0.5">
                      {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
