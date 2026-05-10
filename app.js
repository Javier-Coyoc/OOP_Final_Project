const express = require("express");
const cors    = require("cors");
const path = require('path');

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
app.use(express.static("FE")); // Serves FE folder (CSS, JS, Assets)

// Routes
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/receipts", receiptRoutes);
app.use("/auth", userRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "FE", "HTML", "index.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "FE", "HTML", "login.html"));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "FE", "HTML", "register.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Login: http://localhost:${PORT}/login.html`);
    console.log(`📍 Dashboard: http://localhost:${PORT}/`);
});