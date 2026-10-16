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

export default function WorkerTasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
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
        if (json.success) {
          // Filter tickets assigned or relevant for technician
          const myTasks = json.data.filter(t => t.status === 'assigned' || t.status === 'in_progress');
          setTasks(myTasks);
        }
      })
      .catch(() => {});
  }, []);

  const handleStartTask = async (taskId) => {
    try {
      await fetch(`/api/tickets/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress', note: 'Technician arrived on site' })
      });
      sounds.playChime('bubble');
      setTasks(prev => prev.map(t => t.ticketId === taskId ? { ...t, status: 'in_progress' } : t));
    } catch {}
  };

  const handleResolveWithProof = async (taskId) => {
    try {
      await fetch(`/api/tickets/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          afterPhotoUrl: photoProof || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
          note: 'Work completed and tested by technician.'
        })
      });
      sounds.playChime('success');
      alert('Task resolved! Before & After proof transmitted to HOD and student.');
      setTasks(prev => prev.filter(t => t.ticketId !== taskId));
      setSelectedTask(null);
      setPhotoProof(null);
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

      {/* Daily Preventive Checklist */}
      <div className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
            Daily Preventive Checklist
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {checklist.filter(c => c.done).length} of {checklist.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className="w-full text-left p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between text-xs hover:bg-white/5 transition"
            >
              <span className={`font-medium ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {item.task}
              </span>
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                item.done ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/20'
              }`}>
                {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Assigned Tasks Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>Assigned Urgent Incidents ({tasks.length})</span>
          <span className="text-[10px] text-slate-400">Mobile Action Center</span>
        </h3>

        {tasks.map((task) => (
          <div
            key={task.ticketId}
            className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400">{task.ticketId}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                task.urgency === 'emergency' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {task.urgency}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{task.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{task.description}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
              <span className="flex items-center gap-1 font-sans">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {task.locationRef.buildingId}
              </span>
              <span className="text-emerald-400 capitalize">{task.status.replace('_', ' ')}</span>
            </div>

            {/* Action Buttons for Worker */}
            <div className="pt-2 flex gap-2">
              {task.status === 'assigned' && (
                <button
                  onClick={() => handleStartTask(task.ticketId)}
                  className="flex-1 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Work On-Site</span>
                </button>
              )}

              {task.status === 'in_progress' && (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>Upload "After" Photo Proof</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={() => setPhotoProof('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80')}
                        className="hidden"
                      />
                    </label>
                    {photoProof && <span className="text-[10px] text-emerald-400 font-bold">✓ Photo Attached</span>}
                  </div>

                  <button
                    onClick={() => handleResolveWithProof(task.ticketId)}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete & Transmit Evidence</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="p-8 text-center glass-panel bg-white/5 rounded-3xl border border-white/10 text-slate-400 text-xs">
            🎉 All assigned tasks for this shift have been resolved!
          </div>
        )}
      </div>
    </div>
  );
}
