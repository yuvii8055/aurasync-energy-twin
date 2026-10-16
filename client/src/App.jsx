import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import CustomCursor from './components/common/CustomCursor.jsx';
import DynamicIsland from './components/island/DynamicIsland.jsx';
import PasskeyModal from './components/common/PasskeyModal.jsx';
import CommandPalette from './components/common/CommandPalette.jsx';
import QuickReportModal from './components/helpdesk/QuickReportModal.jsx';
import SimDebugDrawer from './components/common/SimDebugDrawer.jsx';
import AuraAIChatDrawer from './components/ai/AuraAIChatDrawer.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CampusPage from './pages/CampusPage.jsx';
import VisionLabPage from './pages/VisionLabPage.jsx';
import ControlPage from './pages/ControlPage.jsx';
import SimulatorPage from './pages/SimulatorPage.jsx';
import CarbonPage from './pages/CarbonPage.jsx';
import AICoachPage from './pages/AICoachPage.jsx';
import HelpdeskPage from './pages/HelpdeskPage.jsx';
import HelpdeskBoardPage from './pages/HelpdeskBoardPage.jsx';
import WorkerTasksPage from './pages/WorkerTasksPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PhoneCameraPage from './pages/PhoneCameraPage.jsx';
import PairPage from './pages/PairPage.jsx';

import { useCampusStore } from './store/useCampusStore.js';
import { useIslandStore } from './store/useIslandStore.js';
import { useAuthStore } from './store/useAuthStore.js';
import { useSimulationStore } from './store/useSimulationStore.js';
import { sounds } from './lib/utils.js';

