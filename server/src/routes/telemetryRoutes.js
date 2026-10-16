import { Router } from 'express';
import {
  getLiveTelemetry,
  getTelemetryHistory,
  setTimeMultiplier,
  setScenario,
  updateSimulatorSlider
} from '../controllers/telemetryController.js';

const router = Router();

router.get('/live', getLiveTelemetry);
router.get('/history', getTelemetryHistory);
router.post('/time-multiplier', setTimeMultiplier);
router.post('/scenario', setScenario);
router.post('/slider', updateSimulatorSlider);

export default router;
