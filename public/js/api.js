const API_BASE_URL = '/api';

const request = async (method, path, data = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: method.toUpperCase(),
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${API_BASE_URL}${path}`;
  console.log(`Making ${method.toUpperCase()} request to: ${url}`, data ? { data } : '');
  
  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      // If response is not JSON (e.g., HTML error page), use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

window.api = {
  get: (path) => request('GET', path),
  post: (path, data) => request('POST', path, data),
  put: (path, data) => request('PUT', path, data),
  delete: (path) => request('DELETE', path),
  auth: {
    register: (data) => request('POST', '/auth/register', data),
    // You can add login and other auth methods here if needed
  }
}; 