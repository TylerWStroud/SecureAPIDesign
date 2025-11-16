import React, { useState, useEffect } from "react";
import { productService, orderService, type Product } from "../services/api";
import RefreshButton from "./RefreshButton";
import "./Components.css";

// interface Product {
//   _id?: string;
//   id?: string;
//   name: string;
//   price: number;
//   stock?: number;
//   description?: string;
// }

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orderingProductId, setOrderingProductId] = useState<string | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // For the confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      setProducts(res.data.data || []);
      // Check if user is admin from the response
      if (res.data.user && res.data.user.roles) {
        setIsAdmin(res.data.user.roles.includes("admin"));
      }
      setError(null);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning(null);
    if (!name || !price) return alert("Name and price are required.");
    setCreating(true);
    try {
      await productService.createProduct({
        name,
        price: Number(price),
        stock: Number(stock) || 0,
        description,
      });
      setName("");
      setPrice("");
      setStock("");
      setDescription("");
      fetchProducts();
    } catch (err: any) {
      console.error("Create product error:", err);
      if (err.response?.status === 403) {
        setWarning("You cannot add a product as a regular user.");
      } else {
        setError("Failed to create product.");
      }
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (id?: string) => {
    if (!id) return;
    setProductToDelete(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!productToDelete) return;
    setWarning(null);
    try {
      await productService.deleteProduct(productToDelete);
      fetchProducts();
      setShowConfirm(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Delete product error:", err);
      if (err.response?.status === 403) {
        setWarning("You cannot delete products as a regular user.");
      } else {
        setError("Failed to delete product.");
      }
      setShowConfirm(false);
    }
  };

  const handleOrderNow = async (productId: string, productName: string) => {
    setOrderingProductId(productId);
    setWarning(null);
    setSuccessMessage(null);
    setError(null);
    try {
      await orderService.createOrder({ productId, status: "pending" });
      setSuccessMessage(`Order placed successfully for ${productName}!`);
      // Refresh products to update stock count
      await fetchProducts();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Order creation error:", err);
      if (err.response?.status === 403) {
        setWarning("You do not have permission to create orders.");
      } else if (
        err.response?.status === 400 &&
        err.response?.data?.error === "Product is out of stock"
      ) {
        setError("This product is out of stock!");
      } else {
        setError("Failed to place order.");
      }
    } finally {
      setOrderingProductId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Products</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={fetchProducts} />
        </div>
      </div>

      {successMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <div
              style={{
                color: "green",
                marginBottom: "1rem",
                fontWeight: "bold",
              }}
            >
              {successMessage}
            </div>
          </div>
        </div>
      )}
      {warning && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ color: "orange", marginBottom: "1rem" }}>
              {warning}
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          </div>
        </div>
      )}

      {isAdmin && (
        <form onSubmit={createProduct} className="form-inline">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value ? parseFloat(e.target.value) : "")
            }
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value ? parseInt(e.target.value) : "")
            }
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" disabled={creating}>
            {creating ? "Adding..." : "Add Product"}
          </button>
        </form>
      )}

      <div className="item-container">
        {products.map((p) => (
          <div key={p._id || p._id} className="product-card">
            <h3>{p.name}</h3>
            <p>${p.price.toFixed(2)}</p>
            {p.stock !== undefined && (
              <p
                style={{
                  color: p.stock === 0 ? "red" : "inherit",
                  fontWeight: p.stock === 0 ? "bold" : "normal",
                }}
              >
                Stock: {p.stock} {p.stock === 0 && "(OUT OF STOCK)"}
              </p>
            )}
            {p.description && <p>{p.description}</p>}
            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              {!isAdmin && (
                <button
                  className="order-btn"
                  onClick={() => handleOrderNow(p._id!, p.name)}
                  disabled={
                    orderingProductId === p._id ||
                    (p.stock !== undefined && p.stock <= 0)
                  }
                  style={{
                    backgroundColor:
                      p.stock !== undefined && p.stock <= 0
                        ? "#ccc"
                        : "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor:
                      orderingProductId === p._id ||
                      (p.stock !== undefined && p.stock <= 0)
                        ? "not-allowed"
                        : "pointer",
                    flex: 1,
                  }}
                >
                  {orderingProductId === p._id
                    ? "Ordering..."
                    : p.stock !== undefined && p.stock <= 0
                    ? "Out of Stock"
                    : "Order Now"}
                </button>
              )}
              {isAdmin && (
                <button
                  className="delete-btn"
                  onClick={() => confirmDelete(p._id || p._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this product?</p>
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
