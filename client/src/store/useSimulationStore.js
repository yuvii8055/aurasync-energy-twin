import { create } from 'zustand';

// Seeded PRNG (Mulberry32) for reproducible, pure deterministic simulation
function mulberry32(seed) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// College schedule timetable phases
function getSchedulePhase(istHour, isHoliday, isWeekend) {
  if (isHoliday || isWeekend) {
    if (istHour >= 22 || istHour < 6) return 'NIGHT_QUIET';
    if (istHour >= 12 && istHour < 14) return 'HOLIDAY_LUNCH';
    return 'HOLIDAY_IDLE';
  }

  if (istHour >= 22 || istHour < 6) return 'NIGHT_HOSTEL';
  if (istHour >= 6 && istHour < 8.5) return 'EARLY_MORNING';
  if (istHour >= 8.5 && istHour < 9.25) return 'ARRIVAL_PERIOD';
  if (istHour >= 9.25 && istHour < 13) return 'MORNING_LECTURES_LABS';
  if (istHour >= 13 && istHour < 14) return 'CAMPUS_LUNCH';
  if (istHour >= 14 && istHour < 16.5) return 'AFTERNOON_LABS';
  if (istHour >= 16.5 && istHour < 18.5) return 'EVENING_SPORTS_LIBRARY';
  return 'HOSTEL_EVENING_MESS';
}

/**
 * PURE ENGINE: simulate(params, simTime, tick)
 * Returns { perRoomOccupancy, perBuildingKw, totalKw, kwhToday, costRs, co2Kg, ghostGapKw, alerts[], ... }
 */
