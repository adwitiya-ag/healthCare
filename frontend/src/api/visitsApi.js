import { mockVisits } from '../mocks/mockVisits';
import { mockTourPlans } from '../mocks/mockTourPlans';

const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));
let visits = [...mockVisits];
let tourPlans = [...mockTourPlans];

export const visitsApi = {
  async getAll(filters = {}) {
    await delay();
    let result = [...visits];
    if (filters.mrId)       result = result.filter(v => v.mrId === filters.mrId);
    if (filters.entityType) result = result.filter(v => v.entityType === filters.entityType);
    if (filters.dateFrom)   result = result.filter(v => v.date >= filters.dateFrom);
    if (filters.dateTo)     result = result.filter(v => v.date <= filters.dateTo);
    return result.sort((a, b) => b.date.localeCompare(a.date));
  },

  async logVisit(data) {
    await delay(400);
    const newVisit = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      photo: data.photo || 'https://picsum.photos/seed/newvisit/400/300',
      ...data,
    };
    visits.push(newVisit);
    return newVisit;
  },
};

export const tourPlansApi = {
  async getAll(filters = {}) {
    await delay();
    let result = [...tourPlans];
    if (filters.mrId) result = result.filter(t => t.mrId === filters.mrId);
    return result;
  },

  async upload(data) {
    await delay(500);
    const newPlan = {
      id: Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
      ...data,
    };
    tourPlans.push(newPlan);
    return newPlan;
  },
};
