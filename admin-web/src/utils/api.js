import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 5000
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const login = (username, password) => instance.post('/admin/login', { username, password })
export const changePassword = (oldPassword, newPassword) => instance.put('/admin/password', { oldPassword, newPassword })
export const getOrders = (status = 'all') => instance.get(`/orders?status=${status}`)
export const updateOrderStatus = (orderId, status) => instance.put(`/orders/${orderId}/status`, { status })
export const getCards = (params = {}) => instance.get('/cards', { params })
export const importCards = (newCards) => instance.post('/cards/import', { newCards })
export const deleteCard = (cardNo) => instance.delete(`/cards/${encodeURIComponent(cardNo)}`)
export const exportOrders = () => instance.get('/orders/export', { responseType: 'blob' })