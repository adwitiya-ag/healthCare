import { mockDistribution, mockPreferences } from '../mocks/mockDistribution';

const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));
let distribution = [...mockDistribution];
let preferences = [...mockPreferences];

export const distributionApi = {
  async getAll(filters = {}) {
    await delay();
    let result = [...distribution];
    if (filters.mrId)     result = result.filter(d => d.mrId === filters.mrId);
    if (filters.dateFrom) result = result.filter(d => d.date >= filters.dateFrom);
    if (filters.dateTo)   result = result.filter(d => d.date <= filters.dateTo);
    if (filters.doctorId) result = result.filter(d => d.doctorId === filters.doctorId);
    return result.sort((a, b) => b.date.localeCompare(a.date));
  },

  async record(data) {
    await delay(300);
    const newRecord = { id: Date.now(), ...data };
    distribution.push(newRecord);
    return newRecord;
  },
};

export const preferencesApi = {
  async getAll(filters = {}) {
    await delay();
    let result = [...preferences];
    if (filters.mrId)     result = result.filter(p => p.mrId === filters.mrId);
    if (filters.doctorId) result = result.filter(p => p.doctorId === filters.doctorId);
    return result;
  },

  async record(data) {
    await delay(300);
    const newPref = { id: Date.now(), date: new Date().toISOString().split('T')[0], ...data };
    preferences.push(newPref);
    return newPref;
  },
};
