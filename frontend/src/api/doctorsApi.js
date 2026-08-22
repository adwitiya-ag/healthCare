import { mockDoctors } from '../mocks/mockDoctors';

const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));
let doctors = [...mockDoctors];

export const doctorsApi = {

  async getCities() {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/cities`,
      {
        method: "GET",
        
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }

    const data = await response.json();

    return data;
  },

  async getQualifications(){
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/doctor-qualifications`,
      {
        method: "GET",
        
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch qualifications");
    }

    const data = await response.json();
    console.log("Qualifications:", data);
    return data;
  },

  async getSpecialization(){
      const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/doctor-specializations`,
      {
        method: "GET",
        
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch Specialization");
    }

    const data = await response.json();
    console.log("Specialization:", data);
    return data;
  },

  
  async getAll(filters = {}) {
    await delay();
    let result = [...doctors];
    if (filters.city) result = result.filter(d => d.city === filters.city);
    if (filters.area) result = result.filter(d => d.area === filters.area);
    if (filters.qualification) result = result.filter(d => d.qualification === filters.qualification);
    if (filters.specialisation) result = result.filter(d => d.specialisation === filters.specialisation);
    if (filters.search) result = result.filter(d => d.name.toLowerCase().includes(filters.search.toLowerCase()) || d.city.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.mrId) result = result.filter(d => d.mrId === filters.mrId);
    return result;
  },

  async getById(id) {
    await delay();
    return doctors.find(d => d.id === id) || null;
  },

  async create(data) {
    await delay(300);
    const newDoc = { id: Date.now(), active: true, ...data };
    doctors.push(newDoc);
    return newDoc;
  },

  async update(id, data) {
    await delay(300);
    const idx = doctors.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Doctor not found');
    doctors[idx] = { ...doctors[idx], ...data };
    return doctors[idx];
  },

  async toggleActive(id) {
    await delay();
    const idx = doctors.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Doctor not found');
    doctors[idx].active = !doctors[idx].active;
    return doctors[idx];
  },
};
