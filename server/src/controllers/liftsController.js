import { db, saveDatabaseToFile } from '../db/store.js';
import { syntheticEngine } from '../services/syntheticEngine.js';

export function getAllLifts(req, res) {
  res.json({ success: true, count: db.lifts.length, data: db.lifts });
}

export function triggerLiftEmergency(req, res) {
  try {
    const { id } = req.params;
    const lift = db.lifts.find(l => l.id === id);
    if (!lift) {
      return res.status(404).json({ success: false, error: 'Lift not found' });
    }

    lift.status = 'fault';
    lift.faultCode = 'ERR_ENTRAPMENT_SAFETY_STOP';
    lift.emergencyTrapped = true;

    // Create emergency ticket automatically
    const ticketNumber = 100 + db.tickets.length + 1;
    const ticketId = `AS-2026-${String(ticketNumber).padStart(6, '0')}`;
    const emgTicket = {
      ticketId,
      category: 'Lifts and Elevators',
      subcategory: 'Passenger Entrapment (EMERGENCY)',
      title: `🚨 EMERGENCY: Entrapment reported in ${lift.name} (${lift.buildingId})`,
      description: `Lift ${lift.name} registered safety trip stopped at floor ${lift.currentFloor}. Technician dispatched immediately.`,
      locationRef: {
        buildingId: lift.buildingId,
        floor: lift.currentFloor,
        roomId: `${lift.name} Shaft`,
        pin3D: { x: lift.buildingId === 'dsatm-main' ? -50 : 65, y: 8, z: lift.buildingId === 'dsatm-main' ? 45 : 105 }
      },
      urgency: 'emergency',
      status: 'assigned',
      reporterId: req.user.id,
      reporterName: req.user.name,
      anonymous: false,
      assignedHodId: 'usr-admin-1',
      assignedWorkerId: 'w-4', // Gopal Reddy (Lift Tech)
      slaDueAt: new Date(Date.now() + 15 * 60000).toISOString(), // 15 min emergency SLA
      media: [],
      beforeMedia: [],
      afterMedia: [],
      rating: null,
      timeline: [
        {
          status: 'new',
          byUserId: req.user.id,
          byUserName: req.user.name,
          at: new Date().toISOString(),
          note: 'Emergency entrapment sensor triggered'
        },
        {
          status: 'assigned',
          byUserId: 'system',
          byUserName: 'Emergency Protocol',
          at: new Date().toISOString(),
          note: 'Auto-assigned to Gopal Reddy (Lift Technician). Siren dispatched.'
        }
      ]
    };

    db.tickets.unshift(emgTicket);
    saveDatabaseToFile();

    // Broadcast instant multi-role siren alert over socket
    if (syntheticEngine.io) {
      syntheticEngine.io.emit('lift:emergency', { lift, ticket: emgTicket });
      syntheticEngine.io.emit('ticket:new', emgTicket);
      syntheticEngine.io.emit('island:event', {
        type: 'SECURITY',
        title: '🚨 SIREN: LIFT ENTRAPMENT REPORTED',
        message: `${lift.name} stuck at Floor ${lift.currentFloor}. Technician dispatched!`,
        severity: 'critical',
        ticketId: emgTicket.ticketId
      });
    }

    res.json({
      success: true,
      message: 'Emergency protocol initiated. Siren broadcast to Admin, HOD, and Technicians.',
      lift,
      ticket: emgTicket
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function resetLift(req, res) {
  try {
    const { id } = req.params;
    const lift = db.lifts.find(l => l.id === id);
    if (!lift) {
      return res.status(404).json({ success: false, error: 'Lift not found' });
    }

    lift.status = 'idle';
    lift.faultCode = 'NORMAL';
    lift.emergencyTrapped = false;
    saveDatabaseToFile();

    res.json({ success: true, message: `${lift.name} reset to normal operational standby`, lift });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
