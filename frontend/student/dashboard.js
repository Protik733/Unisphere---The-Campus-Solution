// ======================================
// GLOBAL API
// ======================================
const API = window.API_BASE;

// ======================================
// 🛑 SECURITY & USER DATA SETUP
// ======================================
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// ======================================
// 🛑 SECURITY CHECK
// Student OR Super Admin only
// ======================================

if (!user || !token) {
    alert("Unauthorized Access! Please Login.");
    localStorage.clear();
    window.location.href = "../index.html";
}

if (
    user.role !== "student" &&
    !user.isSuperAdmin
) {
    alert("Unauthorized Access!");
    localStorage.clear();
    window.location.href = "../index.html";
}
const content = document.getElementById("content");

// 🔹 Unique Keys for each student (UID দিয়ে আলাদা করা)
const USER_CART_KEY = `cart_${user.uid}`;
const USER_ORDERS_KEY = `orders_${user.uid}`;
const USER_ISSUES_KEY = `issues_${user.uid}`;

let cart = JSON.parse(localStorage.getItem(USER_CART_KEY)) || [];
let orders = JSON.parse(localStorage.getItem(USER_ORDERS_KEY)) || [];
let issues = JSON.parse(localStorage.getItem(USER_ISSUES_KEY)) || [];
let payments = JSON.parse(localStorage.getItem("payments")) || []; // ঐচ্ছিক

window.onload = () => {
    // ১. ইউজার নাম সেট করা
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
        userNameElement.innerText = (user && user.name) ? user.name : "Student";
    }

    // ২. ৩ দিন পর পুরনো অর্ডার অটো-ডিলিট করার লজিক 
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    // লোকাল স্টোরেজে থাকা orders ফিল্টার করে আপডেট করা (৩ দিনের পুরনো গুলো বাদ যাবে)
    const freshOrders = orders.filter(o => (now - new Date(o.createdAt).getTime()) < threeDaysInMs);
    
    if (freshOrders.length !== orders.length) {
        orders = freshOrders;
        localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(orders));
    }

    // ৩. হোম পেজ লোড করা
    showHome();
};

// ======================================
// SIDEBAR & LOGOUT
// ======================================
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("show");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("show");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../index.html";
}

// ======================================
// HOME PAGE
// ======================================
function showHome() {
    closeSidebar();
    content.innerHTML = `
    <div class="hero-box">
        <div class="hero-icon">🎓</div>
        <h1 class="hero-title">
            Unisphere Campus Solution
        </h1>
        <p class="hero-subtitle">
            Smart Campus Management Platform
        </p>
    </div>

    <div class="feature-grid">
        <div class="feature-card canteen-card" onclick="showCanteen()">
            <div class="feature-icon">🍽️</div>
            <h2>Online Canteen</h2>
            <p>Order Food Online Easily</p>
        </div>

        <div class="feature-card report-card" onclick="showReport()">
            <div class="feature-icon">📋</div>
            <h2>Report Issue</h2>
            <p>Submit Campus Issues</p>
        </div>
        <div class="feature-card bus-card" onclick="showBusTracking()">

        <div class="feature-icon">
            🚌
        </div>

        <h2>
            Bus Tracking
        </h2>

        <p>
            Track University Bus Live
        </p>

    </div>
<div class="feature-card helpdesk-card" onclick="openHelpDesk()">

    <div class="feature-icon">
        🤖
    </div>

    <h2>
        AI Help Desk
    </h2>

    <p>
        Ask university related questions using AI
    </p>

</div>

    </div>
    `;
}

// ======================================
// PROFILE
// ======================================
function showProfile() {
    closeSidebar();
    content.innerHTML = `
    <button class="back-btn" onclick="showHome()">← Back</button>
    <div class="profile-card">
        <h2>👤 My Profile</h2>
        <p><b>Name:</b> ${user.name || "-"}</p>
        <p><b>Email:</b> ${user.email || "-"}</p>
        <p><b>Mobile:</b> ${user.mobile || "-"}</p>
        <p><b>ID:</b> ${user.uid || "-"}</p>
        <p><b>Role:</b> ${user.role || "-"}</p>
    </div>
    `;
}

