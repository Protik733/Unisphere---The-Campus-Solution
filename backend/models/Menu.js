// backend/models/Menu.js
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    name: String,
    price: Number,
    img: String,
    stock: { type: String, default: "available" } // "available" or "out"
});

module.exports = mongoose.model("Menu", menuSchema);