import { mockChemists } from '../mocks/mockChemists';

const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));
let chemists = [...mockChemists];

export const chemistsApi = {
  async getAll(filters = {}) {
    await delay();
    let result = [...chemists];
    if (filters.city)        result = result.filter(c => c.city === filters.city);
    if (filters.area)        result = result.filter(c => c.area === filters.area);
    if (filters.chemistType) result = result.filter(c => c.chemistType === filters.chemistType);
    if (filters.search)      result = result.filter(c => c.name.toLowerCase().includes(filters.search.toLowerCase()) || c.city.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.mrId)        result = result.filter(c => c.mrId === filters.mrId);
    return result;
  },

  async create(data) {
    await delay(300);
    const newChemist = { id: Date.now(), active: true, ...data };
    chemists.push(newChemist);
    return newChemist;
  },

  async update(id, data) {
    await delay(300);
    const idx = chemists.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Chemist not found');
    chemists[idx] = { ...chemists[idx], ...data };
    return chemists[idx];
  },

  async toggleActive(id) {
    await delay();
    const idx = chemists.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Chemist not found');
    chemists[idx].active = !chemists[idx].active;
    return chemists[idx];
  },
};
