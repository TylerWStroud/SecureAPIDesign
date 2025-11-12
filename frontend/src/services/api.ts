/* 

Axios is a popular JavaScript library for making HTTP requests from both the browser and Node.js environments. 
It provides an easy-to-use API for sending asynchronous requests to REST endpoints and handling responses. 
Axios supports features like request and response interception, automatic JSON data transformation, and error handling, 
making it a powerful tool for interacting with web APIs.

*/
import axios from "axios";

// Base URL for your REST API
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
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Generic API response shape
export interface ApiResponse<T> {
  message?: string;
  data: T;
}

// User model
export interface User {
  _id?: string;
  username: string;
  password?: string;
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
  userId?: string;
  productId: string;
  productName?: string;
  status: "pending" | "processing" | "completed";
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
  checkHealth: () =>
    api.get<ApiResponse<{ status: string; timestamp?: string; uptime?: string }>>(
      "/health"
    ),
};