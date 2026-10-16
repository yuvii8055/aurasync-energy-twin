import { Router } from 'express';
import {
  handleChatStream,
  getAiStatus,
  testAiHealth,
  getAiAdvice
} from '../controllers/aiController.js';

const router = Router();

// Fix 2: Real Gemini SSE Streaming Chatbot
router.post('/chat', handleChatStream);
router.get('/status', getAiStatus);
router.post('/test', testAiHealth);

// Backward-compatible endpoint
router.post('/advise', getAiAdvice);

export default router;
