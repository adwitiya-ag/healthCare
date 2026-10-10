const BASE_URL = import.meta.env.VITE_BASE_URL;
const PREFERENCE_URL = `${BASE_URL}/preference`;
const SAMPLE_DISTRIBUTION_URL = `${BASE_URL}/sample-distribution`;


// Sample Distribution 

const mapDistribution = (d) => ({
    id: d._id,
    doctorCode: d.doctorId?.doctorId,   // friendly code, e.g. "DOC0001"
    doctorName: d.doctorId?.doctorName,
    productId: d.productId?._id,
    productName: d.productId?.productName,
    mrId: d.userId?._id,
    mrName: d.userId ? `${d.userId.firstName || ''} ${d.userId.lastName || ''}`.trim() : '',
    mrEmail: d.userId?.email,
    quantity: d.quantity,
    date: d.dateGiven ? new Date(d.dateGiven).toISOString().split('T')[0] : null,
});

export const distributionApi = {

    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.doctorId) params.append('doctorId', filters.doctorId);
        if (filters.productId) params.append('productId', filters.productId);
        if (filters.mrId) params.append('userId', filters.mrId);

        const response = await fetch(`${SAMPLE_DISTRIBUTION_URL}/fetch?${params.toString()}`, {
            credentials: 'include', // route requires verifyJWT
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to fetch sample distributions');
        }
        const json = await response.json();
        let result = (json.data || []).map(mapDistribution);


        if (filters.dateFrom) result = result.filter((d) => d.date && d.date >= filters.dateFrom);
        if (filters.dateTo) result = result.filter((d) => d.date && d.date <= filters.dateTo);

        return result.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    },


    async record({ doctorId, productId, quantity }) {
        const response = await fetch(`${SAMPLE_DISTRIBUTION_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ doctorId, productId, quantity }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to record sample distribution');
        }
        const json = await response.json();
        return mapDistribution(json.data);
    },

    async deleteRecord(distributionId) {
        const response = await fetch(`${SAMPLE_DISTRIBUTION_URL}/delete`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ distributionId }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to delete sample distribution record');
        }
        const json = await response.json();
        return json;
    },
};

// For preference
const mapPreference = (p) => ({
    id: p._id,
    productId: p.productId?._id,
    productName: p.productId?.productName,
    preferenceOrder: p.preferenceOrder,
    notes: p.notes,
});

export const preferencesApi = {
    async getByDoctor(doctorId) {
        const response = await fetch(`${PREFERENCE_URL}/${doctorId}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to fetch preferences');
        }
        const json = await response.json();
        return {
            doctor: json.data.doctor,
            preferences: (json.data.preferences || []).map(mapPreference),
        };
    },

    async create({ doctorId, productId, preferenceOrder, notes }) {
        const response = await fetch(`${PREFERENCE_URL}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ doctorId, productId, preferenceOrder, notes }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to add preference');
        }
        const json = await response.json();
        return mapPreference(json.data);
    },

    async update(preferenceId, { doctorId, productId, preferenceOrder, notes }) {
        const response = await fetch(`${PREFERENCE_URL}/${preferenceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ doctorId, productId, preferenceOrder, notes }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update preference');
        }
        const json = await response.json();
        return mapPreference(json.data);
    },

    async remove(preferenceId) {
        const response = await fetch(`${PREFERENCE_URL}/${preferenceId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to delete preference');
        }
        return response.json();
    },
};
