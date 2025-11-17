import React, { useState, useEffect } from "react";
import { orderService, productService, type Product, type Order } from "../services/api";
import RefreshButton from "./RefreshButton";
import "./Components.css";

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [status, setStatus] = useState<"pending" | "processing" | "completed">("pending");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // For custom modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getOrders();
      setOrders(res.data.data || []);
      // Check if user is admin from the response
      if (res.data.user && res.data.user.roles) {
        setIsAdmin(res.data.user.roles.includes("admin"));
      }
      setError(null);
    } catch {
      setError("Failed to fetch orders.");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts();
      setProducts(res.data.data || []);
    } catch {
      setError("Failed to fetch products.");
    }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning(null);
    if (!selectedProduct) return alert("Select a product first.");
    setCreating(true);
    try {
      await orderService.createOrder({ productId: selectedProduct, status });
      setSelectedProduct("");
      setStatus("pending");
      fetchOrders();
    } catch (err: any) {
      console.error("Order creation error:", err);
      if (err.response?.status === 403) {
        setWarning("You do not have permission to create an order.");
      } else {
        setError("Failed to create order.");
      }
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (id?: string) => {
    if (!id) return;
    setOrderToDelete(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!orderToDelete) return;
    setWarning(null);
    try {
      await orderService.deleteOrder(orderToDelete);
      fetchOrders();
      setShowConfirm(false);
      setOrderToDelete(null);
    } catch (err: any) {
      console.error("Delete order error:", err);
      if (err.response?.status === 403) {
        setWarning("You cannot delete orders as a regular user.");
      } else {
        setError("Failed to delete order.");
      }
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Orders</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={fetchOrders} />
        </div>
      </div>

      {warning && (
        <div style={{ color: "orange", marginBottom: "1rem" }}>{warning}</div>
      )}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      {!isAdmin && (
        <div style={{ padding: "1rem", borderRadius: "4px", marginBottom: "1rem" }}>
          <p style={{ margin: 0 }}>
            You can place orders from the Products tab by clicking "Order Now" on any product.
          </p>
        </div>
      )}

      {isAdmin && (
        <form onSubmit={createOrder} className="order-form">
          <label>
            Product:
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">-- Select a Product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value as "pending" | "processing" | "completed")}>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Order"}
          </button>
        </form>
      )}

      <div className="item-container">
        {orders.length > 0 ? (
          orders.map((o) => (
            <div key={o._id} className="order-card">
              <h3>{o.orderNumber || `Order #${o._id}`}</h3>
              <p>Product: {o.productName || o.productId}</p>
              {o.price !== undefined && <p>Price: ${o.price.toFixed(2)}</p>}
              {isAdmin && <p>User ID: {o.userId}</p>}
              <p>Status: {o.status}</p>
              {isAdmin && (
                <button
                  className="delete-btn"
                  onClick={() => confirmDelete(o._id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this order?</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleDeleteConfirmed}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
