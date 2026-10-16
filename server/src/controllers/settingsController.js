import { db, saveDatabaseToFile } from '../db/store.js';

export function getEffectiveSettings(req, res) {
  try {
    const userRole = req.user?.role || 'viewer';
    const userDept = req.user?.department || '';
    const userId = req.user?.id || '';

    const effectiveList = db.settings.map(s => {
      let effectiveValue = s.globalValue ?? s.defaultValue;
      let source = 'Set by Admin (Global)';
      let isEditable = false;

      // Check department override
      if (s.scopeAllowed.includes('department') && s.deptValues && s.deptValues[userDept] !== undefined) {
        effectiveValue = s.deptValues[userDept];
        source = `Overridden by HOD (${userDept})`;
      }

      // Check personal override
      if (s.scopeAllowed.includes('personal') && s.personalValues && s.personalValues[userId] !== undefined) {
        effectiveValue = s.personalValues[userId];
        source = 'Customized by You (Personal)';
      }

      // Determine edit eligibility
      if (userRole === 'admin') {
        isEditable = true;
      } else if (userRole === 'hod') {
        isEditable = s.scopeAllowed.includes('department') && s.lockedBy !== 'admin';
      } else {
        isEditable = s.scopeAllowed.includes('personal') && !s.lockedBy;
      }

      return {
        key: s.key,
        name: s.name,
        category: s.category,
        unit: s.unit,
        description: s.description,
        effectiveValue,
        source,
        isEditable,
        lockedBy: s.lockedBy,
        min: s.min,
        max: s.max,
        options: s.options,
        scopeAllowed: s.scopeAllowed
      };
    });

    res.json({ success: true, data: effectiveList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function updateSetting(req, res) {
  try {
    const { key } = req.params;
    const { value, scope = 'global' } = req.body;
    const userRole = req.user.role;
    const userDept = req.user.department;
    const userId = req.user.id;

    const setting = db.settings.find(s => s.key === key);
    if (!setting) {
      return res.status(404).json({ success: false, error: 'Setting definition not found' });
    }

    // Role and scope checks
    if (scope === 'global' && userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only Admin can modify Global settings' });
    }

    if (scope === 'department') {
      if (userRole !== 'admin' && userRole !== 'hod') {
        return res.status(403).json({ success: false, error: 'Requires HOD or Admin to modify Department settings' });
      }
      if (setting.lockedBy === 'admin' && userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'This setting is locked by Admin and cannot be overridden' });
      }
    }

    // Numeric bounds check
    if (setting.min !== undefined && value < setting.min) {
      return res.status(400).json({ success: false, error: `Value cannot be below minimum limit of ${setting.min}` });
    }
    if (setting.max !== undefined && value > setting.max) {
      return res.status(400).json({ success: false, error: `Value cannot exceed maximum limit of ${setting.max}` });
    }

    const previousValue = setting.globalValue;

    if (scope === 'global') {
      setting.globalValue = value;
    } else if (scope === 'department') {
      if (!setting.deptValues) setting.deptValues = {};
      setting.deptValues[userDept] = value;
    } else if (scope === 'personal') {
      if (!setting.personalValues) setting.personalValues = {};
      setting.personalValues[userId] = value;
    }

    // Audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: `Updated setting ${setting.name} [${key}]`,
      scope,
      previousValue,
      newValue: value,
      timestamp: new Date().toISOString()
    });

    saveDatabaseToFile();

    res.json({ success: true, message: 'Setting updated successfully', key, value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function resetIslandPosition(req, res) {
  try {
    const setting = db.settings.find(s => s.key === 'dynamic_island_position');
    if (setting && setting.personalValues) {
      delete setting.personalValues[req.user.id];
    }
    saveDatabaseToFile();
    res.json({ success: true, defaultPosition: 'top-center' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
