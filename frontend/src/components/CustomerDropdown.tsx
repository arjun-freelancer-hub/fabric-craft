'use client';

import { useState, useEffect, useRef } from 'react';
import { Customer, customerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { User, Phone, Mail, Check, Plus } from 'lucide-react';

interface CustomerDropdownProps {
  searchQuery: string;
  onSelectCustomer: (customer: Customer) => void;
  onAddNewCustomer: () => void;
  isVisible: boolean;
}

export const CustomerDropdown = ({ 
  searchQuery, 
  onSelectCustomer, 
  onAddNewCustomer, 
  isVisible 
}: CustomerDropdownProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery && isVisible) {
      searchForCustomers();
    }
  }, [searchQuery, isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onAddNewCustomer(); // Close dropdown when clicking outside
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onAddNewCustomer]);

  const searchForCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.searchCustomers(searchQuery, 5);
      setCustomers(response.data.customers);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isVisible || customers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, customers.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === customers.length) {
          onAddNewCustomer();
        } else {
          onSelectCustomer(customers[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onAddNewCustomer();
        break;
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          Searching customers...
        </div>
      ) : customers.length > 0 ? (
        <div className="p-2">
          <div className="text-xs text-gray-500 px-3 py-2 border-b">
            Found {customers.length} existing customer{customers.length !== 1 ? 's' : ''}
          </div>
          
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className={`p-3 cursor-pointer rounded-md transition-colors ${
                index === selectedIndex 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      {customer.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {index === selectedIndex && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div
            className={`p-3 cursor-pointer rounded-md transition-colors border-t ${
              selectedIndex === customers.length 
                ? 'bg-green-50 border-green-200' 
                : 'hover:bg-gray-50'
            }`}
            onClick={onAddNewCustomer}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Add new customer
                </div>
                <div className="text-sm text-gray-500">
                  Create a new customer with this information
                </div>
              </div>
              {selectedIndex === customers.length && (
                <Check className="w-4 h-4 text-green-600 ml-auto" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="text-center text-gray-500 mb-3">
            No existing customers found for "{searchQuery}"
          </div>
          <Button
            onClick={onAddNewCustomer}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Customer
          </Button>
        </div>
      )}
      
      <div className="text-xs text-gray-400 px-3 py-2 border-t bg-gray-50 rounded-b-lg">
        Use ↑↓ to navigate, Enter to select, Escape to add new
      </div>
    </div>
  );
};
