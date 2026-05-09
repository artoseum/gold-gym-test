import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, CreditCard, ShoppingBag, Activity, TrendingUp, ChevronRight, Flame } from 'lucide-react';
import { useAuthStore, useGymStore, useMembershipStore, useMarketStore, useHealthStore } from '../store/stores';
import { CITIES, SLOTS } from '../data/gymData';
import { formatDate, daysUntil, formatCurrency } from '../utils/helpers';
import './Dashboard.css';

function OccupancyBar({ current, capacity }) {
  const pct = Math.min(100, Math.round((current / capacity) * 100));
  const cls = pct >= 80 ? 'high' : pct >= 50 ? 'medium' : 'low';
  return (
    <div>
      <div className="flex justify-between mb-8" style={{ fontSize: '0.8rem' }}>
        <span className={`occ-${cls}`}>{current} / {capacity} people</span>
        <span className={`occ-${cls}`}>{pct}% full</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill occ-fill-${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser);
  const selectedCity = useGymStore((s) => s.selectedCity);
  const selectedGym = useGymStore((s) => s.selectedGym);
  const selectedSlot = useGymStore((s) => s.selectedSlot);
  const occupancySeeds = useGymStore((s) => s.occupancySeeds);
  const initOccupancy = useGymStore((s) => s.initOccupancy);
  const memberships = useMembershipStore((s) => s.memberships);
  const cart = useMarketStore((s) => s.cart);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const allHealthLogs = useHealthStore((s) => s.logs);

  const uid = user?.uid;
  const membership = uid ? (memberships[uid] || null) : null;
  const isActive = membership && membership.status === 'active' && Date.now() < membership.expiresAt;
  const healthLogs = uid ? (allHealthLogs[uid] || []) : [];

  const cityData = useMemo(() => CITIES.find((c) => c.id === selectedCity?.id), [selectedCity]);
  const gymData = useMemo(() => cityData?.gyms.find((g) => g.id === selectedGym?.id), [cityData, selectedGym]);
  const slotData = useMemo(() => SLOTS.find((s) => s.id === selectedSlot?.id), [selectedSlot]);

  // Seed occupancy in an effect (not during render)
  useEffect(() => {
    if (gymData && slotData) {
      initOccupancy(gymData.id, slotData.id, gymData.capacity, slotData.peakFactor);
    }
  }, [gymData?.id, slotData?.id]);

  const occupancy = useMemo(() => {
    if (!gymData || !slotData) return null;
    const key = `${gymData.id}_${slotData.id}`;
    const seed = occupancySeeds[key];
    if (seed === undefined) return null;
    return Math.round(seed * gymData.capacity);
  }, [gymData, slotData, occupancySeeds]);

  const recentLogs = healthLogs.slice(0, 3);

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="dashboard-hero card-glass mb-24">
        <div className="dashboard-hero-left">
          <div className="dashboard-greeting">
            <Flame size={20} className="text-gold" />
            {timeOfDay()}, {user?.displayName?.split(' ')[0]}!
          </div>
          <h1 className="dashboard-hero-title">
            Your Fitness<br />
            <span className="text-gold">Command Center</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: 8 }}>
            {isActive
              ? `Membership active · ${daysUntil(membership?.expiresAt)} days remaining`
              : 'No active membership · Subscribe to unlock all features'}
          </p>
          {!isActive && (
            <button className="btn btn-primary mt-16" onClick={() => navigate('/membership')}>
              Get Membership <ChevronRight size={16} />
            </button>
          )}
        </div>
        <div className="dashboard-hero-right">
          <div className="hero-dumbbell">🏋️</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-24">
        <div className="stat-card" onClick={() => navigate('/gym')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon"><MapPin size={18} /></div>
          <div className="stat-value">{gymData?.name?.split("'s Gym ")?.[1] || '—'}</div>
          <div className="stat-label">My Gym</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/gym')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon"><Clock size={18} /></div>
          <div className="stat-value">{slotData?.label || '—'}</div>
          <div className="stat-label">My Slot</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Activity size={18} /></div>
          <div className="stat-value">{healthLogs.length}</div>
          <div className="stat-label">Health Logs</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon"><ShoppingBag size={18} /></div>
          <div className="stat-value">{cartCount}</div>
          <div className="stat-label">Cart Items</div>
        </div>
      </div>

      <div className="dashboard-cols">
        {/* Gym Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontSize: '1rem' }}>Gym Status</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/gym')}>
              Manage
            </button>
          </div>

          {gymData && slotData ? (
            <div className="flex flex-col gap-16">
              <div>
                <div className="text-sm text-muted mb-4">Location</div>
                <div style={{ fontWeight: 600 }}>{gymData.name}</div>
                <div className="text-sm text-muted">{gymData.address}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-4">Booked Slot</div>
                <div className="slot-chip">
                  <span>{slotData.icon}</span>
                  <span style={{ fontWeight: 600 }}>{slotData.label}</span>
                  <span className="text-muted">{slotData.time}</span>
                </div>
              </div>
              {occupancy !== null && (
                <div>
                  <div className="text-sm text-muted mb-8">Live Occupancy</div>
                  <OccupancyBar current={occupancy} capacity={gymData.capacity} />
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">🏟️</div>
              <div className="empty-state-title">No gym selected</div>
              <button className="btn btn-primary btn-sm mt-12" onClick={() => navigate('/gym')}>
                Select Gym
              </button>
            </div>
          )}
        </div>

        {/* Membership Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontSize: '1rem' }}>Membership</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/membership')}>
              View
            </button>
          </div>

          {membership && isActive ? (
            <div className="flex flex-col gap-16">
              <div className="membership-highlight">
                <span className="badge badge-green">● Active</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 8 }}>
                  {membership.planName} Plan
                </div>
                <div className="text-muted text-sm">
                  {formatCurrency(membership.price)} · Renews {formatDate(membership.expiresAt)}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-8">
                  <span className="text-muted">Days Remaining</span>
                  <span className="text-gold">{daysUntil(membership.expiresAt)} days</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, (daysUntil(membership.expiresAt) / (membership.planId === 'annual' ? 365 : 30)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-sm text-muted">
                Next payment: {formatCurrency(membership.price)} on {formatDate(membership.nextPayment)}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-title">No active plan</div>
              <button className="btn btn-primary btn-sm mt-12" onClick={() => navigate('/membership')}>
                Subscribe Now
              </button>
            </div>
          )}
        </div>

        {/* Recent Health Logs */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontSize: '1rem' }}>Health Tracker</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/health')}>
              Add Log
            </button>
          </div>
          {recentLogs.length > 0 ? (
            <div className="flex flex-col gap-12">
              {recentLogs.map((log) => (
                <div key={log.id} className="health-log-item">
                  <div className="health-log-icon">
                    {log.type === 'weight' ? '⚖️' : log.type === 'calories' ? '🔥' : '💪'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {log.type === 'weight'
                        ? `${log.value} kg`
                        : log.type === 'calories'
                        ? `${log.value} kcal`
                        : log.exercise}
                    </div>
                    <div className="text-xs text-muted">{new Date(log.date).toLocaleDateString()}</div>
                  </div>
                  {log.type !== 'workout' && (
                    <div className="flex items-center gap-4 text-xs text-muted" style={{ marginLeft: 'auto' }}>
                      <TrendingUp size={12} />
                      {log.note || '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No logs yet</div>
              <button className="btn btn-primary btn-sm mt-12" onClick={() => navigate('/health')}>
                Start Tracking
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions mt-24">
        {[
          { icon: '🏋️', label: 'Book Slot', to: '/gym' },
          { icon: '👥', label: 'Gold Club', to: '/social' },
          { icon: '🛒', label: 'Shop Now', to: '/marketplace' },
          { icon: '📦', label: 'My Orders', to: '/orders' },
        ].map((a) => (
          <button key={a.to} className="quick-action-btn" onClick={() => navigate(a.to)}>
            <span className="quick-action-icon">{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