// ======================================
// PAYMENTS RECEIPTS (SERVER FETCH)
// ======================================
async function showPayments() {
    closeSidebar();
    content.innerHTML = `<button class="back-btn" onclick="showHome()">← Back</button><p>Loading receipts...</p>`;

    try {
        const response = await fetch(`${window.API_BASE}/api/orders/my-orders/${user.uid}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json(); 
        const paymentsArray = Array.isArray(data) ? data : (data.orders || []);

        let html = `<button class="back-btn" onclick="showHome()">← Back</button><h2>💳 My Payment Receipts</h2>`;

        if (paymentsArray.length === 0) {
            html += `<p>No Payment Receipt Found</p>`;
        } else {
            paymentsArray.forEach(o => {
                const date = o.createdAt ? new Date(o.createdAt).toLocaleString() : "N/A";
                
                html += `
                <div class="card" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                    <p><b>Order ID:</b> ${o.orderId || o._id || "N/A"}</p>
                    <p><b>Amount Paid:</b> ₹${o.total || 0}</p>
                    <p><b>Date:</b> ${date}</p>
                </div>`;
            });
        }
        content.innerHTML = html;
        
    } catch (err) {
        console.error("Fetch Error:", err);
        content.innerHTML = `
            <button class="back-btn" onclick="showHome()">← Back</button>
            <p style="color: red;">Error: Could not load receipts. Please check your backend connection.</p>
        `;
    }
}

// ======================================
// ORDERS (LOCAL STORAGE)
// ======================================
function showOrders() {
    closeSidebar();
    
    // লোকাল স্টোরেজ থেকে ফ্রেশ ডেটা নিন
   const storedOrders = JSON.parse(localStorage.getItem(USER_ORDERS_KEY)) || [];
    
    let html = `<button class="back-btn" onclick="showHome()">← Back</button>
    <h2 style="text-align: center;">📦 My Order History</h2>`;

    if (storedOrders.length === 0) {
        html += "<p style='text-align:center;'>No Orders Yet</p>";
    } else {
        // লেটেস্ট অর্ডার উপরে দেখানোর জন্য reverse() ব্যবহার করলাম
        [...storedOrders].reverse().forEach((o) => {
            const id = o.orderId || o.paymentId || "N/A";
            const date = o.orderDate || "N/A";
            const time = o.orderTime || "N/A";

            html += `
            <div class="card" style="margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; border-radius: 10px; background: #fff;">
                <div style="border-bottom: 2px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                    <p style="margin: 5px 0;"><b>Order ID:</b> ${id}</p>
                    <p style="margin: 5px 0;"><b>Date:</b> ${date} | <b>Time:</b> ${time}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${o.items && Array.isArray(o.items) ? o.items.map(it => `
                            <tr>
                                <td style="padding: 8px; display: flex; align-items: center;">
                                    <img src="../image/${it.img || 'default.jpg'}" style="width: 40px; height: 40px; border-radius: 5px; margin-right: 10px; object-fit: cover;">
                                    ${it.name || "Unknown Item"}
                                </td>
                                <td style="padding: 8px; text-align: center;">Qty: ${it.qty || 0}</td>
                                <td style="padding: 8px; text-align: right;">₹${(it.price || 0) * (it.qty || 0)}</td>
                            </tr>
                        `).join("") : "<tr><td colspan='3'>No items</td></tr>"}
                    </tbody>
                </table>
                <div style="margin-top: 10px; text-align: right; border-top: 1px solid #eee; padding-top: 10px;">
                    <h3>Total: ₹${o.total || 0}</h3>
                    <p><b>Status:</b> ${o.status || "Paid"}</p>
                </div>
            </div>`;
        });
    }
    content.innerHTML = html;
}

// ======================================
// 1. REPORT ISSUE FORM (Title + Multiple Files)
// ======================================
let uploadedFilesArray = []; // গ্লোবাল ভেরিয়েবল ফাইল জমানোর জন্য

function showReport() {
    closeSidebar();
    uploadedFilesArray = []; // ফর্ম ওপেন হলে আগের ফাইল রিসেট
    content.innerHTML = `
    <button class="back-btn" onclick="showHome()">← Back</button>
    <div class="report-header">
        <div class="report-icon">📋</div>
        <h2>Report Issue</h2>
    </div>
    <form onsubmit="submitIssue(event)">
        <input type="text" id="issueTitle" placeholder="Report Title (e.g., ID Card Lost)" required style="width:100%; padding:12px; margin-bottom:10px; border-radius:8px; border:1px solid #cbd5e1;">
        
        <select id="issueCategory" required>
            <option value="">Select Category</option>
            <option>Admission</option>
            <option>Examination</option>
            <option>Canteen</option>
            <option>Hostel</option>
            <option>Other</option>
        </select>
        
        <textarea id="issueDesc" required placeholder="Describe your issue in detail..."></textarea>
        
        <div style="margin-bottom:10px;">
            <label style="font-weight:bold; color:#475569;">Attach Files (Images/PDF - Max 5MB each)</label>
            <input type="file" id="issueFiles" multiple accept="image/*,application/pdf" onchange="handleMultipleFiles(event)" style="display:block; margin-top:5px;">
            <div id="filePreview" style="margin-top:10px; font-size:12px; color:#2563eb;"></div>
        </div>

        <button type="submit">Submit Report</button>
    </form>
    `;
}

function handleMultipleFiles(e) {
    const files = e.target.files;
    const preview = document.getElementById("filePreview");
    preview.innerHTML = "";
    uploadedFilesArray = [];

    Array.from(files).forEach(file => {
        if(file.size > 5 * 1024 * 1024) {
            alert(`❌ ${file.name} is too large! Max 5MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            uploadedFilesArray.push(ev.target.result);
            preview.innerHTML += `📄 ${file.name} attached.<br>`;
        };
        reader.readAsDataURL(file);
    });
}

