const BASE_URL = import.meta.env.VITE_BASE_URL;

export const citiesApi = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.cityName) params.set('cityName', filters.cityName);
        if (filters.isActive !== undefined && filters.isActive !== '') params.set('isActive', filters.isActive);

        const qs = params.toString();
        const response = await fetch(`${BASE_URL}/cities${qs ? `?${qs}` : ''}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Fetching cities failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        let result = responseData.data || [];

        // client-side search filter
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter((c) => c.cityName?.toLowerCase().includes(term));
        }

        return result;
    },

    async getById(id) {
        const response = await fetch(`${BASE_URL}/city/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Fetching city failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async create(data) {
        const response = await fetch(`${BASE_URL}/city`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                cityName: data.cityName,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Creating city failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async update(id, data) {
        const response = await fetch(`${BASE_URL}/city/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                cityName: data.cityName,
                isActive: data.isActive,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Updating city failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async delete(id) {
        const response = await fetch(`${BASE_URL}/city/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Deleting city failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },
};
