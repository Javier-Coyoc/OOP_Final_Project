const express = require("express");
const cors    = require("cors");

const productRoutes = require("./Routes/productRoutes");
const cartRoutes    = require("./Routes/cartRoutes");
const receiptRoutes = require("./Routes/receiptRoutes");
const userRoutes    = require("./Routes/userRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("FE"));

// Routes
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/receipts", receiptRoutes);
app.use("/auth", userRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({ 
        message: "Receipt Gen API is running",
        endpoints: {
            register: "POST /auth/register",
            login: "POST /auth/login",
            users: "GET /auth"
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📝 Register: POST http://localhost:${PORT}/auth/register`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/auth/login`);
    console.log(`👥 Users: GET http://localhost:${PORT}/auth`);
});