// ======================================
// 2. SUBMIT ISSUE (UPDATED WITH PROFILE DATA)
// ======================================
async function submitIssue(e) {
    e.preventDefault();
    
    const data = {
        studentName: user.name || "Unknown",
        studentEmail: user.email || "Unknown",
        studentRoll: user.roll || "N/A", // 👈 Roll number add kora holo
        title: document.getElementById("issueTitle").value,
        category: document.getElementById("issueCategory").value,
        text: document.getElementById("issueDesc").value,
        documents: uploadedFilesArray
    };

    try {
        const res = await fetch(`${window.API_BASE}/api/issues/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            alert("Report Submitted Successfully!");
            showIssues(); 
        } else {
            alert("Submit Failed: " + result.message);
        }
    } catch (err) {
        alert("Submit Failed! Server Error.");
    }
}

// ======================================
// 3. SHOW ISSUES (UPDATED WITH EDIT & DOC UPLOAD)
// ======================================
async function showIssues() {
    closeSidebar();
    content.innerHTML = `<button class="back-btn" onclick="showHome()">← Back</button><h2>📋 Loading...</h2>`;

    try {
        const res = await fetch(`${window.API_BASE}/api/issues?scope=mine`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
        let serverMsg = "";
        try {
            serverMsg = (await res.json()).message;
        } catch (_) {}

        throw new Error(
            `Server responded with status ${res.status}${serverMsg ? " — " + serverMsg : ""}`
        );
    }

        const myIssues = await res.json(); 

        let html = `<button class="back-btn" onclick="showHome()">← Back</button><h2>📋 My Reports</h2>`;
        
        if (myIssues.length === 0) {
            html += `<p>No Reports Found</p>`;
        } else {
            myIssues.forEach(i => {
                let chatHtml = i.comments.map(c => `
                    <div style="margin-bottom:10px; padding:10px; background:${c.sender === 'Student' ? '#e0f2fe' : '#dcfce7'}; border-radius:5px;">
                        <b>${c.sender}:</b> ${c.text}
                    </div>
                `).join("");

                let docsHtml = `<button onclick="loadMyAttachments('${i._id}')" style="background:#e2e8f0; color:#2563eb; font-weight:bold; padding:6px 12px; border:none; border-radius:5px; cursor:pointer;">📎 Load My Files</button><span id="mydocs-${i._id}"></span>`;

                let statusColor = i.status === 'Resolved' ? '#16a34a' : (i.status === 'Rejected' ? '#dc2626' : (i.status === 'Pending' ? '#3b82f6' : '#f59e0b'));

                html += `
                <div class="card" style="border-left: 5px solid ${statusColor};">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <h3 style="margin:0;">${i.title || "Untitled Report"}</h3>
                            <p style="color:#64748b; font-size:14px; margin-top:5px;">Category: ${i.category}</p>
                        
                        <p style="color:#94a3b8; font-size:12px; margin-top:2px;">🕒 Submitted: ${new Date(i.createdAt).toLocaleString()}</p>
                        
                            </div>
                    
                        <span style="background:${statusColor}; color:white; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:bold;">${i.status}</span>
                    </div>
                    
                    <p style="margin-top:15px; font-weight:bold;">Description:</p>
                    <p id="desc-${i._id}">${i.text}</p>
                    
                    <div style="margin-top:10px;">${docsHtml}</div>
                    
                    <div style="background:#f1f5f9; padding:10px; border-radius:5px; margin-top:15px; max-height:200px; overflow-y:auto;">
                        ${chatHtml}
                    </div>

                    ${i.status === 'Pending' ? `
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <button onclick="editIssuePrompt('${i._id}', \`${i.text}\`)" style="background:#f59e0b; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">✏️ Edit Desc</button>
                        <button onclick="deleteIssue('${i._id}')" style="background:#dc2626; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">🗑️ Delete</button>
                    </div>
                    ` : ''}

                    ${(i.status !== 'Resolved' && i.status !== 'Rejected') ? `
                    <div style="display:flex; gap:10px; margin-top:15px; flex-wrap:wrap;">
                        <input type="text" id="chat-${i._id}" placeholder="Reply to Report Cell..." style="flex:1; min-width:200px; padding:8px; border-radius:5px; border:1px solid #ccc;">
                        <button onclick="sendStudentMessage('${i._id}')" style="background:#2563eb; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">Send</button>
                        <button onclick="triggerUpload('${i._id}')" style="background:#64748b; color:white; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">📎 Upload Doc</button>
                    </div>
                    ` : '<p style="color:green; font-weight:bold; margin-top:15px;">✅ This report is closed.</p>'}
                </div>`;
            });
        }
        content.innerHTML = html;
    } catch(err) {
        alert("Failed to load issues.");
    }
}

async function loadMyAttachments(id) {
    const span = document.getElementById(`mydocs-${id}`);
    span.innerHTML = ` Loading...`;
    try {
        const res = await fetch(`${window.API_BASE}/api/issues/${id}/documents`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const docs = data.documents || [];
        span.innerHTML = docs.length === 0 ? ` No attachments.` :
            docs.map((doc, index) => ` <a href="${doc}" download="My_Attachment_${index+1}" style="color:#2563eb; margin-left:8px;">📎 File ${index+1}</a>`).join("");
    } catch(err) {
        span.innerHTML = ` Failed to load.`;
    }
}
window.loadMyAttachments = loadMyAttachments;

// ======================================
// NEW: EDIT ISSUE FUNCTION
// ======================================
async function editIssuePrompt(id, oldText) {
    const newText = prompt("Edit your issue description:", oldText);
    if(newText && newText !== oldText) {
        await fetch(`${window.API_BASE}/api/issues/edit/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ text: newText })
        });
        showIssues();
    }
}
// ======================================
// DELETE ISSUE FUNCTION
// ======================================
async function deleteIssue(id) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
        const res = await fetch(`${window.API_BASE}/api/issues/delete/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            showIssues(); // list refresh
        } else {
            alert(data.message || "Delete failed!");
        }
    } catch (err) {
        alert("Delete failed! Server error.");
    }
}

// ======================================
// 4. CHAT MESSAGE SEND
// ======================================
async function sendStudentMessage(id) {
    const text = document.getElementById(`chat-${id}`).value.trim();
    if(!text) return;

    try {
        await fetch(`${window.API_BASE}/api/issues/comment/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ text })
        });
        showIssues(); // রিফ্রেশ করে নতুন মেসেজ দেখাবে
    } catch (err) {
        alert("Failed to send message!");
    }
}

