import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAuthToken, clearAuth } from './auth'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuth()
      if (window.location.pathname !== '/login' && window.location.pathname !== '/netbanking/login') {
        window.location.href = '/netbanking/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as ApiResponse
    if (data.errors) {
      return Object.values(data.errors).flat().join(', ')
    }
    return data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export default api