import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { sounds } from '../lib/utils.js';

export default function FeedbackPage() {
  const { user } = useAuthStore();
  const [feedbackList, setFeedbackList] = useState([]);
  const [type, setType] = useState('Feature request');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'inbox' : 'submit');

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(json => { if (json.success) setFeedbackList(json.data); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rating, text })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playChime('success');
        setFeedbackList([data.data, ...feedbackList]);
        setText('');
        alert('Thank you for contributing your voice to DSATM campus sustainability!');
      }
    } catch {}
  };

  const handleConvertToTicket = async (feedbackId) => {
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/convert-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        sounds.playChime('bubble');
        alert(`Converted to Helpdesk Ticket ${data.ticketId}!`);
        setFeedbackList(prev => prev.map(f => f.id === feedbackId ? { ...f, status: 'Converted to Ticket' } : f));
      }
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Campus Feedback & Roadmap
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Community Voice & AI Topic Clustering
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Student & Faculty ideas auto-clustered by Aura AI into actionable improvements
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 rounded-xl glass-panel bg-black/40 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'submit' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'inbox' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Inbox ({feedbackList.length})
          </button>
        </div>
      </div>

      {activeTab === 'submit' ? (
        /* Submit Feedback Form */
        <div className="max-w-2xl mx-auto p-6 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white">Share a Suggestion, Feature Request or Issue</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Feedback Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Feature request">Feature request</option>
                  <option value="Suggestion for the college">Suggestion for the college</option>
                  <option value="Bug in the app">Bug in the app</option>
                  <option value="Complaint about a service">Complaint about a service</option>
                  <option value="Praise">Praise</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value="3">⭐⭐⭐ (3 Stars)</option>
                  <option value="2">⭐⭐ (2 Stars)</option>
                  <option value="1">⭐ (1 Star)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Your Detailed Feedback</label>
              <textarea
                required
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your suggestion or experience regarding campus energy, facilities or digital twin tools..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition"
            >
              Transmit Feedback to Campus Governance
            </button>
          </form>
        </div>
      ) : (
        /* Admin Inbox with AI Topics & Convert to Ticket */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {feedbackList.length} items with AI sentiment clustering</span>
            <span className="font-mono text-purple-400">Aura AI Auto-Categorized</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackList.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl glass-panel bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      Topic: {item.topic}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300' : (item.sentiment === 'negative' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-500/20 text-slate-300')
                    }`}>
                      {item.sentiment} ({item.rating}★)
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">"{item.text}"</p>
                  <div className="text-[10px] text-slate-400">By {item.userName} • {item.department}</div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-semibold">{item.status}</span>
                  {item.status !== 'Converted to Ticket' && (
                    <button
                      onClick={() => handleConvertToTicket(item.id)}
                      className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-[10px] font-bold text-purple-300 flex items-center gap-1 transition"
                    >
                      <LifeBuoy className="w-3 h-3" />
                      <span>Convert to Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
