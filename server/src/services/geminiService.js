import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config(); // fallback to cwd .env

import { syntheticEngine } from './syntheticEngine.js';
import { db } from '../db/store.js';

const DEFAULT_MODEL = 'gemini-3.5-flash';

/**
 * Extract live campus grounding context from synthetic engine and store
 */
export function getLiveGroundingContext() {
  const currentTick = syntheticEngine.tick ? syntheticEngine.tick() : {};
  const campus = currentTick?.campus || {};
  const population = currentTick?.population || {};
  const weather = currentTick?.weather || {};
  const rawBuildings = currentTick?.buildings || {};
  const buildings = Array.isArray(rawBuildings) ? rawBuildings : Object.values(rawBuildings);
  const anomalies = currentTick?.ghostAnomalies || [];
  const tickets = db.tickets || [];
  const openTickets = tickets.filter(t => t.status !== 'resolved');

  return {
    timestamp: new Date().toISOString(),
    simulatedIST: currentTick?.simulatedIST || new Date().toISOString(),
    istHour: currentTick?.istHourFormatted || '12:00',
    campus: {
      name: 'Dayananda Sagar Academy of Technology & Management (DSATM)',
      location: 'Kanakapura Main Road, Udayapura, Bengaluru, Karnataka, India',
      totalRealKw: campus.totalRealKw || 142.5,
      ghostGapKw: campus.ghostGapKw || 34.2,
      idealGhostKw: campus.totalGhostKw || 108.3,
      solarGenerationKw: campus.solarGenerationKw || 78.0,
      gridImportKw: Math.max(0, (campus.totalRealKw || 142) - (campus.solarGenerationKw || 78)),
      costRsPerHour: campus.costRsPerHour || Math.round((campus.totalRealKw || 142) * 8.25),
      co2KgPerHour: Number(((campus.totalRealKw || 142) * 0.71).toFixed(1)),
      ecoModeActive: Boolean(currentTick?.ecoModeActive)
    },
    tariff: {
      provider: 'BESCOM',
      rateInrPerKwh: 8.25,
      timeOfUseZone: 'Normal Peak',
      sanctionedDemandKva: 750,
      emissionFactorKgCo2PerKwh: 0.71
    },
    weather: {
      tempC: weather.tempC || 27.5,
      humidityPct: weather.humidityPct || 62,
      condition: weather.condition || 'Partly Cloudy'
    },
    population: {
      studentsPresent: population.studentsPresent || 650,
      attendancePct: population.attendancePct || 78,
      facultyPresent: population.facultyPresent || 65,
      hostelResidentsPresent: population.hostelOccupancy || 320
    },
    buildings: buildings.map(b => ({
      id: b.id || b.buildingId,
      name: b.name,
      realKw: b.realKw || 0,
      ghostKw: b.ghostKw || 0,
      wasteGapKw: Number(((b.realKw || 0) - (b.ghostKw || 0)).toFixed(1)),
      occupants: b.occupancy || b.occupants || 0,
      activeAnomalies: b.alert && b.alert !== 'normal' ? [b.alert] : []
    })),
    ghostAnomalies: anomalies.map(a => ({
      id: a.id,
      roomId: a.roomId,
      roomName: a.roomName,
      deviceName: a.deviceName,
      wasteKw: a.wasteKw,
      reason: a.reason,
      occupancy: a.occupancy
    })),
    openTicketsCount: openTickets.length,
    recentTickets: openTickets.slice(0, 3).map(t => `${t.title} (${t.priority} in ${t.building})`)
  };
}

/**
 * Construct system prompt with live grounding data and persona mode
 */
