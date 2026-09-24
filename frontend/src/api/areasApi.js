const BASE_URL = import.meta.env.VITE_BASE_URL;

export const areasApi = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.cityId) params.set('cityId', filters.cityId);
        if (filters.isActive !== undefined && filters.isActive !== '') params.set('isActive', filters.isActive);

        const qs = params.toString();
        const response = await fetch(`${BASE_URL}/areas${qs ? `?${qs}` : ''}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Fetching areas failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        let result = responseData.data || [];

        // client-side search filter
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter((a) => a.areaName?.toLowerCase().includes(term));
        }

        return result;
    },

    async getById(id) {
        const response = await fetch(`${BASE_URL}/area/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Fetching area failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async create(data) {
        const response = await fetch(`${BASE_URL}/area`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                areaName: data.areaName,
                cityId: data.cityId,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Creating area failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async update(id, data) {
        const response = await fetch(`${BASE_URL}/area/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                areaName: data.areaName,
                cityId: data.cityId,
                isActive: data.isActive,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Updating area failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async delete(id) {
        const response = await fetch(`${BASE_URL}/area/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Deleting area failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },
};
