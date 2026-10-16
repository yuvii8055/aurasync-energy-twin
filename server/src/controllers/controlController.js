import { syntheticEngine } from '../services/syntheticEngine.js';
import { db, saveDatabaseToFile } from '../db/store.js';

export function toggleDevice(req, res) {
  try {
    const { deviceId, state } = req.body;
    if (!deviceId || !state) {
      return res.status(400).json({ success: false, error: 'deviceId and state are required' });
    }

    const success = syntheticEngine.toggleDevice(deviceId, state);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const actionRecord = {
      id: `act-${Date.now()}`,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: `Set device ${deviceId} to ${state}`,
      scope: 'device',
      timestamp: new Date().toISOString()
    };
    db.controlActions.unshift(actionRecord);
    saveDatabaseToFile();

    res.json({ success: true, deviceId, state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function campusMasterEcoSwitch(req, res) {
  try {
    const { enable = true } = req.body;
    const result = syntheticEngine.applyCampusEcoMode(enable);

    const actionRecord = {
      id: `act-eco-${Date.now()}`,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: enable ? 'Activated Campus Eco Mode' : 'Restored Campus Normal Mode',
      scope: 'campus',
      details: result,
      timestamp: new Date().toISOString(),
      canUndoUntil: new Date(Date.now() + 60000).toISOString()
    };
    db.controlActions.unshift(actionRecord);
    saveDatabaseToFile();

    // Broadcast event over socket
    if (syntheticEngine.io) {
      syntheticEngine.io.emit('island:event', {
        type: 'AUTO_CONTROL',
        title: enable ? 'Campus Eco Switch Activated' : 'Campus Mode Restored',
        message: enable
          ? `Auto-shed ${result.switchedOffCount} non-critical loads: saved ${Math.round((result.wattsSaved / 1000) * 8.25)} Rs/hr`
          : 'Standard operational timetable restored across campus.',
        severity: 'info',
        actionId: actionRecord.id
      });
    }

    res.json({
      success: true,
      message: enable ? 'Campus Eco Mode successfully armed & activated' : 'Restored standard campus state',
      data: result,
      actionId: actionRecord.id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function emergencyShutdown(req, res) {
  try {
    const { reason = 'Emergency Drill / Overload Prevention' } = req.body;
    const result = syntheticEngine.applyCampusEcoMode(true);

    const actionRecord = {
      id: `act-emg-${Date.now()}`,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: `EMERGENCY CUT: ${reason}`,
      scope: 'campus_emergency',
      timestamp: new Date().toISOString()
    };
    db.controlActions.unshift(actionRecord);
    saveDatabaseToFile();

    if (syntheticEngine.io) {
      syntheticEngine.io.emit('island:event', {
        type: 'SECURITY',
        title: 'EMERGENCY CAMPUS OVERRIDE',
        message: `Triggered by ${req.user.name} (${req.user.role.toUpperCase()}): Non-critical circuits isolated. Emergency lights unlocked.`,
        severity: 'critical',
        actionId: actionRecord.id
      });
    }

    res.json({ success: true, message: 'Emergency campus isolation executed', details: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function undoControlAction(req, res) {
  try {
    const { actionId } = req.body;
    const action = db.controlActions.find(a => a.id === actionId);
    if (!action) {
      return res.status(404).json({ success: false, error: 'Action record not found' });
    }

    if (action.canUndoUntil && new Date(action.canUndoUntil) < new Date()) {
      return res.status(400).json({ success: false, error: 'Undo window (60s) has expired' });
    }

    syntheticEngine.applyCampusEcoMode(false);
    action.undone = true;
    saveDatabaseToFile();

    res.json({ success: true, message: 'Action successfully reversed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getControlAuditLogs(req, res) {
  res.json({ success: true, data: db.controlActions });
}
