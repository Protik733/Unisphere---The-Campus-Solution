const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const checkRole = require("../middleware/checkRole");

// ১. GET ISSUES (With Filters)
router.get("/", checkRole(["student", "report_cell"]), async (req, res) => {
    try {
        let issues;
        if (req.user.role === "student") {
            issues = await Issue.find({ studentId: req.user.uid }).sort({ createdAt: -1 });
        } else if (req.user.role === "report_cell") {
            issues = await Issue.find().sort({ createdAt: -1 });
        }
        res.json(issues);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

// ২. CREATE ISSUE 
router.post("/create", checkRole(["student"]), async (req,res)=>{
    try {
        const issue = new Issue({
            ...req.body,
            studentId: req.user.uid
        });
        await issue.save();
        res.json({ success:true, message:"Issue Submitted", issue });
    } catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

// ৩. EDIT ISSUE (Student - Only if Pending)
router.put("/edit/:id", checkRole(["student"]), async (req,res)=>{
    try {
        const issue = await Issue.findById(req.params.id);
        if(issue.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Cannot edit after processing starts!" });
        }
        const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success:true, issue: updatedIssue });
    } catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

// ৪. DELETE ISSUE (Student - Only if Pending)
router.delete("/delete/:id", checkRole(["student"]), async (req,res)=>{
    try {
        const issue = await Issue.findById(req.params.id);
        if(issue.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Cannot delete after processing starts!" });
        }
        await Issue.findByIdAndDelete(req.params.id);
        res.json({ success:true, message: "Report Deleted" });
    } catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

// ৫. NEW: UPLOAD ADDITIONAL DOCUMENT (Student - chat er moddhe theke pathanor jonno)
router.put("/upload/:id", checkRole(["student"]), async (req, res) => {
    try {
        const { document } = req.body;
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { $push: { documents: document } },
            { new: true }
        );
        res.json({ success: true, issue });
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ৬. UPDATE STATUS & INTERNAL NOTES (Report Cell)
router.put("/update/:id", checkRole(["report_cell"]), async (req,res)=>{
    try {
        const updateData = {};
        if(req.body.status) updateData.status = req.body.status;
        if(req.body.internalNotes !== undefined) updateData.internalNotes = req.body.internalNotes;

        const issue = await Issue.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success:true, issue });
    } catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

// ৭. ADD INSTRUCTION / REPLY
router.put("/comment/:id", checkRole(["student", "report_cell"]), async (req,res)=>{
    try {
        const { text } = req.body;
        const senderRole = req.user.role === "student" ? "Student" : "Report Cell";

        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: { sender: senderRole, text: text, time: new Date() } } },
            { new: true }
        );
        res.json({ success:true, issue });
    } catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

module.exports = router;