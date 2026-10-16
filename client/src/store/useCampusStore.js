import { create } from 'zustand';

export const useCampusStore = create((set, get) => ({
  // Telemetry Snapshot
  telemetry: {
    campus: {
      totalRealKw: 154.2,
      totalGhostKw: 118.6,
      ghostGapKw: 35.6,
      solarGenerationKw: 78.4,
      netGridImportKw: 75.8,
      carbonIntensityKgPerHr: 53.8,
      currentCostRsPerHr: 625.3,
      sanctionedDemandKva: 750,
      demandUtilizationPct: 20.5,
      isPowerCut: false,
      dgActive: false
    },
    population: {
      studentsPresent: 650,
      facultyPresent: 55,
      hostelResidents: 180,
      totalCampusOccupancy: 885
    },
    weather: {
      tempC: 27.5,
      condition: 'Sunny',
      humidityPct: 55,
      solarRadiationIndex: 0.8
    },
    buildings: {},
    ghostAnomalies: [
      {
        id: 'ghost-1',
        deviceId: 'dev-m204-ac',
        buildingId: 'dsatm-main',
        roomId: 'main-204',
        title: 'Lab 204 AC Running in Empty Room',
        wasteWatts: 1950,
        wasteRsPerHour: '16.1',
        category: 'HVAC'
      }
    ],
    savingsTracker: {
      savedTodayRs: 4850,
      savedTodayKwh: 588,
      savedTodayCo2Kg: 417,
      optimizationsCount: 14
    }
  },

  // 3D Overlays: REAL | GHOST | GAP | THERMAL | OCCUPANCY | CARBON | COST | SOLAR | HELPDESK
  activeOverlay: 'GAP',
  viewMode: '3d', // '3d' | 'map' (top-down satellite style)
  explodedView: false,
  selectedBuildingId: null,
  selectedRoomId: null,

  // Population Simulator Sliders
  simulator: {
    studentsCount: 650,
    attendancePct: 88,
    facultyCount: 55,
    hostelOccupancy: 180,
    outdoorTemp: 27.5,
    monsoonMode: false,
    powerCutMode: false,
    activeScenario: 'Normal Weekday',
    timeMultiplier: 1
  },

  // Actions
  updateTelemetry: (newTelemetry) => set({ telemetry: newTelemetry }),
  setOverlay: (overlay) => set({ activeOverlay: overlay }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleExplodedView: () => set((state) => ({ explodedView: !state.explodedView })),
  selectBuilding: (bId) => set({ selectedBuildingId: bId }),
  selectRoom: (rId) => set({ selectedRoomId: rId }),

  setSimulatorSpeed: (speed) => set((state) => ({
    simulator: { ...state.simulator, timeMultiplier: speed }
  })),

  updateSimulatorField: (key, value) => set((state) => ({
    simulator: { ...state.simulator, [key]: value }
  }))
}));
