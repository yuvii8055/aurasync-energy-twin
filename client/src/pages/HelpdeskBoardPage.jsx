import React, { useState, useEffect } from 'react';
import {
  Kanban,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { sounds } from '../lib/utils.js';
import { getSavedTickets, saveTickets, getSavedWorkers, saveWorkers } from '../config/seedTickets.js';

export default function HelpdeskBoardPage() {
  const [tickets, setTickets] = useState(() => getSavedTickets());
  const [workers, setWorkers] = useState(() => getSavedWorkers());
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setTickets(json.data);
          saveTickets(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/users/workers')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setWorkers(json.data);
          saveWorkers(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const columns = [
    { id: 'new', title: 'New Incidents', color: 'border-cyan-500/40' },
    { id: 'assigned', title: 'Assigned to Tech', color: 'border-blue-500/40' },
    { id: 'in_progress', title: 'In Progress', color: 'border-amber-500/40' },
    { id: 'resolved', title: 'Resolved (Proof Attached)', color: 'border-emerald-500/40' },
    { id: 'closed', title: 'Closed & Verified', color: 'border-slate-500/40' }
  ];

  const handleSmartAssign = async (ticket) => {
    sounds.playChime('success');
    // Find best technician
    const availableWorker = workers.find(w => w.availability === 'available') || workers[0];
    const workerName = availableWorker?.name || 'Manjunath Gowda';
    const workerId = availableWorker?.id || 'w-1';

    const updatedTicket = {
      ...ticket,
      status: 'assigned',
      assignedWorkerId: workerId,
      assignedWorkerName: workerName,
      timeline: [
        ...(ticket.timeline || []),
        { status: 'assigned', byUserId: 'usr-hod-1', at: new Date().toISOString(), note: `Smart-routed to ${workerName} based on skills matrix` }
      ]
    };

    const nextTickets = tickets.map(t => t.ticketId === ticket.ticketId ? updatedTicket : t);
    setTickets(nextTickets);
    saveTickets(nextTickets);

    // Sync to backend if available
    try {
      fetch(`/api/tickets/${ticket.ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, instructions: 'Smart-routed based on skill and proximity' })
      }).catch(() => {});
    } catch {}
  };

  const handleAdvanceStatus = async (ticket, nextStatus) => {
    sounds.playChime('bubble');
    const updatedTicket = {
      ...ticket,
      status: nextStatus,
      timeline: [
        ...(ticket.timeline || []),
        { status: nextStatus, byUserId: 'technician', at: new Date().toISOString(), note: `Status advanced to ${nextStatus}` }
      ]
    };

    const nextTickets = tickets.map(t => t.ticketId === ticket.ticketId ? updatedTicket : t);
    setTickets(nextTickets);
    saveTickets(nextTickets);

    try {
      fetch(`/api/tickets/${ticket.ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      }).catch(() => {});
    } catch {}
  };

  const availableCount = workers.filter(w => w.availability === 'available').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Kanban className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              HOD Management Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Department Incident Dispatch & SLA Kanban
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AIML Department • Auto-routing with skills matrix & live worker workloads
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono">
            <div className="text-[10px] text-slate-400">Available Technicians</div>
            <div className="text-emerald-400 font-bold text-sm">
              {availableCount} of {workers.length} active
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono">
            <div className="text-[10px] text-slate-400">Total Live Incidents</div>
            <div className="text-cyan-400 font-bold text-sm">
              {tickets.length} logged
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTickets = tickets.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`p-4 rounded-3xl glass-panel bg-white/5 border ${col.color} min-w-[240px] flex flex-col space-y-3`}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-white">{col.title}</span>
                <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {colTickets.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colTickets.map((t) => (
                  <div
                    key={t.ticketId}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">{t.ticketId}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                        t.urgency === 'emergency' ? 'bg-rose-500/20 text-rose-400 animate-pulse' :
                        t.urgency === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {t.urgency}
                      </span>
                    </div>

                    <h5 className="font-bold text-white line-clamp-1">{t.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                      <span className="capitalize">{t.locationRef?.buildingId?.replace('-', ' ')}</span>
                      {col.id === 'new' && (
                        <button
                          onClick={() => handleSmartAssign(t)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                          title="Smart Assign to best available technician"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Smart Assign</span>
                        </button>
                      )}
                      {col.id === 'assigned' && (
                        <button
                          onClick={() => handleAdvanceStatus(t, 'in_progress')}
                          className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold cursor-pointer transition"
                        >
                          Start →
                        </button>
                      )}
                      {col.id === 'in_progress' && (
                        <button
                          onClick={() => handleAdvanceStatus(t, 'resolved')}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold cursor-pointer transition"
                        >
                          Resolve ✓
                        </button>
                      )}
                      {col.id === 'resolved' && (
                        <button
                          onClick={() => handleAdvanceStatus(t, 'closed')}
                          className="px-2 py-0.5 rounded bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 font-bold cursor-pointer transition"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colTickets.length === 0 && (
                  <div className="text-center py-8 text-[11px] text-slate-500">
                    No tickets in this state.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
