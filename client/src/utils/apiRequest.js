const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiRequest = async (path, token, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Error inesperado en la API');
  }

  return response.json();
};

export { API_BASE };