export function simulate(params, simTime, tick = 0) {
  const dateObj = simTime instanceof Date ? simTime : new Date(simTime);
  // IST is UTC + 5.5 hours
  const istMinutesTotal = ((dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() + 330) % 1440);
  const istHour = istMinutesTotal / 60;
  const isWeekend = dateObj.getUTCDay() === 0 || dateObj.getUTCDay() === 6;

  // PRNG instance seeded by seed + tick
  const rng = mulberry32((params.seed || 42) + tick * 131);
  const jitter = (rng() - 0.5) * 0.025; // +/- 1.25% natural drift

  const {
    students = 650,
    attendancePct = 88,
    faculty = 55,
    hostelOccupancyPct = 75,
    outdoorTempC = 27.5,
    examMode = false,
    holiday = false,
    eventDay = false,
    monsoon = false,
    powerCut = false,
    dgFailover = false
  } = params;

  const phase = getSchedulePhase(istHour, holiday, isWeekend);

  // Student scaling factor: 0 at 0 students, 1.0 at 1000 students
  const studentScale = Math.max(0, students) / 1000;
  const attendanceRatio = Math.max(0.1, attendancePct / 100);

  // Agent Population allocation based on Timetable Phase
  let academicRatio = 0;
  let labRatio = 0;
  let auditoriumOccupancy = 0;
  let libraryRatio = 0.15;
  let sportsOccupancy = 0;
  let hostelRatio = 0.2;

  if (holiday) {
    academicRatio = 0.01;
    labRatio = 0.01;
    hostelRatio = (hostelOccupancyPct / 100) * 0.35;
    libraryRatio = 0.05;
  } else if (isWeekend) {
    academicRatio = 0.04;
    labRatio = 0.05;
    hostelRatio = (hostelOccupancyPct / 100) * 0.55;
    libraryRatio = 0.25;
    sportsOccupancy = Math.round(students * 0.12);
  } else {
    // Normal Weekday / Exam Day / Event Day
    switch (phase) {
      case 'NIGHT_HOSTEL':
        hostelRatio = hostelOccupancyPct / 100;
        academicRatio = 0.0;
        labRatio = 0.01;
        libraryRatio = 0.0;
        break;
      case 'EARLY_MORNING':
        hostelRatio = (hostelOccupancyPct / 100) * 0.85;
        sportsOccupancy = Math.round(students * 0.1);
        libraryRatio = 0.08;
        break;
      case 'ARRIVAL_PERIOD':
        academicRatio = 0.35;
        hostelRatio = (hostelOccupancyPct / 100) * 0.4;
        sportsOccupancy = Math.round(students * 0.08);
        libraryRatio = 0.15;
        break;
      case 'MORNING_LECTURES_LABS':
        academicRatio = examMode ? 0.75 : 0.65;
        labRatio = examMode ? 0.15 : 0.28;
        libraryRatio = examMode ? 0.25 : 0.15;
        hostelRatio = (hostelOccupancyPct / 100) * 0.15;
        if (eventDay) auditoriumOccupancy = Math.min(380, Math.round(students * 0.5));
        break;
      case 'CAMPUS_LUNCH':
        academicRatio = 0.15;
        labRatio = 0.1;
        hostelRatio = (hostelOccupancyPct / 100) * 0.5;
        libraryRatio = 0.2;
        break;
      case 'AFTERNOON_LABS':
        academicRatio = examMode ? 0.55 : 0.45;
        labRatio = examMode ? 0.2 : 0.4;
        libraryRatio = examMode ? 0.3 : 0.2;
        hostelRatio = (hostelOccupancyPct / 100) * 0.2;
        if (eventDay) auditoriumOccupancy = Math.min(360, Math.round(students * 0.45));
        break;
      case 'EVENING_SPORTS_LIBRARY':
        academicRatio = 0.08;
        labRatio = 0.12;
        sportsOccupancy = Math.round(students * 0.22);
        libraryRatio = 0.35;
        hostelRatio = (hostelOccupancyPct / 100) * 0.6;
        break;
      case 'HOSTEL_EVENING_MESS':
        academicRatio = 0.02;
        labRatio = 0.05;
        libraryRatio = 0.1;
        hostelRatio = hostelOccupancyPct / 100;
        break;
      default:
        break;
    }
  }

  const activeFaculty = holiday ? Math.round(faculty * 0.1) : (isWeekend ? Math.round(faculty * 0.2) : faculty);
  const hostelResidentsTotal = Math.round(200 * (hostelOccupancyPct / 100) * hostelRatio);

  // Per-room occupancy map - strictly proportional to studentScale and attendance
  const perRoomOccupancy = {
    // DSATM Main Block
    'main-001': auditoriumOccupancy,
    'main-101': Math.round(studentScale * academicRatio * 75 * attendanceRatio),
    'main-102': Math.round(studentScale * academicRatio * 60 * attendanceRatio),
    'main-103': Math.round(studentScale * academicRatio * 58 * attendanceRatio),
    'main-104': Math.min(15, Math.round(activeFaculty * 0.22)),
    'main-201': Math.round(studentScale * labRatio * 38 * attendanceRatio),
    'main-202': Math.round(studentScale * academicRatio * 62 * attendanceRatio),
    'main-203': Math.min(20, Math.round(activeFaculty * 0.35)),
    'main-204': Math.round(studentScale * labRatio * 34 * attendanceRatio),
    'main-301': Math.round(studentScale * libraryRatio * 180 * attendanceRatio),
    // DSBA Block
    'dsba-101': Math.round(studentScale * academicRatio * 50 * attendanceRatio),
    'dsba-102': Math.min(20, Math.round(activeFaculty * 0.2)),
    'dsba-201': Math.round(studentScale * labRatio * 40 * attendanceRatio),
    // Mech / Civil Block
    'mech-101': Math.round(studentScale * labRatio * 28 * attendanceRatio),
    'civil-102': Math.round(studentScale * labRatio * 30 * attendanceRatio),
    // Block-C (ECE/EEE)
    'ee-101': Math.round(studentScale * labRatio * 30 * attendanceRatio),
    'ec-102': Math.round(studentScale * labRatio * 32 * attendanceRatio),
    // Boys Hostel 1
    'bh1-mess': (phase === 'CAMPUS_LUNCH' || phase === 'HOSTEL_EVENING_MESS') ? Math.round(hostelResidentsTotal * 0.6) : 10,
    'bh1-common': Math.round(hostelResidentsTotal * 0.25),
    'bh1-201': Math.min(3, Math.round(hostelResidentsTotal > 20 ? 3 : 1)),
    'bh1-202': Math.min(3, Math.round(hostelResidentsTotal > 40 ? 3 : 1)),
    'bh1-208': Math.min(3, Math.round(hostelResidentsTotal > 60 ? 3 : 1)),
    // Outdoor / Utilities
    'basketball-court': sportsOccupancy,
    'ev-bay-1': (istHour >= 8 && istHour <= 18) ? 2 : 0,
    'green-pond-1': sportsOccupancy > 0 ? 5 : 0,
    'trans-yard-1': 2,
    'stp-basin-1': 1
  };

  // Occupants per building
  const mainOccupants =
    perRoomOccupancy['main-001'] +
    perRoomOccupancy['main-101'] +
    perRoomOccupancy['main-102'] +
    perRoomOccupancy['main-103'] +
    perRoomOccupancy['main-104'] +
    perRoomOccupancy['main-201'] +
    perRoomOccupancy['main-202'] +
    perRoomOccupancy['main-203'] +
    perRoomOccupancy['main-204'] +
    perRoomOccupancy['main-301'];

  const dsbaOccupants =
    perRoomOccupancy['dsba-101'] +
    perRoomOccupancy['dsba-102'] +
    perRoomOccupancy['dsba-201'];

  const mechCivilOccupants =
    perRoomOccupancy['mech-101'] +
    perRoomOccupancy['civil-102'];

  const blockCOccupants =
    perRoomOccupancy['ee-101'] +
    perRoomOccupancy['ec-102'];

  const hostelOccupants =
    perRoomOccupancy['bh1-mess'] +
    perRoomOccupancy['bh1-common'] +
    perRoomOccupancy['bh1-201'] +
    perRoomOccupancy['bh1-202'] +
    perRoomOccupancy['bh1-208'];

  // Temperature Multiplier on HVAC/AC load
  // At 25°C = 1.0; at 35°C = 1.45 (+45% AC power draw)
  const tempExcess = Math.max(0, outdoorTempC - 24);
  const acLoadMultiplier = 1.0 + (tempExcess * 0.045);

  // Building Load Calculations (kW)
  // DSATM Main Complex
  const mainBaseKw = 14.5;
  const mainLightsFansKw = (mainOccupants * 0.042) + (perRoomOccupancy['main-103'] === 0 ? 0.6 : 0);
  const mainPCLabKw = (perRoomOccupancy['main-201'] > 0 ? (perRoomOccupancy['main-201'] * 0.12) : 2.5);
  // AC units active in Main complex: Lab 204 anomaly always draws ~2.2kW, plus classrooms & labs when occupied
  const mainAcUnits = ((mainOccupants > 40 ? 5 : 0) + (mainOccupants > 150 ? 4 : 0) + 1);
  const mainAcKw = mainAcUnits * 2.2 * acLoadMultiplier;
  const mainAuditoriumKw = perRoomOccupancy['main-001'] > 20 ? (18.0 * acLoadMultiplier) : 0.65;
  const mainBuildingKw = parseFloat((mainBaseKw + mainLightsFansKw + mainPCLabKw + mainAcKw + mainAuditoriumKw).toFixed(2));
  const mainGhostKw = parseFloat((2.5 + 1.95 + 0.6 + 0.65).toFixed(2));

  // DSBA Block
  const dsbaBaseKw = 5.2;
  const dsbaLightsFansKw = dsbaOccupants * 0.04;
  const dsbaAcKw = ((dsbaOccupants > 20 ? 2 : 0) + (dsbaOccupants > 60 ? 2 : 0)) * 2.1 * acLoadMultiplier;
  const dsbaPCLabKw = perRoomOccupancy['dsba-201'] * 0.11;
  const dsbaBuildingKw = parseFloat((dsbaBaseKw + dsbaLightsFansKw + dsbaAcKw + dsbaPCLabKw).toFixed(2));
  const dsbaGhostKw = parseFloat((dsbaBuildingKw * 0.14).toFixed(2));

  // Mech / Civil Workshop
  const mechBaseKw = 4.0;
  const mechMachinesKw = mechCivilOccupants > 10 ? 14.5 : 1.8;
  const civilLabKw = mechCivilOccupants * 0.06;
  const mechCivilKw = parseFloat((mechBaseKw + mechMachinesKw + civilLabKw).toFixed(2));
  const mechGhostKw = parseFloat((0.8 + (mechCivilKw * 0.12)).toFixed(2));

  // Block-C (ECE & EEE)
  const blockCBaseKw = 4.5;
  const blockCLabsKw = (blockCOccupants * 0.045) + ((blockCOccupants > 15 ? 2 : 0) * 2.0 * acLoadMultiplier);
  const blockCKw = parseFloat((blockCBaseKw + blockCLabsKw).toFixed(2));
  const blockCGhostKw = parseFloat((blockCKw * 0.15).toFixed(2));

  // Boys Hostel 1
  const hostelBaseKw = 6.0;
  const hostelLightingFansKw = hostelOccupants * 0.03;
  const hostelGeyserKw = 3.5; // hostel continuous anomaly
  const hostelMessKitchenKw = (phase === 'CAMPUS_LUNCH' || phase === 'HOSTEL_EVENING_MESS') ? 8.5 : 1.5;
  const hostelKw = parseFloat((hostelBaseKw + hostelLightingFansKw + hostelGeyserKw + hostelMessKitchenKw).toFixed(2));
  const hostelGhostKw = parseFloat((2.0 + (hostelKw * 0.15)).toFixed(2));

  // Infrastructure / Utilities
  const evChargingKw = perRoomOccupancy['ev-bay-1'] > 0 ? 14.8 : 1.2;
  const stpKw = 6.4;
  const transformerYardKw = 1.8;
  const greenBeltKw = 1.1;

  // Per Building Breakdown Dictionary
  const perBuildingKw = {
    'dsatm-main': {
      buildingId: 'dsatm-main',
      name: 'DSATM Main Academic Complex',
      realKw: mainBuildingKw,
      ghostKw: mainGhostKw,
      gapKw: parseFloat(Math.max(0, mainBuildingKw - mainGhostKw).toFixed(2)),
      occupancy: mainOccupants,
      thermalC: parseFloat((outdoorTempC + (mainBuildingKw > 35 ? 1.4 : -0.5)).toFixed(1)),
      alert: mainBuildingKw > 65 ? 'warning' : 'normal'
    },
    'dsba-block': {
      buildingId: 'dsba-block',
      name: 'Dayananda Sagar Business Academy',
      realKw: dsbaBuildingKw,
      ghostKw: dsbaGhostKw,
      gapKw: parseFloat(Math.max(0, dsbaBuildingKw - dsbaGhostKw).toFixed(2)),
      occupancy: dsbaOccupants,
      thermalC: outdoorTempC,
      alert: 'normal'
    },
    'mech-civil': {
      buildingId: 'mech-civil',
      name: 'Mech & Civil Engineering Labs',
      realKw: mechCivilKw,
      ghostKw: mechGhostKw,
      gapKw: parseFloat(Math.max(0, mechCivilKw - mechGhostKw).toFixed(2)),
      occupancy: mechCivilOccupants,
      thermalC: outdoorTempC,
      alert: 'normal'
    },
    'block-c': {
      buildingId: 'block-c',
      name: 'Block-C (ECE & EEE)',
      realKw: blockCKw,
      ghostKw: blockCGhostKw,
      gapKw: parseFloat(Math.max(0, blockCKw - blockCGhostKw).toFixed(2)),
      occupancy: blockCOccupants,
      thermalC: outdoorTempC,
      alert: 'normal'
    },
    'boys-hostel-1': {
      buildingId: 'boys-hostel-1',
      name: 'Boys Hostel 1 & Mess',
      realKw: hostelKw,
      ghostKw: hostelGhostKw,
      gapKw: parseFloat(Math.max(0, hostelKw - hostelGhostKw).toFixed(2)),
      occupancy: hostelOccupants,
      thermalC: outdoorTempC,
      alert: 'normal'
    },
    'ev-station': {
      buildingId: 'ev-station',
      name: 'ElectricPe EV Station',
      realKw: evChargingKw,
      ghostKw: 0.2,
      gapKw: 0.2,
      occupancy: 2,
      thermalC: outdoorTempC,
      alert: 'normal'
    },
    'stp-plant': {
      buildingId: 'stp-plant',
      name: 'STP & Water Treatment',
      realKw: stpKw,
      ghostKw: 0.8,
      gapKw: 0.8,
      occupancy: 1,
      thermalC: outdoorTempC,
      alert: 'normal'
    },
    'transformer-yard': {
      buildingId: 'transformer-yard',
      name: 'Transformers & DG Yard',
      realKw: transformerYardKw,
      ghostKw: 0.4,
      gapKw: 0.4,
      occupancy: 2,
      thermalC: outdoorTempC + (powerCut ? 4.5 : 0.5),
      alert: powerCut ? 'warning' : 'normal'
    },
    'green-belt': {
      buildingId: 'green-belt',
      name: 'Campus Green Belt & Eco Pond',
      realKw: greenBeltKw,
      ghostKw: 0.5,
      gapKw: 0.5,
      occupancy: sportsOccupancy > 0 ? 5 : 0,
      thermalC: outdoorTempC - 1.2,
      alert: 'normal'
    },
    'basketball-court': {
      buildingId: 'basketball-court',
      name: 'DSATM Basketball Court',
      realKw: sportsOccupancy > 0 && (istHour >= 18 || istHour <= 6) ? 3.2 : 0.1,
      ghostKw: 0.1,
      gapKw: 0.1,
      occupancy: sportsOccupancy,
      thermalC: outdoorTempC,
      alert: 'normal'
    }
  };

  // Total Real Campus kW
  const rawTotalKw =
    mainBuildingKw +
    dsbaBuildingKw +
    mechCivilKw +
    blockCKw +
    hostelKw +
    evChargingKw +
    stpKw +
    transformerYardKw +
    greenBeltKw +
    perBuildingKw['basketball-court'].realKw;

  // Add realistic PRNG jitter
  const totalKw = parseFloat(Math.max(18.0, rawTotalKw * (1 + jitter)).toFixed(2));
  const rawGhostKw =
    mainGhostKw +
    dsbaGhostKw +
    mechGhostKw +
    blockCGhostKw +
    hostelGhostKw +
    1.9;
  const totalGhostKw = parseFloat((rawGhostKw * (1 + jitter * 0.5)).toFixed(2));
  const ghostGapKw = parseFloat(Math.max(0, totalKw - totalGhostKw).toFixed(2));

  // Solar PV Generation (260 kWp total)
  let solarRadiation = 0;
  if (istHour >= 6.5 && istHour <= 18.5) {
    const peakHour = 12.5;
    const hourDist = Math.abs(istHour - peakHour);
    solarRadiation = Math.max(0, 1 - (hourDist / 6.0));
    if (monsoon) solarRadiation *= 0.35;
  }
  const solarGenerationKw = parseFloat((260 * solarRadiation * 0.82 * (1 + jitter * 0.8)).toFixed(1));

  // Grid vs DG Failover Logic
  const isPowerCutActive = Boolean(powerCut || dgFailover);
  let dgActive = false;
  let dgKw = 0;
  let netGridImportKw = 0;
  let dieselLitersPerHour = 0;
  let scope1Co2Kg = 0;
  let scope2Co2Kg = 0;

  if (isPowerCutActive) {
    dgActive = true;
    // When BESCOM grid shuts off, rooftop solar anti-islands and DG carries full load
    dgKw = totalKw;
    netGridImportKw = 0;
    dieselLitersPerHour = parseFloat((dgKw * 0.26).toFixed(2));
    scope1Co2Kg = parseFloat((dieselLitersPerHour * 2.68).toFixed(1));
    scope2Co2Kg = 0;
  } else {
    dgActive = false;
    dgKw = 0;
    netGridImportKw = parseFloat(Math.max(0, totalKw - solarGenerationKw).toFixed(2));
    dieselLitersPerHour = 0;
    scope1Co2Kg = 0;
    scope2Co2Kg = parseFloat((netGridImportKw * 0.71).toFixed(1));
  }

  const totalCo2KgPerHour = parseFloat((scope1Co2Kg + scope2Co2Kg).toFixed(1));

  // Cost: Grid @ Rs 8.25/kWh, Diesel @ Rs 92/L
  const gridCostPerHour = netGridImportKw * 8.25;
  const dieselCostPerHour = dieselLitersPerHour * 92.0;
  const currentCostRsPerHour = parseFloat((gridCostPerHour + dieselCostPerHour).toFixed(1));

  // Cumulative Integrations for Today
  const dayFraction = (istMinutesTotal / 1440);
  const kwhToday = Math.round(totalKw * (Math.max(1, istHour) * 0.78));
  const costRs = Math.round(kwhToday * 8.25 + (dgActive ? dieselCostPerHour * 2 : 0));
  const co2Kg = Math.round(kwhToday * (isPowerCutActive ? 0.95 : 0.71));

  // Dynamic Energy Alerts
  const alerts = [];
  if (isPowerCutActive) {
    alerts.push({
      id: 'alert-dg',
      severity: 'critical',
      title: 'BESCOM Grid Outage: DG Generator Engaged',
      message: `Diesel backup powering ${dgKw} kW. Scope 1 emission rate: ${scope1Co2Kg} kg CO₂/hr.`
    });
  }
  if (perRoomOccupancy['main-204'] === 0) {
    alerts.push({
      id: 'alert-ac-ghost',
      severity: 'warning',
      title: 'Lab 204 AC Ghost Waste',
      message: 'Split AC running at 1950W with 0 students detected in room.'
    });
  }
  if (outdoorTempC >= 34) {
    alerts.push({
      id: 'alert-heat-wave',
      severity: 'warning',
      title: 'High Ambient Temperature Alert',
      message: `Outdoor temp is ${outdoorTempC}°C. AC compressor load escalated by ${Math.round((acLoadMultiplier - 1) * 100)}%.`
    });
  }
  if (examMode) {
    alerts.push({
      id: 'alert-exam',
      severity: 'info',
      title: 'Exam Protocol Active',
      message: 'Strict silence enforced. Non-essential corridor lighting minimized.'
    });
  }

  const totalCampusOccupants =
    mainOccupants + dsbaOccupants + mechCivilOccupants + blockCOccupants + hostelOccupants + sportsOccupancy;

  return {
    timestamp: dateObj.toISOString(),
    istHourFormatted: `${String(Math.floor(istHour)).padStart(2, '0')}:${String(Math.floor((istHour % 1) * 60)).padStart(2, '0')} IST`,
    istHour,
    phase,
    perRoomOccupancy,
    perBuildingKw,
    totalKw,
    totalGhostKw,
    ghostGapKw,
    solarGenerationKw,
    netGridImportKw,
    dgActive,
    dgKw,
    dieselLitersPerHour,
    scope1Co2Kg,
    scope2Co2Kg,
    totalCo2KgPerHour,
    currentCostRsPerHour,
    kwhToday,
    costRs,
    co2Kg,
    totalCampusOccupants,
    zoneCounts: {
      academic: mainOccupants + dsbaOccupants,
      labs: mechCivilOccupants + blockCOccupants,
      hostel: hostelOccupants,
      outdoor: sportsOccupancy,
      library: perRoomOccupancy['main-301']
    },
    alerts
  };
}

