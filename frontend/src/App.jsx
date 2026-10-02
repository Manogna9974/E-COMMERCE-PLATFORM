import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Checking...");

  const checkBackend = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      setBackendStatus(
        `${data.status} - Database ${data.database}`
      );
    } catch {
      setBackendStatus("DOWN");
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/products`
      );

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders`
      );

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const createOrder = async (productId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productId,
            quantity: 1
          })
        }
      );

      const data = await response.json();

      alert(data.message);

      loadProducts();
      loadOrders();
    } catch {
      alert("Failed to create order");
    }
  };

  useEffect(() => {
    checkBackend();
    loadProducts();
    loadOrders();
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial",
        maxWidth: "1000px",
        margin: "auto",
        padding: "30px"
      }}
    >
      <h1>🛒 E-Commerce Platform</h1>

      <div
        style={{
          padding: "15px",
          background: "#f2f2f2",
          marginBottom: "25px"
        }}
      >
        <strong>Backend Status:</strong>{" "}
        {backendStatus}
      </div>

      <h2>Products</h2>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "8px"
          }}
        >
          <h3>{product.name}</h3>

          <p>Category: {product.category}</p>

          <p>Price: ₹{product.price}</p>

          <p>Stock: {product.stock}</p>

          <button
            onClick={() => createOrder(product.id)}
            disabled={product.stock === 0}
          >
            Buy 1
          </button>
        </div>
      ))}

      <hr />

      <h2>Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              borderBottom: "1px solid #ddd",
              padding: "10px"
            }}
          >
            <strong>Order #{order.id}</strong>

            <p>
              Product: {order.product_name}
            </p>

            <p>
              Quantity: {order.quantity}
            </p>

            <p>
              Status: {order.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);