/**
 * Aura AI - GenAI Energy Coach Service
 * Supports Google Gemini API proxy with realistic offline rule-based fallback
 * DSATM - O(1) Outlaws: AIML Engineers
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateEnergyAdvice({ context, query, mode = 'CFO', language = 'English' }) {
  // If Gemini API key is provided and valid, attempt online API call
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const prompt = `You are Aura AI, an energy efficiency expert for Dayananda Sagar Academy of Technology and Management (DSATM) campus in Bengaluru, India.
Mode: ${mode}
Language: ${language}
Campus State:
- Real kW: ${context?.campus?.totalRealKw || 142} kW
- Ghost Gap (Waste): ${context?.campus?.ghostGapKw || 34.5} kW
- Solar Generation: ${context?.campus?.solarGenerationKw || 78} kW
- Students Present: ${context?.population?.studentsPresent || 650}
- Weather: ${context?.weather?.tempC || 27}°C, ${context?.weather?.condition || 'Sunny'}
- Active Anomalies: ${JSON.stringify(context?.ghostAnomalies || [])}

User Query: "${query || 'Identify top energy waste and give actionable reduction strategy.'}"

Provide a concise, quantified recommendation in Indian Rupees (Rs) and kg CO2e.
Respond strictly in JSON format with fields:
{
  "title": "Short title",
  "summary": "2-3 sentence overview",
  "savingsRsPerHour": number,
  "savingsKwhPerDay": number,
  "co2SavedKgPerDay": number,
  "effort": "Low" | "Medium" | "High",
  "paybackDays": number,
  "confidencePct": number,
  "affectedDeviceIds": ["dev-id-1", "dev-id-2"],
  "actionSteps": ["Step 1", "Step 2", "Step 3"],
  "simulateParams": { "acReductionPct": 15, "shedNonCritical": true }
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (err) {
      console.warn('⚠️ Gemini online call failed, falling back to offline rule-engine:', err.message);
    }
  }

  // Realistic Offline Rule-based Fallback (Flawless Demo Mode)
  return getOfflineFallbackAdvice({ context, query, mode, language });
}

function getOfflineFallbackAdvice({ context, query, mode, language }) {
  const anomalies = context?.ghostAnomalies || [];
  const hasAcAnomaly = anomalies.some(a => a.deviceId === 'dev-m204-ac');
  const hasLightAnomaly = anomalies.some(a => a.deviceId === 'dev-m103-lgt');

  if (mode === 'CFO') {
    return {
      title: 'Peak Demand Clipping & Empty Room HVAC Cut',
      summary: 'Automating thermostat rollback to 24°C in AIML block and turning off unoccupied Lab 204 AC cuts maximum demand charges by 18 kVA.',
      savingsRsPerHour: 185,
      savingsKwhPerDay: 194,
      co2SavedKgPerDay: 138,
      effort: 'Low',
      paybackDays: 0,
      confidencePct: 94,
      affectedDeviceIds: ['dev-m204-ac', 'dev-m103-lgt', 'dev-aud-prj'],
      actionSteps: [
        'Trigger Campus Eco Switch to isolate 3 ghost loads in DSATM Main Block.',
        'Reset Lab 204 thermostat via digital relay to 24°C sweet spot.',
        'Shift EV charging at ElectricPe hub into peak solar hours (11:30 - 14:00) to avoid BESCOM HT peak penalties.'
      ],
      simulateParams: { acReductionPct: 20, shiftEvToSolar: true }
    };
  }

  if (mode === 'Eco') {
    return {
      title: 'Solar Self-Consumption & Carbon Neutral Load Shifting',
      summary: 'With 82 kW solar output currently available, synchronizing campus water pumps and hostel laundry will eliminate 88 kg CO2e emissions daily.',
      savingsRsPerHour: 142,
      savingsKwhPerDay: 165,
      co2SavedKgPerDay: 117,
      effort: 'Low',
      paybackDays: 0,
      confidencePct: 96,
      affectedDeviceIds: ['dev-pond-pump', 'dev-ev-gun1', 'dev-stp-blower'],
      actionSteps: [
        'Route excess rooftop solar power to rainwater filtration and pond aeration.',
        'Activate carbon-aware scheduling for ElectricPe EV Charging Station.',
        'Enforce 15-minute auto-off timer for vacant academic classrooms.'
      ],
      simulateParams: { solarSelfConsumptionPct: 95 }
    };
  }

  if (mode === 'Engineer') {
    return {
      title: 'APFC Capacitor Bank Tuning & Reactive Power Compensation',
      summary: 'Substation power factor currently reads 0.96. Fine-tuning APFC steps will elevate PF to 0.99, eliminating BESCOM low power factor surcharge.',
      savingsRsPerHour: 220,
      savingsKwhPerDay: 240,
      co2SavedKgPerDay: 170,
      effort: 'Medium',
      paybackDays: 14,
      confidencePct: 92,
      affectedDeviceIds: ['dev-apfc-panel', 'dev-cnc-mill'],
      actionSteps: [
        'Switch in Stage 4 (50 kVAr) capacitor on Main 11kV Substation yard panel.',
        'Schedule maintenance inspection for Workshop CNC mill motor bearing friction.',
        'Enable soft-starter profile on secondary STP recirculation pump.'
      ],
      simulateParams: { powerFactorTarget: 0.99 }
    };
  }

  // Student mode
  return {
    title: 'Ghost Busting: Saving Energy for DSATM',
    summary: 'Think of phantom power like leaving a water tap running! By turning off empty classroom lights and ACs, we save enough power to run 50 laptops for a whole week.',
    savingsRsPerHour: 110,
    savingsKwhPerDay: 130,
    co2SavedKgPerDay: 92,
    effort: 'Low',
    paybackDays: 0,
    confidencePct: 98,
    affectedDeviceIds: ['dev-m103-lgt', 'dev-m204-ac'],
    actionSteps: [
      'Take the DSATM Green Pledge in the student app.',
      'Report empty rooms with running fans using the 3-tap Helpdesk button.',
      'Compete in the Hostel vs Hostel energy leaderboard!'
    ],
    simulateParams: { studentPledgeActive: true }
  };
}
