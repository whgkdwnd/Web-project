import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const teamApi = {
  create: (name) => api.post('/teams', { name }),
  get: (code) => api.get(`/teams/${code}`),
}

export const memberApi = {
  create: (code, name, color) => api.post(`/teams/${code}/members`, { name, color }),
  list: (code) => api.get(`/teams/${code}/members`),
}

export const eventApi = {
  list: (code, year, month) => api.get(`/teams/${code}/events`, { params: { year, month } }),
  create: (code, data) => api.post(`/teams/${code}/events`, data),
  update: (code, id, data) => api.put(`/teams/${code}/events/${id}`, data),
  delete: (code, id) => api.delete(`/teams/${code}/events/${id}`),
}
