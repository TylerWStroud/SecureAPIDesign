/* 

Axios is a popular JavaScript library for making HTTP requests from both the browser and Node.js environments. 
It provides an easy-to-use API for sending asynchronous requests to REST endpoints and handling responses. 
Axios supports features like request and response interception, automatic JSON data transformation, and error handling, 
making it a powerful tool for interacting with web APIs.

*/
import axios from "axios";

// Base URL for REST API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Reusable axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Request interceptor — add token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle global 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("authToken");
      // Only redirect if we had a valid session (logged in user getting 401)
      // Don't redirect on login failure (no token or failed login attempt)
      if (token) {
        localStorage.removeItem("authToken");
        localStorage.setItem("sessionExpired", "Your session has expired. Please log in again.");
        window.location.reload(); // Reload to show login screen
      }
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Generic API response shape
export interface ApiResponse<T> {
  message?: string;
  data: T;
  user?: {
    id: string;
    username: string;
    roles: string[];
  };
}

// User model
export interface User {
  _id?: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  roles?: string[];
}

// Product model
export interface Product {
  _id?: string;
  name: string;
  price: number;
  stock?: number;
  description?: string;
}

// Order model
export interface Order {
  _id?: string;
  orderNumber?: string;
  username?: string;  // Username from populated user
  userId?: string;
  productId: string;
  productName?: string;
  price?: number;
  status: "pending" | "processing" | "completed";
}

// Health status model
export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: string;
  responseTime?: string;
  checks?: {
    database?:{
      status: string;
      state?: string;
      name?: string;
      ping?: string;
      error?: string;
    };
    memory?: {
      status: string;
      usage?: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
      };
      unit?: string;
    };
  };
}

// Audit Log model
export interface AuditLog{
  _id: string;
  userId?: string;
  username?: string;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// === API SERVICES ===
// --- Users ---
export const userService = {
  getUsers: () => api.get<ApiResponse<User[]>>("/api/users"),
  createUser: (userData: Omit<User, "_id">) =>
    api.post<ApiResponse<{ message: string }>>("/auth/signup", userData),
};

// --- Products ---
export const productService = {
  getProducts: () => api.get<ApiResponse<Product[]>>("/api/products"),
  createProduct: (data: Omit<Product, "_id">) =>
    api.post<ApiResponse<Product>>("/api/products", data),
  deleteProduct: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/products/${id}`),
};

// --- Orders ---
export const orderService = {
  getOrders: () => api.get<ApiResponse<Order[]>>("/api/orders"),
  createOrder: (data: Omit<Order, "_id">) =>
    api.post<ApiResponse<Order>>("/api/orders", data),
  deleteOrder: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/orders/${id}`),
};

// --- Health Check ---
export const healthService = {
  checkHealth: () => api.get<HealthStatus>("/health"),
};

// --- Audit Logs ---
export const auditLogService = {
  getAuditLogs: (params?: {limit?: number; offset?: number; action?: string; userId?: string}) =>
    api.get<ApiResponse<AuditLog[]>>("/api/audit-logs", { params }),
}