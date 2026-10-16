import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CAMPUS_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'campus.json'), 'utf-8'));

class SyntheticIoTEngine {
  constructor() {
    this.io = null;
    this.timer = null;
    this.tickIntervalMs = 2000; // 2 seconds per tick

    // Simulation Clock & Speed Multipliers (1x, 10x, 60x, 600x)
    this.timeMultiplier = 1;
    this.simulatedTime = new Date(); // Simulates Indian Standard Time (IST)

    // Agent-based Population Simulator State
    this.state = {
      studentsCount: 650, // 0 to 1000+
      attendancePct: 88,
      facultyCount: 55,
      hostelOccupancy: 180,
      outdoorTemp: 27.5, // Bengaluru ambient Celsius (15 to 35 C)
      monsoonMode: false,
      powerCutMode: false, // BESCOM outage -> DG set failover
      activeScenario: 'Normal Weekday', // Normal Weekday, Exam Week, Weekend, Fest Day, Summer Heat Wave, Monsoon Power Cut, Semester Holiday
      ecoModeActive: false,
      optimizationsAppliedToday: 14,
      savedTodayRs: 4850,
      savedTodayKwh: 588,
      savedTodayCo2Kg: 417
    };

    // Device States registry for dynamic overrides and switches
    this.deviceStates = new Map();
    this.deviceAnomalies = new Map();

    // 8 Deterministic Energy Ghost Anomalies
    this.initDevices();
  }

  initDevices() {
    CAMPUS_DATA.campus.buildings.forEach(b => {
      b.floors.forEach(f => {
        f.rooms.forEach(r => {
          r.devices.forEach(d => {
            this.deviceStates.set(d.id, {
              state: d.state || 'on',
              ratedWatts: d.ratedWatts,
              currentWatts: d.state === 'on' ? d.ratedWatts : 0,
              buildingId: b.id,
              roomId: r.id,
              name: d.name,
              type: d.type,
              controllable: d.controllable !== false
            });

            if (d.anomaly) {
              this.deviceAnomalies.set(d.id, d.anomaly);
            }
          });
        });
      });
    });

    // Ensure our 8 deterministic anomalies exist
    this.deviceAnomalies.set('dev-m204-ac', 'ac_empty_lab'); // Lab 204 AC running with 0 people
    this.deviceAnomalies.set('dev-m103-lgt', 'lights_vacant_class'); // Classroom 103 lights on with 0 people
    this.deviceAnomalies.set('dev-aud-prj', 'projector_idle'); // Auditorium projector idle
    this.deviceAnomalies.set('dev-m201-pc', 'pcs_overnight'); // Lab 201 PCs running
    this.deviceAnomalies.set('dev-bh1-geyser208', 'geyser_continuous'); // Hostel geyser on
    this.deviceAnomalies.set('dev-pond-pump', 'pump_dry_run'); // Pond pump dry run
    this.deviceAnomalies.set('dev-cnc-mill', 'motor_friction_extra'); // CNC drawing 25% extra
    this.deviceAnomalies.set('dev-bh1-refrig', 'chiller_door_ajar'); // Chiller drawing extra
  }

