import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
