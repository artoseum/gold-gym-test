import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Dumbbell, Shield } from 'lucide-react';
import { useAuthStore } from '../store/stores';
import { generateUID } from '../utils/helpers';
import './Login.css';

const ADMIN_CODE = 'GOLD2024';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [tab, setTab] = useState('google'); // 'google' | 'phone' | 'admin'
  const [step, setStep] = useState(1); // 1 = input, 2 = OTP
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSend = (e) => {
    e.preventDefault();
    setError('');
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setStep(2);
  };

  const handlePhoneSend = (e) => {
    e.preventDefault();
    setError('');
    if (!phone.match(/^\+?[0-9]{10,13}$/)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setStep(2);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!adminCode.trim()) {
      setError('Please enter the admin access code.');
      return;
    }
    if (adminCode !== ADMIN_CODE) {
      setError('Invalid admin code. Contact management.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const uid = 'admin_master';
      login({
        uid,
        displayName: 'Admin',
        email: 'admin@goldsgym.com',
        phone: null,
        authMethod: 'admin',
        isAdmin: true,
      });
      setLoading(false);
      navigate('/', { replace: true });
    }, 600);
  };

  const handleOTPVerify = (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP sent to you.');
      return;
    }
    // Simulated OTP – any 6 digit code works (demo: 123456 shown)
    setLoading(true);
    setTimeout(() => {
      const uid = generateUID();
      login({
        uid,
        displayName: tab === 'google' ? name : `User_${phone.slice(-4)}`,
        email: tab === 'google' ? email : null,
        phone: tab === 'phone' ? phone : null,
        authMethod: tab,
      });
      setLoading(false);
      navigate('/', { replace: true });
    }, 800);
  };

  const resetStep = () => {
    setStep(1);
    setOtp('');
    setError('');
  };

  const switchTab = (t) => {
    setTab(t);
    setError('');
    setStep(1);
    setOtp('');
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg-orb orb1" />
        <div className="login-bg-orb orb2" />
        <div className="login-grid" />
      </div>

      <div className="login-container animate-scale-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Dumbbell size={28} color="#0a0a0c" />
          </div>
          <div>
            <div className="login-logo-title">GOLD'S GYM</div>
            <div className="login-logo-sub">Member Portal</div>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="login-heading">
              <h1>{tab === 'admin' ? 'Admin Access' : 'Welcome Back'}</h1>
              <p>{tab === 'admin' ? 'Enter your admin credentials' : 'Sign in to access your fitness journey'}</p>
            </div>

            {/* Auth Tabs */}
            <div className="tabs login-tabs mb-24">
              <button
                className={`tab ${tab === 'google' ? 'active' : ''}`}
                onClick={() => switchTab('google')}
              >
                <Mail size={14} /> Google
              </button>
              <button
                className={`tab ${tab === 'phone' ? 'active' : ''}`}
                onClick={() => switchTab('phone')}
              >
                <Phone size={14} /> Phone
              </button>
              <button
                className={`tab ${tab === 'admin' ? 'active' : ''}`}
                onClick={() => switchTab('admin')}
              >
                <Shield size={14} /> Admin
              </button>
            </div>

            {tab === 'google' ? (
              <form onSubmit={handleGoogleSend} className="flex flex-col gap-16">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Google Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="login-error">{error}</p>}
                <button type="submit" className="btn btn-primary btn-lg btn-full">
                  Continue <ArrowRight size={16} />
                </button>
              </form>
            ) : tab === 'phone' ? (
              <form onSubmit={handlePhoneSend} className="flex flex-col gap-16">
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    className="input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^+\d]/g, ''))}
                  />
                </div>
                {error && <p className="login-error">{error}</p>}
                <button type="submit" className="btn btn-primary btn-lg btn-full">
                  Send OTP <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-16">
                <div className="admin-login-badge">
                  <Shield size={20} />
                  <span>Restricted Access</span>
                </div>
                <div className="input-group">
                  <label className="input-label">Admin Access Code</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Enter admin code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                  />
                </div>
                {error && <p className="login-error">{error}</p>}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : <>Access Admin Panel <Shield size={16} /></>}
                </button>
                <div className="otp-demo-hint">
                  🔐 Demo Code: <strong>GOLD2024</strong>
                </div>
              </form>
            )}

            <p className="login-disclaimer">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              This is a simulated demo — no real data is collected.
            </p>
          </>
        ) : (
          <>
            <div className="login-heading">
              <h1>Verify OTP</h1>
              <p>
                Enter the 6-digit code sent to{' '}
                <span className="text-gold">{tab === 'google' ? email : phone}</span>
              </p>
            </div>

            <div className="otp-demo-hint">
              🔑 Demo OTP: <strong>123456</strong>
            </div>

            <form onSubmit={handleOTPVerify} className="flex flex-col gap-16">
              <input
                className="input otp-input"
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              {error && <p className="login-error">{error}</p>}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : <>Verify & Login <ArrowRight size={16} /></>}
              </button>
              <button type="button" className="btn btn-ghost btn-full" onClick={resetStep}>
                ← Go Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
