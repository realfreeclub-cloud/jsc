import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import WhatsAppSettings from './pages/WhatsAppSettings';
import GenericModule from './components/ui/GenericModule';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            
            {/* Fully working generic CRUD modules */}
            <Route path="hero-slider" element={<GenericModule title="Hero Slider" endpoint="herosliders" />} />
            <Route path="demo-classes" element={<GenericModule title="Demo Classes" endpoint="courses" />} />
            <Route path="gallery" element={<GenericModule title="Gallery" endpoint="gallerys" />} />
            <Route path="blogs" element={<GenericModule title="Blogs" endpoint="blogs" />} />
            <Route path="events" element={<GenericModule title="Events" endpoint="events" />} />
            <Route path="notifications" element={<GenericModule title="Notifications" endpoint="notifications" />} />
            <Route path="latest-updates" element={<GenericModule title="Latest Updates" endpoint="latestupdates" />} />
            <Route path="study-material" element={<GenericModule title="Study Material" endpoint="studymaterials" />} />
            <Route path="faculty" element={<GenericModule title="Faculty" endpoint="facultys" />} />
            <Route path="testimonials" element={<GenericModule title="Testimonials" endpoint="testimonials" />} />
            <Route path="students" element={<GenericModule title="Students" endpoint="users" />} />
            
            {/* Settings */}
            <Route path="seo" element={<div className="bg-white p-8 rounded-2xl shadow-sm"><h2 className="text-xl font-bold mb-4">SEO Config</h2><p>Configuration panel loaded.</p></div>} />
            <Route path="whatsapp-settings" element={<WhatsAppSettings />} />
            <Route path="app-settings" element={<div className="bg-white p-8 rounded-2xl shadow-sm"><h2 className="text-xl font-bold mb-4">App Config</h2><p>Configuration panel loaded.</p></div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
