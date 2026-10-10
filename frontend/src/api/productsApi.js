const BASE_URL = import.meta.env.VITE_BASE_URL;
const PRODUCT_URL = `${BASE_URL}/products`;

const mapProduct = (p) => ({
  id: p._id,
  name: p.productName,
  companyId: p.companyId?._id,
  companyName: p.companyId?.companyName,
  strength: p.strength,
  packSize: p.packSize,
  mrp: p.mrp,
  active: p.isActive,
});

export const productsApi = {
  async getAll({ search } = {}) {
    const response = await fetch(`${PRODUCT_URL}/getallproducts`, {
      credentials: 'include', // route requires verifyJWT
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    const json = await response.json();
    let result = (json.data || []).map(mapProduct);

    // backend has no text-search endpoint — filter client-side
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.companyName || '').toLowerCase().includes(q)
      );
    }
    console.log('productsApi.getAll', result);
    return result;
  },

  async getById(id) {
    const response = await fetch(`${PRODUCT_URL}/getproduct/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    const json = await response.json();
    return mapProduct(json.data);
  },

  async create(data) {
    const payload = {
      productName: data.name,
      companyId: data.companyId,
      strength: data.strength,
      packSize: data.packSize,
      mrp: data.mrp,
    };
    const response = await fetch(`${PRODUCT_URL}/addproduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add product');
    }
    const json = await response.json();
    return mapProduct(json.data);
  },

  async update(id, data) {
    const payload = {
      productName: data.name,
      companyId: data.companyId,
      strength: data.strength,
      packSize: data.packSize,
      mrp: data.mrp,
      isActive: data.active !== undefined ? data.active : true,
    };
    const response = await fetch(`${PRODUCT_URL}/updateproduct/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update product');
    }
    const json = await response.json();
    return mapProduct(json.data);
  },

  // toggleActive has two paths, since /deleteproduct is one-directional (always sets isActive:false)
  async toggleActive(product) {
    if (product.active) {
      // deactivate via the dedicated soft-delete route
      const response = await fetch(`${PRODUCT_URL}/deleteproduct/${product.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to deactivate product');
      }
      const json = await response.json();
      return mapProduct(json.data);
    } else {
      // reactivate via update, since there's no dedicated "activate" route
      return this.update(product.id, { ...product, active: true });
    }
  },
};