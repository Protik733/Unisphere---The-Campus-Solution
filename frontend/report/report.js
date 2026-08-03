// ======================================
// 🛑 ADMIN / REPORT CELL SECURITY CHECK
// ======================================

try {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
        alert("Unauthorized Access!");
        localStorage.clear();
        window.location.href = "../index.html";
    }

    if (
        user.role !== "report_cell" &&
        !user.isSuperAdmin
    ) {
        alert("Unauthorized Access!");
        localStorage.clear();
        window.location.href = "../index.html";
    }

    let currentStatusFilter = "Pending";

    function setStatusFilter(status) {
        currentStatusFilter = status;
        applyFilters();
    }

    async function applyFilters() {
        const content = document.getElementById("content");
        if(!content) {
            console.error("Content div not found in HTML!");
            return;
        }
        
        content.innerHTML = `<h2 style="color:#2563eb;">⏳ Loading Reports... Please wait.</h2>`;
        
        const categorySelect = document.getElementById("categoryFilter");
        const selectedCategory = categorySelect ? categorySelect.value : "ALL";

        try {
            const res = await fetch(`${window.API_BASE}/api/issues?scope=all`, { 
                headers: { "Authorization": `Bearer ${token}` } 
            });
            
         if (!res.ok) {
                let serverMsg = "";
                try { serverMsg = (await res.json()).message; } catch(_) {}
                throw new Error(`Server connection failed! Status: ${res.status}${serverMsg ? " — " + serverMsg : ""}`);
            }
            
            const data = await res.json();
            
            if (!Array.isArray(data)) {
                throw new Error("Invalid data format received from Server.");
            }
            
            // Apply Status Filter first, then Category Filter
            let filtered = data.filter(i => i.status === currentStatusFilter);
            if (selectedCategory !== "ALL") {
                filtered = filtered.filter(i => i.category === selectedCategory);
            }

            let html = `<h2 style="color: #1e293b; margin-bottom: 20px;">Showing: <span style="color: #2563eb;">${currentStatusFilter}</span> | Category: <span style="color: #2563eb;">${selectedCategory}</span></h2>`;

            if(filtered.length === 0) {
                html += `<p style="margin-top:20px; font-weight:bold; color:#64748b; background: #fff; padding: 20px; border-radius: 8px;">No reports found for this filter.</p>`;
            }

            filtered.forEach(i => {
                const commentsArray = i.comments || [];
                const docsArray = []; // documents ekhon lazy-load hobe

                let chatHtml = commentsArray.map(c => `
                    <div style="padding:10px; margin-bottom:10px; background:${c.sender === 'Student' ? '#e0f2fe' : '#dcfce7'}; border-radius:5px; width:fit-content; max-width:80%; margin-${c.sender === 'Student' ? 'left' : 'right'}:auto;">
                        <b>${c.sender}:</b> ${c.text}
                        <div style="font-size:11px; color:#64748b; margin-top:5px;">${new Date(c.time).toLocaleString()}</div>
                    </div>
                `).join("");

                let docsHtml = docsArray.map((doc, index) => `<a href="${doc}" download="Student_Doc_${index+1}" style="display:inline-block; margin-right:15px; margin-bottom:10px; padding:8px 12px; background:#e2e8f0; border-radius:5px; color:#2563eb; font-weight:bold; text-decoration:none;">📎 Download File ${index+1}</a>`).join("");

                let statusColor = i.status === 'Resolved' ? '#16a34a' : (i.status === 'Rejected' ? '#dc2626' : (i.status === 'Pending' ? '#3b82f6' : '#f59e0b'));

                html += `
                <div class="card" style="border: 1px solid #ccc; padding: 20px; margin-bottom: 25px; border-radius: 8px; border-left: 6px solid ${statusColor}; background: #fff;">
                    
                    <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:15px; display:grid; grid-template-columns: 1fr 1fr; gap:10px; border:1px solid #e2e8f0;">
                        <p><b>🧑‍🎓 Name:</b> ${i.studentName || "N/A"}</p>
                        <p><b>🎓 Roll No:</b> ${i.studentRoll || "N/A"}</p>
                        <p><b>📧 Email:</b> ${i.studentEmail || "N/A"}</p>
                        <p><b>🆔 Auth ID:</b> ${i.studentId}</p>
                      <p><b>🕒 Submitted:</b> ${new Date(i.createdAt).toLocaleString()}</p>
                    
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <h3 style="margin:0; color:#0f172a;">${i.title || "Untitled Report"}</h3>
                            <span style="font-size:13px; color:white; background:#475569; padding:3px 10px; border-radius:15px; display:inline-block; margin-top:5px;">${i.category || "General"}</span>
                        </div>
                        <span style="font-weight:bold; color:white; background:${statusColor}; padding:6px 15px; border-radius:20px;">${i.status}</span>
                    </div>
                    
                    <p style="margin-top:15px; font-size:16px; color:#1e293b; background:#f1f5f9; padding:12px; border-radius:5px; border-left: 3px solid #cbd5e1;"><b>Description:</b> <br>${i.text || "No description provided."}</p>
                    
                    <div style="margin: 15px 0;" id="docs-${i._id}">
                        <button onclick="loadAttachments('${i._id}')" style="background:#e2e8f0; color:#2563eb; font-weight:bold; padding:8px 12px; border:none; border-radius:5px; cursor:pointer;">📎 Load Attachments</button>
                    </div>
                    
                    <div style="margin-top:15px; border-top:1px solid #eee; padding-top:15px;">
                        <label style="font-weight:bold; color:#dc2626;">Internal Notes (Hidden from Student):</label>
                        <textarea id="notes-${i._id}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #cbd5e1; margin-top:5px; outline:none;" rows="2">${i.internalNotes || ""}</textarea>
                        <button onclick="updateNotes('${i._id}')" style="background:#64748b; color:white; padding:8px 15px; border:none; cursor:pointer; border-radius:5px; margin-top:8px; font-weight:bold;">💾 Save Notes</button>
                    </div>

                    ${chatHtml ? `<div style="background:#f8fafc; padding:15px; border-radius:8px; margin-top:15px; max-height:250px; overflow-y:auto; border:1px solid #e2e8f0;">${chatHtml}</div>` : ''}

                    ${(i.status !== 'Resolved' && i.status !== 'Rejected') ? `
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <input type="text" id="reply-${i._id}" placeholder="Ask student for proper document/info..." style="flex:1; padding:12px; border:1px solid #cbd5e1; border-radius:5px; outline:none;">
                        <button onclick="sendReply('${i._id}')" style="background:#2563eb; color:white; padding:12px 20px; border:none; cursor:pointer; border-radius:5px; font-weight:bold;">Send Instruction</button>
                    </div>
                    ` : '<p style="color:#16a34a; font-weight:bold; margin-top:15px; text-align:center; padding:10px; background:#dcfce7; border-radius:5px;">✅ This report is closed.</p>'}

                    <div style="margin-top: 20px; display:flex; gap:10px; flex-wrap:wrap; border-top:1px solid #eee; padding-top:15px;">
                        <span style="display:flex; align-items:center; font-weight:bold; color:#64748b; margin-right:10px;">Change Status: </span>
                        <button onclick="updateStatus('${i._id}', 'Pending')" style="background:#3b82f6; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">📨 Pending</button>
                        <button onclick="updateStatus('${i._id}', 'In Progress')" style="background:#f59e0b; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">⚙️ In Progress</button>
                        <button onclick="updateStatus('${i._id}', 'Resolved')" style="background:#16a34a; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">✅ Resolved</button>
                        <button onclick="updateStatus('${i._id}', 'Rejected')" style="background:#dc2626; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">❌ Rejected</button>
                    </div>
                </div>
                `;
            });
            content.innerHTML = html;

        } catch(err) {
            console.error("Dashboard Fetch Error:", err);
            content.innerHTML = `
                <div style="background:#fee2e2; padding:20px; border-radius:10px; border:1px solid #f87171;">
                    <h2 style="color:#dc2626; margin-top:0;">❌ Error Loading Reports</h2>
                    <p style="color:#7f1d1d;">${err.message}</p>
                    <p style="color:#7f1d1d; font-size:14px; margin-top:10px;">Check your developer console (F12) to see exactly what failed.</p>
                </div>
            `;
        }
    }

    async function sendReply(id) {
        const text = document.getElementById(`reply-${id}`).value.trim();
        if(!text) return;
        try {
            await fetch(`${window.API_BASE}/api/issues/comment/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ text })
            });
            applyFilters();
        } catch(err) {
            alert("Failed to send instruction.");
        }
    }

    async function updateStatus(id, newStatus) {
        try {
            await fetch(`${window.API_BASE}/api/issues/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            applyFilters();
        } catch(err) {
            alert("Failed to update status.");
        }
    }

    async function updateNotes(id) {
        const internalNotes = document.getElementById(`notes-${id}`).value;
        try {
            await fetch(`${window.API_BASE}/api/issues/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ internalNotes })
            });
            alert("Internal Notes Saved!");
        } catch(err) {
            alert("Failed to save notes.");
        }
    }

    function logout() { 
        localStorage.clear(); 
        window.location.href = "../index.html"; 
    }

    // Make functions globally available for HTML buttons to click
    window.setStatusFilter = setStatusFilter;
    window.applyFilters = applyFilters;
    window.sendReply = sendReply;
    window.updateStatus = updateStatus;
    window.updateNotes = updateNotes;
    window.logout = logout;

    async function loadAttachments(id) {
        const container = document.getElementById(`docs-${id}`);
        container.innerHTML = `<span style="color:#64748b;">Loading...</span>`;
        try {
            const res = await fetch(`${window.API_BASE}/api/issues/${id}/documents`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            const docs = data.documents || [];
            container.innerHTML = docs.length === 0
                ? `<span style="color:#94a3b8;">No attachments.</span>`
                : docs.map((doc, index) => `<a href="${doc}" download="Student_Doc_${index+1}" style="display:inline-block; margin-right:15px; margin-bottom:10px; padding:8px 12px; background:#e2e8f0; border-radius:5px; color:#2563eb; font-weight:bold; text-decoration:none;">📎 Download File ${index+1}</a>`).join("");
        } catch(err) {
            container.innerHTML = `<span style="color:#dc2626;">Failed to load attachments.</span>`;
        }
    }
    window.loadAttachments = loadAttachments;

    // Direct call, bypass DOMContentLoaded bug!
    setTimeout(() => {
        applyFilters();
    }, 100);

} catch (criticalError) {
    console.error("Critical Script Error:", criticalError);
    // Even if JS entirely breaks, it will print this on screen
    document.body.innerHTML = `<div style="padding:20px; background:#dc2626; color:white; font-size:18px;">CRITICAL JS ERROR: ${criticalError.message}. Check console (F12).</div>`;
}