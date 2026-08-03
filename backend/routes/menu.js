const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const checkRole = require("../middleware/checkRole");

// ==========================================
// 🚀 ONE-CLICK SEED ROUTE (২০টা আইটেম যোগ করা)
// ==========================================
router.get("/seed", async (req, res) => {
    try {
        const initialItems = [
            { name: "Biscuit", price: 10, img: "biscuit.jpg", stock: "available" },
            { name: "Chicken Biryani", price: 130, img: "cbiryani.jpg", stock: "available" },
            { name: "Chicken Curry", price: 80, img: "chicken.jpg", stock: "available" },
            { name: "Chicken Fried Rice", price: 100, img: "chikenfriderice.jpg", stock: "available" },
            { name: "Chole Bhature", price: 50, img: "chole.jpg", stock: "available" },
            { name: "Coffee", price: 15, img: "coffe.jpg", stock: "available" },
            { name: "Egg Curry", price: 40, img: "eggcurry.jpg", stock: "available" },
            { name: "Fish Curry", price: 70, img: "fish.jpg", stock: "available" },
            { name: "Lassi", price: 30, img: "joilassi.jpg", stock: "available" },
            { name: "Lays", price: 10, img: "lays.jpg", stock: "available" },
            { name: "Maggi", price: 30, img: "megi.png", stock: "available" },
            { name: "Paneer Sabji", price: 60, img: "paneer.jpg", stock: "available" },
            { name: "Roti", price: 5, img: "roti.jpg", stock: "available" },
            { name: "Samosa", price: 1, img: "samosa.jpg", stock: "available" },
            { name: "Sandwich", price: 25, img: "sandwich.jpg", stock: "available" },
            { name: "Steam Rice", price: 30, img: "sreemrice.jpg", stock: "available" },
            { name: "Tea", price: 10, img: "tea.jpg", stock: "available" },
            { name: "Thums Up", price: 20, img: "thumsup.jpg", stock: "available" },
            { name: "Veg Biryani", price: 90, img: "vbiryani.jpg", stock: "available" },
            { name: "Veg Thali", price: 70, img: "vthali.jpg", stock: "available" }
        ];

        // আগে থেকে থাকা সব ডেটা মুছে ফ্রেশ করে ইনসার্ট করবে
        await Menu.deleteMany({});
        await Menu.insertMany(initialItems);

        res.json({ success: true, message: "✅ All 20 items successfully added to database!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error seeding data" });
    }
});

// ==========================================
// GET ALL MENU (সব খাবার দেখার জন্য)
// ==========================================
router.get("/", async (req, res) => {
    try {
        const menu = await Menu.find();
        res.json({ success: true, menu });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// ADD NEW ITEM (নতুন খাবার যোগ করার জন্য)
// ==========================================
router.post("/add", async (req, res) => {
    try {
        const { name, price, img, stock } = req.body;
        const newItem = new Menu({ name, price, img, stock: stock || "available" });
        await newItem.save();
        res.json({ success: true, message: "Item added successfully", item: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==========================================
// UPDATE STOCK (স্টক আছে কি না তা বদলানোর জন্য)
// ==========================================
router.put("/update/:id", checkRole(["canteen_authority"]), async (req, res) => {
    try {
        const { stock } = req.body;
        const item = await Menu.findByIdAndUpdate(
            req.params.id,
            { stock },
            { returnDocument: "after" }
        );

        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }
        res.json({ success: true, message: "Stock Updated", item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// EDIT PRICE (দাম পরিবর্তন করার জন্য)
// ==========================================
router.put("/edit/:id", async (req, res) => {
    try {
        await Menu.findByIdAndUpdate(req.params.id, { price: req.body.price });
        res.json({ success: true, message: "Price updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==========================================
// DELETE ITEM (খাবার ডিলিট করার জন্য)
// ==========================================
router.delete("/delete/:id", async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==========================================
// মডিউল এক্সপোর্ট (এটি সবসময় ফাইলের শেষে থাকতে হবে)
// ==========================================
module.exports = router;