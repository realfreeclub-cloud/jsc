import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
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
const StudentMaterials = lazy(() => import('./pages/student/Materials'));
const StudentCourses = lazy(() => import('./pages/student/Courses'));
const StudentSyllabusViewer = lazy(() => import('./pages/student/SyllabusViewer'));
const StudentNotifications = lazy(() => import('./pages/student/Notifications'));
const StudentExamsList = lazy(() => import('./pages/student/ExamsList'));
const StudentExamAttempt = lazy(() => import('./pages/student/ExamAttempt'));
const StudentExamResult = lazy(() => import('./pages/student/ExamResult'));
const DemoClasses = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Demo Classes Page</div>;
const StudyMaterial = lazy(() => import('./pages/StudyMaterial'));
const Gallery = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Gallery Page</div>;
const Contact = lazy(() => import('./pages/Contact'));
const Events = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Events Page</div>;
const Notifications = lazy(() => import('./pages/Notifications'));
const LatestUpdates = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Latest Updates Page</div>;
const Faculty = lazy(() => import('./pages/Faculty'));
const Testimonials = () => <div className="pt-24 min-h-screen text-center text-2xl font-serif">Testimonials Page</div>;
const Register = lazy(() => import('./pages/Register'));

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
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blogs/:slug" element={<BlogDetails />} />
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId" element={<StudentSyllabusViewer />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="exams" element={<StudentExamsList />} />
          <Route path="exams/:id/attempt" element={<StudentExamAttempt />} />
          <Route path="exams/results/:attemptId" element={<StudentExamResult />} />
          <Route path="profile" element={<div className="p-8 text-2xl font-bold">Profile Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