  setIO(io) {
    this.io = io;
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), this.tickIntervalMs);
    console.log('⚡ Synthetic IoT Engine active (tick: 2000ms)');
  }

  setTimeMultiplier(multiplier) {
    this.timeMultiplier = Number(multiplier) || 1;
    console.log(`⏱️ Simulation time multiplier set to ${this.timeMultiplier}x`);
  }

  setScenario(scenarioName) {
    this.state.activeScenario = scenarioName;
    if (scenarioName === 'Normal Weekday') {
      this.state.studentsCount = 650;
      this.state.attendancePct = 88;
      this.state.outdoorTemp = 27;
      this.state.monsoonMode = false;
      this.state.powerCutMode = false;
    } else if (scenarioName === 'Exam Week') {
      this.state.studentsCount = 950;
      this.state.attendancePct = 98;
      this.state.outdoorTemp = 28;
    } else if (scenarioName === 'Weekend') {
      this.state.studentsCount = 60;
      this.state.attendancePct = 10;
      this.state.outdoorTemp = 26;
    } else if (scenarioName === 'Fest Day (1000+ visitors)') {
      this.state.studentsCount = 1250;
      this.state.attendancePct = 95;
      this.state.outdoorTemp = 30;
    } else if (scenarioName === 'Summer Heat Wave') {
      this.state.outdoorTemp = 34.5;
    } else if (scenarioName === 'Monsoon Power Cut') {
      this.state.monsoonMode = true;
      this.state.powerCutMode = true;
      this.state.outdoorTemp = 22;
    } else if (scenarioName === 'Semester Holiday') {
      this.state.studentsCount = 15;
      this.state.attendancePct = 5;
    }
  }

  updateSlider(key, value) {
    if (key in this.state) {
      this.state[key] = value;
    }
  }

  toggleDevice(deviceId, targetState) {
    const dev = this.deviceStates.get(deviceId);
    if (!dev) return false;
    dev.state = targetState;
    dev.currentWatts = targetState === 'on' ? dev.ratedWatts : 0;
    return true;
  }

  applyCampusEcoMode(enable = true) {
    this.state.ecoModeActive = enable;
    let switchedOffCount = 0;
    let wattsSaved = 0;

    this.deviceStates.forEach((dev, id) => {
      if (enable && dev.controllable && dev.state === 'on') {
        // Shed non-critical lights, fans, idle ACs, and projectors
        if (['light', 'fan', 'projector', 'geyser'].includes(dev.type) || id === 'dev-m204-ac') {
          dev.state = 'off';
          wattsSaved += dev.ratedWatts;
          switchedOffCount++;
        }
      } else if (!enable && dev.controllable && dev.state === 'off') {
        if (dev.type === 'light' || dev.type === 'fan') {
          dev.state = 'on';
        }
      }
    });

    if (enable) {
      const rsSavedIncrement = Math.round((wattsSaved / 1000) * 8.25);
      this.state.savedTodayRs += rsSavedIncrement;
      this.state.savedTodayKwh += Math.round(wattsSaved / 1000);
      this.state.savedTodayCo2Kg += Math.round((wattsSaved / 1000) * 0.71);
      this.state.optimizationsAppliedToday += switchedOffCount;
    }

    return { switchedOffCount, wattsSaved };
  }

  tick() {
    // Advance simulated time based on multiplier
    const msToAdvance = this.tickIntervalMs * this.timeMultiplier;
    this.simulatedTime = new Date(this.simulatedTime.getTime() + msToAdvance);

    const istHour = (this.simulatedTime.getUTCHours() + 5.5) % 24;
    const isDayTime = istHour >= 6.5 && istHour <= 18.5;

    // Solar Generation Model (Sun Angle + Weather)
    let solarRadiationIndex = 0;
    if (isDayTime) {
      const peakHour = 12.5;
      const hourDiff = Math.abs(istHour - peakHour);
      solarRadiationIndex = Math.max(0, 1 - (hourDiff / 6));
      if (this.state.monsoonMode) solarRadiationIndex *= 0.35; // Cloud cover reduction
    }

    // Solar kW output across 3 campus arrays (260 kWp total)
    const totalSolarCapacityKwp = 260;
    const solarGenerationKw = parseFloat((totalSolarCapacityKwp * solarRadiationIndex * 0.82).toFixed(1));

    // Calculate Real vs Ghost Consumption per building
    let campusRealWatts = 0;
    let campusGhostWatts = 0;
    const buildingTelemetry = {};
    const ghostAnomaliesDetected = [];

    CAMPUS_DATA.campus.buildings.forEach(b => {
      let bRealWatts = 0;
      let bGhostWatts = 0;
      let bOccupants = 0;

      b.floors.forEach(f => {
        f.rooms.forEach(r => {
          // Room occupancy calculation based on agents and Indian college timetable
          let roomOccupancy = 0;
          if (r.type === 'classroom' || r.type === 'lab') {
            if (istHour >= 9 && istHour <= 16.5) {
              roomOccupancy = Math.round((r.capacity * (this.state.attendancePct / 100)) * (this.state.studentsCount / 1000));
            }
          } else if (r.type === 'admin' || r.type === 'office') {
            if (istHour >= 8.5 && istHour <= 17.5) {
              roomOccupancy = Math.min(r.capacity, Math.round(this.state.facultyCount / 4));
            }
          } else if (r.type === 'hostel_room' || r.type === 'mess') {
            if (istHour >= 18 || istHour <= 8.5) {
              roomOccupancy = Math.round(r.capacity * (this.state.hostelOccupancy / 200));
            }
          } else if (r.type === 'library') {
            if (istHour >= 8.5 && istHour <= 20) {
              roomOccupancy = Math.round(r.capacity * 0.45 * (this.state.studentsCount / 1000));
            }
          }
          bOccupants += roomOccupancy;

          // Calculate devices load in this room
          r.devices.forEach(d => {
            const dev = this.deviceStates.get(d.id);
            if (!dev) return;

            let realWatts = dev.state === 'on' ? dev.ratedWatts : 0;
            let ghostWatts = 0; // Ideal consumption baseline

            // Anomaly logic
            const anomalyType = this.deviceAnomalies.get(d.id);
            if (anomalyType === 'ac_empty_lab') {
              // Lab 204 AC running with 0 occupants
              if (dev.state === 'on') {
                ghostWatts = 0; // Ideal should be OFF
                ghostAnomaliesDetected.push({
                  id: 'ghost-1',
                  deviceId: d.id,
                  buildingId: b.id,
                  roomId: r.id,
                  title: 'Lab 204 AC Running in Empty Room',
                  wasteWatts: 1950,
                  wasteRsPerHour: (1.95 * 8.25).toFixed(1),
                  category: 'HVAC'
                });
              }
            } else if (anomalyType === 'lights_vacant_class') {
              if (dev.state === 'on' && roomOccupancy === 0) {
                ghostWatts = 0;
                ghostAnomaliesDetected.push({
                  id: 'ghost-2',
                  deviceId: d.id,
                  buildingId: b.id,
                  roomId: r.id,
                  title: 'Classroom 103 Lights Active in Vacant Room',
                  wasteWatts: dev.ratedWatts,
                  wasteRsPerHour: ((dev.ratedWatts / 1000) * 8.25).toFixed(1),
                  category: 'Lighting'
                });
              }
            } else if (anomalyType === 'projector_idle') {
              if (dev.state === 'on' && roomOccupancy === 0) {
                ghostWatts = 0;
                ghostAnomaliesDetected.push({
                  id: 'ghost-3',
                  deviceId: d.id,
                  buildingId: b.id,
                  roomId: r.id,
                  title: 'Auditorium Projector Idling on Blank Screen',
                  wasteWatts: 650,
                  wasteRsPerHour: (0.65 * 8.25).toFixed(1),
                  category: 'AV Equipment'
                });
              }
            } else if (anomalyType === 'geyser_continuous') {
              if (dev.state === 'on') {
                ghostWatts = 0;
                ghostAnomaliesDetected.push({
                  id: 'ghost-5',
                  deviceId: d.id,
                  buildingId: b.id,
                  roomId: r.id,
                  title: 'Hostel Room 208 Geyser Continuous Run',
                  wasteWatts: 2000,
                  wasteRsPerHour: (2.0 * 8.25).toFixed(1),
                  category: 'Water Heating'
                });
              }
            } else {
              // Standard ghost baseline logic
              if (roomOccupancy > 0 && dev.state === 'on') {
                ghostWatts = dev.ratedWatts * 0.88; // Optimized efficiency
              } else if (roomOccupancy === 0) {
                ghostWatts = dev.type === 'server_rack' || dev.type === 'ups' ? dev.ratedWatts : 0;
              }
            }

            bRealWatts += realWatts;
            bGhostWatts += ghostWatts;
          });
        });
      });

      campusRealWatts += bRealWatts;
      campusGhostWatts += bGhostWatts;

      buildingTelemetry[b.id] = {
        buildingId: b.id,
        name: b.name,
        realKw: parseFloat((bRealWatts / 1000).toFixed(2)),
        ghostKw: parseFloat((bGhostWatts / 1000).toFixed(2)),
        gapKw: parseFloat((Math.max(0, bRealWatts - bGhostWatts) / 1000).toFixed(2)),
        occupancy: bOccupants,
        thermalC: parseFloat((this.state.outdoorTemp + (bRealWatts > 20000 ? 1.5 : -1.0)).toFixed(1)),
        alert: bRealWatts > bGhostWatts * 1.5 && bOccupants < 10 ? 'warning' : 'normal'
      };
    });

    const campusRealKw = parseFloat((campusRealWatts / 1000).toFixed(2));
    const campusGhostKw = parseFloat((campusGhostWatts / 1000).toFixed(2));
    const ghostGapKw = parseFloat(Math.max(0, campusRealKw - campusGhostKw).toFixed(2));

    // Net Grid Import & Carbon Emission
    const netGridImportKw = Math.max(0, campusRealKw - solarGenerationKw);
    const gridEmissionFactor = 0.71; // kg CO2e / kWh
    const carbonIntensityKgPerHr = parseFloat((netGridImportKw * gridEmissionFactor).toFixed(1));
    const currentCostRsPerHr = parseFloat((netGridImportKw * 8.25).toFixed(1));

    // Broadcast Realtime Telemetry Snapshot
    const telemetryPayload = {
      timestamp: new Date().toISOString(),
      simulatedIST: this.simulatedTime.toISOString(),
      istHourFormatted: `${String(Math.floor(istHour)).padStart(2, '0')}:${String(Math.floor((istHour % 1) * 60)).padStart(2, '0')} IST`,
      timeMultiplier: this.timeMultiplier,
      campus: {
        totalRealKw: campusRealKw,
        totalGhostKw: campusGhostKw,
        ghostGapKw,
        solarGenerationKw,
        netGridImportKw,
        carbonIntensityKgPerHr,
        currentCostRsPerHr,
        gridFrequencyHz: parseFloat((49.95 + Math.random() * 0.1).toFixed(2)),
        powerFactor: parseFloat((0.96 + Math.random() * 0.03).toFixed(2)),
        sanctionedDemandKva: 750,
        demandUtilizationPct: parseFloat(((campusRealKw / 750) * 100).toFixed(1)),
        isPowerCut: this.state.powerCutMode,
        dgActive: this.state.powerCutMode
      },
      population: {
        studentsPresent: this.state.studentsCount,
        facultyPresent: this.state.facultyCount,
        hostelResidents: this.state.hostelOccupancy,
        totalCampusOccupancy: this.state.studentsCount + this.state.facultyCount + this.state.hostelOccupancy
      },
      weather: {
        tempC: this.state.outdoorTemp,
        condition: this.state.monsoonMode ? 'Monsoon Showers' : (isDayTime ? 'Sunny' : 'Clear Night'),
        humidityPct: this.state.monsoonMode ? 85 : 55,
        solarRadiationIndex
      },
      buildings: buildingTelemetry,
      ghostAnomalies: ghostAnomaliesDetected,
      ecoModeActive: this.state.ecoModeActive,
      savingsTracker: {
        savedTodayRs: this.state.savedTodayRs,
        savedTodayKwh: this.state.savedTodayKwh,
        savedTodayCo2Kg: this.state.savedTodayCo2Kg,
        optimizationsCount: this.state.optimizationsAppliedToday
      }
    };

    if (this.io) {
      this.io.emit('telemetry:tick', telemetryPayload);
    }

    return telemetryPayload;
  }
}

export const syntheticEngine = new SyntheticIoTEngine();
