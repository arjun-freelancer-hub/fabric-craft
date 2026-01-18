import axios from 'axios';
import { authUtils } from './auth';
import { API_BASE_URL, ROUTES } from './routeUrls';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for cross-origin requests
});

// Log the configured API base URL in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔗 API Base URL configured:', API_BASE_URL);
    console.log('🔗 Full Login URL will be:', API_BASE_URL + '/auth/login');
}

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
        const response = await api.get(ROUTES.PRODUCTS.LIST, { params });
        return response.data;
    },

    getProductById: async (id: string): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.get(ROUTES.PRODUCTS.BY_ID(id));
        return response.data;
    },

    getProductByBarcode: async (barcode: string): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.get(ROUTES.PRODUCTS.BY_BARCODE(barcode));
        return response.data;
    },

    createProduct: async (productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.post(ROUTES.PRODUCTS.CREATE, productData);
        return response.data;
    },

    updateProduct: async (id: string, productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
        const response = await api.put(ROUTES.PRODUCTS.UPDATE(id), productData);
        return response.data;
    },

    deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(ROUTES.PRODUCTS.DELETE(id));
        return response.data;
    },

    searchProducts: async (query: string, filters?: {
        categoryId?: string;
        type?: string;
        limit?: number;
    }): Promise<ApiResponse<{ products: Product[] }>> => {
        const response = await api.get(ROUTES.PRODUCTS.SEARCH(query), { params: filters });
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
        const response = await api.get(ROUTES.CUSTOMERS.LIST, { params });
        return response.data;
    },

    getCustomerById: async (id: string): Promise<ApiResponse<{ customer: Customer }>> => {
        const response = await api.get(ROUTES.CUSTOMERS.BY_ID(id));
        return response.data;
    },

    createCustomer: async (customerData: Partial<Customer>): Promise<ApiResponse<{ customer: Customer }>> => {
        const response = await api.post(ROUTES.CUSTOMERS.CREATE, customerData);
        return response.data;
    },

    updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<ApiResponse<{ customer: Customer }>> => {
        const response = await api.put(ROUTES.CUSTOMERS.UPDATE(id), customerData);
        return response.data;
    },

    deleteCustomer: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(ROUTES.CUSTOMERS.DELETE(id));
        return response.data;
    },

    getCustomerMeasurements: async (id: string): Promise<ApiResponse<{ measurements: CustomerMeasurement[] }>> => {
        const response = await api.get(ROUTES.CUSTOMERS.MEASUREMENTS(id));
        return response.data;
    },

    addCustomerMeasurement: async (id: string, measurementData: Partial<CustomerMeasurement>): Promise<ApiResponse<{ measurement: CustomerMeasurement }>> => {
        const response = await api.post(ROUTES.CUSTOMERS.ADD_MEASUREMENT(id), measurementData);
        return response.data;
    },

    updateCustomerMeasurement: async (customerId: string, measurementId: string, measurementData: Partial<CustomerMeasurement>): Promise<ApiResponse<{ measurement: CustomerMeasurement }>> => {
        const response = await api.put(ROUTES.CUSTOMERS.UPDATE_MEASUREMENT(customerId, measurementId), measurementData);
        return response.data;
    },

    deleteCustomerMeasurement: async (customerId: string, measurementId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(ROUTES.CUSTOMERS.DELETE_MEASUREMENT(customerId, measurementId));
        return response.data;
    },

    searchCustomers: async (query: string, limit: number = 10): Promise<ApiResponse<{ customers: Customer[] }>> => {
        const response = await api.get(ROUTES.CUSTOMERS.SEARCH(query), {
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
        const response = await api.get(ROUTES.BILLS.LIST, { params });
        return response.data;
    },

    getBillById: async (id: string): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.get(ROUTES.BILLS.BY_ID(id));
        return response.data;
    },

    createBill: async (billData: CreateBillData): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.post(ROUTES.BILLS.CREATE, billData);
        return response.data;
    },

    updateBill: async (id: string, billData: Partial<Bill>): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.put(ROUTES.BILLS.UPDATE(id), billData);
        return response.data;
    },

    cancelBill: async (id: string, reason: string): Promise<ApiResponse<{ bill: Bill }>> => {
        const response = await api.patch(ROUTES.BILLS.CANCEL(id), { reason });
        return response.data;
    },

    generateInvoice: async (id: string, format: 'pdf' | 'html' = 'pdf'): Promise<Blob> => {
        const response = await api.get(ROUTES.BILLS.INVOICE(id), {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    },

    sendInvoiceWhatsApp: async (id: string, phoneNumber: string, message?: string): Promise<ApiResponse<{ method: string; whatsappUrl?: string }>> => {
        const response = await api.post(ROUTES.BILLS.SEND_WHATSAPP(id), { phoneNumber, message });
        return response.data;
    },

    addPayment: async (id: string, paymentData: {
        amount: number;
        method: string;
        notes?: string;
    }): Promise<ApiResponse<{ payment: any }>> => {
        const response = await api.post(ROUTES.BILLS.PAYMENTS(id), paymentData);
        return response.data;
    },
};

// Auth API
export const authApi = {
    // Login - calls backend API directly and stores token in cookies (readable by proxy)
    login: async (email: string, password: string): Promise<ApiResponse<{ user: any; tokens: { accessToken: string; refreshToken: string }; workspaces: any[] }>> => {
        // Log the actual URL being used for debugging
        if (typeof window !== 'undefined') {
            console.log('Login API URL:', API_BASE_URL + ROUTES.AUTH.LOGIN);
        }
        const response = await api.post(ROUTES.AUTH.LOGIN, { email, password });
        
        // Store token and user data in cookies (readable by proxy for protected routes)
        if (response.data.success && response.data.data) {
            const { user, tokens, workspaces } = response.data.data;
            authUtils.setAuth(tokens.accessToken, user, tokens.refreshToken);
            
            // Set default workspace in localStorage (client-side only state)
            if (workspaces && workspaces.length > 0 && typeof window !== 'undefined') {
                localStorage.setItem('currentWorkspaceId', workspaces[0].id);
            }
        }
        
        return response.data;
    },

    register: async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        password: string;
        organizationName?: string;
    }): Promise<ApiResponse<{ user: any; workspaces: any[]; tokens?: { accessToken: string; refreshToken: string } }>> => {
        const response = await api.post(ROUTES.AUTH.REGISTER, userData);
        
        // Store token and user data in cookies if available (readable by proxy)
        if (response.data.success && response.data.data) {
            const { user, tokens, workspaces } = response.data.data;
            if (tokens && user) {
                authUtils.setAuth(tokens.accessToken, user, tokens.refreshToken);
            }
            
            // Set default workspace in localStorage (client-side only state)
            if (workspaces && workspaces.length > 0 && typeof window !== 'undefined') {
                localStorage.setItem('currentWorkspaceId', workspaces[0].id);
            }
        }

        return response.data;
    },

    acceptInvitation: async (invitationData: {
        token: string;
        firstName?: string;
        lastName?: string;
        username?: string;
        password?: string;
    }): Promise<ApiResponse<{ user: any; workspaces: any[]; tokens?: { accessToken: string; refreshToken: string } }>> => {
        const response = await api.post(ROUTES.AUTH.ACCEPT_INVITATION, invitationData);
        
        // Store token and user data in cookies if available (readable by proxy)
        if (response.data.success && response.data.data) {
            const { user, tokens, workspaces } = response.data.data;
            if (tokens && user) {
                authUtils.setAuth(tokens.accessToken, user, tokens.refreshToken);
            }
            
            // Set default workspace in localStorage (client-side only state)
            if (workspaces && workspaces.length > 0 && typeof window !== 'undefined') {
                localStorage.setItem('currentWorkspaceId', workspaces[0].id);
            }
        }

        return response.data;
    },

    verifyInvitation: async (token: string): Promise<ApiResponse<{ invitation: { email: string; role: string; expiresAt: string } }>> => {
        const response = await api.get(ROUTES.AUTH.VERIFY_INVITATION(token));
        return response.data;
    },

    forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
        const response = await api.post(ROUTES.AUTH.FORGOT_PASSWORD, { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
        const response = await api.post(ROUTES.AUTH.RESET_PASSWORD, { token, newPassword });
        return response.data;
    },

    verifyResetToken: async (token: string): Promise<ApiResponse<null>> => {
        const response = await api.get(ROUTES.AUTH.VERIFY_RESET_TOKEN(token));
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
        const response = await api.post(ROUTES.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
        return response.data;
    },

    logout: async (): Promise<ApiResponse<null>> => {
        try {
            await api.post(ROUTES.AUTH.LOGOUT);
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
        const response = await api.get(ROUTES.AUTH.PROFILE);
        return response.data;
    },

    refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
        const response = await api.post(ROUTES.AUTH.REFRESH_TOKEN);
        // Token refresh should be handled server-side via route handler
        return response.data;
    },
};

// Workspace Management API
export const workspaceApi = {
    getWorkspaces: async (): Promise<ApiResponse<{ workspaces: any[] }>> => {
        const response = await api.get(ROUTES.WORKSPACES.LIST);
        return response.data;
    },

    createWorkspace: async (name: string, description?: string): Promise<ApiResponse<{ workspace: any }>> => {
        const response = await api.post(ROUTES.WORKSPACES.CREATE, { name, description });
        return response.data;
    },

    getWorkspace: async (workspaceId: string): Promise<ApiResponse<{ workspace: any }>> => {
        const response = await api.get(ROUTES.WORKSPACES.BY_ID(workspaceId));
        return response.data;
    },

    updateWorkspace: async (workspaceId: string, data: { name?: string; description?: string }): Promise<ApiResponse<{ workspace: any }>> => {
        const response = await api.patch(ROUTES.WORKSPACES.UPDATE(workspaceId), data);
        return response.data;
    },

    deleteWorkspace: async (workspaceId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(ROUTES.WORKSPACES.DELETE(workspaceId));
        return response.data;
    },

    getMembers: async (workspaceId: string): Promise<ApiResponse<{ members: any[]; count: number }>> => {
        const response = await api.get(ROUTES.WORKSPACES.MEMBERS(workspaceId));
        return response.data;
    },

    inviteMember: async (workspaceId: string, email: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER'): Promise<ApiResponse<{ invitation: any; invitationLink?: string }>> => {
        const response = await api.post(ROUTES.WORKSPACES.INVITE(workspaceId), { email, role });
        return response.data;
    },

    updateMemberRole: async (workspaceId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER'): Promise<ApiResponse<null>> => {
        const response = await api.patch(ROUTES.WORKSPACES.MEMBER_ROLE(workspaceId, userId), { role });
        return response.data;
    },

    removeMember: async (workspaceId: string, userId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(ROUTES.WORKSPACES.REMOVE_MEMBER(workspaceId, userId));
        return response.data;
    },

    getInvitations: async (workspaceId: string, status?: string): Promise<ApiResponse<{ invitations: any[] }>> => {
        const response = await api.get(ROUTES.WORKSPACES.INVITATIONS(workspaceId), { params: { status } });
        return response.data;
    },

    resendInvitation: async (workspaceId: string, invitationId: string): Promise<ApiResponse<null>> => {
        const response = await api.post(ROUTES.WORKSPACES.RESEND_INVITATION(workspaceId, invitationId));
        return response.data;
    },

    cancelInvitation: async (workspaceId: string, invitationId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(ROUTES.WORKSPACES.CANCEL_INVITATION(workspaceId, invitationId));
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
        const response = await api.get(ROUTES.USERS.LIST, { params });
        return response.data;
    },

    getUserById: async (userId: string): Promise<ApiResponse<{ user: any }>> => {
        const response = await api.get(ROUTES.USERS.BY_ID(userId));
        return response.data;
    },
};

// Settings API
export const settingsApi = {
    getWhatsAppSettings: async (): Promise<ApiResponse<{ settings: any }>> => {
        const response = await api.get(ROUTES.SETTINGS.WHATSAPP);
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
        const response = await api.put(ROUTES.SETTINGS.WHATSAPP, settings);
        return response.data;
    },

    testWhatsAppConnection: async (): Promise<ApiResponse<null>> => {
        const response = await api.post(ROUTES.SETTINGS.WHATSAPP_TEST);
        return response.data;
    },

    getBusinessSettings: async (): Promise<ApiResponse<{ settings: any }>> => {
        const response = await api.get(ROUTES.SETTINGS.BUSINESS_INFO);
        return response.data;
    },

    updateBusinessSettings: async (settings: any): Promise<ApiResponse<{ settings: any }>> => {
        const response = await api.put(ROUTES.SETTINGS.BUSINESS_INFO, settings);
        return response.data;
    },

    uploadLogo: async (logo: string): Promise<ApiResponse<{ logo: string }>> => {
        const response = await api.post(ROUTES.SETTINGS.BUSINESS_LOGO, { logo });
        return response.data;
    },

    generateSampleInvoice: async (billData: any, template: string): Promise<Blob> => {
        const response = await api.post(ROUTES.SETTINGS.GENERATE_SAMPLE_INVOICE,
            { billData, template },
            { responseType: 'blob' }
        );
        return response.data;
    },
};

export default api;