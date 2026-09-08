const BASE_URL = import.meta.env.VITE_BASE_URL;

export const productsApi = {
    async getAll(filters = {}) {
        const response = await fetch(`${BASE_URL}/products/getallproducts`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Fetching products failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        let result = responseData.data || [];

        // backend has no query-param filtering, so filter client-side
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter((p) => p.productName?.toLowerCase().includes(term));
        }
        if (filters.companyId) {
            result = result.filter((p) => (p.companyId?._id || p.companyId) === filters.companyId);
        }

        return result;
    },

    async getById(id) {
        const response = await fetch(`${BASE_URL}/products/getproduct/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Fetching product failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async create(data) {
        const response = await fetch(`${BASE_URL}/products/addproduct`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                productName: data.productName,
                companyId: data.companyId,
                strength: data.strength,
                packSize: data.packSize,
                mrp: data.mrp,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Creating product failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async update(id, data) {
        const response = await fetch(`${BASE_URL}/products/updateproduct/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                productName: data.productName,
                companyId: data.companyId,
                strength: data.strength,
                packSize: data.packSize,
                mrp: data.mrp,
                isActive: data.isActive,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Updating product failed! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.data;
    },

    async toggleActive(id, currentValue) {
        // Backend's deleteProduct only sets isActive: false (soft delete).
        // To flip it back on, or to toggle either way generically, we go
        // through updateProduct with the inverted isActive value instead.
        if (currentValue === true) {
            const response = await fetch(`${BASE_URL}/products/deleteproduct/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Deactivating product failed! Status: ${response.status}`);
            }

            const responseData = await response.json();
            return responseData.data;
        }

        // reactivating: no dedicated endpoint, so use full update
        const product = await this.getById(id);
        if (!product) throw new Error("Product not found");

        return this.update(id, { ...product, isActive: true });
    },
};