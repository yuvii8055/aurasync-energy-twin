// Realistic Campus ESG & Carbon Telemetry Seed Data for DSATM
// Ensures Carbon & Eco Passport page loads instantly with rich data on Vercel

export const initialCarbonSummary = {
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

export const initialPassport = {
  userId: 'usr-hod-1',
  name: 'Dr. Sandhya V.',
  department: 'AIML',
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
    'Switched off classroom fans after 4th period lecture in Lab 204',
    'Took stairs instead of elevator to 3rd floor AIML department',
    'Reported dripping tap in 1st floor washroom for water conservation'
  ]
};

export function getSavedPassport() {
  if (typeof window === 'undefined') return initialPassport;
  try {
    const raw = localStorage.getItem('aurasync_carbon_passport');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.ecoScorePoints) return parsed;
    }
  } catch (e) {
    console.warn('Error reading passport from localStorage:', e);
  }
  savePassport(initialPassport);
  return initialPassport;
}

export function savePassport(passport) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aurasync_carbon_passport', JSON.stringify(passport));
  } catch (e) {
    console.warn('Error saving passport to localStorage:', e);
  }
}
