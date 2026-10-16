import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: {
    id: 'usr-hod-1',
    name: 'Dr. Sandhya V. (HOD AIML)',
    email: 'hod.aiml@aurasync.demo',
    role: 'hod',
    department: 'Computer Science and Engineering (AIML)',
    twoFAEnabled: true,
    approvalStatus: 'approved'
  },
  token: 'demo-bearer-token-hod-dsatm-2026',
  isAuthenticated: true,

  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      set({ user: data.user, token: data.token, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  setDemoRole: (role) => {
    const rolesMap = {
      admin: {
        id: 'usr-admin-1',
        name: 'Dr. M. Ravishankar (Principal)',
        email: 'admin@aurasync.demo',
        role: 'admin',
        department: 'Campus Administration',
        twoFAEnabled: true,
        approvalStatus: 'approved'
      },
      hod: {
        id: 'usr-hod-1',
        name: 'Dr. Sandhya V. (HOD AIML)',
        email: 'hod.aiml@aurasync.demo',
        role: 'hod',
        department: 'Computer Science and Engineering (AIML)',
        twoFAEnabled: true,
        approvalStatus: 'approved'
      },
      staff: {
        id: 'usr-staff-1',
        name: 'Prof. Ananya Rao (Assistant Professor)',
        email: 'faculty@aurasync.demo',
        role: 'staff',
        department: 'Computer Science and Engineering (AIML)',
        twoFAEnabled: false,
        approvalStatus: 'approved'
      },
      student: {
        id: 'usr-student-1',
        name: 'Nikhil Sharma (USN: 1DT23AI045)',
        email: 'student@aurasync.demo',
        role: 'student',
        department: 'Computer Science and Engineering (AIML)',
        twoFAEnabled: false,
        approvalStatus: 'approved'
      },
      worker: {
        id: 'usr-worker-1',
        name: 'Manjunath Gowda (Lead Technician)',
        email: 'worker@aurasync.demo',
        role: 'worker',
        department: 'Campus Facilities & Maintenance',
        workerSkill: 'Electrician',
        shift: 'Morning (07:00 - 15:30)',
        twoFAEnabled: false,
        approvalStatus: 'approved'
      }
    };

    const targetUser = rolesMap[role] || rolesMap.hod;
    set({ user: targetUser, token: `demo-token-${role}`, isAuthenticated: true });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }
}));
