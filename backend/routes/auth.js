// ======================================================
// backend/routes/auth.js
// COMBINED PARTS 1, 2, AND 3 (FIXED)
// ======================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Otp = require("../models/Otp");

const allowedUsers = require("../config/allowedUsers");

const router = express.Router();


// ======================================================
// EMAIL CONFIG
// ======================================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.CAMPUS_EMAIL,
        pass: process.env.CAMPUS_EMAIL_PASSWORD
    }
});


// ======================================================
// ROLE ACCESS CHECK
// ======================================================

function checkRoleAccess(email, role) {
    if (!email) return false;

    email = email.toLowerCase().trim();

    // =============================
    // SUPER ADMIN
    // =============================
    if (
        allowedUsers.superAdmin &&
        allowedUsers.superAdmin.includes(email)
    ) {
        return true;
    }

    // =============================
    // STUDENT
    // =============================
    if (role === "student") {
        return true;
    }

    // =============================
    // DRIVER
    // =============================
    if (role === "driver") {
        return (
            allowedUsers.driver &&
            allowedUsers.driver.includes(email)
        );
    }

    // =============================
    // REPORT CELL
    // =============================
   if(role==="report_cell") {
        return (
            allowedUsers.report_cell &&
            allowedUsers.report_cell.includes(email)
        );
    }

    // =============================
    // CANTEEN AUTHORITY
    // =============================
   if(role==="canteen_authority") {
        return (
            allowedUsers.canteen_authority &&
            allowedUsers.canteen_authority.includes(email)
        );
    }

    return false;
}


// ======================================================
// SEND OTP
// ======================================================

