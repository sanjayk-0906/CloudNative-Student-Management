const BASE_URL = '/api';

/**
 * Generic fetch wrapper with JSON error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message);
    throw error;
  }
}

// ------------------------------------------------------------------------------
// Health & Infrastructure API
// ------------------------------------------------------------------------------
export const healthAPI = {
  getHealth: () => apiRequest('/health')
};

// ------------------------------------------------------------------------------
// Students API
// ------------------------------------------------------------------------------
export const studentsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/students${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/students/${id}`),
  create: (formData) => {
    if (formData instanceof FormData) {
      return apiRequest('/students', {
        method: 'POST',
        body: formData
      });
    }
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },
  update: (id, formData) => {
    if (formData instanceof FormData) {
      return apiRequest(`/students/${id}`, {
        method: 'PUT',
        body: formData
      });
    }
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
  },
  delete: (id) => apiRequest(`/students/${id}`, { method: 'DELETE' }),
  uploadPhoto: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(`/students/${id}/upload`, {
      method: 'POST',
      body: formData
    });
  }
};

// ------------------------------------------------------------------------------
// Attendance API
// ------------------------------------------------------------------------------
export const attendanceAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/attendance${query ? `?${query}` : ''}`);
  },
  getSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/attendance/summary${query ? `?${query}` : ''}`);
  },
  record: (data) => apiRequest('/attendance', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/attendance/${id}`, { method: 'DELETE' })
};

// ------------------------------------------------------------------------------
// Marks & Academic Results API
// ------------------------------------------------------------------------------
export const marksAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/marks${query ? `?${query}` : ''}`);
  },
  getSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/marks/summary${query ? `?${query}` : ''}`);
  },
  addOrUpdate: (data) => apiRequest('/marks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/marks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/marks/${id}`, { method: 'DELETE' })
};

// ------------------------------------------------------------------------------
// Dashboard Analytics API
// ------------------------------------------------------------------------------
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard')
};
