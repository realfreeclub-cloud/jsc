import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { cn } from '../../utils/cn';

interface GalleryItem {
  _id: string;
  title?: string;
  imageUrl: string;
  category?: string;
  createdAt?: string;
}

interface ApiListResponse {
  data: GalleryItem[];
}

const NAVY = '#07152F';

export default function GalleryManager() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');
  const [uploadingFiles, setUploadingFiles] = useState<{ file: File; progress: number }[]>([]);

  const { data, isLoading } = useQuery<ApiListResponse>({
    queryKey: ['gallery'],
    queryFn: () => api.get<ApiListResponse>('/galleries').then((res) => res.data),
  });

  const images: GalleryItem[] = data?.data || [];
  const categories = ['All', ...new Set(images.map((img) => img.category || 'General'))];
  const filteredImages =
    activeCategory === 'All' ? images : images.filter((img) => img.category === activeCategory);

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; imageUrl: string; category: string }) =>
      api.post('/galleries', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/galleries/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploads = acceptedFiles.map((file) => ({ file, progress: 0 }));
      setUploadingFiles((prev) => [...prev, ...newUploads]);

      for (const file of acceptedFiles) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const fakeUrl = URL.createObjectURL(file);

        await createMutation.mutateAsync({
          title: file.name,
          imageUrl: fakeUrl,
          category: activeCategory === 'All' ? 'General' : activeCategory,
        });

        setUploadingFiles((prev) => prev.filter((p) => p.file !== file));
      }
    },
    [createMutation, activeCategory]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-up">
      {/* ── Page Header ── */}
      <div className="jsc-page-header">
        <h1 className="jsc-page-title">Media Gallery</h1>
        <p className="jsc-page-subtitle">Upload and organize images for the platform.</p>
      </div>

      {/* ── Upload Zone ── */}
      <div
        {...getRootProps()}
        className={cn(
          "jsc-upload-zone",
          isDragActive && "is-drag-active"
        )}
        style={{
          border: '2px dashed var(--color-navy-200)',
          borderRadius: 16,
          background: '#fff',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-gold-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold-500)',
            }}
          >
            <Upload size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>
              Click or drag images to upload
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-navy-400)', marginTop: 4 }}>
              Supports JPG, PNG and WebP up to 10MB
            </p>
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div
          className="jsc-card animate-fade-in"
          style={{
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderColor: 'rgba(244,180,0,0.25)',
            background: 'var(--color-gold-100)',
          }}
        >
          <Loader2
            className="animate-spin text-gold-DEFAULT"
            size={20}
            style={{ color: 'var(--color-gold-500)', animation: 'spin 1s linear infinite' }}
          />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-gold-600)' }}>
              Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? 's' : ''}...
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--color-navy-400)' }}>
              Please do not close this page.
            </p>
          </div>
        </div>
      )}

      {/* ── Category Tabs ── */}
      <div
        className="hidden-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="btn-outline"
            style={{
              padding: '8px 18px',
              fontSize: 13,
              borderRadius: 20,
              whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--color-navy-900)' : 'transparent',
              color: activeCategory === cat ? '#fff' : 'var(--color-navy-700)',
              borderColor: activeCategory === cat ? 'var(--color-navy-900)' : 'var(--color-navy-200)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Masonry Grid ── */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 18,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1/1',
                background: 'var(--color-navy-50)',
                borderRadius: 12,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="jsc-empty-state jsc-card" style={{ background: '#fff' }}>
          <div className="jsc-empty-icon">
            <ImageIcon size={26} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
            No images in this album
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)' }}>
            Drag and drop images above to add them to this category.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 20,
          }}
        >
          {filteredImages.map((img) => (
            <div
              key={img._id}
              className="jsc-card group"
              style={{
                aspectRatio: '1/1',
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                border: '1.5px solid var(--color-navy-100)',
                background: '#fff',
              }}
            >
              <img
                src={img.imageUrl}
                alt={img.title || 'Gallery image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                }}
                className="group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(7,21,47,0.85) 0%, transparent 60%)',
                  opacity: 0,
                  transition: 'opacity 0.25s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 14,
                }}
                className="group-hover:opacity-100"
              >
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.title}
                </p>
                <p style={{ color: 'var(--color-gold-400)', fontSize: 11.5, fontWeight: 500, marginTop: 2 }}>
                  {img.category || 'General'}
                </p>
              </div>

              {/* Hover Delete Action */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  opacity: 0,
                  transition: 'opacity 0.25s',
                }}
                className="group-hover:opacity-100"
              >
                <button
                  onClick={() => {
                    if (window.confirm('Delete this image from gallery?')) {
                      deleteMutation.mutate(img._id);
                    }
                  }}
                  style={{
                    background: '#EF4444',
                    border: 'none',
                    borderRadius: 8,
                    padding: 7,
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
