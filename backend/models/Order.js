const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: String,
    userId: String,
    userName: String,
    email: String,
    items: { type: Array, default: [] },
    total: Number,
    paymentId: String,
    orderDate: String,
    orderTime: String,
    status: { type: String, default: "Paid" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);