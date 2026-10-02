const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce backend is running",
    version: "1.0.0"
  });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "UP",
      service: "ecommerce-backend",
      database: "CONNECTED"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "DOWN",
      service: "ecommerce-backend",
      database: "DISCONNECTED"
    });
  }
});

// Get products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
});

// Get product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch product"
    });
  }
});

// Create order
app.post("/api/orders", async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({
      message: "productId and quantity are required"
    });
  }

  try {
    const productResult = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const product = productResult.rows[0];

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    const orderResult = await pool.query(
      `
      INSERT INTO orders
      (product_id, quantity, status)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [productId, quantity, "CONFIRMED"]
    );

    await pool.query(
      `
      UPDATE products
      SET stock = stock - $1
      WHERE id = $2
      `,
      [quantity, productId]
    );

    res.status(201).json({
      message: "Order created successfully",
      order: orderResult.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create order"
    });
  }
});

// Get orders
app.get("/api/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        orders.id,
        orders.quantity,
        orders.status,
        orders.created_at,
        products.name AS product_name,
        products.price
      FROM orders
      JOIN products
        ON orders.product_id = products.id
      ORDER BY orders.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});