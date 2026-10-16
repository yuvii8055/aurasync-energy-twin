import { db, saveDatabaseToFile } from '../db/store.js';
import { syntheticEngine } from '../services/syntheticEngine.js';

export function getAllTickets(req, res) {
  try {
    const { category, status, urgency, buildingId, search } = req.query;
    let list = [...db.tickets];

    if (category) {
      list = list.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }
    if (status) {
      list = list.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (urgency) {
      list = list.filter(t => t.urgency.toLowerCase() === urgency.toLowerCase());
    }
    if (buildingId) {
      list = list.filter(t => t.locationRef?.buildingId === buildingId);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q));
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getTicketById(req, res) {
  const ticket = db.tickets.find(t => t.ticketId === req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }
  res.json({ success: true, data: ticket });
}

export function createTicket(req, res) {
  try {
    const {
      category,
      subcategory,
      title,
      description,
      locationRef,
      urgency = 'normal',
      media = [],
      anonymous = false
    } = req.body;

    if (!category || !title) {
      return res.status(400).json({ success: false, error: 'Category and title are required' });
    }

    const ticketNumber = 100 + db.tickets.length + 1;
    const ticketId = `AS-2026-${String(ticketNumber).padStart(6, '0')}`;

    // Compute SLA target by urgency
    const slaHours = urgency === 'emergency' ? 0.5 : (urgency === 'high' ? 4 : (urgency === 'normal' ? 24 : 48));
    const slaDueAt = new Date(Date.now() + slaHours * 3600000).toISOString();

    // Auto-detect default 3D pin if building provided
    const pin = locationRef?.pin3D || { x: (Math.random() * 80) - 40, y: 3, z: (Math.random() * 60) - 30 };

    const newTicket = {
      ticketId,
      category,
      subcategory: subcategory || 'General',
      title,
      description: description || 'Reported via DSATM Campus Helpdesk.',
      locationRef: {
        buildingId: locationRef?.buildingId || 'dsatm-main',
        floor: locationRef?.floor ?? 1,
        roomId: locationRef?.roomId || 'General Campus',
        pin3D: pin
      },
      urgency,
      status: 'new',
      reporterId: anonymous ? 'anonymous' : (req.user?.id || 'usr-student-1'),
      reporterName: anonymous ? 'Anonymous Reporter' : (req.user?.name || 'Student Reporter'),
      anonymous: Boolean(anonymous),
      assignedHodId: 'usr-hod-1',
      assignedWorkerId: null,
      slaDueAt,
      media: Array.isArray(media) ? media : [],
      beforeMedia: Array.isArray(media) ? media : [],
      afterMedia: [],
      rating: null,
      timeline: [
        {
          status: 'new',
          byUserId: req.user?.id || 'usr-student-1',
          byUserName: req.user?.name || 'Reporter',
          at: new Date().toISOString(),
          note: 'Ticket submitted via Quick Report'
        }
      ]
    };

    db.tickets.unshift(newTicket);
    saveDatabaseToFile();

    // Broadcast over socket for HOD and Dynamic Island
    if (syntheticEngine.io) {
      syntheticEngine.io.emit('ticket:new', newTicket);
      syntheticEngine.io.emit('island:event', {
        type: urgency === 'emergency' ? 'SECURITY' : 'ENERGY_ALERT',
        title: urgency === 'emergency' ? '🚨 EMERGENCY REPORT' : 'New Campus Issue Reported',
        message: `${newTicket.title} (${newTicket.locationRef.buildingId})`,
        severity: urgency === 'emergency' ? 'critical' : 'warning',
        ticketId: newTicket.ticketId
      });
    }

    res.status(201).json({ success: true, data: newTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function assignTicket(req, res) {
  try {
    const { workerId, instructions } = req.body;
    const ticket = db.tickets.find(t => t.ticketId === req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    let assignedWorker = db.workers.find(w => w.id === workerId);
    // Smart Assign fallback if not specified: pick available worker with matching skill
    if (!assignedWorker) {
      const neededSkill = ticket.category.includes('Elect') ? 'Electrician' :
                         ticket.category.includes('Plumb') ? 'Plumber' :
                         ticket.category.includes('Lift') ? 'Lift Technician' : 'Housekeeping';
      assignedWorker = db.workers.find(w => w.skill === neededSkill && w.availability === 'available') || db.workers[0];
    }

    ticket.assignedWorkerId = assignedWorker.id;
    ticket.status = 'assigned';
    assignedWorker.workload = (assignedWorker.workload || 0) + 1;

    ticket.timeline.push({
      status: 'assigned',
      byUserId: req.user.id,
      byUserName: req.user.name,
      at: new Date().toISOString(),
      note: `Assigned to ${assignedWorker.name} (${assignedWorker.skill}). ${instructions || ''}`
    });

    saveDatabaseToFile();

    if (syntheticEngine.io) {
      syntheticEngine.io.emit('ticket:updated', ticket);
      syntheticEngine.io.emit('island:event', {
        type: 'AUTO_CONTROL',
        title: 'Task Assigned to Technician',
        message: `${ticket.title} assigned to ${assignedWorker.name}`,
        severity: 'info',
        ticketId: ticket.ticketId
      });
    }

    res.json({ success: true, message: `Ticket assigned to ${assignedWorker.name}`, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function updateTicketStatus(req, res) {
  try {
    const { status, note } = req.body;
    const ticket = db.tickets.find(t => t.ticketId === req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    ticket.status = status;
    ticket.timeline.push({
      status,
      byUserId: req.user.id,
      byUserName: req.user.name,
      at: new Date().toISOString(),
      note: note || `Status updated to ${status}`
    });

    saveDatabaseToFile();

    if (syntheticEngine.io) {
      syntheticEngine.io.emit('ticket:updated', ticket);
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function completeTicketWithPhoto(req, res) {
  try {
    const { afterPhotoUrl, note } = req.body;
    const ticket = db.tickets.find(t => t.ticketId === req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    if (!afterPhotoUrl) {
      return res.status(400).json({ success: false, error: 'Mandatory after-photo proof is required to resolve ticket' });
    }

    ticket.afterMedia.push({ url: afterPhotoUrl, type: 'image' });
    ticket.status = 'resolved';
    ticket.timeline.push({
      status: 'resolved',
      byUserId: req.user.id,
      byUserName: req.user.name,
      at: new Date().toISOString(),
      note: note || 'Resolved with verified after-photo evidence.'
    });

    // Reduce worker workload
    const worker = db.workers.find(w => w.id === ticket.assignedWorkerId);
    if (worker && worker.workload > 0) {
      worker.workload--;
    }

    saveDatabaseToFile();

    if (syntheticEngine.io) {
      syntheticEngine.io.emit('ticket:updated', ticket);
      syntheticEngine.io.emit('island:event', {
        type: 'ACHIEVEMENT',
        title: 'Task Resolved with Photo Proof',
        message: `${ticket.title} has been marked resolved. Awaiting verification.`,
        severity: 'info',
        ticketId: ticket.ticketId
      });
    }

    res.json({ success: true, message: 'Ticket marked resolved with evidence', data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function rateTicket(req, res) {
  try {
    const { rating, feedback } = req.body;
    const ticket = db.tickets.find(t => t.ticketId === req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    ticket.rating = Number(rating);
    if (ticket.rating <= 2) {
      // Re-open if dissatisfied
      ticket.status = 'in_progress';
      ticket.timeline.push({
        status: 'in_progress',
        byUserId: req.user.id,
        byUserName: req.user.name,
        at: new Date().toISOString(),
        note: `Reopened due to low rating (${rating}/5): ${feedback || 'Resolution unsatisfactory'}`
      });
    } else {
      ticket.status = 'closed';
      ticket.timeline.push({
        status: 'closed',
        byUserId: req.user.id,
        byUserName: req.user.name,
        at: new Date().toISOString(),
        note: `Closed with ${rating}★ rating. ${feedback || ''}`
      });
    }

    saveDatabaseToFile();

    if (syntheticEngine.io) {
      syntheticEngine.io.emit('ticket:updated', ticket);
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
