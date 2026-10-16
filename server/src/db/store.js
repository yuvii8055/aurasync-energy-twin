import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');

// In-Memory collections
export const db = {
  users: [],
  tickets: [],
  workers: [],
  lifts: [],
  bins: [],
  feedback: [],
  settings: [],
  auditLogs: [],
  controlActions: [],
  carbonBudgets: [],
  carbonPassports: []
};

// Seed passwords hashed with bcrypt 12 rounds
const BCRYPT_SALT_ROUNDS = 12;

export async function hashPassword(plainText) {
  return await bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(plainText, hash) {
  return await bcrypt.compare(plainText, hash);
}

/**
 * Initialize and seed the database
 */
export async function initDatabase(forceReseed = false) {
  try {
    if (!forceReseed && fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      Object.assign(db, parsed);
      console.log('✅ Loaded database from file storage with', db.users.length, 'users &', db.tickets.length, 'tickets.');
      return;
    }
  } catch (err) {
    console.warn('⚠️ Could not load data file, proceeding to fresh seeding:', err.message);
  }

  console.log('🌱 Seeding fresh database for AuraSync Energy Twin (DSATM)...');

  // Pre-hash passwords
  const adminHash = await hashPassword('Admin@12345');
  const hodHash = await hashPassword('Hod@12345');
  const facultyHash = await hashPassword('Faculty@12345');
  const studentHash = await hashPassword('Student@12345');
  const workerHash = await hashPassword('Worker@12345');
  const passkeyHash = await hashPassword('123456');

  db.users = [
    {
      id: 'usr-admin-1',
      name: 'Dr. M. Ravishankar (Principal)',
      email: 'admin@aurasync.demo',
      passwordHash: adminHash,
      role: 'admin',
      department: 'Campus Administration',
      passKeyHash: passkeyHash,
      twoFAEnabled: true,
      approvalStatus: 'approved',
      failedAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-hod-1',
      name: 'Dr. Sandhya V. (HOD AIML)',
      email: 'hod.aiml@aurasync.demo',
      passwordHash: hodHash,
      role: 'hod',
      department: 'Computer Science and Engineering (AIML)',
      passKeyHash: passkeyHash,
      twoFAEnabled: true,
      approvalStatus: 'approved',
      failedAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-staff-1',
      name: 'Prof. Ananya Rao (Assistant Professor)',
      email: 'faculty@aurasync.demo',
      passwordHash: facultyHash,
      role: 'staff',
      department: 'Computer Science and Engineering (AIML)',
      passKeyHash: passkeyHash,
      twoFAEnabled: false,
      approvalStatus: 'approved',
      failedAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-student-1',
      name: 'Nikhil Sharma (USN: 1DT23AI045)',
      email: 'student@aurasync.demo',
      passwordHash: studentHash,
      role: 'student',
      department: 'Computer Science and Engineering (AIML)',
      passKeyHash: passkeyHash,
      twoFAEnabled: false,
      approvalStatus: 'approved',
      failedAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-worker-1',
      name: 'Manjunath Gowda (Lead Technician)',
      email: 'worker@aurasync.demo',
      passwordHash: workerHash,
      role: 'worker',
      department: 'Campus Facilities & Maintenance',
      workerSkill: 'Electrician',
      shift: 'Morning (07:00 - 15:30)',
      passKeyHash: passkeyHash,
      twoFAEnabled: false,
      approvalStatus: 'approved',
      failedAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString()
    }
  ];

  db.workers = [
    { id: 'w-1', name: 'Manjunath Gowda', skill: 'Electrician', phone: '+91 98450 11201', shift: 'Morning', workload: 2, availability: 'available', rating: 4.8 },
    { id: 'w-2', name: 'Basavaraj Patil', skill: 'Plumber', phone: '+91 98450 11202', shift: 'Morning', workload: 1, availability: 'available', rating: 4.9 },
    { id: 'w-3', name: 'Suma Narayana', skill: 'Housekeeping', phone: '+91 98450 11203', shift: 'Morning', workload: 3, availability: 'busy', rating: 4.7 },
    { id: 'w-4', name: 'Gopal Reddy', skill: 'Lift Technician', phone: '+91 98450 11204', shift: 'General', workload: 1, availability: 'available', rating: 4.9 },
    { id: 'w-5', name: 'Lakshmamma R.', skill: 'Housekeeping', phone: '+91 98450 11205', shift: 'Morning', workload: 1, availability: 'available', rating: 4.6 },
    { id: 'w-6', name: 'Shankar Murthy', skill: 'HVAC Specialist', phone: '+91 98450 11206', shift: 'General', workload: 2, availability: 'available', rating: 4.8 },
    { id: 'w-7', name: 'Krishnappa M.', skill: 'Gardener & Waste', phone: '+91 98450 11207', shift: 'Morning', workload: 0, availability: 'available', rating: 4.5 },
    { id: 'w-8', name: 'Praveen Naik', skill: 'Electrician', phone: '+91 98450 11208', shift: 'Evening', workload: 1, availability: 'available', rating: 4.7 },
    { id: 'w-9', name: 'Venkatesh Rao', skill: 'Carpenter & Civil', phone: '+91 98450 11209', shift: 'Morning', workload: 2, availability: 'busy', rating: 4.4 },
    { id: 'w-10', name: 'Renuka Devi', skill: 'Housekeeping', phone: '+91 98450 11210', shift: 'Evening', workload: 1, availability: 'available', rating: 4.8 },
    { id: 'w-11', name: 'Anand Kumar', skill: 'IT & AV Tech', phone: '+91 98450 11211', shift: 'General', workload: 3, availability: 'busy', rating: 4.9 },
    { id: 'w-12', name: 'Raju Shetty', skill: 'Security Supervisor', phone: '+91 98450 11212', shift: 'Night', workload: 0, availability: 'available', rating: 4.9 }
  ];

  db.lifts = [
    { id: 'lift-main-1', buildingId: 'dsatm-main', name: 'Academic Elevator A', capacityKg: 680, currentFloor: 1, status: 'running', faultCode: 'NORMAL', energyKwh: 14.8, tripsToday: 84, emergencyTrapped: false },
    { id: 'lift-main-2', buildingId: 'dsatm-main', name: 'Academic Elevator B', capacityKg: 680, currentFloor: 3, status: 'idle', faultCode: 'NORMAL', energyKwh: 12.3, tripsToday: 71, emergencyTrapped: false },
    { id: 'lift-dsba-1', buildingId: 'dsba-block', name: 'DSBA Central Lift', capacityKg: 544, currentFloor: 0, status: 'idle', faultCode: 'NORMAL', energyKwh: 8.4, tripsToday: 42, emergencyTrapped: false },
    { id: 'lift-mech-1', buildingId: 'mech-civil', name: 'Engineering Bay Freight Lift', capacityKg: 1000, currentFloor: 0, status: 'idle', faultCode: 'NORMAL', energyKwh: 9.1, tripsToday: 35, emergencyTrapped: false },
    { id: 'lift-hostel-1', buildingId: 'boys-hostel-1', name: 'Boys Hostel Lift A', capacityKg: 544, currentFloor: 4, status: 'running', faultCode: 'NORMAL', energyKwh: 16.2, tripsToday: 112, emergencyTrapped: false },
    { id: 'lift-hostel-2', buildingId: 'boys-hostel-1', name: 'Boys Hostel Lift B', capacityKg: 544, currentFloor: 2, status: 'idle', faultCode: 'NORMAL', energyKwh: 13.5, tripsToday: 98, emergencyTrapped: false }
  ];

  // 60 Smart Waste Bins across campus
  const binLocations = [
    { bId: 'dsatm-main', prefix: 'DSATM Main' },
    { bId: 'dsba-block', prefix: 'DSBA Block' },
    { bId: 'mech-civil', prefix: 'Mech-Civil' },
    { bId: 'block-c', prefix: 'Block-C' },
    { bId: 'boys-hostel-1', prefix: 'Hostel 1' },
    { bId: 'green-belt', prefix: 'Green Belt' }
  ];
  const binTypes = ['dry', 'wet', 'plastic', 'e-waste'];

  db.bins = [];
  let binCounter = 1;
  for (let i = 0; i < 60; i++) {
    const loc = binLocations[i % binLocations.length];
    const type = binTypes[i % binTypes.length];
    const fill = Math.floor(20 + Math.random() * 75);
    db.bins.push({
      id: `bin-${String(binCounter).padStart(3, '0')}`,
      buildingId: loc.bId,
      locationName: `${loc.prefix} - Zone ${Math.floor(i / 6) + 1}`,
      type,
      fillPct: fill,
      lastEmptied: new Date(Date.now() - (i * 3600000)).toISOString(),
      capacityLiters: type === 'dry' ? 120 : 80
    });
    binCounter++;
  }

  // 40 Realistic Seed Tickets across categories
  db.tickets = [
    {
      ticketId: 'AS-2026-000101',
      category: 'Garbage and Waste',
      subcategory: 'Overflowing Bin',
      title: 'Overflowing bin near Block-C cafeteria courtyard',
      description: 'The green segregated bin is overflowing with food wrappers and drink cups. Needs immediate clearing.',
      locationRef: { buildingId: 'block-c', floor: 0, roomId: 'court-exterior', pin3D: { x: 72, y: 1, z: 25 } },
      urgency: 'high',
      status: 'assigned',
      reporterId: 'usr-student-1',
      reporterName: 'Nikhil Sharma',
      anonymous: false,
      assignedHodId: 'usr-hod-1',
      assignedWorkerId: 'w-3',
      slaDueAt: new Date(Date.now() + 2 * 3600000).toISOString(),
      media: [{ url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80', type: 'image' }],
      beforeMedia: [{ url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80' }],
      afterMedia: [],
      rating: null,
      timeline: [
        { status: 'new', byUserId: 'usr-student-1', at: new Date(Date.now() - 3600000).toISOString(), note: 'Ticket submitted via Mobile Quick-Report' },
        { status: 'assigned', byUserId: 'usr-hod-1', at: new Date(Date.now() - 1800000).toISOString(), note: 'Smart-assigned to Suma Narayana (Housekeeping)' }
      ]
    },
    {
      ticketId: 'AS-2026-000102',
      category: 'Energy Waste',
      subcategory: 'Ghost Load',
      title: 'Lab 204 AC running with 0 occupants for 35 minutes',
      description: 'Embedded Systems Lab 204 has 2.0T Split AC running at 18C while room is locked and empty. Energy Ghost alert triggered.',
      locationRef: { buildingId: 'dsatm-main', floor: 2, roomId: 'main-204', pin3D: { x: -45, y: 12, z: 42 } },
      urgency: 'high',
      status: 'in_progress',
      reporterId: 'usr-admin-1',
      reporterName: 'Aura AI Auto-Detector',
      anonymous: false,
      assignedHodId: 'usr-hod-1',
      assignedWorkerId: 'w-1',
      slaDueAt: new Date(Date.now() + 1 * 3600000).toISOString(),
      media: [],
      beforeMedia: [],
      afterMedia: [],
      rating: null,
      timeline: [
        { status: 'new', byUserId: 'system', at: new Date(Date.now() - 2400000).toISOString(), note: 'Energy Ghost correlation detected: Power 1950W, Occupancy 0' },
        { status: 'in_progress', byUserId: 'w-1', at: new Date(Date.now() - 900000).toISOString(), note: 'Technician en route to verify and isolate relay' }
      ]
    },
    {
      ticketId: 'AS-2026-000103',
      category: 'Lifts and Elevators',
      subcategory: 'Stuck Door Fault',
      title: 'DSBA Central Lift door sensor intermittent jam',
      description: 'Ground floor lift doors reopen repeatedly before closing. Causing delay for faculty and students.',
      locationRef: { buildingId: 'dsba-block', floor: 0, roomId: 'dsba-atrium', pin3D: { x: 0, y: 1, z: -48 } },
      urgency: 'high',
      status: 'assigned',
      reporterId: 'usr-staff-1',
      reporterName: 'Prof. Ananya Rao',
      anonymous: false,
      assignedHodId: 'usr-admin-1',
      assignedWorkerId: 'w-4',
      slaDueAt: new Date(Date.now() + 3 * 3600000).toISOString(),
      media: [],
      beforeMedia: [],
      afterMedia: [],
      rating: null,
      timeline: [
        { status: 'new', byUserId: 'usr-staff-1', at: new Date(Date.now() - 4000000).toISOString(), note: 'Reported by Faculty via Room QR' },
        { status: 'assigned', byUserId: 'usr-admin-1', at: new Date(Date.now() - 3000000).toISOString(), note: 'Assigned to Gopal Reddy (Lift Tech)' }
      ]
    },
    {
      ticketId: 'AS-2026-000104',
      category: 'Washroom and Hygiene',
      subcategory: 'Tap Leakage',
      title: 'Continuous tap drip in 1st Floor Boys Washroom',
      description: 'Sensor faucet leaking continuously, wasting water and causing basin overflow risk.',
      locationRef: { buildingId: 'dsatm-main', floor: 1, roomId: 'main-101-ext', pin3D: { x: -60, y: 6, z: 40 } },
      urgency: 'normal',
      status: 'resolved',
      reporterId: 'usr-student-1',
      reporterName: 'Nikhil Sharma',
      anonymous: false,
      assignedHodId: 'usr-hod-1',
      assignedWorkerId: 'w-2',
      slaDueAt: new Date(Date.now() - 3600000).toISOString(),
      media: [],
      beforeMedia: [],
      afterMedia: [{ url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80' }],
      rating: 5,
      timeline: [
        { status: 'new', byUserId: 'usr-student-1', at: new Date(Date.now() - 7200000).toISOString(), note: 'Issue logged' },
        { status: 'assigned', byUserId: 'usr-hod-1', at: new Date(Date.now() - 6000000).toISOString(), note: 'Assigned to Basavaraj Patil' },
        { status: 'resolved', byUserId: 'w-2', at: new Date(Date.now() - 1200000).toISOString(), note: 'Washer replaced and pressure calibrated' }
      ]
    },
    {
      ticketId: 'AS-2026-000105',
      category: 'Electrical',
      subcategory: 'Flickering Light',
      title: 'Classroom 103 LED Tube flicker',
      description: 'Row 3 tube light is strobing during lecture hours.',
      locationRef: { buildingId: 'dsatm-main', floor: 1, roomId: 'main-103', pin3D: { x: -50, y: 6, z: 50 } },
      urgency: 'low',
      status: 'new',
      reporterId: 'usr-staff-1',
      reporterName: 'Prof. Ananya Rao',
      anonymous: false,
      assignedHodId: 'usr-hod-1',
      assignedWorkerId: null,
      slaDueAt: new Date(Date.now() + 24 * 3600000).toISOString(),
      media: [],
      beforeMedia: [],
      afterMedia: [],
      rating: null,
      timeline: [
        { status: 'new', byUserId: 'usr-staff-1', at: new Date(Date.now() - 1500000).toISOString(), note: 'Ticket created' }
      ]
    }
  ];

  // Generate additional tickets to meet the 40 seed tickets requirement
  const categoriesPool = [
    { cat: 'Garbage and Waste', sub: 'Litter in lawn', urg: 'normal', b: 'green-belt', title: 'Lawn litter after college cultural practice' },
    { cat: 'Electrical', sub: 'Switchboard loose', urg: 'high', b: 'mech-civil', title: 'Loose 3-phase switch plate in CNC workshop' },
    { cat: 'Plumbing and Water', sub: 'Overhead tank sensor', urg: 'high', b: 'boys-hostel-1', title: 'Overhead tank float sensor signal fault' },
    { cat: 'Safety and Security', sub: 'Extinguisher pin missing', urg: 'high', b: 'dsatm-main', title: '2nd Floor Fire Extinguisher inspection seal cut' },
    { cat: 'Cleanliness', sub: 'Classroom floor spill', urg: 'low', b: 'dsba-block', title: 'Coffee spill in DSBA Hall 101' },
    { cat: 'IT and Network', sub: 'Wi-Fi AP offline', urg: 'normal', b: 'block-c', title: 'C-Block 1st floor Aruba AP indicator flashing amber' },
    { cat: 'Energy Waste', sub: 'Projector left on', urg: 'normal', b: 'dsatm-main', title: 'Auditorium laser projector left idling on blank screen' },
    { cat: 'Lifts and Elevators', sub: 'Rattling noise', urg: 'normal', b: 'boys-hostel-1', title: 'Boys Hostel Passenger Lift counterweight rattling' }
  ];

  for (let k = 6; k <= 40; k++) {
    const item = categoriesPool[k % categoriesPool.length];
    db.tickets.push({
      ticketId: `AS-2026-${String(100 + k).padStart(6, '0')}`,
      category: item.cat,
      subcategory: item.sub,
      title: `${item.title} #${k}`,
      description: `Automated & crowd-reported campus maintenance item logged for ${item.b}.`,
      locationRef: { buildingId: item.b, floor: 1, roomId: `${item.b}-room-${k}`, pin3D: { x: (k * 7) % 80 - 40, y: 5, z: (k * 11) % 60 - 30 } },
      urgency: item.urg,
      status: k % 3 === 0 ? 'resolved' : (k % 2 === 0 ? 'in_progress' : 'new'),
      reporterId: 'usr-student-1',
      reporterName: 'Campus Reporter',
      anonymous: k % 5 === 0,
      assignedHodId: 'usr-hod-1',
      assignedWorkerId: k % 2 === 0 ? `w-${(k % 12) + 1}` : null,
      slaDueAt: new Date(Date.now() + (k * 1800000)).toISOString(),
      media: [],
      beforeMedia: [],
      afterMedia: [],
      rating: k % 3 === 0 ? 4 : null,
      timeline: [
        { status: 'new', byUserId: 'usr-student-1', at: new Date(Date.now() - k * 3600000).toISOString(), note: 'Logged' }
      ]
    });
  }

  // 25 Feedback Items
  db.feedback = [
    {
      id: 'fb-1',
      userId: 'usr-student-1',
      userName: 'Nikhil Sharma',
      type: 'Feature request',
      rating: 5,
      sentiment: 'positive',
      topic: 'Carbon Passport',
      text: 'Loving the real-time Carbon Passport! Could we add college bus route tracking to log Scope 3 commute savings?',
      status: 'Planned',
      adminReply: 'Great idea! We are piloting GPS tracking on 6 Kanakapura road college buses in phase 2.',
      department: 'Computer Science and Engineering (AIML)',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'fb-2',
      userId: 'usr-staff-1',
      userName: 'Prof. Ananya Rao',
      type: 'Suggestion for the college',
      rating: 4,
      sentiment: 'positive',
      topic: 'Solar Rooftop',
      text: 'The solar generation overlay in the 3D twin is impressive. Faculty suggest scheduling lab batches during peak solar hours (11:00 - 14:00).',
      status: 'Reviewing',
      adminReply: 'Implemented in the Auto-Optimizer timetable recommendation engine!',
      department: 'Computer Science and Engineering (AIML)',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'fb-3',
      userId: 'usr-worker-1',
      userName: 'Manjunath Gowda',
      type: 'Bug in the app',
      rating: 4,
      sentiment: 'neutral',
      topic: 'Worker Mobile View',
      text: 'After-photo upload should support offline mode when underground in the transformer yard.',
      status: 'Done',
      adminReply: 'Resolved: PWA offline caching enabled for all worker uploads.',
      department: 'Campus Facilities & Maintenance',
      createdAt: new Date(Date.now() - 250000000).toISOString()
    }
  ];

  for (let f = 4; f <= 25; f++) {
    db.feedback.push({
      id: `fb-${f}`,
      userId: 'usr-student-1',
      userName: `Student Community #${f}`,
      type: f % 4 === 0 ? 'Complaint about a service' : (f % 3 === 0 ? 'Praise' : 'Suggestion for the college'),
      rating: (f % 3) + 3,
      sentiment: f % 4 === 0 ? 'negative' : 'positive',
      topic: f % 2 === 0 ? 'Energy Efficiency' : 'Hostel Facilities',
      text: `Feedback report regarding campus sustainability and facility management item #${f}.`,
      status: f % 2 === 0 ? 'Reviewing' : 'New',
      adminReply: f % 2 === 0 ? 'Thank you for your constructive contribution to DSATM green goals.' : null,
      department: 'Campus Facilities & Maintenance',
      createdAt: new Date(Date.now() - f * 43200000).toISOString()
    });
  }

  // Settings Definitions with Inheritance (Global > Department > Personal)
  db.settings = [
    {
      key: 'tariff_per_kwh_inr',
      name: 'Grid Tariff Rate (BESCOM HT Slab)',
      category: 'Financial & Tariffs',
      unit: 'Rs/kWh',
      scopeAllowed: ['global'],
      defaultValue: 8.25,
      globalValue: 8.25,
      deptValues: {},
      personalValues: {},
      min: 4.0,
      max: 18.0,
      lockedBy: 'admin',
      description: 'Assumed Bangalore Electricity Supply Company (BESCOM) rate for HT-2 commercial educational institutions.'
    },
    {
      key: 'grid_emission_factor',
      name: 'India Grid Emission Factor',
      category: 'Carbon & ESG',
      unit: 'kg CO2e/kWh',
      scopeAllowed: ['global'],
      defaultValue: 0.71,
      globalValue: 0.71,
      deptValues: {},
      personalValues: {},
      min: 0.3,
      max: 1.2,
      lockedBy: 'admin',
      description: 'CEA CO2 baseline database for Indian national grid electricity average.'
    },
    {
      key: 'ac_setpoint_cooling',
      name: 'Standard AC Setpoint Temperature',
      category: 'Thermal & Comfort',
      unit: '°C',
      scopeAllowed: ['global', 'department'],
      defaultValue: 24,
      globalValue: 24,
      deptValues: {
        'Computer Science and Engineering (AIML)': 23,
        'Dayananda Sagar Business Academy (DSBA)': 24,
        'Mechanical Engineering': 25
      },
      personalValues: {},
      min: 22,
      max: 27,
      lockedBy: null,
      description: 'BEE recommended thermostat sweet spot for energy savings and occupant thermal comfort.'
    },
    {
      key: 'idle_timeout_minutes',
      name: 'Vacant Room Auto-Off Delay',
      category: 'Auto-Optimizer',
      unit: 'Minutes',
      scopeAllowed: ['global', 'department'],
      defaultValue: 15,
      globalValue: 15,
      deptValues: {
        'Computer Science and Engineering (AIML)': 10
      },
      personalValues: {},
      min: 5,
      max: 60,
      lockedBy: null,
      description: 'Minutes of zero occupancy detected via Computer Vision or IoT sensors before auto-switching non-critical loads.'
    },
    {
      key: 'optimizer_aggressiveness',
      name: 'Auto-Optimizer Control Mode',
      category: 'Auto-Optimizer',
      unit: 'Profile',
      scopeAllowed: ['global', 'department'],
      defaultValue: 'Balanced',
      globalValue: 'Balanced',
      deptValues: {},
      personalValues: {},
      options: ['Gentle', 'Balanced', 'Aggressive'],
      lockedBy: null,
      description: 'Determines threshold sensitivity for load shedding, pre-cooling schedules and peak shaving.'
    },
    {
      key: 'dynamic_island_position',
      name: 'Dynamic Island Anchor Position',
      category: 'User Interface',
      unit: 'Anchor',
      scopeAllowed: ['personal'],
      defaultValue: 'top-center',
      globalValue: 'top-center',
      deptValues: {},
      personalValues: {},
      options: ['top-center', 'top-left', 'top-right', 'bottom-center', 'bottom-left', 'bottom-right', 'free'],
      lockedBy: null,
      description: 'Physical screen location of the floating Dynamic Island HUD.'
    }
  ];

  // Carbon Budgets
  db.carbonBudgets = [
    {
      scopeId: 'campus-global',
      scopeName: 'DSATM Campus Total',
      period: 'October 2026',
      capKg: 120000,
      usedKg: 84210,
      warningThresholdPct: 70
    },
    {
      scopeId: 'dept-aiml',
      scopeName: 'CSE (AIML) Department',
      period: 'October 2026',
      capKg: 28000,
      usedKg: 19450,
      warningThresholdPct: 70
    },
    {
      scopeId: 'dept-dsba',
      scopeName: 'DSBA Block',
      period: 'October 2026',
      capKg: 18000,
      usedKg: 11200,
      warningThresholdPct: 70
    },
    {
      scopeId: 'dept-mech',
      scopeName: 'Mechanical Engineering',
      period: 'October 2026',
      capKg: 22000,
      usedKg: 16800,
      warningThresholdPct: 70
    },
    {
      scopeId: 'hostel-boys1',
      scopeName: 'Boys Hostel 1',
      period: 'October 2026',
      capKg: 35000,
      usedKg: 27900,
      warningThresholdPct: 70
    }
  ];

  // Save to file
  saveDatabaseToFile();
  console.log('✅ Database seeded and saved to file successfully!');
}

export function saveDatabaseToFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to persist store to file:', err.message);
  }
}
