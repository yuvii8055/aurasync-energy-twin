import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import {
  Sparkles,
  Send,
  Square,
  RotateCcw,
  Copy,
  Check,
  Mic,
  MicOff,
  AlertTriangle,
  Play,
  Zap,
  Shield,
  Activity,
  Layers,
  HelpCircle,
  TrendingDown,
  Globe,
  Sliders,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore.js';
import { useSimulationStore } from '../../store/useSimulationStore.js';
import { sounds, formatINR } from '../../lib/utils.js';

export default function AuraAIChat({ isDrawer = false, onClose }) {
  const { telemetry } = useCampusStore();
  const simulationStore = useSimulationStore();

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Hello! I am **Aura AI**, your campus energy operations intelligence for DSATM Bengaluru. I analyze live sub-metering, student occupancy, and BESCOM tariffs to identify waste and deliver quantified savings.\n\nAsk me anything about current loads, ghost waste, tariff impacts, or carbon metrics!',
      isOffline: false,
      timestamp: Date.now()
    }
  ]);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState('CFO'); // 'CFO' | 'Eco' | 'Engineer' | 'Student'
  const [language, setLanguage] = useState('English'); // 'English' | 'Hindi' | 'Kannada'
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Diagnostics state (Fix 2.9)
  const [aiStatus, setAiStatus] = useState({ connected: false, model: 'gemini-1.5-flash', latencyMs: 0 });
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [offlineWarning, setOfflineWarning] = useState(null);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fetch AI Health on mount
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      if (data.success && data.data) {
        setAiStatus(data.data);
      }
    } catch {
      setAiStatus({ connected: false, model: 'offline-rule-engine', latencyMs: 0 });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Web Speech API Voice Recognition (Fix 2.6)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Kannada' ? 'kn-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        sounds.playChime('bubble');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        sounds.playChime('chime');
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // Run Test AI Diagnostic (Fix 2.9)
  const handleTestAi = async () => {
    setTestingAi(true);
    setTestResult(null);
    sounds.playChime('bubble');
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setAiStatus(data.data);
        setTestResult(data.data);
        sounds.playChime('success');
      } else {
        setTestResult({ connected: false, message: data.error || 'Test failed' });
        sounds.playChime('alert');
      }
    } catch (err) {
      setTestResult({ connected: false, message: err.message });
      sounds.playChime('alert');
    } finally {
      setTestingAi(false);
    }
  };

  // Dynamic Suggested Prompt Chips from active alerts (Fix 2.6)
  const anomalies = telemetry?.ghostAnomalies || [];
  const suggestedPrompts = [
    ...(anomalies.length > 0
      ? [`How do we fix the ghost load in ${anomalies[0].roomName}?`]
      : []),
    'Which block wastes the most power right now?',
    'What happens to my bill if I set AC to 26?',
    'Explain carbon scope 2 simply',
    'How can we optimize EV charging with solar?'
  ].slice(0, 4);

  // Send message and stream response (Fix 2.2 & 2.3)
  const handleSend = async (overridePrompt) => {
    const textToSend = overridePrompt !== undefined ? overridePrompt : input;
    if (!textToSend.trim() || isStreaming) return;

    sounds.playChime('bubble');
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    const newMessages = [
      ...messages,
      { id: userMsgId, role: 'user', content: textToSend.trim(), timestamp: Date.now() }
    ];

    setMessages([
      ...newMessages,
      { id: assistantMsgId, role: 'assistant', content: '', isOffline: false, timestamp: Date.now() }
    ]);
    setInput('');
    setIsStreaming(true);
    setOfflineWarning(null);

    abortControllerRef.current = new AbortController();

    try {
      // Build history payload for Gemini
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          mode,
          language
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to reach AI service.`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      let currentAction = null;
      let isOfflineMsg = false;
      let fallbackErr = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));

              if (parsed.type === 'token') {
                accumulatedText += parsed.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                  )
                );
              } else if (parsed.type === 'action') {
                currentAction = parsed.action;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, action: parsed.action } : m
                  )
                );
              } else if (parsed.type === 'fallback_warning') {
                // Fix 2.1: Visible banner when offline fallback is used
                isOfflineMsg = true;
                fallbackErr = parsed.error;
                setOfflineWarning(parsed.banner || `Gemini unreachable: showing basic offline answer (${parsed.error})`);
                if (parsed.offlineAnswer) {
                  accumulatedText = parsed.offlineAnswer;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: accumulatedText,
                            action: parsed.action || m.action,
                            isOffline: true,
                            error: parsed.error
                          }
                        : m
                    )
                  );
                }
              } else if (parsed.type === 'done') {
                if (parsed.isOffline) {
                  isOfflineMsg = true;
                }
              }
            } catch {
              // Partial chunk
            }
          }
        }
      }

      sounds.playChime('success');
    } catch (err) {
      if (err.name === 'AbortError') {
        // Stream aborted by user
      } else {
        setOfflineWarning(`Gemini unreachable: showing basic offline answer (${err.message})`);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    m.content ||
                    'Unable to reach Gemini AI service. Please verify server connectivity or GEMINI_API_KEY.',
                  isOffline: true,
                  error: err.message
                }
              : m
          )
        );
        sounds.playChime('alert');
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generation Button (Fix 2.3)
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  // Regenerate last response (Fix 2.3)
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  // Copy message text (Fix 2.3)
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sounds.playChime('bubble');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Execute Action - "Simulate this" (Fix 2.7)
  const handleSimulateAction = (action) => {
    sounds.playChime('success');
    if (!action) return;

    if (action.params) {
      // Apply params to simulation store
      if (action.params.students !== undefined) {
        simulationStore.setParam('students', action.params.students);
      }
      if (action.params.outdoorTempC !== undefined) {
        simulationStore.setParam('outdoorTempC', action.params.outdoorTempC);
      }
      if (action.params.acReductionPct !== undefined) {
        // adjust outdoor temp or exam mode
      }
    }
    alert(`Simulation updated with parameters from Aura AI:\n${JSON.stringify(action.params || {}, null, 2)}`);
  };

  // Execute Action - "Apply" (Fix 2.7)
  const handleApplyAction = async (action) => {
    sounds.playChime('bubble');
    const confirmed = window.confirm(`Authorize Aura AI recommendation: "${action.title}"?\nEstimated savings: ₹${action.estimatedSavingsRsPerHour || 140}/hr.`);
    if (confirmed) {
      try {
        await fetch('/api/control/device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: action.target || 'dev-m204-ac', state: 'off' })
        });
        sounds.playChime('success');
        alert(`Action applied successfully! Digital relay activated for ${action.title}.`);
      } catch (err) {
        alert('Action could not be executed: ' + err.message);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#070B14] text-slate-100 ${isDrawer ? 'p-4' : 'p-6 max-w-5xl mx-auto space-y-4'}`}>
      {/* Top Header & Diagnostics Bar (Fix 2.9) */}
      <div className="p-4 rounded-3xl glass-panel bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white leading-tight">Aura AI Campus Coach</h1>
              {/* Diagnostic Status Chip */}
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  aiStatus.connected
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
                title={aiStatus.connected ? 'Gemini API online' : 'Offline rule-engine active'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${aiStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {aiStatus.connected ? 'Gemini Connected' : 'Offline Fallback'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Model: <span className="text-cyan-400">{aiStatus.model || 'gemini-1.5-flash'}</span>
              {aiStatus.latencyMs > 0 && <span> • {aiStatus.latencyMs}ms</span>}
            </p>
          </div>
        </div>

        {/* Persona Mode & Language Selectors (Fix 2.6) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Persona Mode */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs font-semibold">
            {['CFO', 'Eco', 'Engineer', 'Student'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  mode === m
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-black font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-black/50 border border-white/10 text-xs rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
          </select>

          {/* Test AI Diagnostic Button (Fix 2.9) */}
          <button
            onClick={handleTestAi}
            disabled={testingAi}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] text-slate-300 font-mono flex items-center gap-1 transition"
            title="Send test ping to Gemini API"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{testingAi ? 'Testing...' : 'Test AI'}</span>
          </button>

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Test AI Result Popover Banner if tested */}
      {testResult && (
        <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between font-mono ${
          testResult.connected ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>AI Test: {testResult.message} ({testResult.latencyMs || 0}ms latency)</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Visible Offline Banner when Gemini call fails (Fix 2.1) */}
      {offlineWarning && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Notice:</strong> {offlineWarning}</span>
          </div>
          <button onClick={() => setOfflineWarning(null)} className="text-amber-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Chat Messages Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono px-2">
                <span>{isUser ? 'You' : 'Aura AI (DSATM)'}</span>
                {m.isOffline && <span className="text-amber-400 font-semibold">• Offline Answer</span>}
              </div>

              <div
                className={`group relative max-w-2xl p-4 rounded-3xl text-xs leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                    : 'bg-[#0E1526] border border-white/10 text-slate-200 rounded-tl-sm'
                }`}
              >
                {/* Markdown Rendered Content */}
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div
                    className="prose prose-invert prose-xs max-w-none space-y-2"
                    dangerouslySetInnerHTML={{ __html: marked.parse(m.content || '') }}
                  />
                )}

                {/* Structured Action Recommendation Card (Fix 2.7) */}
                {m.action && (
                  <div className="mt-3 p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-cyan-400 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Recommended Action: {m.action.title}</span>
                      </div>
                      {m.action.estimatedSavingsRsPerHour && (
                        <span className="text-emerald-400 font-mono text-[11px]">
                          +₹{m.action.estimatedSavingsRsPerHour}/hr
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSimulateAction(m.action)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-[11px] flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Simulate this</span>
                      </button>

                      <button
                        onClick={() => handleApplyAction(m.action)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-[11px] flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
                      >
                        <Shield className="w-3 h-3" />
                        <span>Apply</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Floating Action Buttons: Copy */}
                {!isUser && m.content && (
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-slate-400 hover:text-white transition"
                    title="Copy response"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Typing / Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono p-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Aura AI is thinking & streaming live tokens...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips (Fix 2.6) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isStreaming}
            className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white whitespace-nowrap transition disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box & Action Controls */}
      <div className="relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[#0C1222] p-2 rounded-2xl border border-white/15 focus-within:border-cyan-400/80 transition shadow-2xl"
        >
          {/* Voice Input Button via Web Speech API */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2 rounded-xl transition ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to speech...' : 'Ask Aura AI about DSATM energy, ghost waste, tariffs...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStop}
              className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition flex items-center gap-1 text-xs font-bold"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/20 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          )}

          {/* Regenerate Button */}
          {!isStreaming && messages.length > 1 && (
            <button
              type="button"
              onClick={handleRegenerate}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Regenerate last response"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
