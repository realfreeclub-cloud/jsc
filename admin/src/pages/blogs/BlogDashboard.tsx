import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, AlertCircle, Loader2, Edit2, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const NAVY = '#07152F';
const GOLD = '#F4B400';

const BlogDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  interface BlogsResponse {
    data: Record<string, unknown>[];
  }

  const { data, isLoading, error } = useQuery<BlogsResponse>({
    queryKey: ['blogs', searchTerm],
    queryFn: () => api.get<BlogsResponse>(`/blogs?search=${searchTerm}`).then((res) => res.data),
  });

  const results = (data?.data || []) as Record<string, unknown>[];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  const handleDelete = (row: Record<string, unknown>) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      deleteMutation.mutate(row._id as string);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-up">
      {/* Header Section */}
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
          <h1 className="jsc-page-title">Blog Articles</h1>
          <p className="jsc-page-subtitle">Manage your blog content and SEO settings.</p>
        </div>
        <Link
          to="/blogs/create"
          className="btn-gold"
          style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Write New Post
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="jsc-card" style={{ overflow: 'hidden' }}>
        {/* Filter Bar */}
        <div className="jsc-filter-bar">
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
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jsc-search-bar"
              style={{ paddingLeft: 36 }}
            />
          </div>
          {(isLoading || deleteMutation.isPending) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: GOLD,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Syncing...
            </div>
          )}
        </div>

        {/* Dynamic Table Area */}
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
              We couldn't fetch the blog list. Check the server connection.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="jsc-empty-state">
            <div className="jsc-empty-icon">
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
              No blogs found
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-navy-400)', marginBottom: 24 }}>
              Get started by writing your first article.
            </p>
            <Link
              to="/blogs/create"
              className="btn-gold"
              style={{ padding: '10px 24px', textDecoration: 'none' }}
            >
              Write First Post
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="jsc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Article Details</th>
                  <th style={{ textAlign: 'left' }}>SEO Score</th>
                  <th style={{ textAlign: 'left' }}>Status</th>
                  <th style={{ textAlign: 'left' }}>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row: Record<string, unknown>) => {
                  const seoScore = (row.seoScore as number) || 0;
                  const isGoodSeo = seoScore >= 80;
                  const isOkSeo = seoScore >= 50 && seoScore < 80;

                  return (
                    <tr key={row._id as string} className="group">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {typeof row.featuredImage === 'string' && row.featuredImage && (
                            <img
                              src={row.featuredImage}
                              alt="Thumbnail"
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                objectFit: 'cover',
                                border: '1.5px solid var(--color-navy-100)',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            <p style={{ fontWeight: 600, color: NAVY, fontSize: 13.5, marginBottom: 2 }}>
                              {String(row.title || 'Untitled Article')}
                            </p>
                            <p
                              style={{
                                fontSize: 11.5,
                                color: 'var(--color-navy-300)',
                                fontFamily: 'monospace',
                                maxWidth: 280,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              /{String(row.slug || '')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: isGoodSeo
                                ? '#10B981'
                                : isOkSeo
                                ? '#F59E0B'
                                : '#EF4444',
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                            {seoScore}/100
                          </span>
                        </div>
                      </td>
                      <td>
                        {row.isPublished ? (
                          <span className="badge-active">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                            Published
                          </span>
                        ) : (
                          <span className="badge-inactive">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-navy-300)', display: 'inline-block' }} />
                            Draft
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-navy-500)' }}>
                        {row.createdAt
                          ? new Date(row.createdAt as string).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 6,
                            opacity: 0,
                            transition: 'opacity 0.15s',
                          }}
                          className="group-action-btns"
                        >
                          <button
                            onClick={() => window.open(`/blog/${row.slug}`, '_blank')}
                            className="jsc-action-btn edit"
                            style={{ color: 'var(--color-navy-700)', borderColor: 'var(--color-navy-200)' }}
                            title="Preview"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/blogs/edit/${row._id}`)}
                            className="jsc-action-btn edit"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(row)}
                            className="jsc-action-btn delete"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDashboard;
