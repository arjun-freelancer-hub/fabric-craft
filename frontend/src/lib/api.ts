import axios from 'axios';
import { authUtils } from './auth';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for cross-origin requests
});

// Request interceptor to add auth token and workspace context
api.interceptors.request.use(
    (config) => {
        const token = authUtils.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add workspace context (only if available and not on auth endpoints)
        const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') : null;
        const isAuthEndpoint = config.url?.includes('/auth/');

        if (workspaceId && !isAuthEndpoint) {
            config.headers['X-Organization-Id'] = workspaceId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (!error.response) {
            const networkError = {
                response: {
                    data: {
                        message: 'Network error. Please check if the server is running.',
                        error: 'NETWORK_ERROR'
                    },
                    status: 0
                },
                message: 'Network error'
            };
            return Promise.reject(networkError);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            authUtils.clearAuth();
            // Only redirect if we're in the browser and not on auth pages
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
                window.location.href = '/auth/login';
            }
        }

        // Enhance error object with user-friendly messages
        const enhancedError = {
            ...error,
            response: {
                ...error.response,
                data: {
                    ...error.response?.data,
                    message: error.response?.data?.message || error.message || 'An error occurred',
                }
            }
        };

        return Promise.reject(enhancedError);
    }
);

// API Types
export interface Product {
    id: string;
    name: string;
    type: 'FABRIC' | 'READY_MADE' | 'ACCESSORY' | 'TAILORING_SERVICE' | 'CUSTOM';
    category: {
        id: string;
        name: string;
    };
    basePrice: number;
    sellingPrice: number;
    costPrice: number;
    unit: string;
    stock?: number;
    barcode?: string;
    description?: string;
    sku: string;
    isActive: boolean;
    isTailoring: boolean;
    tailoringPrice?: number;
    imageUrl?: string;
    specifications?: any;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerMeasurement {
    id: string;
    customerId: string;
    name: string;
    chest?: number;
    waist?: number;
    hip?: number;
    shoulder?: number;
    sleeve?: number;
    length?: number;
    inseam?: number;
    neck?: number;
    notes?: string;
    createdAt: string;
}

export interface BillItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    total: number;
    product: Product;
}

