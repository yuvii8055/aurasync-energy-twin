import jwt from 'jsonwebtoken';
import { db, hashPassword, verifyPassword, saveDatabaseToFile } from '../db/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aurasync_dsatm_o1_outlaws_jwt_secret_2026_super_secure_key_aiml';
const JWT_EXPIRES_IN = '24h';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Check account lockout (5 attempts -> 15 min lock)
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Account is temporarily locked due to excessive failed attempts. Try again in ${remainingMinutes} minute(s).`
      });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60000).toISOString();
      }
      saveDatabaseToFile();
      return res.status(401).json({
        success: false,
        error: `Invalid credentials. ${5 - (user.failedAttempts || 0)} attempts remaining before lock.`
      });
    }

    // Reset lockout counters on success
    user.failedAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date().toISOString();
    saveDatabaseToFile();

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        workerSkill: user.workerSkill,
        twoFAEnabled: user.twoFAEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, role = 'student', department, rollNumber } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password required' });
    }

    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const passkeyHash = await hashPassword('123456'); // Default PIN

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: ['admin', 'hod', 'staff', 'student', 'worker', 'viewer'].includes(role) ? role : 'student',
      department: department || 'Computer Science and Engineering (AIML)',
      rollNumber: rollNumber || null,
      passKeyHash: passkeyHash,
      approvalStatus: role === 'student' ? 'approved' : 'pending',
      failedAttempts: 0,
      lockUntil: null,
      twoFAEnabled: false,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDatabaseToFile();

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        approvalStatus: newUser.approvalStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function verifyPasskey(req, res) {
  try {
    const { passkey } = req.body;
    if (!passkey) {
      return res.status(400).json({ success: false, error: 'Passkey PIN required' });
    }

    const user = db.users.find(u => u.id === req.user.id);
    if (!user || !user.passKeyHash) {
      return res.status(403).json({ success: false, error: 'User does not have a configured Passkey' });
    }

    const isValid = await verifyPassword(passkey, user.passKeyHash);
    if (!isValid) {
      return res.status(403).json({ success: false, error: 'Incorrect Passkey PIN' });
    }

    res.json({ success: true, message: 'Passkey authorized for high-risk action' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getCurrentUser(req, res) {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      workerSkill: user.workerSkill,
      twoFAEnabled: user.twoFAEnabled,
      approvalStatus: user.approvalStatus
    }
  });
}
