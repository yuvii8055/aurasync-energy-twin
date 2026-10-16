import { db, saveDatabaseToFile } from '../db/store.js';

export function getCarbonSummary(req, res) {
  try {
    // Current Monthly ESG Telemetry for DSATM
    const summary = {
      period: 'October 2026',
      totalEmissionKgCo2: 84210,
      emissionAvoidedKgCo2: 18450,
      scopeBreakdown: {
        scope1: {
          totalKg: 9400,
          pct: 11.2,
          sources: [
            { name: 'Diesel Genset Backups (2x 250kVA)', kg: 4200, unit: '1,560 Litres Diesel' },
            { name: 'Hostel Mess & Canteen LPG', kg: 3800, unit: '128 Commercial Cylinders' },
            { name: 'College Maintenance Vehicles & Shuttles', kg: 1400, unit: '510 Litres Petrol' }
          ]
        },
        scope2: {
          totalKg: 58600,
          pct: 69.6,
          sources: [
            { name: 'BESCOM Grid Electricity Import', kg: 58600, unit: '82,535 kWh' }
          ]
        },
        scope3: {
          totalKg: 16210,
          pct: 19.2,
          sources: [
            { name: 'Student & Faculty Daily Commute', kg: 11400, unit: 'Est. 48,000 passenger-km' },
            { name: 'Municipal Water Supply Pumping', kg: 2600, unit: '450 kL Water' },
            { name: 'Solid Waste to Mandur Landfill', kg: 2210, unit: '3.4 Tonnes Waste' }
          ]
        }
      },
      emissionFactors: [
        { key: 'grid_elec', name: 'Indian Grid Electricity', factor: 0.71, unit: 'kg CO2e/kWh', source: 'CEA CO2 Baseline 2024' },
        { key: 'diesel', name: 'High-Speed Diesel', factor: 2.68, unit: 'kg CO2e/Litre', source: 'IPCC Guidelines' },
        { key: 'lpg', name: 'LPG Gas', factor: 2.98, unit: 'kg CO2e/kg', source: 'IPCC Guidelines' },
        { key: 'petrol', name: 'Motor Gasoline', factor: 2.31, unit: 'kg CO2e/Litre', source: 'IPCC Guidelines' }
      ],
      carbonAwareHourSchedule: [
        { hour: '06:00 - 08:00', intensityKgKwh: 0.78, status: 'high_carbon', recommendation: 'Grid peak ramp. Defer heavy pumping.' },
        { hour: '08:00 - 11:00', intensityKgKwh: 0.65, status: 'moderate', recommendation: 'Solar ramping up. Academic labs open.' },
        { hour: '11:00 - 14:30', intensityKgKwh: 0.28, status: 'cleanest', recommendation: 'CLEANEST WINDOW! Rooftop Solar 82 kW active. Schedule EV charging & water pumps.' },
        { hour: '14:30 - 17:30', intensityKgKwh: 0.58, status: 'moderate', recommendation: 'Normal operations.' },
        { hour: '17:30 - 21:00', intensityKgKwh: 0.84, status: 'high_carbon', recommendation: 'State grid peak evening load. Shift sports floodlights to LED.' },
        { hour: '21:00 - 06:00', intensityKgKwh: 0.72, status: 'moderate', recommendation: 'Off-peak thermal. Hostel geyser timers active.' }
      ],
      netZeroPathway: {
        baselineYear: 2024,
        targetYear: 2030,
        baselineEmissionsTonnes: 1240,
        currentYearEmissionsTonnes: 920,
        targetEmissionsTonnes: 180,
        progressPct: 30.2,
        milestones: [
          { year: 2024, title: 'Smart Sub-Metering & Telemetry', achieved: true },
          { year: 2025, title: '260 kWp Rooftop Solar Arrays', achieved: true },
          { year: 2026, title: 'AuraSync AI Dynamic Optimizer & EV Hub', achieved: true },
          { year: 2028, title: '200 kWh Vanadium Redox Flow Battery', achieved: false },
          { year: 2030, title: 'Net-Zero Green Campus Certification', achieved: false }
        ]
      },
      greenCampusScore: 84
    };

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getCarbonBudgets(req, res) {
  res.json({ success: true, data: db.carbonBudgets });
}

export function getCarbonPassport(req, res) {
  try {
    const passport = {
      userId: req.user.id,
      name: req.user.name,
      department: req.user.department,
      ecoScorePoints: 420,
      monthlyFootprintKg: 18.4,
      campusAverageKg: 24.8,
      streakDays: 19,
      badges: [
        { id: 'b1', name: 'Ghost Buster', icon: 'ZapOff', desc: 'Reported 3 empty room energy ghosts' },
        { id: 'b2', name: 'Solar Native', icon: 'Sun', desc: 'Charged EV during cleanest solar hours' },
        { id: 'b3', name: 'Zero Waste Champion', icon: 'Recycle', desc: '100% dry waste segregation verified' }
      ],
      recentPledges: [
        'Switched off classroom fans after 4th period lecture',
        'Took stairs instead of elevator to 3rd floor library',
        'Reported dripping tap in 1st floor washroom'
      ]
    };
    res.json({ success: true, data: passport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function submitPledge(req, res) {
  try {
    const { pledgeText } = req.body || {};
    const text = (pledgeText || '').trim();

    // 1. Length validation (at least 12 characters)
    if (!text || text.length < 12) {
      return res.status(400).json({
        success: false,
        error: 'Pledge too short. Please describe a meaningful eco action (minimum 12 characters).'
      });
    }

    // 2. Reject keyboard smashes / repeating garbage (e.g. "asdasdasd", "aaaaaa", "123456")
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please write a complete sentence describing your sustainability commitment (at least 3 words).'
      });
    }

    // Check for repetitive characters
    if (/([a-zA-Z0-9])\1{4,}/.test(text)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid text detected. Please enter a genuine sustainability pledge.'
      });
    }

    // 3. Genuine Sustainability / Eco Relevance Verification
    const ecoKeywords = [
      'light', 'lights', 'fan', 'fans', 'ac', 'air conditioner', 'cooler', 'energy', 'power',
      'electricity', 'switch off', 'turn off', 'shut down', 'isolate', 'solar', 'stair',
      'stairs', 'lift', 'elevator', 'recycle', 'waste', 'plastic', 'water', 'tap', 'leak',
      'cycle', 'bicycle', 'walk', 'walking', 'bus', 'carpool', 'plant', 'tree', 'carbon',
      'emission', 'green', 'conserve', 'conservation', 'saving', 'save', 'unplug', 'charger',
      'paper', 'temperature', '24', 'setpoint', 'segregation', 'garbage', 'compost', 'led',
      'sustainable', 'sustainability', 'daylight', 'natural light'
    ];

    const lowerText = text.toLowerCase();
    const hasEcoIntent = ecoKeywords.some(kw => lowerText.includes(kw));

    if (!hasEcoIntent) {
      return res.status(400).json({
        success: false,
        error: 'Pledge rejected: No sustainability or energy-saving theme detected. Please commit to an eco-friendly campus action (e.g. switching off lights/fans, using stairs, saving water, or waste segregation).'
      });
    }

    // Successfully validated genuine pledge
    res.json({
      success: true,
      pointsAwarded: 25,
      message: 'Verified Eco Pledge accepted! +25 Green Carbon Points credited to your Passport.',
      pledge: text
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
