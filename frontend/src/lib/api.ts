import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/fintech-api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'An unexpected error occurred'
    return Promise.reject(new Error(msg))
  }
)

export default api

export const economicsApi = {
  npv:         (data: object) => api.post('/api/econ/npv', data),
  breakeven:   (data: object) => api.post('/api/econ/breakeven', data),
  depreciation:(data: object) => api.post('/api/econ/depreciation', data),
}

export const marketApi = {
  rates: ()              => api.get('/api/market/rates'),
  asset: (ticker: string)=> api.get(`/api/market/asset/${ticker.toUpperCase()}`),
}

export const optimizerApi = {
  optimize: (data: object) => api.post('/api/optimizer', data),
}

export const capitalApi = {
  allocate: (data: object) => api.post('/api/capital', data),
}

export const monteCarloApi = {
  simulate: (data: object) => api.post('/api/monte-carlo', data),
}
