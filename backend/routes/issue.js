const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const checkRole = require("../middleware/checkRole");

// ======================================================
// ১. GET ISSUES (Scope-based)
//    scope=mine -> caller's own submitted issues (Student page)
//    scope=all  -> every issue (Report Cell page only)
//    Heavy "documents" (base64 attachments) field is excluded here
//    to avoid MongoDB's 32MB in-memory sort limit; attachments are
//    lazy-loaded per-issue via route #8 below.
// ======================================================
router.get("/", checkRole(["student", "report_cell"]), async (req, res) => {
    try {
        let issues;
        const scope = req.query.scope; // "mine" or "all"

        // "all" is only honored for report_cell / super admin accounts.
        const wantsAll = scope === "all" && (req.user.isSuperAdmin === true || req.user.role === "report_cell");

        if (wantsAll) {
            issues = await Issue.find()
                .select("-documents")
                .sort({ createdAt: -1 })
                .allowDiskUse(true);
        } else {
            // Student page (super admin included) -> only their own issues
            issues = await Issue.find({ studentId: req.user.uid })
                .select("-documents")
                .sort({ createdAt: -1 })
                .allowDiskUse(true);
        }

        res.json(issues);
    } catch(err) {
        console.error("GET /api/issues error:", err);
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
        const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
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
            { returnDocument: "after" }
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

        const issue = await Issue.findByIdAndUpdate(req.params.id, updateData, { returnDocument: "after" });
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
            { returnDocument: "after" }
        );
        res.json({ success:true, issue });
    } catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

// ======================================================
// ৮. GET DOCUMENTS OF A SINGLE ISSUE (Lazy Load)
//    List view (route #1) excludes "documents" to keep it light;
//    this route fetches attachments only when the user actually
//    clicks "Load My Files" / "Load Attachments".
// ======================================================
router.get("/:id/documents", checkRole(["student", "report_cell"]), async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).select("documents studentId");
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        if (req.user.role === "student" && !req.user.isSuperAdmin && issue.studentId !== req.user.uid) {
            return res.status(403).json({ message: "Access Denied" });
        }

        res.json({ documents: issue.documents || [] });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;