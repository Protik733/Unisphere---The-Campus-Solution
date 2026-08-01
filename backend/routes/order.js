const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const sendEmail = require("../utils/email");
const checkRole = require("../middleware/checkRole");

// ===============================
// SAVE ORDER (STUDENT ONLY)
// ===============================
router.post("/save", async (req, res) => {
    try {
        const {
            orderId,
            userId,
            userName,
            email,
            items,
            total,
            paymentId,
            orderDate,
            orderTime
        } = req.body;

        // BASIC VALIDATION
        if (!userId || !items || !total || !paymentId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const order = new Order({
            orderId,
            userId,
            userName,
            email,
            items,
            total,
            paymentId,
            orderDate,
            orderTime,
            status: "Paid"
        });

        await order.save();

        // EMAIL SEND (SAFE)
        if (email && typeof sendEmail === "function") {
            await sendEmail(
                email,
                orderId,
                paymentId,
                total,
                userId,
                userName || "Student",
                items
            );
        }

        return res.status(201).json({
            success: true,
            message: "Order saved successfully",
            order
        });

    } catch (err) {
        console.error("Save Order Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// ===============================
// GET ALL ORDERS (CANTEEN ONLY)
// ===============================
router.get(
    "/",
   checkRole([
"canteen_authority",
"superAdmin"
]),
    async (req, res) => {
        try {
            const orders = await Order.find().sort({ createdAt: -1 });

            return res.json({
                success: true,
                count: orders.length,
                orders
            });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);


// ===============================
// GET USER ORDERS (STUDENT)
// ===============================
router.get("/my-orders/:userId", async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.params.userId
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;