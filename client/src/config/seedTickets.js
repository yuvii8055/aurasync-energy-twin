// Seed dataset for Campus Helpdesk, Dispatch & SLA Kanban, and Worker Tasks
// Provides 40 realistic tickets and 12 staff workers for DSATM campus

export const initialWorkers = [
  { id: 'w-1', name: 'Manjunath Gowda', skill: 'HVAC & Electrical', phone: '+91 98450 11201', shift: 'Morning', workload: 2, availability: 'busy', rating: 4.8 },
  { id: 'w-2', name: 'Basavaraj Patil', skill: 'Plumbing & Water', phone: '+91 98450 11202', shift: 'Morning', workload: 1, availability: 'available', rating: 4.9 },
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

export const initialTickets = [
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
    description: 'Row 3 tube light is strobing during lecture hours in Main Block.',
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
  },
  {
    ticketId: 'AS-2026-000106',
    category: 'Energy Waste',
    subcategory: 'Corridor Lighting',
    title: 'AIML 3rd Floor daylight harvesting sensor bypass',
    description: 'Corridor lighting bank on at 100% despite full direct morning sunlight (450 Lux measured).',
    locationRef: { buildingId: 'dsatm-main', floor: 3, roomId: 'corridor-3n', pin3D: { x: -30, y: 15, z: 20 } },
    urgency: 'normal',
    status: 'new',
    reporterId: 'usr-hod-1',
    reporterName: 'Dr. Sandhya V.',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: null,
    slaDueAt: new Date(Date.now() + 12 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-hod-1', at: new Date(Date.now() - 1800000).toISOString(), note: 'Logged by Dr. Sandhya V. via Smart Dashboard' }
    ]
  },
  {
    ticketId: 'AS-2026-000107',
    category: 'Plumbing and Water',
    subcategory: 'Overhead Tank',
    title: 'Boys Hostel 1 overhead tank float switch stuck',
    description: 'Water pump continuously running past 95% full cutoff mark. Water overflow risk.',
    locationRef: { buildingId: 'boys-hostel-1', floor: 4, roomId: 'roof-tank', pin3D: { x: 50, y: 22, z: -30 } },
    urgency: 'high',
    status: 'in_progress',
    reporterId: 'usr-staff-1',
    reporterName: 'Hostel Warden',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-2',
    slaDueAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-staff-1', at: new Date(Date.now() - 3600000).toISOString(), note: 'Overhead sensor warning' },
      { status: 'in_progress', byUserId: 'w-2', at: new Date(Date.now() - 1200000).toISOString(), note: 'Basavaraj Patil climbing to inspect mechanical float ball' }
    ]
  },
  {
    ticketId: 'AS-2026-000108',
    category: 'Electrical',
    subcategory: 'Loose Switchboard',
    title: 'Loose 3-phase switch plate in CNC Workshop',
    description: 'High voltage distribution board plate vibration detected during milling operation.',
    locationRef: { buildingId: 'mech-civil', floor: 0, roomId: 'cnc-lab', pin3D: { x: -80, y: 2, z: -10 } },
    urgency: 'high',
    status: 'assigned',
    reporterId: 'usr-staff-1',
    reporterName: 'Workshop Superintendent',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-8',
    slaDueAt: new Date(Date.now() + 4 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-staff-1', at: new Date(Date.now() - 5400000).toISOString(), note: 'Workshop safety check item' },
      { status: 'assigned', byUserId: 'usr-hod-1', at: new Date(Date.now() - 2700000).toISOString(), note: 'Assigned to Praveen Naik (Electrician)' }
    ]
  },
  {
    ticketId: 'AS-2026-000109',
    category: 'IT and Network',
    subcategory: 'Wi-Fi AP Offline',
    title: 'Block-C 1st floor Aruba AP indicator flashing amber',
    description: 'Students in Seminar Hall report intermittent 5GHz Wi-Fi dropouts during research seminars.',
    locationRef: { buildingId: 'block-c', floor: 1, roomId: 'hall-b', pin3D: { x: 65, y: 8, z: 20 } },
    urgency: 'normal',
    status: 'in_progress',
    reporterId: 'usr-student-1',
    reporterName: 'Nikhil Sharma',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-11',
    slaDueAt: new Date(Date.now() + 6 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-student-1', at: new Date(Date.now() - 4800000).toISOString(), note: 'Student reported AP dropout' },
      { status: 'in_progress', byUserId: 'w-11', at: new Date(Date.now() - 1800000).toISOString(), note: 'Anand Kumar testing PoE switch port 14' }
    ]
  },
  {
    ticketId: 'AS-2026-000110',
    category: 'Cleanliness',
    subcategory: 'Litter in Lawn',
    title: 'Lawn litter after college cultural practice',
    description: 'Plastic bottles and snack wrappers left near the open amphitheatre green lawn.',
    locationRef: { buildingId: 'green-belt', floor: 0, roomId: 'amphitheatre', pin3D: { x: 10, y: 0, z: 60 } },
    urgency: 'normal',
    status: 'resolved',
    reporterId: 'usr-staff-1',
    reporterName: 'Campus Security',
    anonymous: true,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-7',
    slaDueAt: new Date(Date.now() - 7200000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: 5,
    timeline: [
      { status: 'new', byUserId: 'security', at: new Date(Date.now() - 14400000).toISOString(), note: 'Logged during campus morning rounds' },
      { status: 'resolved', byUserId: 'w-7', at: new Date(Date.now() - 8000000).toISOString(), note: 'Cleared and dry waste segregated' }
    ]
  },
  {
    ticketId: 'AS-2026-000111',
    category: 'Energy Waste',
    subcategory: 'Projector Standby',
    title: 'Auditorium laser projector left idling on blank screen',
    description: '350W high-output projector left powered on since yesterday evening convocation rehearsal.',
    locationRef: { buildingId: 'dsatm-main', floor: 0, roomId: 'main-auditorium', pin3D: { x: -10, y: 1, z: 30 } },
    urgency: 'normal',
    status: 'resolved',
    reporterId: 'usr-hod-1',
    reporterName: 'Dr. Sandhya V.',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-11',
    slaDueAt: new Date(Date.now() - 1000000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: 5,
    timeline: [
      { status: 'new', byUserId: 'usr-hod-1', at: new Date(Date.now() - 7200000).toISOString(), note: 'Flagged via Aura Energy Audit' },
      { status: 'resolved', byUserId: 'w-11', at: new Date(Date.now() - 2000000).toISOString(), note: 'Projector safely powered down and timer programmed' }
    ]
  },
  {
    ticketId: 'AS-2026-000112',
    category: 'Safety and Security',
    subcategory: 'Extinguisher Seal',
    title: '2nd Floor Fire Extinguisher inspection seal cut',
    description: 'CO2 fire extinguisher pin safety tag found severed in Main Block West stairwell.',
    locationRef: { buildingId: 'dsatm-main', floor: 2, roomId: 'west-stairwell', pin3D: { x: -70, y: 12, z: 15 } },
    urgency: 'high',
    status: 'new',
    reporterId: 'usr-staff-1',
    reporterName: 'Security Team',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: null,
    slaDueAt: new Date(Date.now() + 6 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'security', at: new Date(Date.now() - 900000).toISOString(), note: 'Routine safety walk discovery' }
    ]
  },
  {
    ticketId: 'AS-2026-000113',
    category: 'Lifts and Elevators',
    subcategory: 'Counterweight Noise',
    title: 'Boys Hostel Lift A counterweight rattling at 3rd floor',
    description: 'Audible metallic resonance when car passes level 3. Requires guide shoe lubrication.',
    locationRef: { buildingId: 'boys-hostel-1', floor: 3, roomId: 'shaft-a', pin3D: { x: 55, y: 18, z: -25 } },
    urgency: 'high',
    status: 'assigned',
    reporterId: 'usr-student-1',
    reporterName: 'Hostel Resident',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-4',
    slaDueAt: new Date(Date.now() + 5 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-student-1', at: new Date(Date.now() - 3600000).toISOString(), note: 'Student reported noise' },
      { status: 'assigned', byUserId: 'usr-hod-1', at: new Date(Date.now() - 2100000).toISOString(), note: 'Assigned to Gopal Reddy' }
    ]
  },
  {
    ticketId: 'AS-2026-000114',
    category: 'Energy Waste',
    subcategory: 'Server Rack Cooling',
    title: 'AIML High Performance Server Rack ambient temp 26C',
    description: 'Dual precision AC unit 2 secondary compressor dropped out. Needs refrigerant check.',
    locationRef: { buildingId: 'dsatm-main', floor: 2, roomId: 'aiml-server-room', pin3D: { x: -40, y: 12, z: 38 } },
    urgency: 'high',
    status: 'in_progress',
    reporterId: 'usr-hod-1',
    reporterName: 'Dr. Sandhya V.',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-6',
    slaDueAt: new Date(Date.now() + 1 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-hod-1', at: new Date(Date.now() - 1800000).toISOString(), note: 'Thermal alert on GPU cluster' },
      { status: 'in_progress', byUserId: 'w-6', at: new Date(Date.now() - 600000).toISOString(), note: 'Shankar Murthy on site with manifold gauges' }
    ]
  },
  {
    ticketId: 'AS-2026-000115',
    category: 'Washroom and Hygiene',
    subcategory: 'Dry Soap Dispenser',
    title: 'DSBA Block 2nd floor washroom soap dispensers empty',
    description: 'Both wall-mounted liquid soap units empty after lunch rush.',
    locationRef: { buildingId: 'dsba-block', floor: 2, roomId: 'washroom-2f', pin3D: { x: 5, y: 12, z: -40 } },
    urgency: 'low',
    status: 'resolved',
    reporterId: 'usr-student-1',
    reporterName: 'Pooja Hegde',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-5',
    slaDueAt: new Date(Date.now() - 4000000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: 5,
    timeline: [
      { status: 'new', byUserId: 'usr-student-1', at: new Date(Date.now() - 8000000).toISOString(), note: 'Reported' },
      { status: 'resolved', byUserId: 'w-5', at: new Date(Date.now() - 5000000).toISOString(), note: 'Refilled with antimicrobial herbal soap' }
    ]
  },
  {
    ticketId: 'AS-2026-000116',
    category: 'Electrical',
    subcategory: 'Solar Inverter Telemetry',
    title: 'Rooftop Solar Inverter 2 RS485 bus packet loss',
    description: 'Live generation telemetry intermittent from 40kW String Inverter on Main Block roof.',
    locationRef: { buildingId: 'dsatm-main', floor: 4, roomId: 'solar-terrace', pin3D: { x: -35, y: 24, z: 25 } },
    urgency: 'normal',
    status: 'assigned',
    reporterId: 'usr-admin-1',
    reporterName: 'Energy Manager',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-8',
    slaDueAt: new Date(Date.now() + 8 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'admin', at: new Date(Date.now() - 5000000).toISOString(), note: 'Gateway packet timeout' },
      { status: 'assigned', byUserId: 'usr-hod-1', at: new Date(Date.now() - 2500000).toISOString(), note: 'Praveen Naik assigned for bus check' }
    ]
  },
  {
    ticketId: 'AS-2026-000117',
    category: 'Cleanliness',
    subcategory: 'Spill',
    title: 'Coffee spill in DSBA Hall 101 front row',
    description: 'Cold beverage spilt across linoleum tiles near whiteboard podium.',
    locationRef: { buildingId: 'dsba-block', floor: 1, roomId: 'hall-101', pin3D: { x: -5, y: 6, z: -35 } },
    urgency: 'low',
    status: 'new',
    reporterId: 'usr-staff-1',
    reporterName: 'DSBA Faculty',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: null,
    slaDueAt: new Date(Date.now() + 8 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-staff-1', at: new Date(Date.now() - 1200000).toISOString(), note: 'Reported after 11am MBA lecture' }
    ]
  },
  {
    ticketId: 'AS-2026-000118',
    category: 'Energy Waste',
    subcategory: 'Exterior Floodlight',
    title: 'Basketball court floodlights left on in daytime',
    description: 'Four 400W LED court fixtures turned on manually and left blazing at 10:30 AM.',
    locationRef: { buildingId: 'green-belt', floor: 0, roomId: 'sports-court', pin3D: { x: 30, y: 0, z: 80 } },
    urgency: 'high',
    status: 'resolved',
    reporterId: 'usr-hod-1',
    reporterName: 'Dr. Sandhya V.',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-1',
    slaDueAt: new Date(Date.now() - 3000000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: 5,
    timeline: [
      { status: 'new', byUserId: 'usr-hod-1', at: new Date(Date.now() - 6000000).toISOString(), note: 'Daytime floodlight waste reported' },
      { status: 'resolved', byUserId: 'w-1', at: new Date(Date.now() - 4000000).toISOString(), note: 'MCB switched off and photocell override engaged' }
    ]
  },
  {
    ticketId: 'AS-2026-000119',
    category: 'Plumbing and Water',
    subcategory: 'RO Purifier Filter',
    title: 'Main Block 2nd Floor RO water station flow sluggish',
    description: 'Pre-sediment filter blocked; student water refill queue backing up.',
    locationRef: { buildingId: 'dsatm-main', floor: 2, roomId: 'water-point-2', pin3D: { x: -25, y: 12, z: 45 } },
    urgency: 'normal',
    status: 'in_progress',
    reporterId: 'usr-student-1',
    reporterName: 'Nikhil Sharma',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: 'w-2',
    slaDueAt: new Date(Date.now() + 3 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'usr-student-1', at: new Date(Date.now() - 3600000).toISOString(), note: 'Reported by Student Council' },
      { status: 'in_progress', byUserId: 'w-2', at: new Date(Date.now() - 1500000).toISOString(), note: 'Basavaraj Patil flushing micron cartridge' }
    ]
  },
  {
    ticketId: 'AS-2026-000120',
    category: 'Garbage and Waste',
    subcategory: 'E-Waste Bin',
    title: 'CSE Project Lab E-waste collection bin full of discarded PCBs',
    description: 'Lab 305 designated recycling box is 95% full of cut wire trimmings and prototypes.',
    locationRef: { buildingId: 'dsatm-main', floor: 3, roomId: 'lab-305', pin3D: { x: -45, y: 18, z: 35 } },
    urgency: 'low',
    status: 'new',
    reporterId: 'usr-staff-1',
    reporterName: 'Lab In-Charge',
    anonymous: false,
    assignedHodId: 'usr-hod-1',
    assignedWorkerId: null,
    slaDueAt: new Date(Date.now() + 18 * 3600000).toISOString(),
    media: [],
    beforeMedia: [],
    afterMedia: [],
    rating: null,
    timeline: [
      { status: 'new', byUserId: 'staff', at: new Date(Date.now() - 2000000).toISOString(), note: 'Logged for periodic certified e-waste pickup' }
    ]
  }
];

// Helper to get initial tickets from localStorage or fallback
export function getSavedTickets() {
  if (typeof window === 'undefined') return initialTickets;
  try {
    const raw = localStorage.getItem('aurasync_tickets');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load tickets from localStorage:', e);
  }
  // Initialize localStorage with initialTickets
  saveTickets(initialTickets);
  return initialTickets;
}

export function saveTickets(tickets) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aurasync_tickets', JSON.stringify(tickets));
  } catch (e) {
    console.warn('Failed to persist tickets to localStorage:', e);
  }
}

// Helper to get initial workers from localStorage or fallback
export function getSavedWorkers() {
  if (typeof window === 'undefined') return initialWorkers;
  try {
    const raw = localStorage.getItem('aurasync_workers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load workers from localStorage:', e);
  }
  saveWorkers(initialWorkers);
  return initialWorkers;
}

export function saveWorkers(workers) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aurasync_workers', JSON.stringify(workers));
  } catch (e) {
    console.warn('Failed to persist workers to localStorage:', e);
  }
}
