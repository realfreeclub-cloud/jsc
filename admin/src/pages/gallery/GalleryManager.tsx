import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Loader2, Image as ImageIcon, Trash2, Settings } from 'lucide-react';
import api from '../../../utils/api';
import { cn } from '../../../utils/cn';

export default function GalleryManager() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');
  
  // To handle uploading multiple files, we mock a fake upload progress since we don't have a real S3 integration hooked up here.
  const [uploadingFiles, setUploadingFiles] = useState<{file: File, progress: number}[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => api.get('/galleries').then(res => res.data)
  });

  const images = (data?.data || []) as Record<string, unknown>[];

  const categories = ['All', ...new Set(images.map(img => img.category as string || 'General'))];
  const filteredImages = activeCategory === 'All' ? images : images.filter(img => img.category === activeCategory);

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/galleries', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/galleries/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] })
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // In a real production scenario, this would upload directly to Cloudinary/S3.
    // For now, we simulate an upload and save a dummy URL to the database.
    const newUploads = acceptedFiles.map(file => ({ file, progress: 0 }));
    setUploadingFiles(prev => [...prev, ...newUploads]);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const fakeUrl = URL.createObjectURL(file); // Temporary blob URL for display

      await createMutation.mutateAsync({
        title: file.name,
        imageUrl: fakeUrl,
        category: activeCategory === 'All' ? 'General' : activeCategory
      });

      setUploadingFiles(prev => prev.filter(p => p.file !== file));
    }
  }, [createMutation, activeCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Media Gallery</h1>
          <p className="text-slate-500 text-sm mt-1">Upload and organize images for your platform.</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group",
          isDragActive 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" 
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Upload size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Click or drag images to upload</h3>
            <p className="text-slate-500 text-sm mt-1">Supports JPG, PNG and WebP up to 10MB</p>
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="bg-white dark:bg-slate-950 border border-blue-100 dark:border-blue-900 p-4 rounded-xl shadow-sm flex items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={24} />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">Uploading {uploadingFiles.length} files...</p>
            <p className="text-xs text-slate-500">Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hidden-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === cat 
                ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry-style Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="p-20 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center">
          <ImageIcon size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No images in this album</h3>
          <p className="text-slate-500 text-sm mt-1">Drag and drop images above to add them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredImages.map((img: any) => (
            <div key={img._id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <img 
                src={img.imageUrl} 
                alt={img.title || 'Gallery image'} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium truncate">{img.title}</p>
                <p className="text-slate-300 text-xs">{img.category}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <button 
                  onClick={() => deleteMutation.mutate(img._id)}
                  className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg"
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
