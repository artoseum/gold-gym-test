import { useState, useMemo, useEffect } from 'react';
import { MapPin, Clock, Users, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { useGymStore } from '../store/stores';
import { CITIES, SLOTS } from '../data/gymData';
import { useToast } from '../components/Toast';
import './GymPage.css';

function OccupancyBar({ current, capacity }) {
  const pct = Math.min(100, Math.round((current / capacity) * 100));
  const cls = pct >= 80 ? 'high' : pct >= 50 ? 'medium' : 'low';
  const label = pct >= 80 ? 'Crowded' : pct >= 50 ? 'Moderate' : 'Quiet';
  return (
    <div className="occ-block">
      <div className="flex justify-between items-center mb-8">
        <span className={`badge badge-${cls === 'high' ? 'red' : cls === 'medium' ? 'blue' : 'green'}`}>
          {label}
        </span>
        <span className={`occ-${cls}`} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {current} / {capacity}
        </span>
      </div>
      <div className="progress-bar" style={{ height: 8 }}>
        <div className={`progress-fill occ-fill-${cls}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-muted mt-8">
        {capacity - current} spots available
      </div>
    </div>
  );
}

export default function GymPage() {
  const toast = useToast();
  const selectedCity = useGymStore((s) => s.selectedCity);
  const selectedGym = useGymStore((s) => s.selectedGym);
  const selectedSlot = useGymStore((s) => s.selectedSlot);
  const occupancySeeds = useGymStore((s) => s.occupancySeeds);
  const setCity = useGymStore((s) => s.setCity);
  const setGym = useGymStore((s) => s.setGym);
  const bookSlot = useGymStore((s) => s.bookSlot);
  const resetBooking = useGymStore((s) => s.resetBooking);
  const initOccupancy = useGymStore((s) => s.initOccupancy);

  const [cityId, setCityId] = useState(selectedCity?.id || '');
  const [gymId, setGymId] = useState(selectedGym?.id || '');
  const [slotId, setSlotId] = useState(selectedSlot?.id || '');

  const cityData = useMemo(() => CITIES.find((c) => c.id === cityId), [cityId]);
  const gymData = useMemo(() => cityData?.gyms.find((g) => g.id === gymId), [cityData, gymId]);

  // When city changes, reset gym & slot
  useEffect(() => {
    if (cityId !== selectedCity?.id) {
      setGymId('');
      setSlotId('');
    }
  }, [cityId]);

  // Initialize seeds for all slots whenever gymData changes
  useEffect(() => {
    if (!gymData) return;
    SLOTS.forEach((s) => initOccupancy(gymData.id, s.id, gymData.capacity, s.peakFactor));
  }, [gymData?.id]);

  const occupancyMap = useMemo(() => {
    if (!gymData) return {};
    const map = {};
    SLOTS.forEach((s) => {
      const key = `${gymData.id}_${s.id}`;
      const seed = occupancySeeds[key];
      map[s.id] = seed !== undefined ? Math.round(seed * gymData.capacity) : 0;
    });
    return map;
  }, [gymData, occupancySeeds]);

  const handleBook = () => {
    if (!cityId || !gymId || !slotId) {
      toast('Please select a city, gym, and time slot.', 'error');
      return;
    }
    const city = CITIES.find((c) => c.id === cityId);
    const gym = city?.gyms.find((g) => g.id === gymId);
    const slot = SLOTS.find((s) => s.id === slotId);
    setCity({ id: city.id, name: city.name });
    setGym({ id: gym.id, name: gym.name, address: gym.address, capacity: gym.capacity });
    bookSlot({ id: slot.id, label: slot.label, time: slot.time });
    toast(`Slot booked at ${gym.name} · ${slot.label}`, 'success');
  };

  const handleReset = () => {
    resetBooking();
    setCityId('');
    setGymId('');
    setSlotId('');
    toast('Booking cleared.', 'info');
  };

  const isBooked = selectedCity && selectedGym && selectedSlot;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Gym</h1>
        <p className="page-subtitle">Choose your city, gym, and preferred time slot</p>
      </div>

      {/* Current Booking Banner */}
      {isBooked && (
        <div className="booking-banner mb-24 animate-fade-in">
          <div className="booking-banner-left">
            <div className="badge badge-green mb-8">● Active Booking</div>
            <div className="booking-banner-gym">{selectedGym.name}</div>
            <div className="booking-banner-meta">
              <MapPin size={14} /> {selectedGym.address}
            </div>
            <div className="booking-banner-meta mt-8">
              <Clock size={14} />
              {SLOTS.find((s) => s.id === selectedSlot.id)?.icon}{' '}
              {selectedSlot.label} · {SLOTS.find((s) => s.id === selectedSlot.id)?.time}
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      )}

      <div className="gym-layout">
        {/* Selector Panel */}
        <div className="gym-selector card">
          <h2 style={{ fontSize: '1rem', marginBottom: 20 }}>Book / Change Slot</h2>

          {/* City Selector */}
          <div className="input-group mb-16">
            <label className="input-label">City</label>
            <select
              className="input"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
            >
              <option value="">— Select City —</option>
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Gym Selector */}
          <div className="input-group mb-20">
            <label className="input-label">Nearest Gym</label>
            <select
              className="input"
              value={gymId}
              onChange={(e) => setGymId(e.target.value)}
              disabled={!cityId}
            >
              <option value="">— Select Gym —</option>
              {cityData?.gyms.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Slot Cards */}
          <label className="input-label mb-12">Time Slot (max 3 hrs)</label>
          <div className="slot-grid mb-20">
            {SLOTS.map((slot) => {
              const occ = gymData ? occupancyMap[slot.id] : null;
              const pct = occ !== null ? Math.round((occ / (gymData?.capacity || 1)) * 100) : 0;
              const isSelected = slotId === slot.id;
              return (
                <button
                  key={slot.id}
                  className={`slot-card ${isSelected ? 'selected' : ''} ${!gymId ? 'disabled' : ''}`}
                  onClick={() => gymId && setSlotId(slot.id)}
                  disabled={!gymId}
                >
                  <div className="slot-emoji">{slot.icon}</div>
                  <div className="slot-label">{slot.label}</div>
                  <div className="slot-time">{slot.time}</div>
                  {occ !== null && (
                    <div className={`slot-occ occ-${pct >= 80 ? 'high' : pct >= 50 ? 'medium' : 'low'}`}>
                      {occ} here
                    </div>
                  )}
                  {isSelected && <div className="slot-check"><Check size={14} /></div>}
                </button>
              );
            })}
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handleBook}>
            {isBooked ? 'Update Booking' : 'Confirm Booking'}
          </button>
        </div>

        {/* Gym Details & Occupancy */}
        {gymData ? (
          <div className="flex flex-col gap-16">
            <div className="card">
              <div className="flex items-center gap-12 mb-16">
                <div className="gym-icon">🏋️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{gymData.name}</div>
                  <div className="text-sm text-muted flex items-center gap-4">
                    <MapPin size={12} /> {gymData.address}
                  </div>
                </div>
              </div>
              <div className="gym-stats-row">
                <div className="gym-stat">
                  <div className="gym-stat-val">{gymData.capacity}</div>
                  <div className="gym-stat-lbl">Capacity</div>
                </div>
                <div className="gym-stat">
                  <div className="gym-stat-val">{SLOTS.length}</div>
                  <div className="gym-stat-lbl">Time Slots</div>
                </div>
                <div className="gym-stat">
                  <div className="gym-stat-val text-gold">24/7</div>
                  <div className="gym-stat-lbl">Support</div>
                </div>
              </div>
            </div>

            {/* Live Occupancy Per Slot */}
            <div className="card">
              <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>
                <Users size={16} style={{ display: 'inline', marginRight: 8 }} />
                Live Occupancy
              </h3>
              <div className="flex flex-col gap-16">
                {SLOTS.map((slot) => (
                  <div key={slot.id}>
                    <div className="flex items-center gap-8 mb-8">
                      <span>{slot.icon}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{slot.label}</span>
                      <span className="text-xs text-muted">{slot.time}</span>
                    </div>
                    <OccupancyBar
                      current={occupancyMap[slot.id] || 0}
                      capacity={gymData.capacity}
                    />
                  </div>
                ))}
              </div>
              <div className="occ-note">
                <Clock size={12} />
                Occupancy data updates each session to simulate real-time gym traffic.
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>🏢</div>
            <div className="text-muted mt-16">Select a gym to see details</div>
          </div>
        )}
      </div>
    </div>
  );
}
