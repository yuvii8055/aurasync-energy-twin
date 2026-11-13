// Aura AI Client-Side Autonomous Campus Brain
// Multilingual (English, Hindi, Kannada) intelligence engine for DSATM Campus Digital Twin

export async function generateAuraResponse({ prompt, mode = 'CFO', language = 'English', onToken, signal }) {
  const q = (prompt || '').toLowerCase().trim();

  // Try direct Gemini client-side fetch if user provided key or default key is valid
  const localKey = (typeof window !== 'undefined' && localStorage.getItem('aurasync_gemini_key')) || '';
  if (localKey && localKey.length > 20) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${localKey}`;
      const systemInstruction = `You are Aura AI, the Digital Twin Campus Intelligence for Dayananda Sagar Academy of Technology & Management (DSATM), Bangalore.
Department of Computer Science & Engineering (AIML), led by Dr. Sandhya V.
Mode: ${mode}. Language: Respond strictly in ${language}.
Provide helpful, professional, campus-specific insights on campus power, solar generation (82 kW active), ghost loads in Lab 204, BESCOM tariffs (₹8.25/kWh), and SLA helpdesk tickets.`;

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }]
            }
          ]
        }),
        signal
      });

      if (res.ok) {
        const json = await res.json();
        const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          // Stream tokens character by character
          await streamText(candidate, onToken, signal);
          return { text: candidate, isOffline: false, action: getContextAction(q) };
        }
      }
    } catch (e) {
      console.info('Direct Gemini API fallback to grounded local engine:', e.message);
    }
  }

  // Grounded Multi-Lingual Expert Fallback Engine
  let answer = '';
  let action = null;

  if (language === 'Hindi' || /[\u0900-\u097F]/.test(prompt)) {
    // HINDI (हिन्दी)
    if (q.includes('ac') || q.includes('lab') || q.includes('ghost') || q.includes('एसी') || q.includes('लैब')) {
      answer = `### 🏢 डी.एस.ए.टी.एम. (DSATM) लैब 204 ऊर्जा विश्लेषण:
- **घोस्ट लोड का पता चला:** एंबेडेड सिस्टम्स लैब 204 में 2.0 टन स्प्लिट एसी 18°C पर बिना किसी छात्र (0 ऑक्यूपेंसी) के 35 मिनट से चल रहा है।
- **ऊर्जा बर्बादी:** 1,950 वाट (~₹16.2 प्रति घंटा)।
- **सिफारिश:** ऑरा एआई के माध्यम से तुरंत स्मार्ट रिले को आइसोलेट करें ताकि ऊर्जा और कार्बन उत्सर्जन बचाया जा सके।
- **कार्रवाई:** नीचे दिए गए बटन पर क्लिक करके एसी बंद करें।`;
      action = {
        label: 'लैब 204 एसी बंद करें (Switch Off)',
        type: 'device_control',
        payload: { deviceId: 'ac-main-204', state: false }
      };
    } else if (q.includes('solar') || q.includes('सोलर') || q.includes('धूप') || q.includes('power') || q.includes('बिजली')) {
      answer = `### ☀️ डी.एस.ए.टी.एम. रूफटॉप सौर ऊर्जा टेलीमेट्री:
- **सक्रिय उत्पादन:** वर्तमान में 82 किलोवाट (kW) सौर ऊर्जा मुख्य भवन से उत्पन्न हो रही है।
- **ग्रिड ऑफसेट:** कुल परिसर मांग (412 kW) का लगभग 20% स्वच्छ सौर ऊर्जा से पूरा हो रहा है।
- **कार्बन की बचत:** आज अब तक 140 किग्रा CO2 का उत्सर्जन रोका गया है।
- **सर्वोत्तम समय:** 11:00 से 14:30 के बीच सौर ऊर्जा चरम पर रहती है, ईवी चार्जिंग और पानी पंपिंग इसी समय करें।`;
      action = {
        label: 'ईएसजी कार्बन रिपोर्ट देखें',
        type: 'navigate',
        payload: { path: '/carbon' }
      };
    } else {
      answer = `### 🤖 ऑरा एआई (DSATM AIML कैंपस इंटेलिजेंस):
नमस्ते! मैं दयानंद सागर एकेडमी ऑफ टेक्नोलॉजी एंड मैनेजमेंट (DSATM) का ऑरा डिजिटल ट्विन एआई हूँ।
- **विभाग:** कंप्यूटर साइंस एंड इंजीनियरिंग (AIML) - डॉ. संध्या वी.
- **कैंपस पावर:** कुल भार 412 kW, 82 kW सोलर उत्पादन चालू है।
- **हेल्पडेस्क:** एसएलए कानबान बोर्ड पर 20+ टिकट सक्रिय रूप से प्रबंधित हैं।
- आप मुझसे ऊर्जा बचत, लैब 204 एसी, सौर ऊर्जा, लिफ्ट या मेंटेनेंस के बारे में हिन्दी में पूछ सकते हैं।`;
      action = {
        label: 'कानबान बोर्ड खोलें',
        type: 'navigate',
        payload: { path: '/helpdesk/board' }
      };
    }
  } else if (language === 'Kannada' || /[\u0C80-\u0CFF]/.test(prompt)) {
    // KANNADA (ಕನ್ನಡ)
    if (q.includes('ac') || q.includes('lab') || q.includes('ghost') || q.includes('ಎಸಿ') || q.includes('ಲ್ಯಾಬ್')) {
      answer = `### 🏢 ಡಿ.ಎಸ್.ಎ.ಟಿ.ಎಂ (DSATM) ಲ್ಯಾಬ್ 204 ಶಕ್ತಿ ವಿಶ್ಲೇಷಣೆ:
- **ಗೋಸ್ಟ್ ಲೋಡ್ ಪತ್ತೆ:** ಎಂಬೆಡೆಡ್ ಸಿಸ್ಟಮ್ಸ್ ಲ್ಯಾಬ್ 204 ರಲ್ಲಿ 0 ವಿದ್ಯಾರ್ಥಿಗಳಿದ್ದರೂ 2.0T ಸ್ಪ್ಲಿಟ್ ಎಸಿ 18°C ನಲ್ಲಿ ಚಾಲನೆಯಲ್ಲಿದೆ.
- **ವಿದ್ಯುತ್ ವ್ಯರ್ಥ:** 1,950 ವ್ಯಾಟ್ಸ್ (~₹16.2 ಪ್ರತಿ ಗಂಟೆಗೆ).
- **ಶಿಫಾರಸು:** ಶಕ್ತಿ ಸಂರಕ್ಷಣೆಗಾಗಿ ಸ್ಮಾರ್ಟ್ ರಿಲೇ ಮೂಲಕ ಎಸಿ ತಕ್ಷಣ ಆಫ್ ಮಾಡಿ.
- **ಕ್ರಮ:** ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಲ್ಯಾಬ್ 204 ಎಸಿ ನಿಯಂತ್ರಿಸಿ.`;
      action = {
        label: 'ಲ್ಯಾಬ್ 204 ಎಸಿ ಆಫ್ ಮಾಡಿ (Isolate)',
        type: 'device_control',
        payload: { deviceId: 'ac-main-204', state: false }
      };
    } else if (q.includes('solar') || q.includes('ಸೌರ') || q.includes('ಬೆಳಕು') || q.includes('power') || q.includes('ವಿದ್ಯುತ್')) {
      answer = `### ☀️ ಡಿ.ಎಸ್.ಎ.ಟಿ.ಎಂ ಕ್ಯಾಂಪಸ್ ಸೌರಶಕ್ತಿ ವಿವರ:
- **ಲೈವ್ ಉತ್ಪಾದನೆ:** ಮುಖ್ಯ ಬ್ಲಾಕ್ ಮೇಲ್ಛಾವಣಿಯ ಸೋಲಾರ್ ಪ್ಯಾನೆಲ್‌ಗಳಿಂದ 82 kW ಸ್ವಚ್ಛ ವಿದ್ಯುತ್ ಲಭ್ಯವಿದೆ.
- **ಗ್ರಿಡ್ ಉಳಿತಾಯ:** ಒಟ್ಟು ಬಳಕೆಯ 20% ಸೋಲಾರ್ ಮೂಲಕ ಪೂರೈಕೆಯಾಗುತ್ತಿದೆ.
- **ಇಂಗಾಲ ತಗ್ಗಿಸುವಿಕೆ:** ಇಂದು 140 ಕೆಜಿ CO2 ವಾತಾವರಣಕ್ಕೆ ಸೇರುವುದನ್ನು ತಡೆಯಲಾಗಿದೆ.
- **ಶಿಫಾರಸು:** ಬೆಳಿಗ್ಗೆ 11:00 ರಿಂದ ಮಧ್ಯಾಹ್ನ 2:30 ರವರೆಗೆ ನೀರಿನ ಪಂಪ್ ಮತ್ತು ಇವಿ ಚಾರ್ಜಿಂಗ್ ಸೂಕ್ತ ಸಮಯ.`;
      action = {
        label: 'ಇಎಸ್‌ಜಿ ಕಾರ್ಬನ್ ವರದಿ ಪರಿಶೀಲಿಸಿ',
        type: 'navigate',
        payload: { path: '/carbon' }
      };
    } else {
      answer = `### 🤖 ಔರಾ ಎಐ (DSATM AIML ಕ್ಯಾಂಪಸ್ ಡಿಜಿಟಲ್ ಟ್ವಿನ್):
ನಮಸ್ಕಾರ! ದಯಾನಂದ ಸಾಗರ್ ಅಕಾಡೆಮಿ ಆಫ್ ಟೆಕ್ನಾಲಜಿ ಅಂಡ್ ಮ್ಯಾನೇಜ್ಮೆಂಟ್ (DSATM) ಕ್ಯಾಂಪಸ್ ಇಂಟೆಲಿಜೆನ್ಸ್‌ಗೆ ಸುಸ್ವಾಗತ.
- **ವಿಭಾಗ:** ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ & ಇಂಜಿನಿಯರಿಂಗ್ (AIML) - ಡಾ. ಸಂಧ್ಯಾ ವಿ. (HOD)
- **ಕ್ಯಾಂಪಸ್ ವಿದ್ಯುತ್:** ಒಟ್ಟು ಲೋಡ್ 412 kW, ಸೌರಶಕ್ತಿ 82 kW ಲಭ್ಯ.
- **ಹೆಲ್ಪ್‌ಡೆಸ್ಕ್:** 20+ ಟಿಕೆಟ್‌ಗಳು SLA ಕಾನ್‌ಬಾನ್ ಬೋರ್ಡ್‌ನಲ್ಲಿ ಪರಿಶೀಲನೆ ಹಂತದಲ್ಲಿವೆ.
- ನೀವು ಶಕ್ತಿ ಉಳಿತಾಯ, ಲ್ಯಾಬ್ ಎಸಿ ಅಥವಾ ಕ್ಯಾಂಪಸ್ ನಿರ್ವಹಣೆ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.`;
      action = {
        label: 'ಕಾನ್‌ಬಾನ್ ಬೋರ್ಡ್ ತೆರೆಯಿರಿ',
        type: 'navigate',
        payload: { path: '/helpdesk/board' }
      };
    }
  } else {
    // ENGLISH
    if (q.includes('ghost') || q.includes('204') || q.includes('ac') || q.includes('isolate') || q.includes('empty')) {
      answer = `### 🏢 Lab 204 Energy Ghost Anomaly Diagnostic:
- **Root Cause Identified:** Embedded Systems Lab 204 split AC unit is running at 18°C while Computer Vision occupancy sensor detects **0 occupants** for over 35 continuous minutes.
- **Wasted Power:** **1.95 kW** (costing ₹16.20/hour under BESCOM HT Academic Tariff).
- **Emissions Rate:** Adding 1.38 kg CO2e per hour to the AIML department's scope-2 carbon ledger.
- **Recommended Action:** Execute remote relay cutoff to prevent an estimated ₹240 daily idle loss.`;
      action = {
        label: 'Isolate Lab 204 AC Relay Now',
        type: 'device_control',
        payload: { deviceId: 'ac-main-204', state: false }
      };
    } else if (q.includes('solar') || q.includes('cleanest') || q.includes('sun') || q.includes('renewable')) {
      answer = `### ☀️ DSATM Campus Rooftop Solar Array Telemetry:
- **Active Real-Time Generation:** **82.4 kW** (Peak irradiance conditions across Main & Mech Block arrays).
- **Demand Offset:** Offsetting **20.4%** of the campus's active 412 kW load.
- **Avoided Emissions Today:** **148.6 kg CO2e** CEA baseline equivalent.
- **Cleanest Carbon Window:** **11:00 to 14:30 IST** has the lowest grid carbon intensity (0.28 kg/kWh). Recommended for EV hub charging and basement water pump cycles.`;
      action = {
        label: 'Download Green Audit ESG Report (PDF)',
        type: 'navigate',
        payload: { path: '/carbon' }
      };
    } else if (q.includes('kanban') || q.includes('ticket') || q.includes('worker') || q.includes('dispatch') || q.includes('helpdesk')) {
      answer = `### 📋 AIML Department SLA Kanban & Incident Dispatch:
- **Queue Status:** 20+ tickets logged across Garbage & Waste, Energy Waste, Lifts, and Washrooms.
- **Workforce Availability:** 10 of 12 campus technicians currently active on duty.
- **Lead Electrician:** Manjunath Gowda (Morning shift, 2 work orders assigned).
- **Auto-Routing:** Smart-assigns tickets instantly using proximity and skill matrix matching.`;
      action = {
        label: 'Open Incident Dispatch Kanban',
        type: 'navigate',
        payload: { path: '/helpdesk/board' }
      };
    } else if (q.includes('cost') || q.includes('bill') || q.includes('cfo') || q.includes('tariff') || q.includes('money')) {
      answer = `### 💰 CFO Financial Optimization Summary:
- **Current Run Rate:** ₹3,399/hour under BESCOM HT-2(a) Academic tariff.
- **Sanctioned Demand:** 750 kVA (currently operating comfortably at 55% peak demand headroom).
- **Monthly Savings Target:** On track to save **₹1,42,800/month** through automated daylight harvesting and unoccupied room HVAC shutdowns.`;
      action = {
        label: 'Review Master Switch Passkey Authorization',
        type: 'open_master_switch'
      };
    } else {
      answer = `### ⚡ Aura AI Campus Intelligence • DSATM Digital Twin:
- **Host Institution:** Dayananda Sagar Academy of Technology & Management (DSATM), Bangalore.
- **Department:** Computer Science & Engineering (AIML), guided by **Dr. Sandhya V.**
- **Active Telemetry:** Campus load is **412 kW**, rooftop solar generating **82 kW**, and grid carbon intensity is 0.58 kg CO2/kWh.
- **How I can help:** Ask about Lab 204 AC ghost load, rooftop solar generation, incident Kanban dispatch, or download the campus ESG report!`;
      action = {
        label: 'Review Live SLA Kanban',
        type: 'navigate',
        payload: { path: '/helpdesk/board' }
      };
    }
  }

  // Stream text smoothly with realistic typing latency
  await streamText(answer, onToken, signal);
  return { text: answer, isOffline: true, action };
}

function getContextAction(q) {
  if (q.includes('ac') || q.includes('lab') || q.includes('ghost')) {
    return { label: 'Isolate Lab 204 AC', type: 'device_control', payload: { deviceId: 'ac-main-204', state: false } };
  }
  if (q.includes('ticket') || q.includes('kanban') || q.includes('worker')) {
    return { label: 'Open Dispatch Kanban', type: 'navigate', payload: { path: '/helpdesk/board' } };
  }
  return { label: 'Explore ESG Carbon Twin', type: 'navigate', payload: { path: '/carbon' } };
}

async function streamText(fullText, onToken, signal) {
  const words = fullText.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) break;
    const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
    if (onToken) onToken(chunk);
    // Smooth delay between words (12-25ms)
    await new Promise((r) => setTimeout(r, 15));
  }
}
