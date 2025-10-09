import { Customer, Gender } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreateCustomerData {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    createdBy: string;
}
export interface UpdateCustomerData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    isActive?: boolean;
}
export interface CreateMeasurementData {
    name: string;
    measurements: any;
    notes?: string;
}
export interface UpdateMeasurementData {
    name?: string;
    measurements?: any;
    notes?: string;
}
export declare class CustomerModel extends BaseModel<Customer> {
    getTableName(): string;
    createCustomer(data: CreateCustomerData): Promise<Customer>;
    updateCustomer(id: string, data: UpdateCustomerData): Promise<Customer>;
    findByEmailOrPhone(email?: string, phone?: string): Promise<Customer | null>;
    findByEmail(email: string): Promise<Customer | null>;
    findByPhone(phone: string): Promise<Customer | null>;
    searchCustomers(query: string, limit?: number): Promise<Customer[]>;
    getCustomerMeasurements(customerId: string): Promise<any[]>;
    addCustomerMeasurement(customerId: string, data: CreateMeasurementData): Promise<any>;
    updateCustomerMeasurement(customerId: string, measurementId: string, data: UpdateMeasurementData): Promise<any>;
    deleteCustomerMeasurement(customerId: string, measurementId: string): Promise<void>;
    getCustomerBills(customerId: string, options?: any): Promise<any[]>;
    getCustomerStats(): Promise<{
        total: number;
        active: number;
        newThisMonth: number;
        topCustomers: Array<{
            customer: Customer;
            totalSpent: number;
            billCount: number;
        }>;
    }>;
}
//# sourceMappingURL=CustomerModel.d.ts.map