// ======================================
// 5. FILE UPLOAD (5MB LIMIT)
// ======================================
function triggerUpload(issueId) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,application/pdf";
    
    fileInput.onchange = (e) => {
        const file = e.target.files;
        if (!file) return;

        // 🌟 5MB Limit Check (5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            alert("❌ File is too large! Maximum allowed size is 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(ev) {
            try {
                await fetch(`${window.API_BASE}/api/issues/upload/${issueId}`, {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json", 
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify({ document: ev.target.result })
                });
                alert("✅ Document Uploaded Successfully!");
                showIssues();
            } catch(err) {
                alert("Upload failed! Server error.");
            }
        };
        reader.readAsDataURL(file);
    };
    fileInput.click();
}

// ======================================
// ONLINE CANTEEN
// ======================================
async function showCanteen() {
    closeSidebar();
    content.innerHTML = `
        <button class="back-btn" onclick="showHome()">← Back</button>
        <h2>🍽️ Loading Menu...</h2>
    `;

    try {
        const res = await fetch(`${window.API_BASE}/api/menu`);
        const data = await res.json();
        
        const items = Array.isArray(data) ? data : (data.menu || []);

        let html = `
        <button class="back-btn" onclick="showHome()">← Back</button>
        <div class="canteen-header">
            <div class="canteen-icon">🍽️</div>
            <h2>Online Canteen</h2>
        </div>
        <div class="menu-grid">
        `;

        items.forEach(item => {
            const isStockOut = item.stock === "out";

            html += `
            <div class="food-card" style="position: relative; ${isStockOut ? 'opacity: 0.7;' : ''}">
                <span style="position: absolute; top: 10px; right: 10px; background: ${isStockOut ? '#dc2626' : '#16a085'}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${isStockOut ? 'Stock Out' : 'Available'}
                </span>

                <img src="../image/${item.img || 'default.jpg'}" alt="${item.name}" style="width:100%; border-radius:10px;">

                <h3>${item.name}</h3>
                <p class="price" style="color: #27ae60; font-weight: bold; font-size: 18px;">₹${item.price}</p>

                <button
                    onclick="addToCart('${item.name}', ${item.price}, '${item.img}')"
                    ${isStockOut ? "disabled" : ""}
                    style="width: 100%; padding: 10px; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: ${isStockOut ? 'not-allowed' : 'pointer'}; background-color: ${isStockOut ? '#7f8c8d' : '#27ae60'}; margin-top: 10px;"
                >
                    ${isStockOut ? "Stock Out" : "Add To Cart"}
                </button>
            </div>
            `;
        });

        html += `</div>`;
        content.innerHTML = html;

    } catch (err) {
        content.innerHTML = `
            <button class="back-btn" onclick="showHome()">← Back</button>
            <p style="color: red; text-align: center; margin-top: 20px;">❌ Failed to load menu from server.</p>
        `;
    }
}