export default function App() {
  const location = useLocation();
  const { updateTelemetry } = useCampusStore();
  const { pushEvent } = useIslandStore();
  const { token } = useAuthStore();
  const { advanceClockTick } = useSimulationStore();

  const [isPasskeyOpen, setIsPasskeyOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Check if current route is dedicated mobile camera or pairing page
  const isMobileCameraRoute = location.pathname.startsWith('/camera') || location.pathname === '/pair';

  // Simulation Clock Runner: advances simulation time every 1000ms
  useEffect(() => {
    const clockInterval = setInterval(() => {
      advanceClockTick();
    }, 1000);
    return () => clearInterval(clockInterval);
  }, [advanceClockTick]);

  // Synchronize useSimulationStore computed outputs with useCampusStore
  useEffect(() => {
    const unsub = useSimulationStore.subscribe((state) => {
      const c = state.computed;
      updateTelemetry({
        campus: {
          totalRealKw: c.totalKw,
          totalGhostKw: c.totalGhostKw,
          ghostGapKw: c.ghostGapKw,
          solarGenerationKw: c.solarGenerationKw,
          netGridImportKw: c.netGridImportKw,
          carbonIntensityKgPerHr: c.totalCo2KgPerHour,
          currentCostRsPerHr: c.currentCostRsPerHour,
          sanctionedDemandKva: 750,
          demandUtilizationPct: parseFloat(((c.totalKw / 750) * 100).toFixed(1)),
          isPowerCut: c.dgActive,
          dgActive: c.dgActive
        },
        population: {
          studentsPresent: state.params.students,
          facultyPresent: state.params.faculty,
          hostelResidents: Math.round(200 * (state.params.hostelOccupancyPct / 100)),
          totalCampusOccupancy: c.totalCampusOccupants
        },
        weather: {
          tempC: state.params.outdoorTempC,
          condition: state.params.monsoon ? 'Monsoon Showers' : 'Sunny',
          humidityPct: state.params.monsoon ? 85 : 55,
          solarRadiationIndex: c.solarGenerationKw > 0 ? 0.82 : 0
        },
        buildings: c.perBuildingKw,
        ghostAnomalies: c.alerts || [],
        savingsTracker: {
          savedTodayRs: Math.round(c.costRs * 0.14),
          savedTodayKwh: Math.round(c.kwhToday * 0.14),
          savedTodayCo2Kg: Math.round(c.co2Kg * 0.14),
          optimizationsCount: 14
        }
      });
    });
    return unsub;
  }, [updateTelemetry]);

  // Real-time Socket.IO Connection (Section A.1: path /socket.io, relative origin)
  useEffect(() => {
    const socket = io('/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to AuraSync Telemetry WebSocket:', socket.id);
      socket.emit('telemetry:request');
    });

    socket.on('telemetry:tick', (data) => {
      if (data && data.campus) {
        // preserve live sync
      }
    });

    socket.on('island:event', (event) => {
      pushEvent(event);
    });

    socket.on('lift:emergency', (data) => {
      pushEvent({
        type: 'SECURITY',
        title: '🚨 SIREN: LIFT ENTRAPMENT REPORTED',
        message: `${data.lift.name} stuck at Floor ${data.lift.currentFloor}. Technician dispatched!`,
        severity: 'critical'
      });
    });

    return () => socket.disconnect();
  }, [token, pushEvent]);

  // Global Command Palette Shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleGlobalCommandShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalCommandShortcut);
    return () => window.removeEventListener('keydown', handleGlobalCommandShortcut);
  }, []);

  // Easter Egg: Type "o1" to celebrate O(1) Outlaws
  useEffect(() => {
    let buffer = '';
    const handleKey = (e) => {
      buffer += e.key.toLowerCase();
      if (buffer.length > 5) buffer = buffer.slice(-5);
      if (buffer.endsWith('o1')) {
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } });
        sounds.playChime('success');
        setShowEasterEgg(true);
        buffer = '';
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleExecuteMasterSwitch = async (pin) => {
    try {
      const res = await fetch('/api/control/campus-eco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enable: true, passkey: pin })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playChime('success');
        pushEvent({
          type: 'AUTO_CONTROL',
          title: 'Campus Eco Mode Active!',
          message: 'Isolating vacant classroom ACs & shedding non-critical loads.',
          severity: 'info'
        });
      } else {
        alert(data.error);
      }
    } catch {}
  };

  // Dedicated Mobile Camera Fullscreen View (Section C.1 & B.5)
  if (isMobileCameraRoute) {
    return (
      <Routes>
        <Route path="/camera/:token" element={<PhoneCameraPage />} />
        <Route path="/pair" element={<PairPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Custom Glowing Pointer & Spotlight */}
      <CustomCursor />

      {/* Rock-Solid Movable Dynamic Island (Portal-based into document.body) */}
      <DynamicIsland
        onOpenMasterSwitch={() => setIsPasskeyOpen(true)}
        onOpenAiCoach={() => setIsAiDrawerOpen(true)}
      />

      {/* Global Sim Debug Drawer (Ctrl+Shift+D) */}
      <SimDebugDrawer />

      {/* Top Navbar with Responsive Hamburger & Desktop Menu */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        onOpenReportModal={() => setIsReportOpen(true)}
      />

      {/* Page Routing with Fluid Transitions & Error Boundary */}
      <main className="flex-1 w-full">
        <ErrorBoundary>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Routes location={location}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <DashboardPage
                      onOpenMasterSwitch={() => setIsPasskeyOpen(true)}
                      onOpenReportModal={() => setIsReportOpen(true)}
                    />
                  }
                />
                <Route path="/campus" element={<CampusPage />} />
                <Route path="/vision" element={<VisionLabPage />} />
                <Route
                  path="/control"
                  element={<ControlPage onOpenMasterSwitch={() => setIsPasskeyOpen(true)} />}
                />
                <Route path="/simulate" element={<SimulatorPage />} />
                <Route path="/carbon" element={<CarbonPage />} />
                <Route path="/coach" element={<AICoachPage />} />
                <Route
                  path="/helpdesk"
                  element={<HelpdeskPage onOpenReportModal={() => setIsReportOpen(true)} />}
                />
                <Route path="/helpdesk/board" element={<HelpdeskBoardPage />} />
                <Route path="/helpdesk/my-tasks" element={<WorkerTasksPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pair" element={<PairPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <PasskeyModal
        isOpen={isPasskeyOpen}
        onClose={() => setIsPasskeyOpen(false)}
        onAuthorized={handleExecuteMasterSwitch}
        title="Campus Eco Switch Authorization"
        predictedImpact={{
          kwDrop: 48,
          savingsPerHourRs: 396,
          co2AvoidedKg: 34.1
        }}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenMasterSwitch={() => setIsPasskeyOpen(true)}
        onOpenReportModal={() => setIsReportOpen(true)}
      />

      <QuickReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Aura AI Chat Slide-over Drawer (Reachable from Dynamic Island) */}
      <AuraAIChatDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <div
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowEasterEgg(false)}
        >
          <div className="p-8 rounded-3xl glass-panel bg-[#0B0F19]/95 border border-emerald-500/40 text-center space-y-3 shadow-2xl max-w-md">
            <div className="text-3xl">🚀</div>
            <h3 className="text-xl font-bold text-white">O(1) Outlaws: AIML Engineers</h3>
            <p className="text-xs text-emerald-400 font-mono">
              Dayananda Sagar Academy of Technology & Management (DSATM)
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pt-2">
              "Building scalable AI systems with O(1) performance guarantees for a sustainable campus."
            </p>
            <button
              onClick={() => setShowEasterEgg(false)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Back to Campus Twin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
