import { mockProducts } from '../mocks/mockProducts';

const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));
let products = [...mockProducts];

export const productsApi = {
  async getAll(filters = {}) {
    await delay();
    let result = [...products];
    if (filters.search)   result = result.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.category) result = result.filter(p => p.category === filters.category);
    return result;
  },

  async getById(id) {
    await delay();
    return products.find(p => p.id === id) || null;
  },

  async create(data) {
    await delay(300);
    const newProduct = { id: Date.now(), active: true, ...data };
    products.push(newProduct);
    return newProduct;
  },

  async update(id, data) {
    await delay(300);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    products[idx] = { ...products[idx], ...data };
    return products[idx];
  },

  async toggleActive(id) {
    await delay();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    products[idx].active = !products[idx].active;
    return products[idx];
  },
};
