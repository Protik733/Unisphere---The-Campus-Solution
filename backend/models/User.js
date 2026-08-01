const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true, unique: true }, 
    mobile: { type: String },
    // models/User.js er bhetor
role: { 
    type: String, 
    enum: ['student', 'report_cell', 'canteen_authority', 'driver', 'superAdmin'], 
    default: 'student' 
},
    department: { type: String, default: 'N/A' },
    password: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);