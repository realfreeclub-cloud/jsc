import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Students from './pages/Students';
import WhatsAppSettings from './pages/WhatsAppSettings';
import GenericModule from './components/ui/GenericModule';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
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
                  { name: 'name', label: 'Full Name', type: 'text', required: true },
                  { name: 'designation', label: 'Designation', type: 'text', required: true },
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
            
            {/* Settings */}
            <Route path="seo" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">SEO Config</h2><p className="text-gray-500">Configuration panel loaded.</p></div>} />
            <Route path="whatsapp-settings" element={<WhatsAppSettings />} />
            <Route path="app-settings" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">App Config</h2><p className="text-gray-500">Configuration panel loaded.</p></div>} />
            <Route path="admins" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-900 dark:bg-slate-950"><h2 className="text-xl font-bold mb-4 dark:text-white">Admin Users</h2><p className="text-gray-500">Manage administrative accounts here.</p></div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
