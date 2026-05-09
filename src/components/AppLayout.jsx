import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/stores';
import Sidebar from './Sidebar';
import AdminPage from '../pages/AdminPage';

export default function AppLayout() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [showAdmin, setShowAdmin] = useState(false);

  // Auto-open admin panel for admin users on first load
  useEffect(() => {
    if (currentUser?.isAdmin) {
      setShowAdmin(true);
    }
  }, [currentUser?.isAdmin]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar onAdminTrigger={() => setShowAdmin(true)} />
      <main className="main-content">
        <Outlet />
      </main>
      {showAdmin && <AdminPage onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
