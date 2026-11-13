import React, { useState, useEffect } from 'react';
import {
  User,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  AlertTriangle,
  Play,
  Check,
  CalendarCheck
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { sounds } from '../lib/utils.js';
import { getSavedTickets, saveTickets } from '../config/seedTickets.js';

export default function WorkerTasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState(() => {
    const all = getSavedTickets();
    return all.filter(t => t.status === 'assigned' || t.status === 'in_progress');
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [photoProof, setPhotoProof] = useState(null);
  const [checklist, setChecklist] = useState([
    { id: 'c1', task: 'Morning 11kV Substation Voltage & APFC Log', done: true },
    { id: 'c2', task: 'Boys Hostel 1 Geyser Thermostat Inspection', done: false },
    { id: 'c3', task: 'AIML Block 2nd Floor Washroom Sensor Faucets', done: true },
    { id: 'c4', task: 'Green Belt Rainwater Pond Aeration Pump Check', done: false }
  ]);

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const myTasks = json.data.filter(t => t.status === 'assigned' || t.status === 'in_progress');
          setTasks(myTasks);
          saveTickets(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleStartTask = async (taskId) => {
    sounds.playChime('bubble');
    const allTickets = getSavedTickets();
    const updated = allTickets.map(t => t.ticketId === taskId ? { ...t, status: 'in_progress' } : t);
    saveTickets(updated);
    setTasks(updated.filter(t => t.status === 'assigned' || t.status === 'in_progress'));

    try {
      fetch(`/api/tickets/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress', note: 'Technician arrived on site' })
      }).catch(() => {});
    } catch {}
  };

  const handleResolveWithProof = async (taskId) => {
    sounds.playChime('success');
    const allTickets = getSavedTickets();
    const updated = allTickets.map(t =>
      t.ticketId === taskId
        ? {
            ...t,
            status: 'resolved',
            afterMedia: [{ url: photoProof || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80' }]
          }
        : t
    );
    saveTickets(updated);
    setTasks(updated.filter(t => t.status === 'assigned' || t.status === 'in_progress'));
    setSelectedTask(null);
    setPhotoProof(null);

    try {
      fetch(`/api/tickets/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          afterPhotoUrl: photoProof || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
          note: 'Work completed and tested by technician.'
        })
      }).catch(() => {});
    } catch {}
  };

  const toggleChecklistItem = (id) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
    sounds.playChime('bubble');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Worker Profile Header */}
      <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Manjunath Gowda</h2>
            <p className="text-xs text-slate-400">Lead Electrician • Facilities & Maintenance</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
          Shift: Morning (07:00 - 15:30)
        </span>
      </div>

      {/* Routine Daily Preventive Checklist */}
      <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-emerald-400" />
          Daily Preventive Care Rounds
        </span>
        <div className="space-y-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className="w-full p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-left hover:border-emerald-500/30 transition text-xs"
            >
              <span className={`text-slate-300 ${item.done ? 'line-through opacity-60 text-emerald-300' : ''}`}>
                {item.task}
              </span>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                  item.done
                    ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                    : 'border-white/20'
                }`}
              >
                {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Dispatched Work Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Active Assigned Work Orders ({tasks.length})
          </span>
          <span className="text-[11px] text-slate-400">Smart Priority Queue</span>
        </div>

        {tasks.map((task) => (
          <div
            key={task.ticketId}
            className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400">{task.ticketId}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  task.urgency === 'emergency'
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : task.urgency === 'high'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {task.urgency}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{task.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{task.locationRef?.buildingId} • Floor {task.locationRef?.floor ?? 1}</span>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
              {task.status === 'assigned' && (
                <button
                  onClick={() => handleStartTask(task.ticketId)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Accept & Start Work</span>
                </button>
              )}

              {task.status === 'in_progress' && (
                <div className="w-full space-y-2">
                  <button
                    onClick={() => setSelectedTask(selectedTask === task.ticketId ? null : task.ticketId)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Resolved with Proof</span>
                  </button>

                  {selectedTask === task.ticketId && (
                    <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
                      <span className="text-xs font-bold text-emerald-400">
                        Upload After-Service Photo Proof
                      </span>
                      <input
                        type="text"
                        placeholder="Photo URL or leave blank for default technician proof"
                        value={photoProof || ''}
                        onChange={(e) => setPhotoProof(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      />
                      <button
                        onClick={() => handleResolveWithProof(task.ticketId)}
                        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                      >
                        Submit Proof & Close Ticket
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="p-8 rounded-3xl glass-panel bg-white/5 border border-white/10 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">All Dispatched Work Orders Clear!</h4>
            <p className="text-xs text-slate-400">Great job! No pending assigned incidents for this shift.</p>
          </div>
        )}
      </div>
    </div>
  );
}
