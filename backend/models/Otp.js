const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 600 } } // 10 Min por auto delete (matches the "valid for 10 minutes" text in the OTP email)
});
module.exports = mongoose.model('Otp', otpSchema);