const BASE_URL = import.meta.env.VITE_BASE_URL;

const mapChemist = (c) => ({
  id: c._id,
  name: c.chemistName,
  cityId: c.cityId?._id,
  city: c.cityId?.cityName,
  areaId: c.areaId?._id,
  area: c.areaId?.areaName,
  chemistType: c.chemistType,
  active: c.isActive,
});

export const chemistsApi = {
  async getCities() {
    const response = await fetch(`${BASE_URL}/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    return response.json();
  },

  async getAreas(cityId) {
    const url = cityId ? `${BASE_URL}/areas?cityId=${cityId}` : `${BASE_URL}/areas`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch areas');
    return response.json();
  },

  // chemistType is a fixed enum (RETAIL/WHOLESALE/HOSPITAL/ONLINE) — no API needed
  getChemistTypes() {
    return ['RETAIL', 'WHOLESALE', 'HOSPITAL', 'ONLINE'];
  },

  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.cityId) params.append('cityId', filters.cityId);
    if (filters.areaId) params.append('areaId', filters.areaId);
    if (filters.chemistType) params.append('chemistType', filters.chemistType);

    const response = await fetch(`${BASE_URL}/chemists?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch chemists');
    const json = await response.json();
    let result = (json.data || []).map(mapChemist);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q)
      );
    }
    return result;
  },

  async create(data) {
    const payload = {
      chemistName: data.name,
      cityId: data.cityId,
      areaId: data.areaId,
      chemistType: data.chemistType,
    };
    const response = await fetch(`${BASE_URL}/chemist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // createChemist is behind verifyJWT (cookie auth)
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create chemist');
    }
    const json = await response.json();
    return mapChemist(json.data);
  },

  // ⚠ backend has NO update or toggle-active route for chemists yet —
  // only POST /chemist and GET /chemists exist (see chemist.routes.js).
  async update() {
    throw new Error('Backend has no update-chemist endpoint yet — ask backend dev to add PATCH /chemist/:id');
  },
  async toggleActive() {
    throw new Error('Backend has no toggle-active-chemist endpoint yet — ask backend dev to add PATCH /chemist/:id/toggle');
  },
};