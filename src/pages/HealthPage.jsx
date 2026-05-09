import { useState } from 'react';
import { Plus, Trash2, Scale, Flame, Dumbbell, X } from 'lucide-react';
import { useAuthStore, useHealthStore } from '../store/stores';
import { formatDateTime } from '../utils/helpers';
import { useToast } from '../components/Toast';
import './HealthPage.css';

const LOG_TYPES = [
  { id: 'weight', icon: Scale, label: 'Weight', color: 'var(--info)' },
  { id: 'calories', icon: Flame, label: 'Calories', color: 'var(--error)' },
  { id: 'workout', icon: Dumbbell, label: 'Workout', color: 'var(--gold-primary)' },
];

function LogForm({ onAdd }) {
  const [type, setType] = useState('weight');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type !== 'workout' && !value) { toast('Enter a value.', 'error'); return; }
    if (type === 'workout' && !exercise) { toast('Enter an exercise name.', 'error'); return; }
    const entry = { type, value: parseFloat(value) || 0, note, exercise, sets: parseInt(sets) || 0, reps: parseInt(reps) || 0 };
    onAdd(entry);
    setValue(''); setNote(''); setExercise(''); setSets(''); setReps('');
    toast('Log added!', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="card log-form">
      <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Add Entry</h3>
      <div className="log-type-tabs mb-16">
        {LOG_TYPES.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`log-type-btn ${type === t.id ? 'active' : ''}`}
            style={type === t.id ? { borderColor: t.color, color: t.color, background: `${t.color}18` } : {}}
            onClick={() => setType(t.id)}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {type === 'weight' && (
        <div className="input-group mb-12">
          <label className="input-label">Weight (kg)</label>
          <input className="input" type="number" step="0.1" placeholder="75.5" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      )}

      {type === 'calories' && (
        <div className="input-group mb-12">
          <label className="input-label">Calories (kcal)</label>
          <input className="input" type="number" placeholder="2200" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      )}

      {type === 'workout' && (
        <>
          <div className="input-group mb-12">
            <label className="input-label">Exercise</label>
            <input className="input" placeholder="Bench Press, Squats..." value={exercise} onChange={(e) => setExercise(e.target.value)} />
          </div>
          <div className="grid-2 mb-12">
            <div className="input-group">
              <label className="input-label">Sets</label>
              <input className="input" type="number" placeholder="4" value={sets} onChange={(e) => setSets(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Reps</label>
              <input className="input" type="number" placeholder="10" value={reps} onChange={(e) => setReps(e.target.value)} />
            </div>
          </div>
        </>
      )}

      <div className="input-group mb-16">
        <label className="input-label">Note (optional)</label>
        <input className="input" placeholder="Feeling strong today..." value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button type="submit" className="btn btn-primary btn-full">
        <Plus size={16} /> Add Log
      </button>
    </form>
  );
}

function StatSummary({ logs }) {
  const weights = logs.filter((l) => l.type === 'weight');
  const calories = logs.filter((l) => l.type === 'calories');
  const workouts = logs.filter((l) => l.type === 'workout');
  const avgWeight = weights.length ? (weights.reduce((a, b) => a + b.value, 0) / weights.length).toFixed(1) : '—';
  const avgCal = calories.length ? Math.round(calories.reduce((a, b) => a + b.value, 0) / calories.length) : '—';

  return (
    <div className="health-stats-row mb-20">
      <div className="health-stat-card">
        <Scale size={20} color="var(--info)" />
        <div className="health-stat-val">{avgWeight}</div>
        <div className="health-stat-lbl">Avg Weight (kg)</div>
      </div>
      <div className="health-stat-card">
        <Flame size={20} color="var(--error)" />
        <div className="health-stat-val">{avgCal}</div>
        <div className="health-stat-lbl">Avg Calories</div>
      </div>
      <div className="health-stat-card">
        <Dumbbell size={20} color="var(--gold-primary)" />
        <div className="health-stat-val">{workouts.length}</div>
        <div className="health-stat-lbl">Workouts Logged</div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const user = useAuthStore((s) => s.currentUser);
  const allLogs = useHealthStore((s) => s.logs);
  const addLog = useHealthStore((s) => s.addLog);
  const deleteLog = useHealthStore((s) => s.deleteLog);
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const logs = user?.uid ? (allLogs[user.uid] || []) : [];

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.type === filter);

  const iconMap = { weight: '⚖️', calories: '🔥', workout: '💪' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Health Tracker</h1>
        <p className="page-subtitle">Track your weight, calories, and workouts</p>
      </div>

      {logs.length > 0 && <StatSummary logs={logs} />}

      <div className="health-layout">
        <LogForm onAdd={(entry) => addLog(user.uid, entry)} />

        <div>
          {/* Filter Tabs */}
          <div className="flex items-center gap-8 mb-16">
            {['all', 'weight', 'calories', 'workout'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No logs yet</div>
              <div className="empty-state-desc">Start tracking by adding your first entry.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {filtered.map((log) => (
                <div key={log.id} className="log-item card" style={{ padding: '14px 16px' }}>
                  <div className="log-item-icon">{iconMap[log.type]}</div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {log.type === 'weight' && `${log.value} kg`}
                      {log.type === 'calories' && `${log.value} kcal`}
                      {log.type === 'workout' && `${log.exercise} — ${log.sets}×${log.reps}`}
                    </div>
                    {log.note && <div className="text-xs text-muted">{log.note}</div>}
                    <div className="text-xs text-muted">{formatDateTime(log.date)}</div>
                  </div>
                  <button
                    className="btn btn-danger btn-icon btn-sm"
                    onClick={() => { deleteLog(user.uid, log.id); toast('Log deleted.', 'info'); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
