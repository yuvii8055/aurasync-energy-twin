import { db, saveDatabaseToFile } from '../db/store.js';

export function getAllUsers(req, res) {
  try {
    const safeUsers = db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      workerSkill: u.workerSkill,
      approvalStatus: u.approvalStatus,
      twoFAEnabled: u.twoFAEnabled,
      createdAt: u.createdAt
    }));
    res.json({ success: true, count: safeUsers.length, data: safeUsers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function approveUser(req, res) {
  try {
    const { id } = req.params;
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.approvalStatus = 'approved';
    saveDatabaseToFile();

    res.json({ success: true, message: `Account for ${user.name} approved successfully`, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getAllWorkers(req, res) {
  res.json({ success: true, count: db.workers.length, data: db.workers });
}

export function getSystemAuditLogs(req, res) {
  res.json({ success: true, count: db.auditLogs.length, data: db.auditLogs });
}
