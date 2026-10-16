import {
  streamGeminiChat,
  testGeminiHealth,
  getLiveGroundingContext,
  getOfflineFallbackResponse
} from '../services/geminiService.js';
import { syntheticEngine } from '../services/syntheticEngine.js';

/**
 * POST /api/ai/chat
 * Real-time SSE streaming Gemini chatbot with live campus telemetry grounding (Fix 2.2 & 2.3)
 */
export async function handleChatStream(req, res) {
  try {
    const { messages = [], mode = 'CFO', language = 'English' } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required.' });
    }

    // Set Server-Sent Events Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Stream tokens to the client
    await streamGeminiChat({
      messages,
      mode,
      language,
      onToken: (token) => {
        res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
      },
      onAction: (action) => {
        res.write(`data: ${JSON.stringify({ type: 'action', action })}\n\n`);
      },
      onDone: (meta) => {
        res.write(`data: ${JSON.stringify({ type: 'done', ...meta })}\n\n`);
        res.end();
      },
      onError: (err, fallback) => {
        // Send required visible warning banner to UI (Fix 2.1)
        res.write(
          `data: ${JSON.stringify({
            type: 'fallback_warning',
            error: err.message,
            banner: `Gemini unreachable: showing basic offline answer (${err.message})`,
            offlineAnswer: fallback.text,
            action: fallback.action
          })}\n\n`
        );
        res.write(`data: ${JSON.stringify({ type: 'done', isOffline: true, error: err.message })}\n\n`);
        res.end();
      }
    });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    }
  }
}

/**
 * GET /api/ai/status
 * Diagnostics status for Gemini connection (Fix 2.9)
 */
export async function getAiStatus(req, res) {
  try {
    const health = await testGeminiHealth();
    res.json({
      success: true,
      data: health
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai/test
 * Diagnostic test trigger (Fix 2.9)
 */
export async function testAiHealth(req, res) {
  try {
    const health = await testGeminiHealth();
    res.json({
      success: true,
      data: health
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai/advise
 * Legacy endpoint maintained for backward compatibility
 */
export async function getAiAdvice(req, res) {
  try {
    const { query, mode = 'CFO', language = 'English' } = req.body || {};
    const liveContext = getLiveGroundingContext();

    const fallback = getOfflineFallbackResponse({
      query: query || 'Identify top energy waste and give actionable reduction strategy.',
      mode,
      language,
      liveContext,
      errorMsg: process.env.GEMINI_API_KEY ? null : 'GEMINI_API_KEY not configured'
    });

    res.json({
      success: true,
      advice: {
        title: fallback.action?.title || 'Aura AI Realtime Advice',
        summary: fallback.text,
        savingsRsPerHour: fallback.action?.estimatedSavingsRsPerHour || 140,
        savingsKwhPerDay: 180,
        co2SavedKgPerDay: fallback.action?.estimatedCo2KgPerDay || 90,
        effort: 'Low',
        actionSteps: [
          'Verify DSATM Lab 204 thermostat rollback',
          'Shed unoccupied floor circuits'
        ],
        action: fallback.action,
        isOffline: fallback.isOffline,
        error: fallback.error
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
