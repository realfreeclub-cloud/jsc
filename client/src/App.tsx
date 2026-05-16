import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import StudentLayout from './components/layout/StudentLayout';
import FloatingWhatsApp from './components/ui/FloatingWhatsApp';
import PageLoader from './components/ui/PageLoader';
import ScrollToTop from './components/utils/ScrollToTop';

// Lazy Loaded Pages (Code Splitting)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses.tsx'));
const CourseDetails = lazy(() => import('./pages/CourseDetails.tsx'));
const Login = lazy(() => import('./pages/Login'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const DemoClasses = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Demo Classes Page</div>;
const StudyMaterial = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Study Material Page</div>;
const Gallery = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Gallery Page</div>;
const Contact = lazy(() => import('./pages/Contact'));
const Events = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Events Page</div>;
const Notifications = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Notifications Page</div>;
const LatestUpdates = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Latest Updates Page</div>;
const Faculty = lazy(() => import('./pages/Faculty'));
const Testimonials = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Testimonials Page</div>;
const Register = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Register Page</div>;

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-gold selection:text-white font-sans">
      <Navbar />
      <FloatingWhatsApp />
      <main className="grow">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetails />} />
          <Route path="/demo" element={<DemoClasses />} />
          <Route path="/study-material" element={<StudyMaterial />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/updates" element={<LatestUpdates />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Student Portal Routes */}
        <Route path="/student" element={
          <Suspense fallback={<PageLoader />}>
            <StudentLayout />
          </Suspense>
        }>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<div className="p-8 text-2xl font-bold">My Courses Placeholder</div>} />
          <Route path="materials" element={<div className="p-8 text-2xl font-bold">Saved Materials Placeholder</div>} />
          <Route path="notifications" element={<div className="p-8 text-2xl font-bold">Notifications Placeholder</div>} />
          <Route path="profile" element={<div className="p-8 text-2xl font-bold">Profile Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
