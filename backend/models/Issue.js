const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    studentEmail: String,
    studentRoll: String, // 👈 নতুন ফিল্ড: Report cell e roll number dekhanor jonno
    
    title: String, 
    category: String,
    text: String, 
    
    status: { 
        type: String, 
        default: "Pending" // Pending, In Progress, Resolved, Rejected
    },
    
    comments: [{
        sender: String,
        text: String,
        time: { type: Date, default: Date.now }
    }],

    internalNotes: { 
        type: String, 
        default: "" // শুধু Report Cell দেখবে
    },

    documents: { 
        type: [String], // Base64 Array (Multiple Images/PDF)
        default: [] 
    },

    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Issue", issueSchema);