// ======================================
// CART SYSTEM
// ======================================
function addToCart(name, price, img) {
    let existing = cart.find(i => i.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            img: img,
            qty: 1
        });
    }

    localStorage.setItem(USER_CART_KEY, JSON.stringify(cart));
    alert(name + " added to cart");
}

function showCart() {
    closeSidebar();
    let total = 0;
    let html = `
    <button class="back-btn" onclick="showHome()">← Back</button>
    <h2>🛒 My Cart</h2>
    `;

    if (cart.length === 0) {
        html += `<p>Cart is empty!</p>`;
    } else {
        cart.forEach((item, index) => {
            let itemTotal = item.price * item.qty;
            total += itemTotal;

            html += `
            <div class="cart-card">
                <img src="../image/${item.img}" class="cart-image">
                <div class="info">
                    <h3>${item.name}</h3>
                    <p>Price: ₹${item.price}</p>
                    <div class="qty-control">
                        <button class="btn-qty" onclick="decreaseQty(${index})">-</button>
                        <span class="qty-text">${item.qty}</span>
                        <button class="btn-qty" onclick="increaseQty(${index})">+</button>
                    </div>
                </div>
            </div>`;
        });

        html += `
        <div class="card">
            <h3>Total Amount: ₹${total}</h3>
            <button class="pay-now-btn" onclick="payNowCart(${total})">
                💳 Pay Now
            </button>
        </div>`;
    }
    content.innerHTML = html;
}

