import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import ScrollToTop from './components/utils/ScrollToTop';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Courses = React.lazy(() => import('./pages/Courses'));
const GenericModule = React.lazy(() => import('./components/ui/GenericModule'));
const Login = React.lazy(() => import('./pages/Login'));

// Advanced CMS Modules
const BlogDashboard = React.lazy(() => import('./pages/blogs/BlogDashboard'));
const BlogEditor = React.lazy(() => import('./pages/blogs/BlogEditor'));
const GalleryManager = React.lazy(() => import('./pages/gallery/GalleryManager'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 size={40} className="animate-spin text-blue-600" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="students" element={
              <GenericModule 
                title="Student" 
                endpoint="students" 
                fields={[
                  { name: 'name', label: 'Full Name', type: 'text', required: true },
                  { name: 'email', label: 'Email', type: 'text' },
                  { name: 'phone', label: 'Phone', type: 'text', required: true },
                  { name: 'course', label: 'Enrolled Course', type: 'text' },
                  { name: 'status', label: 'Status', type: 'text' },
                  { name: 'feesPaid', label: 'Fees Paid', type: 'number' },
                  { name: 'totalFees', label: 'Total Fees', type: 'number' },
                  { name: 'isActive', label: 'Active', type: 'checkbox' }
                ]}
              />
            } />
            
            {/* Fully working generic CRUD modules */}
            <Route path="hero-slider" element={
              <GenericModule 
                title="Hero Slider" 
                endpoint="herosliders" 
                fields={[
                  { name: 'title', label: 'Title', type: 'text', required: true },
                  { name: 'subtitle', label: 'Subtitle', type: 'text' },
                  { name: 'imageUrl', label: 'Image URL', type: 'file', required: true },
                  { name: 'buttonText', label: 'Button Text', type: 'text' },
                  { name: 'buttonLink', label: 'Button Link', type: 'text' },
                  { name: 'order', label: 'Display Order', type: 'number' },
                  { name: 'isActive', label: 'Is Active', type: 'checkbox' }
                ]}
              />
            } />

            {/* Advanced CMS Modules */}
            <Route path="blogs" element={<BlogDashboard />} />
            <Route path="blogs/create" element={<BlogEditor />} />
            <Route path="blogs/edit/:id" element={<BlogEditor />} />
            <Route path="gallery" element={<GalleryManager />} />

            <Route path="notifications" element={
              <GenericModule 
                title="Notification" 
                endpoint="notifications" 
                fields={[
                  { name: 'title', label: 'Alert Title', type: 'text', required: true },
                  { name: 'message', label: 'Full Message', type: 'textarea' },
                  { name: 'link', label: 'Redirect Link', type: 'text' },
                  { name: 'isPinned', label: 'Pin to Top', type: 'checkbox' },
                  { name: 'isActive', label: 'Status', type: 'checkbox' }
                ]}
              />
            } />

            <Route path="faculty" element={
              <GenericModule 
                title="Faculty" 
                endpoint="facultys" 
                fields={[
                  { name: 'name', label: 'Full Name', type: 'text' },
                  { name: 'designation', label: 'Designation', type: 'text' },
                  { name: 'subjectExpertise', label: 'Subject Expertise', type: 'text' },
                  { name: 'experience', label: 'Experience', type: 'text' },
                  { name: 'bio', label: 'Short Bio', type: 'textarea' },
                  { name: 'imageUrl', label: 'Photo URL', type: 'file' },
                  { name: 'order', label: 'Display Order', type: 'number' },
                  { name: 'isActive', label: 'Status', type: 'checkbox' }
                ]}
              />
            } />

            <Route path="events" element={
              <GenericModule 
                title="Event" 
                endpoint="events" 
                fields={[
                  { name: 'title', label: 'Event Title', type: 'text', required: true },
                  { name: 'description', label: 'Description', type: 'textarea' },
                  { name: 'date', label: 'Event Date', type: 'date', required: true },
                  { name: 'location', label: 'Location/Link', type: 'text' },
                  { name: 'imageUrl', label: 'Cover Image URL', type: 'file' },
                  { name: 'isActive', label: 'Status', type: 'checkbox' }
                ]}
              />
            } />

            {/* Academics - Missing routes added back */}
            <Route path="demo-classes" element={
              <GenericModule 
                title="Demo Classes" 
                endpoint="democlasses" 
                fields={[
                  { name: 'name', label: 'Student Name', type: 'text', required: true },
                  { name: 'phone', label: 'Phone', type: 'text', required: true },
                  { name: 'email', label: 'Email', type: 'text' },
                  { name: 'courseInterest', label: 'Course Interest', type: 'text' },
                  { name: 'scheduleDate', label: 'Scheduled Date', type: 'date' },
                  { name: 'status', label: 'Status', type: 'text' },
                  { name: 'isActive', label: 'Active', type: 'checkbox' }
                ]}
              />
            } />

            {/* Marketing & SEO Components */}
            <Route path="seo-dashboard" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">SEO Dashboard</h2><p className="text-gray-500">Coming soon.</p></div>} />
            <Route path="seo-settings" element={
              <GenericModule 
                title="SEO Settings" 
                endpoint="seosettings" 
                fields={[
                  { name: 'pageUrl', label: 'Page URL', type: 'text', required: true },
                  { name: 'metaTitle', label: 'Meta Title', type: 'text', required: true },
                  { name: 'metaDescription', label: 'Meta Description', type: 'textarea' },
                  { name: 'keywords', label: 'Keywords (Comma separated)', type: 'textarea' },
                  { name: 'canonicalUrl', label: 'Canonical URL', type: 'text' },
                  { name: 'ogImage', label: 'OG Image URL', type: 'file' },
                  { name: 'isActive', label: 'Active', type: 'checkbox' }
                ]}
              />
            } />
            <Route path="meta-tags" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Meta Tags Config</h2><p className="text-gray-500">Managed via SEO Settings.</p></div>} />
            <Route path="social-media" element={
              <GenericModule 
                title="Social Media Links" 
                endpoint="socialmedias" 
                fields={[
                  { name: 'platform', label: 'Platform Name', type: 'text', required: true },
                  { name: 'url', label: 'Profile URL', type: 'text', required: true },
                  { name: 'icon', label: 'Icon Class (e.g. facebook)', type: 'text' },
                  { name: 'order', label: 'Order', type: 'number' },
                  { name: 'isActive', label: 'Active', type: 'checkbox' }
                ]}
              />
            } />
            <Route path="whatsapp-leads" element={
              <GenericModule 
                title="WhatsApp Leads" 
                endpoint="whatsappleads" 
                fields={[
                  { name: 'name', label: 'Name', type: 'text' },
                  { name: 'phone', label: 'Phone', type: 'text', required: true },
                  { name: 'message', label: 'Message', type: 'textarea' },
                  { name: 'sourcePage', label: 'Source Page', type: 'text' },
                  { name: 'status', label: 'Status', type: 'text' },
                  { name: 'notes', label: 'Notes', type: 'textarea' },
                  { name: 'isActive', label: 'Active', type: 'checkbox' }
                ]}
              />
            } />

            {/* Hero Slider */}
            <Route path="hero-slider" element={
              <GenericModule 
                title="Hero Slider" 
                endpoint="herosliders" 
                fields={[
                  { name: 'title', label: 'Title', type: 'text', required: true },
                  { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
                  { name: 'imageUrl', label: 'Image URL', type: 'file', required: true },
                  { name: 'ctaText', label: 'Button Text', type: 'text' },
                  { name: 'ctaLink', label: 'Button Link', type: 'text' },
                  { name: 'order', label: 'Order', type: 'number' },
                  { name: 'isActive', label: 'Active', type: 'checkbox' }
                ]}
              />
            } />
            <Route path="app-settings" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">App Config</h2><p className="text-gray-500">Configuration panel loaded.</p></div>} />
            <Route path="admins" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Admin Users</h2><p className="text-gray-500">Manage administrative accounts here.</p></div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </BrowserRouter>
  );
}

export default App;
