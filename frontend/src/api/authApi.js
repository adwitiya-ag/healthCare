import { mockUsers } from '../mocks/mockMRs';

const delay = (ms = 200) => new Promise(res => setTimeout(res, ms));

// In-memory registered users (starts with mock users)
let users = [...mockUsers];

export const authApi = {
  async login(email, password) {
    await delay();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token: `mock-token-${safeUser.id}` };
  },

  async register(data) {
    await delay();
    const exists = users.find(u => u.email === data.email);
    if (exists) throw new Error('Email already registered');
    const newUser = { id: Date.now(), ...data };
    users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    return { user: safeUser, token: `mock-token-${safeUser.id}` };
  },

  async requestOtp(email) {
    await delay();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Email not found');
    return { message: 'OTP sent to your email (mock OTP: 123456)' };
  },

  async verifyOtp(email, otp) {
    await delay(300);
    if (otp !== '123456') throw new Error('Invalid OTP');
    return { verified: true };
  },

  async resetPassword(email, newPassword) {
    await delay();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) throw new Error('User not found');
    users[idx].password = newPassword;
    return { message: 'Password reset successfully' };
  },
};
