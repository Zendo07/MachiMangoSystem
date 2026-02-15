const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'An error occurred',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(token: string) {
    return this.request('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Inventory endpoints
  async getInventory(branchId: string, token: string) {
    return this.request(`/inventory?branchId=${branchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateInventory(id: string, quantity: number, token: string) {
    return this.request(`/inventory/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
  }

  // Orders endpoints
  async getOrders(branchId: string, token: string) {
    return this.request(`/orders?branchId=${branchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createOrder(orderData: any, token: string) {
    return this.request('/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }

  // Sales endpoints
  async getSales(
    branchId: string,
    startDate: string,
    endDate: string,
    token: string,
  ) {
    return this.request(
      `/sales?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  async createSale(saleData: any, token: string) {
    return this.request('/sales', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(saleData),
    });
  }

  // Products endpoints
  async getProducts(token: string) {
    return this.request('/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Branches endpoints
  async getBranches(token: string) {
    return this.request('/branches', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
