import { db, saveDatabaseToFile } from '../db/store.js';
import { syntheticEngine } from '../services/syntheticEngine.js';

export function getAllFeedback(req, res) {
  try {
    const { sentiment, topic, type } = req.query;
    let list = [...db.feedback];

    // HODs only see their department's feedback unless admin
    if (req.user.role === 'hod') {
      list = list.filter(f => f.department === req.user.department);
    }

    if (sentiment) list = list.filter(f => f.sentiment === sentiment);
    if (topic) list = list.filter(f => f.topic.toLowerCase().includes(topic.toLowerCase()));
    if (type) list = list.filter(f => f.type === type);

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function submitFeedback(req, res) {
  try {
    const { type, rating, text, department, anonymous = false } = req.body;
    if (!type || !text) {
      return res.status(400).json({ success: false, error: 'Type and text description required' });
    }

    const sentiment = Number(rating) >= 4 ? 'positive' : (Number(rating) <= 2 ? 'negative' : 'neutral');
    const topic = text.toLowerCase().includes('lift') ? 'Elevators' :
                  text.toLowerCase().includes('solar') ? 'Solar Rooftop' :
                  text.toLowerCase().includes('bus') || text.toLowerCase().includes('commute') ? 'Commute' :
                  text.toLowerCase().includes('carbon') ? 'Carbon Accounting' : 'General Campus';

    const newFeedback = {
      id: `fb-${Date.now()}`,
      userId: anonymous ? 'anonymous' : req.user.id,
      userName: anonymous ? 'Anonymous' : req.user.name,
      type,
      rating: Number(rating) || 4,
      sentiment,
      topic,
      text,
      status: 'New',
      adminReply: null,
      department: department || req.user.department || 'General',
      createdAt: new Date().toISOString()
    };

    db.feedback.unshift(newFeedback);
    saveDatabaseToFile();

    if (syntheticEngine.io) {
      syntheticEngine.io.emit('island:event', {
        type: 'ACHIEVEMENT',
        title: 'New Campus Feedback Received',
        message: `${newFeedback.type}: "${newFeedback.text.substring(0, 45)}..."`,
        severity: 'info',
        feedbackId: newFeedback.id
      });
    }

    res.status(201).json({ success: true, data: newFeedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function replyToFeedback(req, res) {
  try {
    const { reply, status } = req.body;
    const fb = db.feedback.find(f => f.id === req.params.id);
    if (!fb) {
      return res.status(404).json({ success: false, error: 'Feedback item not found' });
    }

    if (reply) fb.adminReply = reply;
    if (status) fb.status = status;
    saveDatabaseToFile();

    res.json({ success: true, data: fb });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function convertFeedbackToTicket(req, res) {
  try {
    const fb = db.feedback.find(f => f.id === req.params.id);
    if (!fb) {
      return res.status(404).json({ success: false, error: 'Feedback item not found' });
    }

    const ticketNumber = 100 + db.tickets.length + 1;
    const ticketId = `AS-2026-${String(ticketNumber).padStart(6, '0')}`;

    const newTicket = {
      ticketId,
      category: fb.topic.includes('Elevator') ? 'Lifts and Elevators' : 'General Campus',
      subcategory: fb.type,
      title: `Converted: ${fb.text.substring(0, 60)}`,
      description: fb.text,
      locationRef: {
        buildingId: 'dsatm-main',
        floor: 1,
        roomId: 'Campus Office',
        pin3D: { x: 0, y: 3, z: 0 }
      },
      urgency: fb.sentiment === 'negative' ? 'high' : 'normal',
      status: 'new',
      reporterId: fb.userId,
      reporterName: fb.userName,
      anonymous: fb.userName === 'Anonymous',
      assignedHodId: 'usr-hod-1',
      assignedWorkerId: null,
      slaDueAt: new Date(Date.now() + 24 * 3600000).toISOString(),
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
          note: `Converted from Feedback #${fb.id} by Admin`
        }
      ]
    };

    db.tickets.unshift(newTicket);
    fb.status = 'Converted to Ticket';
    fb.adminReply = `Converted to Helpdesk Ticket ${ticketId}.`;
    saveDatabaseToFile();

    if (syntheticEngine.io) {
      syntheticEngine.io.emit('ticket:new', newTicket);
    }

    res.json({ success: true, ticketId, ticket: newTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