router.post("/send-otp", async (req, res) => {
    try {
        const { email, uid, role } = req.body;

        // =============================
        // ROLE SECURITY
        // =============================
        if (!checkRoleAccess(email, role)) {
            return res.status(403).json({
                message: "This email is not authorized for this role"
            });
        }

        // =============================
        // USER EXISTS?
        // =============================
        const existingUser = await User.findOne({
            $or: [
                { email },
                { uid }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // =============================
        // GENERATE OTP
        // =============================
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // =============================
        // REMOVE OLD OTP
        // =============================
        await Otp.deleteMany({ email });

        // =============================
        // SAVE OTP
        // =============================
        await Otp.create({
            email,
            otp
        });

        // =============================
        // SEND MAIL
        // =============================
        await transporter.sendMail({
            from: `"UniSphere Campus" <${process.env.CAMPUS_EMAIL}>`,
            to: email,
            subject: "UniSphere OTP Verification",
            html: `
            <div style="font-family:Arial;padding:20px">
                <h2>UniSphere Campus</h2>
                <p>Your OTP is</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
           </div>
            `
        });

        return res.json({
            message: "OTP sent successfully"
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "OTP sending failed"
        });
    }
});


// ======================================================
// VERIFY OTP + REGISTER + SYNC USER
// ======================================================

router.post("/verify-and-sync", async (req, res) => {
    try {
        const {
            name,
            email,
            uid,
            mobile,
            role,
            password,
            otp
        } = req.body;

        // =============================
        // ROLE ACCESS CHECK
        // =============================
        if (!checkRoleAccess(email, role)) {
            return res.status(403).json({
                message: "You are not authorized for this role"
            });
        }

        // =============================
        // VERIFY OTP
        // =============================
        const validOtp = await Otp.findOne({
            email,
            otp
        });

        if (!validOtp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // =============================
        // CHECK DUPLICATE USER
        // =============================
        const existingUser = await User.findOne({
            $or: [
                { email },
                { uid }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // =============================
        // HASH PASSWORD
        // =============================
        const hash = await bcrypt.hash(password, 10);

        // =============================
        // CREATE USER
        // =============================
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            uid,
            mobile,
            role,
            password: hash
        });

        // =============================
        // DELETE OTP
        // =============================
        await Otp.deleteMany({ email });

        // =============================
        // GENERATE TOKEN
        // =============================
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                uid: user.uid,
                role: user.role,
                    isSuperAdmin:
    allowedUsers.superAdmin.includes(
        user.email.toLowerCase()
    )

            },
            process.env.JWT_SECRET,
            {
                expiresIn: "6h"
            }
        );

        // =============================
        // SUPER ADMIN CHECK
        // =============================
        const isSuperAdmin = allowedUsers.superAdmin.includes(
            user.email.toLowerCase()
        );

        // =============================
        // RESPONSE
        // =============================
        return res.status(201).json({
            message: "Registration Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                uid: user.uid,
                mobile: user.mobile,
                role: user.role
            },
            isSuperAdmin
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Registration failed"
        });
    }
});


// ======================================================
// LOGIN SECURE
// ======================================================

router.post("/login-secure", async (req, res) => {
    try {
        const {
            loginKey,
            password,
            role
        } = req.body;

        const input = loginKey.toLowerCase().trim();

        // ==========================================
        // FIND USER (FIXED: Fixed Mongoose $or + role query syntax)
        // ==========================================
        const user = await User.findOne({
            $or: [
                { email: input, },
                { uid: loginKey,}
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // ==========================================
        // ROLE ACCESS CHECK
        // ==========================================
 if (
    !checkRoleAccess(user.email, role) &&
    !allowedUsers.superAdmin.includes(
        user.email.toLowerCase()
    )
) {
    return res.status(403).json({
        message: "You are not authorized for this role"
    });
}
        // ==========================================
        // PASSWORD CHECK
        // ==========================================
        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(401).json({
                message: "Wrong password"
            });
        }

        // ==========================================
        // JWT TOKEN
        // ==========================================
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                uid: user.uid,
                role: user.role,    isSuperAdmin:
    allowedUsers.superAdmin.includes(
        user.email.toLowerCase()
    )

            },
            process.env.JWT_SECRET,
            {
                expiresIn: "6h"
            }
        );

        // ==========================================
        // SUPER ADMIN CHECK
        // ==========================================
        const isSuperAdmin = allowedUsers.superAdmin.includes(
            user.email.toLowerCase()
        );

        // ==========================================
        // RESPONSE
        // ==========================================
        return res.json({
            message: "Login success",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                uid: user.uid,
                mobile: user.mobile,
                role: user.role
            },
            isSuperAdmin
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Login failed"
        });
    }
});


// ======================================================
// FORGOT PASSWORD OTP
// ======================================================

router.post("/forgot-password-otp", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // =============================
        // GENERATE OTP
        // =============================
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Remove previous OTP
        await Otp.deleteMany({
            email: email.toLowerCase()
        });

        // Save new OTP
        await Otp.create({
            email: email.toLowerCase(),
            otp
        });

        // Send Mail
        await transporter.sendMail({
            from: `"UniSphere Campus" <${process.env.CAMPUS_EMAIL}>`,
            to: email,
            subject: "Password Reset OTP",
            html: `
            <div style="font-family:Arial;padding:20px">
                <h2>UniSphere Campus</h2>
                <p>Your Password Reset OTP</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
           </div>
            `
        });

        return res.json({
            message: "Reset OTP sent"
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "OTP sending failed"
        });
    }
});


// ======================================================
// RESET PASSWORD
// ======================================================

router.post("/reset-password", async (req, res) => {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        // =============================
        // VERIFY OTP
        // =============================
        const validOtp = await Otp.findOne({
            email: email.toLowerCase(),
            otp
        });

        if (!validOtp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // =============================
        // HASH PASSWORD
        // =============================
        const hash = await bcrypt.hash(
            newPassword,
            10
        );

        // =============================
        // UPDATE PASSWORD
        // =============================
        await User.updateOne(
            {
                email: email.toLowerCase()
            },
            {
                password: hash
            }
        );

        // =============================
        // DELETE OTP
        // =============================
        await Otp.deleteMany({
            email: email.toLowerCase()
        });

        return res.json({
            message: "Password reset successful"
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Password reset failed"
        });
    }
});


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;