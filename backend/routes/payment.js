const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();

// Razorpay Instance
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,     // নিশ্চিত করো .env ফাইলে RAZORPAY_KEY আছে
    key_secret: process.env.RAZORPAY_SECRET
});

// Give the frontend the public key_id that matches whatever RAZORPAY_KEY/
// RAZORPAY_SECRET pair is set in THIS server's .env — so Checkout.js can
// never end up using a different key than the one the order was created with.
router.get("/key", (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY });
});

router.post("/create-order", async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // পয়সায় কনভার্ট
            currency: "INR",
            receipt: "rcpt_" + Date.now()
        };

        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating order");
    }
});

module.exports = router;
