import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const authApi = {
  register: async (email, password, name) => {
    const res = await axios.post(`${API}/auth/register`, { email, password, name });
    return res.data;
  },
  login: async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    return res.data;
  },
  exchangeSession: async (sessionId) => {
    const res = await axios.get(`${API}/auth/session`, {
      headers: { 'X-Session-ID': sessionId },
      withCredentials: true
    });
    return res.data;
  },
  getMe: async (token) => {
    const res = await axios.get(`${API}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true
    });
    return res.data;
  },
  logout: async () => {
    const res = await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    return res.data;
  }
};
