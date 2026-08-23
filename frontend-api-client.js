const DEFAULT_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'adminToken';

const defaultStorage = {
  getItem(key) {
    return typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(key)
      : null;
  },
  setItem(key, value) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem(key) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function createApiClient({
  baseUrl = DEFAULT_BASE_URL,
  tokenKey = TOKEN_KEY,
  storage = defaultStorage,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required to create the API client');
  }

  const base = baseUrl.replace(/\/$/, '');

  const request = async (path, { method = 'GET', query, body, headers } = {}) => {
    const url = new URL(`${base}${path}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const token = storage.getItem(tokenKey);
    const requestHeaders = {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    const response = await fetchImpl(url.toString(), {
      method,
      headers: requestHeaders,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const contentType = response.headers?.get('content-type') || '';
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message = responseBody && typeof responseBody === 'object'
        ? responseBody.message
        : responseBody;
      throw new ApiError(message || `Request failed with status ${response.status}`, response.status, responseBody);
    }

    return responseBody;
  };

  const resourceClient = (resource) => ({
    list: (query) => request(`/${resource}`, { query }),
    getBySlug: (slug) => request(`/${resource}/${encodeURIComponent(slug)}`),
    adminList: (query) => request(`/${resource}/admin/list`, { query }),
    create: (payload) => request(`/${resource}`, { method: 'POST', body: payload }),
    update: (id, payload) => request(`/${resource}/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  });

  return {
    request,

    health: () => request('/health'),

    auth: {
      register: async (payload) => {
        const response = await request('/auth/register', { method: 'POST', body: payload });
        if (response.token) storage.setItem(tokenKey, response.token);
        return response;
      },
      login: async (email, password) => {
        const response = await request('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        if (response.token) storage.setItem(tokenKey, response.token);
        return response;
      },
      me: () => request('/auth/me'),
      logout: () => storage.removeItem(tokenKey),
      getToken: () => storage.getItem(tokenKey),
      setToken: (token) => storage.setItem(tokenKey, token),
    },

    services: resourceClient('services'),
    blogs: resourceClient('blogs'),
    caseStudies: resourceClient('case-studies'),
    testimonials: resourceClient('testimonials'),

    leads: {
      submit: (payload) => request('/leads', { method: 'POST', body: payload }),
      list: (query) => request('/leads', { query }),
      updateStatus: (id, status) => request(`/leads/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status },
      }),
      updateReadState: (id, isRead) => request(`/leads/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        body: { isRead },
      }),
    },

    siteSettings: {
      get: () => request('/site-settings'),
      update: (payload) => request('/site-settings', { method: 'PUT', body: payload }),
    },

    admin: {
      dashboard: () => request('/admin/dashboard'),
      analytics: () => request('/admin/analytics'),
    },
  };
}

const api = createApiClient();

export default api;