/**
 * Self-Test Suite for Bug 1:
 * (a) students 0 vs 1000 must give totalKw differing by at least 30% on a weekday at 11:00
 * (b) turning on the Holiday preset must drop academic-block kW sharply
 * (c) outdoor temperature 25 vs 35 C must change AC kW
 * (d) Power Cut must switch the source to DG and raise Scope 1 CO2
 * (e) values must keep changing on every tick without changing sliders
 */
export function runBug1SelfTests() {
  const weekday11am = new Date('2026-10-15T05:30:00.000Z'); // 11:00 AM IST

  const baseParams = {
    students: 650,
    attendancePct: 88,
    faculty: 55,
    hostelOccupancyPct: 75,
    outdoorTempC: 27.5,
    examMode: false,
    holiday: false,
    eventDay: false,
    monsoon: false,
    powerCut: false,
    dgFailover: false,
    seed: 42
  };

  // Test A: 0 vs 1000 students at 11:00 weekday
  const sim0 = simulate({ ...baseParams, students: 0 }, weekday11am, 1);
  const sim1000 = simulate({ ...baseParams, students: 1000 }, weekday11am, 1);
  const diffPctA = Math.round(((sim1000.totalKw - sim0.totalKw) / sim1000.totalKw) * 100);
  const passA = diffPctA >= 30;

  // Test B: Holiday preset drops academic block kW sharply
  const simWeekday = simulate(baseParams, weekday11am, 1);
  const simHoliday = simulate({ ...baseParams, holiday: true, students: 15, attendancePct: 5 }, weekday11am, 1);
  const dropPctB = Math.round(
    ((simWeekday.perBuildingKw['dsatm-main'].realKw - simHoliday.perBuildingKw['dsatm-main'].realKw) /
      simWeekday.perBuildingKw['dsatm-main'].realKw) * 100
  );
  const passB = dropPctB >= 40;

  // Test C: 25°C vs 35°C changes AC kW
  const sim25C = simulate({ ...baseParams, outdoorTempC: 25.0 }, weekday11am, 1);
  const sim35C = simulate({ ...baseParams, outdoorTempC: 35.0 }, weekday11am, 1);
  const acDeltaKw = parseFloat((sim35C.perBuildingKw['dsatm-main'].realKw - sim25C.perBuildingKw['dsatm-main'].realKw).toFixed(1));
  const passC = acDeltaKw > 5.0;

  // Test D: Power Cut switches source to DG and raises Scope 1 CO2
  const simGrid = simulate(baseParams, weekday11am, 1);
  const simCut = simulate({ ...baseParams, powerCut: true, dgFailover: true }, weekday11am, 1);
  const passD = simCut.dgActive === true && simCut.dgKw > 0 && simCut.scope1Co2Kg > 10 && simGrid.scope1Co2Kg === 0;

  // Test E: Values keep changing on every tick without changing sliders
  const tick1 = simulate(baseParams, weekday11am, 1);
  const tick2 = simulate(baseParams, weekday11am, 2);
  const passE = tick1.totalKw !== tick2.totalKw;

  return {
    testA: {
      id: 'test-a',
      name: 'Students 0 vs 1000 (diff >= 30%)',
      passed: passA,
      detail: `0 students: ${sim0.totalKw} kW vs 1000 students: ${sim1000.totalKw} kW (Δ ${diffPctA}%, requirement >= 30%)`
    },
    testB: {
      id: 'test-b',
      name: 'Holiday Preset Drops Academic Block kW',
      passed: passB,
      detail: `Weekday: ${simWeekday.perBuildingKw['dsatm-main'].realKw} kW -> Holiday: ${simHoliday.perBuildingKw['dsatm-main'].realKw} kW (Drop ${dropPctB}%, requirement >= 40%)`
    },
    testC: {
      id: 'test-c',
      name: 'Outdoor Temp 25°C vs 35°C Raises HVAC kW',
      passed: passC,
      detail: `25°C: ${sim25C.perBuildingKw['dsatm-main'].realKw} kW vs 35°C: ${sim35C.perBuildingKw['dsatm-main'].realKw} kW (+${acDeltaKw} kW)`
    },
    testD: {
      id: 'test-d',
      name: 'Power Cut Switches to DG & Raises Scope 1 CO₂',
      passed: passD,
      detail: `Grid Cut: DG Active=${simCut.dgActive}, ${simCut.dgKw} kW, Scope 1 CO₂: ${simCut.scope1Co2Kg} kg/hr (Grid was ${simGrid.scope1Co2Kg} kg/hr)`
    },
    testE: {
      id: 'test-e',
      name: 'Continuous Dynamic Tick Output Variation',
      passed: passE,
      detail: `Tick #1: ${tick1.totalKw} kW vs Tick #2: ${tick2.totalKw} kW (PRNG drift verified)`
    },
    allPassed: passA && passB && passC && passD && passE
  };
}

