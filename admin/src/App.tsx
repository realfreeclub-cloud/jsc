import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import ScrollToTop from './components/utils/ScrollToTop';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Courses = React.lazy(() => import('./pages/Courses'));
const Students = React.lazy(() => import('./pages/Students'));
const WhatsAppSettings = React.lazy(() => import('./pages/WhatsAppSettings'));
const GenericModule = React.lazy(() => import('./components/ui/GenericModule'));
const Login = React.lazy(() => import('./pages/Login'));

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
            <Route path="students" element={<Students />} />
            
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

            <Route path="latest-updates" element={
              <GenericModule 
                title="Latest Update" 
                endpoint="latestupdates" 
                fields={[
                  { name: 'title', label: 'Update Text', type: 'text', required: true },
                  { name: 'link', label: 'Target Link', type: 'text' },
                  { name: 'isActive', label: 'Status', type: 'checkbox' }
                ]}
              />
            } />

            <Route path="blogs" element={<GenericModule title="Blogs" endpoint="blogs" fields={[{name:'title', label:'Title', type:'text', required:true}, {name:'content', label:'Content', type:'textarea'}]} />} />
            <Route path="gallery" element={<GenericModule title="Gallery" endpoint="gallerys" fields={[{name:'title', label:'Title', type:'text'}, {name:'imageUrl', label:'Image URL', type:'file', required:true}]} />} />
            <Route path="study-material" element={<GenericModule title="Study Material" endpoint="studymaterials" fields={[{name:'title', label:'Title', type:'text', required:true}, {name:'fileUrl', label:'File URL', type:'url', required:true}]} />} />
            <Route path="testimonials" element={<GenericModule title="Testimonials" endpoint="testimonials" fields={[{name:'name', label:'Name', type:'text', required:true}, {name:'message', label:'Message', type:'textarea'}]} />} />
            
            {/* Settings & New Architecture Placeholders */}
            <Route path="analytics" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Analytics</h2><p className="text-gray-500">Analytics module coming soon.</p></div>} />
            <Route path="reports" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Reports</h2><p className="text-gray-500">Reporting module coming soon.</p></div>} />
            
            <Route path="batches" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Batch Management</h2></div>} />
            <Route path="demo-classes" element={<GenericModule title="Demo Classes" endpoint="democlasses" fields={[{name:'title', label:'Title', type:'text'}, {name:'videoUrl', label:'Video URL', type:'text'}]} />} />
            <Route path="test-series" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Test Series</h2></div>} />
            <Route path="questions" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Question Bank</h2></div>} />
            <Route path="assignments" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Assignments</h2></div>} />
            <Route path="academic-attendance" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Student Attendance</h2></div>} />
            
            <Route path="admissions" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Admissions Workflow</h2></div>} />
            <Route path="fees" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Fee Management</h2></div>} />
            <Route path="id-cards" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">ID Card Generator</h2></div>} />
            <Route path="certificates" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Certificates</h2></div>} />
            <Route path="performance" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Performance Tracking</h2></div>} />

            <Route path="salary" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Faculty Salary</h2></div>} />
            <Route path="faculty-attendance" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Faculty Attendance</h2></div>} />
            <Route path="scheduling" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Lecture Scheduling</h2></div>} />

            <Route path="meta-tags" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Meta Tags Config</h2></div>} />
            <Route path="social-media" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Social Media Connect</h2></div>} />
            <Route path="email-campaigns" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Email Campaigns</h2></div>} />

            <Route path="roles" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Roles & Permissions</h2></div>} />
            <Route path="api-config" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">API Config</h2></div>} />
            <Route path="security" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Backup & Security</h2></div>} />

            <Route path="seo" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">SEO Config</h2><p className="text-gray-500">Configuration panel loaded.</p></div>} />
            <Route path="whatsapp-settings" element={<WhatsAppSettings />} />
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
