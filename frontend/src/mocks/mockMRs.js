export const mockMRs = [
  { id: 1, name: 'Amit Kumar',    email: 'amit@mr.com',    phone: '9800000001', password: 'password123', role: 'mr', city: 'Mumbai', area: 'Andheri', lat: 19.1136, lng: 72.8697, active: true  },
  { id: 2, name: 'Priya Sharma',  email: 'priya@mr.com',   phone: '9800000002', password: 'password123', role: 'mr', city: 'Pune',   area: 'Kothrud', lat: 18.5067, lng: 73.8125, active: true  },
  { id: 3, name: 'Rahul Nair',    email: 'rahul@mr.com',   phone: '9800000003', password: 'password123', role: 'mr', city: 'Nashik', area: 'Satpur',  lat: 19.9975, lng: 73.7898, active: true  },
  { id: 4, name: 'Sneha Patil',   email: 'sneha@mr.com',   phone: '9800000004', password: 'password123', role: 'mr', city: 'Nagpur', area: 'Sadar',   lat: 21.1458, lng: 79.0882, active: false },
  { id: 5, name: 'Karan Mehta',   email: 'karan@mr.com',   phone: '9800000005', password: 'password123', role: 'mr', city: 'Surat',  area: 'Adajan',  lat: 21.1702, lng: 72.8311, active: true  },
];

export const mockManagers = [
  { id: 101, name: 'Manager Admin', email: 'manager@mr.com', phone: '9900000001', password: 'admin123', role: 'manager' },
];

// All users combined for auth lookup
export const mockUsers = [...mockMRs, ...mockManagers];
