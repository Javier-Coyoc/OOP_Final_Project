const express = require("express");
const cors    = require("cors");

const productRoutes = require("./routes/productRoutes");
const cartRoutes    = require("./routes/cartRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const userRoutes    = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("FE"));

app.use("/products", productRoutes); // /products
app.use("/cart",     cartRoutes);    // /cart
app.use("/receipts", receiptRoutes); // /receipts
app.use("/auth",     userRoutes);    // /auth

app.listen(3000, () => console.log("Server running on port 3000"));
