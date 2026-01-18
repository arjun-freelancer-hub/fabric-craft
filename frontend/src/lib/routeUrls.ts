/**
 * API Route URLs
 * 
 * Centralized file for all API endpoints.
 * Modify these URLs when the backend API routes change.
 */

// Base API URL
// For client-side requests, use the full backend URL (browser makes direct requests)
// For server-side requests, this can use a relative URL or the full URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Auth Routes
export const AUTH_ROUTES = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_RESET_TOKEN: (token: string) => `/auth/reset-password/verify/${token}`,
    CHANGE_PASSWORD: '/auth/change-password',
    ACCEPT_INVITATION: '/auth/accept-invitation',
    VERIFY_INVITATION: (token: string) => `/auth/invite/verify/${token}`,
} as const;

// Product Routes
export const PRODUCT_ROUTES = {
    LIST: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    BY_BARCODE: (barcode: string) => `/products/barcode/${barcode}`,
    SEARCH: (query: string) => `/products/search/${query}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
} as const;

// Customer Routes
export const CUSTOMER_ROUTES = {
    LIST: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
    SEARCH: (query: string) => `/customers/search/${encodeURIComponent(query)}`,
    CREATE: '/customers',
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
    MEASUREMENTS: (id: string) => `/customers/${id}/measurements`,
    ADD_MEASUREMENT: (id: string) => `/customers/${id}/measurements`,
    UPDATE_MEASUREMENT: (customerId: string, measurementId: string) => `/customers/${customerId}/measurements/${measurementId}`,
    DELETE_MEASUREMENT: (customerId: string, measurementId: string) => `/customers/${customerId}/measurements/${measurementId}`,
} as const;

// Bill Routes
export const BILL_ROUTES = {
    LIST: '/bills',
    BY_ID: (id: string) => `/bills/${id}`,
    CREATE: '/bills',
    UPDATE: (id: string) => `/bills/${id}`,
    CANCEL: (id: string) => `/bills/${id}/cancel`,
    INVOICE: (id: string) => `/bills/${id}/invoice`,
    SEND_WHATSAPP: (id: string) => `/bills/${id}/send-whatsapp`,
    PAYMENTS: (id: string) => `/bills/${id}/payments`,
} as const;

// Workspace Routes
export const WORKSPACE_ROUTES = {
    LIST: '/workspaces',
    BY_ID: (workspaceId: string) => `/workspaces/${workspaceId}`,
    CREATE: '/workspaces',
    UPDATE: (workspaceId: string) => `/workspaces/${workspaceId}`,
    DELETE: (workspaceId: string) => `/workspaces/${workspaceId}`,
    MEMBERS: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
    MEMBER_ROLE: (workspaceId: string, userId: string) => `/workspaces/${workspaceId}/members/${userId}/role`,
    REMOVE_MEMBER: (workspaceId: string, userId: string) => `/workspaces/${workspaceId}/members/${userId}`,
    INVITE: (workspaceId: string) => `/workspaces/${workspaceId}/invite`,
    INVITATIONS: (workspaceId: string) => `/workspaces/${workspaceId}/invitations`,
    RESEND_INVITATION: (workspaceId: string, invitationId: string) => `/workspaces/${workspaceId}/invitations/${invitationId}/resend`,
    CANCEL_INVITATION: (workspaceId: string, invitationId: string) => `/workspaces/${workspaceId}/invitations/${invitationId}`,
} as const;

// User Routes
export const USER_ROUTES = {
    LIST: '/users',
    BY_ID: (userId: string) => `/users/${userId}`,
} as const;

// Settings Routes
export const SETTINGS_ROUTES = {
    WHATSAPP: '/settings/whatsapp',
    WHATSAPP_TEST: '/settings/whatsapp/test',
    BUSINESS_INFO: '/settings/business/info',
    BUSINESS_LOGO: '/settings/business/logo',
    GENERATE_SAMPLE_INVOICE: '/settings/business/generate-sample-invoice',
} as const;

// Export all routes as a single object for convenience
export const ROUTES = {
    AUTH: AUTH_ROUTES,
    PRODUCTS: PRODUCT_ROUTES,
    CUSTOMERS: CUSTOMER_ROUTES,
    BILLS: BILL_ROUTES,
    WORKSPACES: WORKSPACE_ROUTES,
    USERS: USER_ROUTES,
    SETTINGS: SETTINGS_ROUTES,
} as const;
