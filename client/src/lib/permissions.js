export const ROLES = {
  ADMIN: 'admin',
  HOD: 'hod',
  FACULTY_STAFF: 'staff',
  STUDENT: 'student',
  WORKER: 'worker',
  VIEWER: 'viewer'
};

export const ROLE_HIERARCHY = {
  admin: 100,
  hod: 80,
  staff: 60,
  student: 40,
  worker: 30,
  viewer: 10
};

export function canControlCampus(role) {
  return role === ROLES.ADMIN || role === ROLES.HOD;
}

export function canAssignTickets(role) {
  return role === ROLES.ADMIN || role === ROLES.HOD;
}

export function canEditGlobalSettings(role) {
  return role === ROLES.ADMIN;
}

export function canEditDeptSettings(role) {
  return role === ROLES.ADMIN || role === ROLES.HOD;
}