export interface Bill {
    id: string;
    billNumber: string;
    customerId: string;
    customer: Customer;
    items: BillItem[];
    subtotal: number;
    discount: number;
    tax: number;
    finalAmount: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'partial';
    paymentMethod?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBillItem {
    productId?: string;
    customName?: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    discount?: number;
    isTailoring?: boolean;
    tailoringPrice?: number;
    measurements?: any;
    notes?: string;
}

export interface CreateBillData {
    customerId?: string;
    items: CreateBillItem[];
    discountAmount?: number;
    taxAmount?: number;
    paymentMethod: string;
    notes?: string;
    deliveryDate?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        [key: string]: T[];
    } & {
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

// Product API
export const productApi = {
    getProducts: async (params?: {
        search?: string;
        categoryId?: string;
        type?: string;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Product>> => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    getProductById: async (id: string): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    getProductByBarcode: async (barcode: string): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.get(`/products/barcode/${barcode}`);
        return response.data;
    },

    createProduct: async (productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    updateProduct: async (id: string, productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    searchProducts: async (query: string, filters?: {
        categoryId?: string;
        type?: string;
        limit?: number;
    }): Promise<ApiResponse<{ products: Product[] }>> => {
        const response = await api.get(`/products/search/${query}`, { params: filters });
        return response.data;
    },
};

// Customer API
export const customerApi = {
    getCustomers: async (params?: {
        search?: string;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Customer>> => {
        const response = await api.get('/customers', { params });
        return response.data;
    },

    getCustomerById: async (id: string): Promise<ApiResponse<{ customer: Customer }>> => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },

    createCustomer: async (customerData: Partial<Customer>): Promise<ApiResponse<{ customer: Customer }>> => {
        const response = await api.post('/customers', customerData);
        return response.data;
    },

    updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<ApiResponse<{ customer: Customer }>> => {
        const response = await api.put(`/customers/${id}`, customerData);
        return response.data;
    },

    deleteCustomer: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    },

    getCustomerMeasurements: async (id: string): Promise<ApiResponse<{ measurements: CustomerMeasurement[] }>> => {
        const response = await api.get(`/customers/${id}/measurements`);
        return response.data;
    },

    addCustomerMeasurement: async (id: string, measurementData: Partial<CustomerMeasurement>): Promise<ApiResponse<{ measurement: CustomerMeasurement }>> => {
        const response = await api.post(`/customers/${id}/measurements`, measurementData);
        return response.data;
    },

    updateCustomerMeasurement: async (customerId: string, measurementId: string, measurementData: Partial<CustomerMeasurement>): Promise<ApiResponse<{ measurement: CustomerMeasurement }>> => {
        const response = await api.put(`/customers/${customerId}/measurements/${measurementId}`, measurementData);
        return response.data;
    },

    deleteCustomerMeasurement: async (customerId: string, measurementId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/customers/${customerId}/measurements/${measurementId}`);
        return response.data;
    },

    searchCustomers: async (query: string, limit: number = 10): Promise<ApiResponse<{ customers: Customer[] }>> => {
        const response = await api.get(`/customers/search/${encodeURIComponent(query)}`, {
            params: { limit }
        });
        return response.data;
    },
};

// Bill API
export const billApi = {
    getBills: async (params?: {
        customerId?: string;
        status?: string;
        paymentStatus?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Bill>> => {
        const response = await api.get('/bills', { params });
        return response.data;
    },

    getBillById: async (id: string): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.get(`/bills/${id}`);
        return response.data;
    },

    createBill: async (billData: CreateBillData): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.post('/bills', billData);
        return response.data;
    },

    updateBill: async (id: string, billData: Partial<Bill>): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.put(`/bills/${id}`, billData);
        return response.data;
    },

    cancelBill: async (id: string, reason: string): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.patch(`/bills/${id}/cancel`, { reason });
        return response.data;
    },

    generateInvoice: async (id: string, format: 'pdf' | 'html' = 'pdf'): Promise<Blob> => {
        const response = await api.get(`/bills/${id}/invoice`, {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    },

    sendInvoiceWhatsApp: async (id: string, phoneNumber: string, message?: string): Promise<ApiResponse<{ method: string; whatsappUrl?: string }>> => {
        const response = await api.post(`/bills/${id}/send-whatsapp`, { phoneNumber, message });
        return response.data;
    },

    addPayment: async (id: string, paymentData: {
        amount: number;
        method: string;
        notes?: string;
    }): Promise<ApiResponse<{ payment: any }>> => {
        const response = await api.post(`/bills/${id}/payments`, paymentData);
        return response.data;
    },
};

// Auth API
export const authApi = {
    // Note: login() is deprecated - use the route handler at /api/auth/login instead
    // This method is kept for backward compatibility but does not set cookies
    login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
        const response = await api.post('/auth/login', { email, password });
        // Cookies are now set server-side via route handler
        return response.data;
    },

    register: async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        password: string;
        organizationName?: string;
    }): Promise<ApiResponse<{ user: any; workspaces: any[] }>> => {
        const response = await api.post('/auth/register', userData);
        // Cookies should be set server-side via route handler
        // Set default workspace if available
        const { workspaces } = response.data.data;
        if (workspaces && workspaces.length > 0 && typeof window !== 'undefined') {
            localStorage.setItem('currentWorkspaceId', workspaces[0].id);
        }

        return response.data;
    },

    acceptInvitation: async (invitationData: {
        token: string;
        firstName?: string;
        lastName?: string;
        username?: string;
        password?: string;
    }): Promise<ApiResponse<{ user: any; workspaces: any[] }>> => {
        const response = await api.post('/auth/accept-invitation', invitationData);
        // Cookies should be set server-side via route handler
        // Set default workspace if available
        const { workspaces } = response.data.data;
        if (workspaces && workspaces.length > 0 && typeof window !== 'undefined') {
            localStorage.setItem('currentWorkspaceId', workspaces[0].id);
        }

        return response.data;
    },

    verifyInvitation: async (token: string): Promise<ApiResponse<{ invitation: { email: string; role: string; expiresAt: string } }>> => {
        const response = await api.get(`/auth/invite/verify/${token}`);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    verifyResetToken: async (token: string): Promise<ApiResponse<null>> => {
        const response = await api.get(`/auth/reset-password/verify/${token}`);
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
        const response = await api.post('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    },

    logout: async (): Promise<ApiResponse<null>> => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Even if the API call fails, clear local auth data
            console.error('Logout API call failed:', error);
        } finally {
            // Always clear local auth data
            authUtils.clearAuth();
        }

        return { success: true, data: null };
    },

    getProfile: async (): Promise<ApiResponse<{ user: any }>> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
        const response = await api.post('/auth/refresh');
        // Token refresh should be handled server-side via route handler
        return response.data;
    },
};

// Workspace Management API
export const workspaceApi = {
    getWorkspaces: async (): Promise<ApiResponse<{ workspaces: any[] }>> => {
        const response = await api.get('/workspaces');
        return response.data;
    },

    createWorkspace: async (name: string, description?: string): Promise<ApiResponse<{ workspace: any }>> => {
        const response = await api.post('/workspaces', { name, description });
        return response.data;
    },

    getWorkspace: async (workspaceId: string): Promise<ApiResponse<{ workspace: any }>> => {
        const response = await api.get(`/workspaces/${workspaceId}`);
        return response.data;
    },

    updateWorkspace: async (workspaceId: string, data: { name?: string; description?: string }): Promise<ApiResponse<{ workspace: any }>> => {
        const response = await api.patch(`/workspaces/${workspaceId}`, data);
        return response.data;
    },

    deleteWorkspace: async (workspaceId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/workspaces/${workspaceId}`);
        return response.data;
    },

    getMembers: async (workspaceId: string): Promise<ApiResponse<{ members: any[]; count: number }>> => {
        const response = await api.get(`/workspaces/${workspaceId}/members`);
        return response.data;
    },

    inviteMember: async (workspaceId: string, email: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER'): Promise<ApiResponse<{ invitation: any; invitationLink?: string }>> => {
        const response = await api.post(`/workspaces/${workspaceId}/invite`, { email, role });
        return response.data;
    },

    updateMemberRole: async (workspaceId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER'): Promise<ApiResponse<null>> => {
        const response = await api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
        return response.data;
    },

    removeMember: async (workspaceId: string, userId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
        return response.data;
    },

    getInvitations: async (workspaceId: string, status?: string): Promise<ApiResponse<{ invitations: any[] }>> => {
        const response = await api.get(`/workspaces/${workspaceId}/invitations`, { params: { status } });
        return response.data;
    },

    resendInvitation: async (workspaceId: string, invitationId: string): Promise<ApiResponse<null>> => {
        const response = await api.post(`/workspaces/${workspaceId}/invitations/${invitationId}/resend`);
        return response.data;
    },

    cancelInvitation: async (workspaceId: string, invitationId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
        return response.data;
    },
};

// User API (simplified)
export const userApi = {
    getUsers: async (params?: {
        search?: string;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<any>> => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    getUserById: async (userId: string): Promise<ApiResponse<{ user: any }>> => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },
};

// Settings API
export const settingsApi = {
    getWhatsAppSettings: async (): Promise<ApiResponse<{ settings: any }>> => {
        const response = await api.get('/settings/whatsapp');
        return response.data;
    },

    updateWhatsAppSettings: async (settings: {
        enabled: boolean;
        method: 'web' | 'api';
        apiUrl?: string;
        accessToken?: string;
        phoneNumberId?: string;
        businessAccountId?: string;
    }): Promise<ApiResponse<{ settings: any }>> => {
        const response = await api.put('/settings/whatsapp', settings);
        return response.data;
    },

    testWhatsAppConnection: async (): Promise<ApiResponse<null>> => {
        const response = await api.post('/settings/whatsapp/test');
        return response.data;
    },

    getBusinessSettings: async (): Promise<ApiResponse<{ settings: any }>> => {
        const response = await api.get('/settings/business/info');
        return response.data;
    },

    updateBusinessSettings: async (settings: any): Promise<ApiResponse<{ settings: any }>> => {
        const response = await api.put('/settings/business/info', settings);
        return response.data;
    },

    uploadLogo: async (logo: string): Promise<ApiResponse<{ logo: string }>> => {
        const response = await api.post('/settings/business/logo', { logo });
        return response.data;
    },

    generateSampleInvoice: async (billData: any, template: string): Promise<Blob> => {
        const response = await api.post('/settings/business/generate-sample-invoice',
            { billData, template },
            { responseType: 'blob' }
        );
        return response.data;
    },
};

export default api;