// Initial Parameters Default State
const initialParams = {
  students: 650,
  attendancePct: 88,
  faculty: 55,
  hostelOccupancyPct: 75,
  outdoorTempC: 27.5,
  examMode: false,
  holiday: false,
  eventDay: false,
  monsoon: false,
  powerCut: false,
  dgFailover: false,
  aggressiveness: 2,
  speed: '1x',
  seed: 42
};

const initialDate = new Date();
const initialComputed = simulate(initialParams, initialDate, 0);

export const useSimulationStore = create((set, get) => ({
  // Single Source of Truth: Params
  params: { ...initialParams },

  // Live Simulation Clock
  simTime: initialDate,
  tick: 0,
  isPaused: false,

  // Computed Results
  computed: initialComputed,

  // Baseline Snapshot for "Before vs After" Delta Comparison
  baselineSnapshot: {
    totalKw: initialComputed.totalKw,
    kwhToday: initialComputed.kwhToday,
    costRs: initialComputed.costRs,
    co2Kg: initialComputed.co2Kg,
    timestamp: initialDate.toISOString()
  },

  // Real-time Computer Vision Occupancy Pipe (from Bug 2)
  visionDetectedCount: null,

  // Live Self-Test Cache
  selfTestResults: runBug1SelfTests(),

  // Actions
  setParam: (key, value) => {
    set((state) => {
      const nextParams = { ...state.params, [key]: value };
      const nextComputed = simulate(nextParams, state.simTime, state.tick);
      return {
        params: nextParams,
        computed: nextComputed
      };
    });
  },

  setPreset: (presetName) => {
    set((state) => {
      let overrides = {};
      if (presetName === 'Normal Weekday') {
        overrides = {
          students: 650,
          attendancePct: 88,
          faculty: 55,
          hostelOccupancyPct: 75,
          outdoorTempC: 27.5,
          examMode: false,
          holiday: false,
          eventDay: false,
          monsoon: false,
          powerCut: false,
          dgFailover: false
        };
      } else if (presetName === 'Exam Week') {
        overrides = {
          students: 950,
          attendancePct: 98,
          faculty: 75,
          hostelOccupancyPct: 95,
          outdoorTempC: 28.0,
          examMode: true,
          holiday: false,
          eventDay: false,
          monsoon: false,
          powerCut: false,
          dgFailover: false
        };
      } else if (presetName === 'Weekend') {
        overrides = {
          students: 60,
          attendancePct: 15,
          faculty: 12,
          hostelOccupancyPct: 40,
          outdoorTempC: 26.0,
          examMode: false,
          holiday: false,
          eventDay: false,
          monsoon: false,
          powerCut: false,
          dgFailover: false
        };
      } else if (presetName === 'Fest Day (Events)' || presetName.includes('Fest Day')) {
        overrides = {
          students: 1450,
          attendancePct: 96,
          faculty: 85,
          hostelOccupancyPct: 95,
          outdoorTempC: 30.5,
          examMode: false,
          holiday: false,
          eventDay: true,
          monsoon: false,
          powerCut: false,
          dgFailover: false
        };
      } else if (presetName === 'Summer Heat Wave') {
        overrides = {
          outdoorTempC: 35.5,
          monsoon: false,
          holiday: false
        };
      } else if (presetName === 'Monsoon Power Cut') {
        overrides = {
          monsoon: true,
          powerCut: true,
          dgFailover: true,
          outdoorTempC: 22.5
        };
      } else if (presetName === 'Semester Holiday') {
        overrides = {
          students: 15,
          attendancePct: 5,
          faculty: 10,
          hostelOccupancyPct: 15,
          holiday: true,
          examMode: false,
          eventDay: false
        };
      }

      const nextParams = { ...state.params, ...overrides };
      const nextComputed = simulate(nextParams, state.simTime, state.tick);
      return {
        params: nextParams,
        computed: nextComputed
      };
    });
  },

  setSpeed: (speed) => {
    set((state) => ({
      params: { ...state.params, speed }
    }));
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  snapshotBaseline: () => {
    const { computed, simTime } = get();
    set({
      baselineSnapshot: {
        totalKw: computed.totalKw,
        kwhToday: computed.kwhToday,
        costRs: computed.costRs,
        co2Kg: computed.co2Kg,
        timestamp: simTime.toISOString()
      }
    });
  },

  setVisionDetectedCount: (count) => {
    set((state) => {
      const nextComputed = { ...state.computed };
      nextComputed.perRoomOccupancy = {
        ...nextComputed.perRoomOccupancy,
        'main-204': count
      };
      return {
        visionDetectedCount: count,
        computed: nextComputed
      };
    });
  },

  // Called on every simulation clock interval (e.g., 1000ms)
  advanceClockTick: () => {
    const { params, simTime, tick, isPaused } = get();
    if (isPaused) return;

    let secondsToAdvance = 1;
    if (params.speed === '10x') secondsToAdvance = 10;
    else if (params.speed === '60x') secondsToAdvance = 60;
    else if (params.speed === '600x') secondsToAdvance = 600;

    const nextTime = new Date(simTime.getTime() + secondsToAdvance * 1000);
    const nextTick = tick + 1;
    const nextComputed = simulate(params, nextTime, nextTick);

    set({
      simTime: nextTime,
      tick: nextTick,
      computed: nextComputed
    });
  },

  rerunSelfTests: () => {
    set({ selfTestResults: runBug1SelfTests() });
  }
}));
