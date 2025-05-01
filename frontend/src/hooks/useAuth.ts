import { useState, useEffect, useCallback } from 'react'
import { api, ApiResponse } from '@/services/api'
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  setUserData,
  clearUserData,
  getUserType,
  setUserType,
  clearUserType,
  AuthUser
} from '@/services/auth'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const fetchUser = useCallback(async () => {
    const token = getAuthToken()
    const userType = getUserType()
    
    if (!token || !userType) {
      setState({ user: null, loading: false, error: null })
      return
    }

    try {
      const endpoint = userType === 'customer' ? '/customer/me' : '/admin/me'
      const response = await api.get<ApiResponse<AuthUser>>(endpoint)
      
      if (response.data.success && response.data.data) {
        setUserData(response.data.data)
        setState({ user: response.data.data, loading: false, error: null })
      } else {
        throw new Error(response.data.message || 'Failed to fetch user')
      }
    } catch (error) {
      clearAuthToken()
      clearUserData()
      clearUserType()
      setState({ user: null, loading: false, error: 'Session expired' })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (token: string, user: AuthUser, userType: 'customer' | 'admin') => {
    setAuthToken(token)
    setUserData(user)
    setUserType(userType)
    setState({ user, loading: false, error: null })
  }

  const logout = async () => {
    try {
      const userType = getUserType()
      if (userType) {
        await api.post(`/${userType}/logout`)
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearAuthToken()
      clearUserData()
      clearUserType()
      setState({ user: null, loading: false, error: null })
    }
  }

  const updateUser = (userData: Partial<AuthUser>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData }
      setUserData(updatedUser)
      setState(prev => ({ ...prev, user: updatedUser }))
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    updateUser,
    refreshUser: fetchUser,
    isAuthenticated: !!state.user,
  }
}

// Hook for protected routes
export function useRequireAuth(userType?: 'customer' | 'admin') {
  const { user, loading, isAuthenticated } = useAuth()
  const currentUserType = getUserType()

  if (loading) {
    return { user: null, loading: true, authorized: false, isAuthenticated: false }
  }

  if (!isAuthenticated) {
    return { user: null, loading: false, authorized: false, isAuthenticated: false }
  }

  if (userType && currentUserType !== userType) {
    return { user: null, loading: false, authorized: false, isAuthenticated: true }
  }

  return { user, loading: false, authorized: true, isAuthenticated: true }
}