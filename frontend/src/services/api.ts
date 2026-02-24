import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getAuthToken, clearAuth } from './auth'

// The Laravel API groups every endpoint under a versioned prefix
// (routes/api.php → Route::prefix('v1')). VITE_API_URL is the API root,
// e.g. "/api" in development through the Vite proxy.
const API_ROOT = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

const attachInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid — send the user to the login portal that
        // matches their stored user type (admins must not land on customer login).
        const userType = localStorage.getItem('fusionbanking_user_type')
        const currentPath = window.location.pathname
        clearAuth()
        const loginPath = userType === 'admin' ? '/admin/login' : '/netbanking/login'
        const onLoginAlready = currentPath === '/admin/login' || currentPath === '/netbanking/login'
        if (!onLoginAlready) {
          window.location.href = loginPath
        }
      }
      return Promise.reject(error)
    }
  )
}

export const api = axios.create({
  baseURL: `${API_ROOT}/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// Client for endpoints registered outside the versioned group (POST /api/logout).
export const apiRoot = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

attachInterceptors(api)
attachInterceptors(apiRoot)

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