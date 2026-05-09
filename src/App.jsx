import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GymPage from './pages/GymPage';
import MembershipPage from './pages/MembershipPage';
import SocialPage from './pages/SocialPage';
import HealthPage from './pages/HealthPage';
import MarketplacePage from './pages/MarketplacePage';
import CartPage from './pages/CartPage';
import './index.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gym" element={<GymPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<CartPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
