CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);

INSERT INTO products (name, price, category, stock)
VALUES
    ('Laptop', 65000, 'Electronics', 10),
    ('Wireless Headphones', 3000, 'Electronics', 25),
    ('Smart Watch', 5000, 'Wearables', 15),
    ('Running Shoes', 2500, 'Fashion', 20),
    ('Mechanical Keyboard', 4500, 'Electronics', 12)
ON CONFLICT DO NOTHING;