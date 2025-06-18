// API Service Layer for Maya Family Finance App

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new ApiError(response.status, `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Transaction APIs
  async getTransactions(): Promise<any[]> {
    return this.request('/transaction/');
  }

  async createTransaction(transaction: any): Promise<any> {
    return this.request('/transaction/', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Warehouse APIs
  async getWarehouseItems(): Promise<any[]> {
    return this.request('/warehouse/');
  }

  async createWarehouseItem(item: any): Promise<any> {
    return this.request('/warehouse/', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateWarehouseItem(id: string, item: any): Promise<any> {
    return this.request(`/warehouse/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  // Report APIs
  async getMonthlyReport(month?: string): Promise<any> {
    const endpoint = month ? `/report/monthly?month=${month}` : '/report/monthly';
    return this.request(endpoint);
  }

  // Invoice Scanning API
  async scanInvoice(imageData: string): Promise<any> {
    return this.request('/invoice/scan', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  }

  // Notification API
  async sendNotification(notification: any): Promise<any> {
    return this.request('/notification/', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  // Dummy APIs for testing
  async getDummyUsers(): Promise<any[]> {
    return this.request('/dummy/users');
  }

  async getDummyTransactions(userId?: string): Promise<any[]> {
    const endpoint = userId ? `/dummy/transactions/${userId}` : '/dummy/transactions/all';
    return this.request(endpoint);
  }

  async getDummyWarehouse(userId?: string): Promise<any[]> {
    const endpoint = userId ? `/dummy/warehouse/${userId}` : '/dummy/warehouse/all';
    return this.request(endpoint);
  }

  async getDummyReports(userId: string, month?: string): Promise<any> {
    const endpoint = month 
      ? `/dummy/reports/${userId}/${month}` 
      : `/dummy/reports/${userId}`;
    return this.request(endpoint);
  }

  async getDummyInvoiceScan(): Promise<any> {
    return this.request('/dummy/invoice/scan');
  }
}

export const apiService = new ApiService();
export { ApiError };
export default ApiService;