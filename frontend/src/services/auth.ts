const AUTH_TOKEN_KEY = 'fusionbanking_auth_token'
const USER_DATA_KEY = 'fusionbanking_user_data'
const USER_TYPE_KEY = 'fusionbanking_user_type' // 'customer' | 'admin'

export interface User {
  id: number
  customer_id?: string
  email: string
  full_name: string
  mobile: string
  is_active: boolean
}

export interface AdminUser {
  id: number
  username: string
  email: string
  full_name: string
  is_master: boolean
  is_active: boolean
}

export type AuthUser = User | AdminUser

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function setUserData(user: AuthUser): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
}

export function getUserData(): AuthUser | null {
  const data = localStorage.getItem(USER_DATA_KEY)
  return data ? JSON.parse(data) : null
}

export function clearUserData(): void {
  localStorage.removeItem(USER_DATA_KEY)
}

export function setUserType(type: 'customer' | 'admin'): void {
  localStorage.setItem(USER_TYPE_KEY, type)
}

export function getUserType(): 'customer' | 'admin' | null {
  return localStorage.getItem(USER_TYPE_KEY) as 'customer' | 'admin' | null
}

export function clearUserType(): void {
  localStorage.removeItem(USER_TYPE_KEY)
}

export function clearAuth(): void {
  clearAuthToken()
  clearUserData()
  clearUserType()
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export function isCustomer(): boolean {
  return getUserType() === 'customer'
}

export function isAdmin(): boolean {
  return getUserType() === 'admin'
}