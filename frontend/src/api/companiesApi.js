const BASE_URL = import.meta.env.VITE_BASE_URL;

export const companiesApi = {
    async getAll(filters = {}) {
        const response = await fetch(`${BASE_URL}/company/getallcompany`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Fetching companies failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        let result = responseData.data || [];

        // client-side search filter
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter((c) =>
                c.companyName?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term)
            );
        }

        // status filter
        if (filters.isActive !== undefined && filters.isActive !== '') {
            const activeVal = filters.isActive === 'true' || filters.isActive === true;
            result = result.filter((c) => c.isActive === activeVal);
        }

        return result;
    },

    async getById(id) {
        const response = await fetch(`${BASE_URL}/company/getcompany/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Fetching company failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async create(data) {
        const response = await fetch(`${BASE_URL}/company/addcompany`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                companyName: data.companyName,
                email: data.email,
                phoneNumber: data.phoneNumber,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Creating company failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async update(id, data) {
        const response = await fetch(`${BASE_URL}/company/updatecompany/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                companyName: data.companyName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                isActive: data.isActive,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Updating company failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async delete(id) {
        const response = await fetch(`${BASE_URL}/company/deletecompany/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Deleting company failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },
};
