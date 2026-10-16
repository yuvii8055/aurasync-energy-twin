/**
 * Central Permission Matrix & Role Hierarchy for AuraSync Energy Twin
 * DSATM - O(1) Outlaws: AIML Engineers
 *
 * Role Hierarchy: ADMIN > HOD > FACULTY_STAFF > STUDENT > WORKER > VIEWER
 */

export const ROLES = {
  ADMIN: 'admin',
  HOD: 'hod',
  FACULTY_STAFF: 'staff',
  STUDENT: 'student',
  WORKER: 'worker',
  VIEWER: 'viewer'
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 100,
  [ROLES.HOD]: 80,
  [ROLES.FACULTY_STAFF]: 60,
  [ROLES.STUDENT]: 40,
  [ROLES.WORKER]: 30,
  [ROLES.VIEWER]: 10
};

export const SETTING_SCOPES = {
  GLOBAL: 'global',
  DEPARTMENT: 'department',
  PERSONAL: 'personal'
};

export const PERMISSIONS = {
  // Master control switches (require PIN / Passkey)
  CAMPUS_MASTER_SWITCH: [ROLES.ADMIN],
  DEPT_MASTER_SWITCH: [ROLES.ADMIN, ROLES.HOD],
  ROOM_DEVICE_CONTROL: [ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY_STAFF],
  EMERGENCY_SHUTDOWN: [ROLES.ADMIN, ROLES.HOD],

  // Settings
  EDIT_GLOBAL_SETTINGS: [ROLES.ADMIN],
  EDIT_DEPT_SETTINGS: [ROLES.ADMIN, ROLES.HOD],
  EDIT_PERSONAL_SETTINGS: [ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY_STAFF, ROLES.STUDENT, ROLES.WORKER, ROLES.VIEWER],

  // Helpdesk
  SUBMIT_TICKET: [ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY_STAFF, ROLES.STUDENT, ROLES.WORKER, ROLES.VIEWER],
  ASSIGN_TICKET: [ROLES.ADMIN, ROLES.HOD],
  WORK_ON_TICKET: [ROLES.ADMIN, ROLES.HOD, ROLES.WORKER],
  CLOSE_TICKET: [ROLES.ADMIN, ROLES.HOD],
  RATE_TICKET: [ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY_STAFF, ROLES.STUDENT, ROLES.WORKER, ROLES.VIEWER],

  // Admin & Governance
  VIEW_FEEDBACK_INBOX: [ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN, ROLES.HOD],
  VIEW_AUDIT_LOGS: [ROLES.ADMIN, ROLES.HOD],
  EXPORT_ESG_REPORT: [ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY_STAFF, ROLES.STUDENT]
};

export function hasPermission(userRole, permissionKey) {
  const allowedRoles = PERMISSIONS[permissionKey];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

export function isRoleAtLeast(userRole, targetRole) {
  const userRank = ROLE_HIERARCHY[userRole] || 0;
  const targetRank = ROLE_HIERARCHY[targetRole] || 0;
  return userRank >= targetRank;
}
