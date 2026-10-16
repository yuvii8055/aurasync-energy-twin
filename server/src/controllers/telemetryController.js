import { syntheticEngine } from '../services/syntheticEngine.js';

export function getLiveTelemetry(req, res) {
  try {
    const snapshot = syntheticEngine.tick();
    res.json({ success: true, data: snapshot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function setTimeMultiplier(req, res) {
  try {
    const { multiplier } = req.body;
    syntheticEngine.setTimeMultiplier(multiplier);
    res.json({ success: true, multiplier: syntheticEngine.timeMultiplier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function setScenario(req, res) {
  try {
    const { scenario } = req.body;
    syntheticEngine.setScenario(scenario);
    res.json({ success: true, scenario: syntheticEngine.state.activeScenario });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function updateSimulatorSlider(req, res) {
  try {
    const { key, value } = req.body;
    syntheticEngine.updateSlider(key, value);
    res.json({ success: true, state: syntheticEngine.state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getTelemetryHistory(req, res) {
  try {
    // Generate realistic 14 days historical telemetry for DSATM
    const history = [];
    const now = Date.now();
    for (let day = 14; day >= 1; day--) {
      const d = new Date(now - day * 86400000);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const baseConsumptionKwh = isWeekend ? 1400 : 3800;
      const variation = Math.round((Math.sin(day) * 350));
      const realKwh = baseConsumptionKwh + variation;
      const ghostKwh = Math.round(realKwh * (isWeekend ? 0.90 : 0.81));
      const gapKwh = realKwh - ghostKwh;
      const solarKwh = isWeekend ? 650 : 880;

      history.push({
        date: d.toISOString().split('T')[0],
        dayLabel: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        realKwh,
        ghostKwh,
        gapKwh,
        solarKwh,
        costInr: Math.round(realKwh * 8.25),
        co2Kg: Math.round(realKwh * 0.71),
        peakKw: isWeekend ? 110 : 265
      });
    }

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
