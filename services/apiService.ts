const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email?: string;
  role: string;
  token: string;
}

export interface ApiError {
  message: string;
}

// Helper function to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
const removeToken = (): void => {
  localStorage.removeItem('token');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/me');
  },

  logout: (): void => {
    removeToken();
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

// Shipment API
export const shipmentAPI = {
  extract: async (emailText: string): Promise<any> => {
    return apiRequest('/shipment/extract', {
      method: 'POST',
      body: JSON.stringify({ emailText }),
    });
  },
};

// User interface
export interface User {
  _id: string;
  username: string;
  email?: string;
  role: string;
  createdAt: string;
}

// Create user response (includes password on creation)
export interface CreateUserResponse extends User {
  password: string;
}

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<User[]> => {
    return apiRequest<User[]>('/admin/users');
  },

  createUser: async (username?: string, password?: string, email?: string): Promise<CreateUserResponse> => {
    return apiRequest<CreateUserResponse>('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  updateUser: async (userId: string, data: { username?: string; email?: string; role?: string }): Promise<User> => {
    return apiRequest<User>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getSubmissions: async (userId?: string): Promise<Submission[]> => {
    const url = userId ? `/admin/submissions?userId=${userId}` : '/admin/submissions';
    return apiRequest<Submission[]>(url);
  },

  getSubmissionStats: async (): Promise<SubmissionStats> => {
    return apiRequest<SubmissionStats>('/admin/submissions/stats');
  },
};

// Submission interfaces
export interface Submission {
  _id: string;
  user: {
    _id: string;
    username: string;
    email?: string;
  };
  customerName: string;
  shipper: {
    city: string;
    stateOrProvince: string;
    postalCode: string;
  };
  receiver: {
    city: string;
    stateOrProvince: string;
    postalCode: string;
  };
  details: {
    weightLbs: string;
    dimensions: Array<{
      quantity: string;
      length: string;
      width: string;
      height: string;
    }>;
    isHazmat: boolean;
    isReeferRequired: boolean;
    appointments: string;
    additionalNotes: string;
    serviceType: string;
  };
  fileType: 'word' | 'excel' | 'pdf';
  createdAt: string;
}

export interface SubmissionStats {
  totalSubmissions: number;
  submissionsByUser: Array<{
    userId: string;
    username: string;
    email?: string;
    count: number;
  }>;
}

// Submission API
export const submissionAPI = {
  saveSubmission: async (data: any): Promise<{ _id: string; message: string }> => {
    return apiRequest<{ _id: string; message: string }>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMySubmissions: async (): Promise<Submission[]> => {
    return apiRequest<Submission[]>('/submissions');
  },
};

// Email API
export const emailAPI = {
  sendToPricing: async (email: string | undefined, shipmentData: any): Promise<{ success: boolean; message: string }> => {
    const requestBody: any = {
      ...shipmentData,
    };
    
    // Only include email if provided (otherwise backend will use env default)
    if (email && email.trim()) {
      requestBody.email = email.trim();
    }
    
    return apiRequest<{ success: boolean; message: string }>('/email/send-pricing', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },
};



