import { api, ApiResponse } from './api'

export interface Application {
  id: string
  acknowledgement_number: string
  status: string
  preferred_account_type: string
  submitted_at: string | null
  approved_at: string | null
  steps: ApplicationStep[]
}

export interface ApplicationStep {
  id: string
  step_key: string
  step_name: string
  step_order: number
  status: string
  reviewed_at: string | null
  rejection_reason: string | null
}

export interface ApplicationCreateResponse {
  application: Application
}

export class ApplicationService {
  static async createDraft(): Promise<Application> {
    const response = await api.post<ApiResponse<ApplicationCreateResponse>>('/applications')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create application')
    }
    return response.data.data!.application
  }

  static async savePersonalInfo(applicationId: string, data: Record<string, unknown>): Promise<void> {
    const response = await api.post<ApiResponse>(`/applications/${applicationId}/personal-info`, data)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save personal information')
    }
  }

  static async saveContactInfo(applicationId: string, data: Record<string, unknown>): Promise<void> {
    const response = await api.post<ApiResponse>(`/applications/${applicationId}/contact-info`, data)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save contact information')
    }
  }

  static async saveKycInfo(applicationId: string, data: Record<string, unknown>): Promise<void> {
    const response = await api.post<ApiResponse>(`/applications/${applicationId}/kyc-info`, data)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save KYC information')
    }
  }

  static async saveAddressInfo(applicationId: string, data: Record<string, unknown>): Promise<void> {
    const response = await api.post<ApiResponse>(`/applications/${applicationId}/address-info`, data)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save address information')
    }
  }

  static async submitApplication(applicationId: string): Promise<{ acknowledgement_number: string }> {
    const response = await api.post<ApiResponse<{ acknowledgement_number: string }>>(`/applications/${applicationId}/submit`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit application')
    }
    return response.data.data!
  }

  static async getApplication(acknowledgementNumber: string): Promise<Application> {
    const response = await api.get<ApiResponse<Application>>(`/track/${acknowledgementNumber}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Application not found')
    }
    return response.data.data!
  }

  static async getApplicationById(applicationId: string): Promise<Application> {
    const response = await api.get<ApiResponse<Application>>(`/applications/${applicationId}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Application not found')
    }
    return response.data.data!
  }
}