const BASE_URL = import.meta.env.VITE_BASE_URL;

const mapDoctor = (d) => ({
  id: d._id,
  name: d.doctorName,
  cityId: d.cityId?._id,
  city: d.cityId?.cityName,
  areaId: d.areaId?._id,
  area: d.areaId?.areaName,
  qualificationId: d.qualificationId?._id,
  qualification: d.qualificationId?.name,
  specializationId: d.specializationId?._id,
  specialisation: d.specializationId?.name,
  active: d.isActive,
});

export const doctorsApi = {
  async getCities() {
    const response = await fetch(`${BASE_URL}/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    return response.json();
  },

  async getQualifications() {
    const response = await fetch(`${BASE_URL}/doctor-qualifications`);
    if (!response.ok) throw new Error('Failed to fetch qualifications');
    return response.json();
  },

  async getSpecialization() {
    const response = await fetch(`${BASE_URL}/doctor-specializations`);
    if (!response.ok) throw new Error('Failed to fetch Specialization');
    return response.json();
  },

  

  // NEW — areas, optionally scoped to a city (for cascading dropdown)
  async getAreas(cityId) {
    const url = cityId ? `${BASE_URL}/areas?cityId=${cityId}` : `${BASE_URL}/areas`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch areas');
    return response.json();
  },

   async addQualification(name) {
    const response = await fetch(
      `${BASE_URL}/doctor-qualification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));

      throw new Error(
        err.message || 'Failed to add qualification'
      );
    }

    const json = await response.json();

    return json.data;
  },

  // UPDATE qualification
  async updateQualification(id, name) {
    const response = await fetch(
      `${BASE_URL}/doctor-qualification/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));

      throw new Error(
        err.message || 'Failed to update qualification'
      );
    }

    const json = await response.json();

    return json.data;
  },

  // DEACTIVATE qualification
  async toggleQualification(id) {
    const response = await fetch(
      `${BASE_URL}/doctor-qualification/${id}/toggle`,
      {
        method: 'PATCH',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));

      throw new Error(
        err.message || 'Failed to deactivate qualification'
      );
    }

    const json = await response.json();

    return json.data;
  },

  // REWRITTEN — real API call, using *Id filter keys to match backend query params
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.cityId) params.append('cityId', filters.cityId);
    if (filters.areaId) params.append('areaId', filters.areaId);
    if (filters.qualificationId) params.append('qualificationId', filters.qualificationId);
    if (filters.specializationId) params.append('specializationId', filters.specializationId);

    const response = await fetch(`${BASE_URL}/doctors?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch doctors');
    const json = await response.json();
    let result = (json.data || []).map(mapDoctor);

    // backend has no text-search yet — filter client-side
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || (d.city || '').toLowerCase().includes(q)
      );
    }
    return result;
  },

  // REWRITTEN — real API call
  async create(data) {
    const payload = {
      doctorName: data.name,
      cityId: data.cityId,
      areaId: data.areaId,
      qualificationId: data.qualificationId,
      specializationId: data.specializationId,
    };
    const response = await fetch(`${BASE_URL}/doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // required — createDoctor is behind verifyJWT (cookie auth)
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create doctor');
    }
    const json = await response.json();
    return mapDoctor(json.data);
  },

  // ⚠ backend has NO update or toggle-active route for doctors yet —
  // only POST /doctor and GET /doctors exist (see doctor.routes.js).
  // These will throw until you add PATCH/DELETE endpoints on the backend.
  async update() {
    throw new Error('Backend has no update-doctor endpoint yet — ask backend dev to add PATCH /doctor/:id');
  },
  async toggleActive() {
    throw new Error('Backend has no toggle-active-doctor endpoint yet — ask backend dev to add PATCH /doctor/:id/toggle');
  },
};