export function buildSystemPrompt({ mode = 'CFO', language = 'English', liveContext }) {
  const ctx = liveContext || getLiveGroundingContext();

  let modeInstruction = '';
  switch (mode) {
    case 'CFO':
      modeInstruction = 'PERSONA: CFO / Chief Financial Officer. Prioritize rupee savings (₹ / Rs), peak demand charges (kVA penalties), BESCOM tariff slabs, payback periods, and ROI.';
      break;
    case 'Eco':
      modeInstruction = 'PERSONA: Sustainability & Carbon Officer. Prioritize kg CO2e emissions reduction, rooftop solar self-consumption, Net Zero targets, and ecological footprint.';
      break;
    case 'Engineer':
      modeInstruction = 'PERSONA: Facilities & Electrical Engineer. Prioritize circuit-level diagnostics, kW vs kVA, power factor, HVAC thermostat deltas, and automated relay isolation.';
      break;
    case 'Student':
      modeInstruction = 'PERSONA: Campus Green Ambassador. Speak in an encouraging, educational tone suitable for students, comparing energy waste to relatable everyday units.';
      break;
    default:
      modeInstruction = 'PERSONA: General Energy Expert.';
  }

  let langInstruction = '';
  if (language === 'Hindi') {
    langInstruction = 'LANGUAGE: Respond in Hindi (natural conversational Hindi with technical terms in English or Devanagari).';
  } else if (language === 'Kannada') {
    langInstruction = 'LANGUAGE: Respond in Kannada (ಕನ್ನಡ) with technical terms preserved where common.';
  } else {
    langInstruction = 'LANGUAGE: Respond in English.';
  }

  return `You are Aura AI, the intelligent energy and campus-operations assistant for Dayananda Sagar Academy of Technology and Management (DSATM), Udayapura, Kanakapura Main Road, Bengaluru, Karnataka, India.
Developed by O(1) Outlaws: AIML Engineers of DSATM.

${modeInstruction}
${langInstruction}

MANDATORY RULES:
1. Answer the user's actual question directly, conversationally, and concisely.
2. Use ONLY the supplied LIVE CAMPUS DATA below for numbers. If the data does not contain the answer, say so honestly instead of guessing or hallucinating numbers.
3. Always format currency in Indian Rupees (Rs or ₹) using Indian digit grouping (e.g. Rs 1,25,000).
4. Always format emissions in kg CO2e or tonnes CO2e (grid emission factor: 0.71 kg CO2/kWh).
5. Give specific, quantified, actionable suggestions.
6. NEVER recommend switching off safety-critical loads (server rooms, emergency lighting, fire pumps).
7. If your recommendation includes an actionable step that the user can execute or simulate (e.g. thermostat adjustment, shedding non-critical ghost load, simulating student attendance change), append a structured JSON block at the very end of your response inside \`\`\`json-action ... \`\`\` with:
\`\`\`json-action
{
  "type": "SET_THERMOSTAT" | "SHED_LOAD" | "SIMULATE" | "ECO_SWITCH",
  "title": "Short action label",
  "target": "target-device-or-room-id",
  "params": { "tempC": 26, "acReductionPct": 20, "students": 450 },
  "estimatedSavingsRsPerHour": 140,
  "estimatedCo2KgPerDay": 95
}
\`\`\`

LIVE CAMPUS DATA AS OF ${ctx.timestamp} (Simulated IST: ${ctx.istHour}):
\`\`\`json
${JSON.stringify(ctx, null, 2)}
\`\`\``;
}

/**
 * Offline rule-based fallback when Gemini API is unreachable or key is unset
 */
export function getOfflineFallbackResponse({ query, mode, language, liveContext, errorMsg }) {
  const ctx = liveContext || getLiveGroundingContext();
  const topWasteBuilding = [...ctx.buildings].sort((a, b) => b.wasteGapKw - a.wasteGapKw)[0];
  const q = (query || '').toLowerCase();

  let text = '';
  let action = null;

  if (q.includes('which block') || q.includes('most power') || q.includes('waste')) {
    text = `Based on live telemetry, **${topWasteBuilding?.name || 'DSATM Main Block'}** has the highest energy waste right now with a ghost gap of **${topWasteBuilding?.wasteGapKw || 18.4} kW** (consuming ${topWasteBuilding?.realKw} kW against an ideal baseline of ${topWasteBuilding?.ghostKw} kW with ${topWasteBuilding?.occupants || 0} occupants).\n\nTop waste contributors: ${topWasteBuilding?.activeAnomalies?.join(', ') || 'Unoccupied AC units and empty lab lighting'}.`;
    action = {
      type: 'SHED_LOAD',
      title: `Isolate Ghost Loads in ${topWasteBuilding?.name || 'Main Block'}`,
      target: topWasteBuilding?.id || 'dsatm-main',
      params: { deviceId: 'dev-m204-ac' },
      estimatedSavingsRsPerHour: Math.round((topWasteBuilding?.wasteGapKw || 18) * 8.25),
      estimatedCo2KgPerDay: Math.round((topWasteBuilding?.wasteGapKw || 18) * 0.71 * 8)
    };
  } else if (q.includes('ac to 26') || q.includes('thermostat') || q.includes('temperature') || q.includes('bill')) {
    const savingsKw = 16.5;
    const savingsRsPerHr = Math.round(savingsKw * 8.25);
    const savingsRsPerMonth = savingsRsPerHr * 8 * 26;
    text = `Setting campus thermostats from 22°C to **26°C** achieves a **~24% reduction in HVAC compressor load**, saving approximately **${savingsKw} kW** across DSATM academic blocks.\n\n- **Hourly Savings:** ₹${savingsRsPerHr}/hr\n- **Monthly Bill Impact:** ~₹${savingsRsPerMonth.toLocaleString('en-IN')}\n- **CO2 Avoided:** ${(savingsKw * 0.71 * 8).toFixed(1)} kg CO2e daily.\n\nRecommended: Apply thermostat rollback via digital relay schedule.`;
    action = {
      type: 'SET_THERMOSTAT',
      title: 'Set Campus HVAC Baseline to 26°C',
      target: 'campus-wide-hvac',
      params: { tempC: 26 },
      estimatedSavingsRsPerHour: savingsRsPerHr,
      estimatedCo2KgPerDay: Math.round(savingsKw * 0.71 * 8)
    };
  } else if (q.includes('carbon') || q.includes('scope 2')) {
    text = `**Scope 2 Carbon Emissions** are indirect greenhouse gas emissions from purchased electricity consumed by DSATM from the BESCOM grid.\n\n- **Current Campus Consumption:** ${ctx.campus.totalRealKw} kW\n- **Current Grid Carbon Factor:** 0.71 kg CO2/kWh\n- **Campus Hourly Scope 2 Footprint:** ${ctx.campus.co2KgPerHour} kg CO2e/hr\n- **Solar Offset:** ${ctx.campus.solarGenerationKw} kW rooftop solar is currently mitigating ${(ctx.campus.solarGenerationKw * 0.71).toFixed(1)} kg CO2e/hr.\n\nEvery 1 kWh conserved on campus directly prevents 0.71 kg of CO2 from entering Bengaluru's atmosphere.`;
  } else {
    text = `Hello! I am monitoring DSATM's campus twin. Current total demand is **${ctx.campus.totalRealKw} kW** (₹${ctx.campus.costRsPerHour}/hr) with **${ctx.campus.ghostGapKw} kW** in identified ghost-gap waste across ${ctx.population.studentsPresent} students present.\n\nAsk me about building waste, solar generation, thermostat adjustments, or carbon reduction strategies!`;
  }

  return {
    text,
    action,
    error: errorMsg || 'Gemini API key not configured in server/.env',
    isOffline: true
  };
}

