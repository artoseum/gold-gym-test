import { useState } from 'react';
import { Check, Crown, AlertCircle, X } from 'lucide-react';
import { useAuthStore, useMembershipStore } from '../store/stores';
import { MEMBERSHIP_PLANS } from '../data/gymData';
import { formatDate, formatCurrency, daysUntil } from '../utils/helpers';
import { useToast } from '../components/Toast';
import './MembershipPage.css';

function PlanCard({ plan, isCurrentPlan, onSelect, disabled }) {
  return (
    <div className={`plan-card ${isCurrentPlan ? 'current' : ''} ${plan.badge ? 'featured' : ''}`}>
      {plan.badge && <div className="plan-badge">{plan.badge}</div>}
      <div className="plan-header">
        <div className="plan-icon">{plan.id === 'annual' ? <Crown size={22} /> : '📋'}</div>
        <div>
          <div className="plan-name">{plan.name}</div>
          <div className="plan-price">
            {formatCurrency(plan.price)}
            <span className="plan-period">/{plan.id === 'annual' ? 'year' : 'month'}</span>
          </div>
        </div>
      </div>
      {plan.id === 'annual' && (
        <div className="plan-savings">
          Save {formatCurrency(1499 * 12 - plan.price)} vs monthly!
        </div>
      )}
      <ul className="plan-features">
        {plan.features.map((f) => (
          <li key={f}>
            <Check size={14} className="text-gold" />
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`btn btn-full mt-16 ${isCurrentPlan ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => onSelect(plan)}
        disabled={isCurrentPlan || disabled}
      >
        {isCurrentPlan ? '✓ Current Plan' : 'Subscribe Now'}
      </button>
    </div>
  );
}

function PaymentModal({ plan, onConfirm, onClose }) {
  const [cardNum, setCardNum] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/26');
  const [cvv, setCvv] = useState('123');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Complete Payment</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="payment-summary">
          <div>
            <div className="text-muted text-sm">Plan</div>
            <div style={{ fontWeight: 700 }}>{plan.name} Membership</div>
          </div>
          <div className="payment-amount">{formatCurrency(plan.price)}</div>
        </div>
        <div className="payment-demo-note">
          <AlertCircle size={14} /> Demo mode – any card details work
        </div>
        <form onSubmit={handlePay} className="flex flex-col gap-14" style={{ gap: 14 }}>
          <div className="input-group">
            <label className="input-label">Cardholder Name</label>
            <input className="input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Card Number</label>
            <input className="input" value={cardNum} onChange={(e) => setCardNum(e.target.value)} maxLength={19} />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Expiry</label>
              <input className="input" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">CVV</label>
              <input className="input" placeholder="•••" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength={4} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? <><span className="spinner" /> Processing...</> : `Pay ${formatCurrency(plan.price)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MembershipPage() {
  const toast = useToast();
  const user = useAuthStore((s) => s.currentUser);
  const memberships = useMembershipStore((s) => s.memberships);
  const subscribe = useMembershipStore((s) => s.subscribe);
  const cancel = useMembershipStore((s) => s.cancel);
  const uid = user?.uid;
  const membership = uid ? (memberships[uid] || null) : null;
  const active = membership && membership.status === 'active' && Date.now() < membership.expiresAt;

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelect = (plan) => setSelectedPlan(plan);

  const handleConfirmPay = () => {
    subscribe(user.uid, selectedPlan);
    setSelectedPlan(null);
    toast(`🎉 ${selectedPlan.name} membership activated!`, 'success');
  };

  const handleCancel = () => {
    cancel(user.uid);
    setShowConfirm(false);
    toast('Membership cancelled.', 'info');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Membership</h1>
        <p className="page-subtitle">Manage your Gold's Gym subscription</p>
      </div>

      {/* Active Membership Card */}
      {membership && active && (
        <div className="active-membership-card mb-24 animate-fade-in">
          <div className="active-membership-left">
            <span className="badge badge-green mb-12">● ACTIVE</span>
            <h2 className="active-membership-plan">{membership.planName} Plan</h2>
            <div className="active-membership-meta">
              <div><span className="text-muted">Started</span><strong>{formatDate(membership.startedAt)}</strong></div>
              <div><span className="text-muted">Expires</span><strong className="text-gold">{formatDate(membership.expiresAt)}</strong></div>
              <div><span className="text-muted">Next Payment</span><strong>{formatCurrency(membership.price)}</strong></div>
            </div>
            <div className="active-membership-bar mt-16">
              <div className="flex justify-between text-sm mb-8">
                <span className="text-muted">Days Remaining</span>
                <span className="text-gold">{daysUntil(membership.expiresAt)} / {membership.planId === 'annual' ? 365 : 30} days</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(100, (daysUntil(membership.expiresAt) / (membership.planId === 'annual' ? 365 : 30)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="active-membership-actions">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowConfirm(true)}
            >
              Cancel Plan
            </button>
          </div>
        </div>
      )}

      {membership && !active && (
        <div className="card mb-24 flex items-center gap-12" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <AlertCircle size={20} color="var(--error)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--error)' }}>Membership Expired</div>
            <div className="text-sm text-muted">Your {membership.planName} plan expired on {formatDate(membership.expiresAt)}. Subscribe again to restore access.</div>
          </div>
        </div>
      )}

      {/* Plans */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>
        {active ? 'Upgrade or Change Plan' : 'Choose a Plan'}
      </h2>
      <div className="plans-grid">
        {MEMBERSHIP_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={active && membership?.planId === plan.id}
            onSelect={handleSelect}
            disabled={false}
          />
        ))}
      </div>

      {/* Cancel confirmation */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Cancel Membership?</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowConfirm(false)}><X size={18} /></button>
            </div>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
              You'll lose access to the Community social feature and all members-only benefits immediately.
              Are you sure?
            </p>
            <div className="flex gap-12">
              <button className="btn btn-secondary btn-full" onClick={() => setShowConfirm(false)}>Keep Plan</button>
              <button className="btn btn-danger btn-full" onClick={handleCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onConfirm={handleConfirmPay}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
