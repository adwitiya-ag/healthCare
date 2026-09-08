const BASE_URL = import.meta.env.VITE_BASE_URL;


export const distributionApi = {
  async getAll(filters = {}) {

    const params = new URLSearchParams();
    if (filters.doctorId) params.append("doctorId", filters.doctorId);
    if (filters.productId) params.append("productId", filters.productId);
    if (filters.mrId) params.append("userId", filters.mrId);
   
    const response = await fetch(
      `${BASE_URL}/sample-distribution/fetch?${params.toString()}`, 
      {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Fetching distributions failed! Status: ${response.status}`);
    }
    
    const responseData = await response.json();
    return responseData.data;
  },

  async record(data) {
    const response = await fetch(
      `${BASE_URL}/sample-distribution/add`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        doctorId: data.doctorId,
        productId: data.productId,
        quantity: data.quantity || 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Recording distribution failed! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data;
  },

  
};

export const preferencesApi = {
  async getAll(filters = {}) {
    await delay();
    let result = [...preferences];
    if (filters.mrId)     result = result.filter(p => p.mrId === filters.mrId);
    if (filters.doctorId) result = result.filter(p => p.doctorId === filters.doctorId);
    return result;
  },

  async record(data) {
    await delay(300);
    const newPref = { id: Date.now(), date: new Date().toISOString().split('T')[0], ...data };
    preferences.push(newPref);
    return newPref;
  },
};