function increaseQty(index) {
    cart[index].qty++;
    localStorage.setItem(USER_CART_KEY, JSON.stringify(cart));
    showCart();
}

function decreaseQty(index) {
    if (cart[index].qty > 1) {
        cart[index].qty--;
    } else {
        cart.splice(index, 1);
    }
    localStorage.setItem(USER_CART_KEY, JSON.stringify(cart));
    showCart();
}

// ======================================
// RAZORPAY PAYMENT & SAVE ORDER
// ======================================
function payNowCart(total) {
    fetch(`${window.API_BASE}/api/payment/create-order`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: total })
    })
    .then(res => res.json())
    .then(order => {
        fetch(`${window.API_BASE}/api/payment/key`)
            .then(res => res.json())
            .then(keyData => {
                openRazorpay(order, total, keyData.key);
            });
    })
    .catch(err => {
        console.error(err);
        alert("Server error, try again!");
    });
}

function openRazorpay(order, total, razorpayKey) {
    const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        prefill: {
            name: user.name,
            email: user.email,
            contact: user.mobile
        },
        handler: function (response) {
            saveOrder(total, response.razorpay_payment_id);
        },
        modal: {
            ondismiss: function() {
                alert("Payment was not completed. Please try again.");
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

async function saveOrder(total, paymentId) {
    const now = new Date();

    const newOrder = {
        orderId: "ORD-" + Date.now(),
        userId: user.uid,
        userName: user.name,
        email: user.email,
        items: cart.map(i => ({
            name: i.name,
            price: i.price,
            qty: i.qty,
            img: i.img  
        })),
        total: total,
        paymentId: paymentId,
        status: "Paid",
        orderDate: now.toLocaleDateString(),
        orderTime: now.toLocaleTimeString(),
        createdAt: now.getTime()
    };

    try {
        const response = await fetch(`${window.API_BASE}/api/orders/save`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newOrder)
        });

        const data = await response.json();

        if (data.success) {
            orders.push(data.order);
            localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(orders));

            cart = [];
            localStorage.setItem(USER_CART_KEY, JSON.stringify(cart));

            alert("Payment Successful!\nOrder ID: " + data.order.orderId);
            showOrders();
        } else {
            alert("Order failed to save: " + data.message);
        }

    } catch (err) {
        console.error("Save Order Error:", err);
        alert("Server error! Please check if your Node server is running.");
    }
}
// ======================================
// 🚌 BUS TRACKING
// ======================================

async function showBusTracking(){

    closeSidebar();

    content.innerHTML = `
    <button class="back-btn" onclick="showHome()">
        ← Back
    </button>

    <h2>
        🚌 Live Bus Tracking
    </h2>

    <div id="busList">
        Loading buses...
    </div>
    `;


    try{


        const res = await fetch(
            API + "/api/bus/all"
        );


        const response =
        await res.json();



        const buses =
        Array.isArray(response)
        ?
        response
        :
        response.buses || [];



        let html="";



        buses.forEach(bus=>{


            html += `

            <div class="card"
            onclick="openBus('${bus.busNumber}')">

                <h3>
                    🚌 ${bus.busNumber}
                </h3>


                <p>
                Status:
                ${bus.status}
                </p>


                <p>
                Driver:
                ${bus.driverName || "Not Assigned"}
                </p>


                <p>
                ETA:
                ${bus.eta || "--"}
                </p>


            </div>


            `;


        });



        document.getElementById("busList")
        .innerHTML = html;



    }
    catch(err){


        console.log(err);


        document.getElementById("busList")
        .innerHTML =
        "❌ Failed to load buses";


    }


}
function openBus(busNumber){

    window.location.href =
    "./bus/bus.html?bus=" + busNumber;

}
// ==========================
// OPEN AI HELP DESK
// ==========================

// ==========================
// OPEN AI HELP DESK
// ==========================

function openHelpDesk(){

    window.location.href = "./helpdesk/helpdesk.html";

}