/**
 * Stream Gemini Chat with Live Grounding Context
 */
export async function streamGeminiChat({
  messages = [],
  mode = 'CFO',
  language = 'English',
  onToken,
  onAction,
  onDone,
  onError
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const liveContext = getLiveGroundingContext();
  const startTime = Date.now();

  // If API key is not configured, immediately use offline fallback with required visible warning
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const fallback = getOfflineFallbackResponse({
      query: messages[messages.length - 1]?.content || '',
      mode,
      language,
      liveContext,
      errorMsg: 'GEMINI_API_KEY is not configured in server/.env'
    });

    if (onToken) onToken(fallback.text);
    if (fallback.action && onAction) onAction(fallback.action);
    if (onDone) {
      onDone({
        model: 'offline-rule-engine',
        latencyMs: Date.now() - startTime,
        isOffline: true,
        error: fallback.error
      });
    }
    return;
  }

  try {
    const systemInstruction = buildSystemPrompt({ mode, language, liveContext });

    // Format chat history for Google Gemini API
    // Cap at last 20 messages
    const trimmedMessages = messages.slice(-20);
    const contents = trimmedMessages.map((m) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.content).slice(0, 1500) }]
    }));

    const candidateModels = Array.from(new Set([modelName, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']));
    let response = null;
    let chosenModel = modelName;

    for (const cand of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cand}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 1200
          }
        })
      });

      if (res.ok) {
        response = res;
        chosenModel = cand;
        break;
      } else {
        const errTxt = await res.text();
        console.warn(`Model ${cand} failed (${res.status}): ${errTxt.slice(0, 100)}`);
      }
    }

    if (!response || !response.ok) {
      throw new Error(`All Gemini models unavailable for current API key.`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep remainder

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textChunk) {
              accumulatedText += textChunk;
              if (onToken) onToken(textChunk);
            }
          } catch {
            // Incomplete JSON chunk
          }
        }
      }
    }

    // Check for structured json-action block
    const actionMatch = accumulatedText.match(/```json-action\s*([\s\S]*?)\s*```/);
    if (actionMatch && actionMatch[1]) {
      try {
        const actionObj = JSON.parse(actionMatch[1]);
        if (onAction) onAction(actionObj);
      } catch (err) {
        console.warn('Action parsing error:', err.message);
      }
    }

    if (onDone) {
      onDone({
        model: modelName,
        latencyMs: Date.now() - startTime,
        isOffline: false
      });
    }
  } catch (err) {
    console.warn('Gemini stream failed, falling back to offline rule-engine:', err.message);

    // Call fallback with required visible error
    const fallback = getOfflineFallbackResponse({
      query: messages[messages.length - 1]?.content || '',
      mode,
      language,
      liveContext,
      errorMsg: err.message
    });

    if (onError) {
      onError(err, fallback);
    } else {
      if (onToken) onToken(`\n\n${fallback.text}`);
      if (fallback.action && onAction) onAction(fallback.action);
      if (onDone) {
        onDone({
          model: 'offline-fallback',
          latencyMs: Date.now() - startTime,
          isOffline: true,
          error: err.message
        });
      }
    }
  }
}

/**
 * Ping test to measure Gemini API availability and round-trip latency
 */
export async function testGeminiHealth() {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const startTime = Date.now();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      connected: false,
      configured: false,
      model: modelName,
      latencyMs: 0,
      message: 'GEMINI_API_KEY is not configured in server/.env'
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping test: reply with "PONG"' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
      return {
        connected: true,
        configured: true,
        model: modelName,
        latencyMs,
        message: reply
      };
    } else {
      const err = await res.text();
      return {
        connected: false,
        configured: true,
        model: modelName,
        latencyMs,
        message: `HTTP ${res.status}: ${err.slice(0, 150)}`
      };
    }
  } catch (err) {
    return {
      connected: false,
      configured: true,
      model: modelName,
      latencyMs: Date.now() - startTime,
      message: err.message
    };
  }
}
