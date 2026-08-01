const content = document.getElementById("content");

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// ======================================
// 🛑 CANTEEN SECURITY CHECK
// ======================================

if (!user || !token) {
    alert("Unauthorized Access!");
    localStorage.clear();
    window.location.href = "../index.html";
}

if (
    user.role !== "canteen_authority" &&
    !user.isSuperAdmin
) {
    alert("Unauthorized Access!");
    localStorage.clear();
    window.location.href = "../index.html";
}

// ======================================
// CACHE
// ======================================

let allOrders = [];

// =========================
// SIDEBAR CONTROL
// =========================
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("show");
}

function closeSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar && sidebar.classList.contains("show")) {
        sidebar.classList.remove("show");
    }
}

// =========================
// DASHBOARD
// =========================
window.onload = () => {
    showAnalytics();
};

// =========================
// SALES ANALYTICS
// =========================
async function showAnalytics() {
    closeSidebar();
    content.innerHTML = `<h2>📊 Loading Analytics...</h2>`;

    try {
        const res = await fetch(`${window.API_BASE}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const orders = data.orders || [];

        let totalRevenue = 0;
        let totalItems = 0;
        let itemMap = {};

        orders.forEach(order => {
            totalRevenue += order.total || 0;
            (order.items || []).forEach(item => {
                totalItems += item.qty || 0;
                if (!itemMap[item.name]) itemMap[item.name] = 0;
                itemMap[item.name] += item.qty || 0;
            });
        });

        let topItem = "N/A";
        let maxQty = 0;

        Object.keys(itemMap).forEach(name => {
            if (itemMap[name] > maxQty) {
                maxQty = itemMap[name];
                topItem = name;
            }
        });

        content.innerHTML = `
        <h1 class="header-title">📊 Sales Analytics</h1>
        <div class="grid-2">
            <div class="card">
                <h2>💰 ₹${totalRevenue}</h2>
                <p>Total Revenue</p>
            </div>
            <div class="card">
                <h2>${orders.length}</h2>
                <p>Total Orders</p>
            </div>
            <div class="card">
                <h2>${totalItems}</h2>
                <p>Items Sold</p>
            </div>
            <div class="card">
                <h2>${topItem}</h2>
                <p>Top Selling Item</p>
            </div>
        </div>
        `;
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="card">❌ Failed to load analytics</div>`;
    }
}

// =========================
// MENU CONTROL
// =========================
// =========================
// MENU CONTROL (ADMIN)
// =========================
async function showMenu() {
    closeSidebar();
    content.innerHTML = `<h2>🍔 Loading Menu...</h2>`;

    try {
        const res = await fetch(`${window.API_BASE}/api/menu`);
        const data = await res.json();
        const menu = Array.isArray(data) ? data : (data.menu || data.data || []);

        let html = `
        <h1 class="header-title">🍔 Menu Control</h1>
        
        <div class="card" style="margin-bottom: 20px; background: #f8f9fa; border: 1px dashed #27ae60;">
            <h3 style="color: #27ae60;">➕ Add New Food Item</h3>
            <form onsubmit="addNewItem(event)" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                <input type="text" id="newName" placeholder="Item Name (e.g: Maggi)" required style="padding: 8px; flex: 1; border: 1px solid #ccc; border-radius: 5px;">
                <input type="number" id="newPrice" placeholder="Price (₹)" required style="padding: 8px; width: 100px; border: 1px solid #ccc; border-radius: 5px;">
                <input type="text" id="newImg" placeholder="Image Name (e.g: maggi.png)" required style="padding: 8px; flex: 1; border: 1px solid #ccc; border-radius: 5px;">
                <button type="submit" class="action-btn" style="background: #27ae60;">Add Item</button>
            </form>
        </div>

        <div class="grid-2">`;

        menu.forEach(item => {
            html += `
            <div class="card">
                <h3>${item.name || 'Unnamed Item'}</h3>
                <p><b>Price:</b> ₹${item.price || 0}</p>
                <p><b>Status:</b> ${item.stock === "available" ? "🟢 Available" : "🔴 Stock Out"}</p>
                
                <hr style="margin: 10px 0;">
                
                <button class="action-btn" style="width: 100%; margin-bottom: 5px;" onclick="toggleStock('${item._id}','${item.stock}')">
                    ${item.stock === "available" ? "Mark Stock Out" : "Mark Available"}
                </button>
                
                <div style="display: flex; gap: 5px;">
                    <button style="flex: 1; background: #f39c12; color: white; padding: 8px; border: none; border-radius: 5px; cursor: pointer;" 
                        onclick="editPrice('${item._id}', ${item.price})">
                        ✏️ Edit Price
                    </button>
                    
                    <button style="flex: 1; background: #e74c3c; color: white; padding: 8px; border: none; border-radius: 5px; cursor: pointer;" 
                        onclick="deleteItem('${item._id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
            `;
        });
        
        html += `</div>`;
        content.innerHTML = html;
    } catch (err) {
        content.innerHTML = `<div class="card">❌ Failed to load menu</div>`;
    }
}
// =========================
// EDIT PRICE FUNCTION
// =========================
async function editPrice(id, currentPrice) {
    const newPrice = prompt("Enter new price in ₹:", currentPrice);
    
    if (newPrice !== null && newPrice.trim() !== "" && !isNaN(newPrice)) {
        try {
            await fetch(`${window.API_BASE}/api/menu/edit/${id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ price: Number(newPrice) })
            });
            showMenu(); // রিফ্রেশ
        } catch (err) {
            alert("Failed to update price!");
        }
    }
}

// =========================
// DELETE ITEM FUNCTION
// =========================
async function deleteItem(id) {
    if (confirm("Are you sure you want to delete this item?")) {
        try {
            await fetch(`${window.API_BASE}/api/menu/delete/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            showMenu(); // রিফ্রেশ
        } catch (err) {
            alert("Failed to delete item!");
        }
    }
}
// =========================
// STOCK UPDATE
// =========================
async function toggleStock(id, currentStock) {
    try {
        const newStock = currentStock === "available" ? "out" : "available";

        const res = await fetch(`${window.API_BASE}/api/menu/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ stock: newStock })
        });

        const data = await res.json();

        if(data.success || res.ok) {
            showMenu();
        } else {
            alert(data.message || "Stock update failed");
        }
    } catch (err) {
        alert("Stock update failed");
    }
}

// =========================
// ORDER RECORDS
// =========================
async function showOrders() {
    closeSidebar();
    content.innerHTML = `<h2>🧾 Loading Orders...</h2>`;

    try {
        const res = await fetch(`${window.API_BASE}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        allOrders = data.orders || [];

        content.innerHTML = `
        <h1 class="header-title">🧾 Order Records</h1>
        
        <input 
            id="orderSearch" 
            placeholder="Search Order ID or Payment ID" 
            style="max-width: 300px; display: inline-block; margin-right: 10px; padding: 8px; border-radius: 5px; border: 1px solid #ccc;"
        >
        <button class="action-btn" onclick="searchOrderRecord()" style="margin-bottom: 20px;">
            Search
        </button>

        <div id="ordersContainer"></div>
        `;

        renderOrders(allOrders);

    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="card">❌ Failed to load orders</div>`;
    }
}

function renderOrders(orders) {
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `<div class="card">No Orders Found</div>`;
        return;
    }

    let html = "";
    orders.forEach(order => {
        html += `
        <div class="card">
            <h3>${order.orderId}</h3>
            <p><b>Student:</b> ${order.userName}</p>
            <p><b>Student ID:</b> ${order.userId}</p>
            <p><b>Payment ID:</b> ${order.paymentId}</p>
            <p><b>Total:</b> ₹${order.total}</p>
            <p><b>Status:</b> 
                <span style="background:#dcfce7; padding:4px 10px; border-radius:20px; color:#166534; font-weight:bold;">
                    ${order.status}
                </span>
            </p>
            <p><b>Date:</b> ${order.orderDate}</p>
            <hr style="margin: 10px 0;">
            ${(order.items || []).map(item => `<p>${item.name} × ${item.qty}</p>`).join("")}
        </div>
        `;
    });
    container.innerHTML = html;
}

function searchOrderRecord() {
    const value = document.getElementById("orderSearch").value.trim().toLowerCase();
    
    const filtered = allOrders.filter(o => 
        String(o.orderId).toLowerCase().includes(value) || 
        String(o.paymentId).toLowerCase().includes(value)
    );
    
    renderOrders(filtered);
}

// =========================
// PAYMENT VERIFY
// =========================
function showPayments() {
    closeSidebar();
    content.innerHTML = `
    <h1 class="header-title">🔎 Payment Verification</h1>
    
    <input
        id="searchBox"
        placeholder="Enter Order ID or Payment ID"
        style="max-width: 300px; display: inline-block; margin-right: 10px; padding: 8px; border-radius: 5px; border: 1px solid #ccc;"
    >
    <button class="action-btn" onclick="searchPayment()">
        Search
    </button>
    <br><br>
    <div id="result"></div>
    `;
}

async function searchPayment() {
    const value = document.getElementById("searchBox").value.trim().toLowerCase();

    if (!value) {
        alert("Enter ID");
        return;
    }

    try {
        const res = await fetch(`${window.API_BASE}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const orders = data.orders || [];

        const order = orders.find(o =>
            String(o.orderId).toLowerCase().includes(value) ||
            String(o.paymentId).toLowerCase().includes(value)
        );

        if (!order) {
            document.getElementById("result").innerHTML = `<div class="card">❌ No Record Found</div>`;
            return;
        }

        document.getElementById("result").innerHTML = `
        <div class="card" style="border-left: 5px solid #27ae60;">
            <div class="receipt-header">
                <h2 style="color: #27ae60; margin-bottom: 15px;">✅ Payment Verified</h2>
            </div>
            <p><b>Student:</b> ${order.userName}</p>
            <p><b>Student ID:</b> ${order.userId}</p>
            <p><b>Order ID:</b> ${order.orderId}</p>
            <p><b>Payment ID:</b> ${order.paymentId}</p>
            <p><b>Total:</b> ₹${order.total}</p>
            <p><b>Status:</b> ${order.status}</p>
            
            <hr style="margin: 15px 0;">
            <h4 style="margin-bottom: 5px;">Items</h4>
            ${(order.items || []).map(item => `<p>${item.name} × ${item.qty}</p>`).join("")}
        </div>
        `;

    } catch (err) {
        console.error(err);
        document.getElementById("result").innerHTML = `<div class="card">❌ Failed to fetch data</div>`;
    }
}

// =========================
// LOGOUT
// =========================
function logout() {
    localStorage.clear();
    window.location.href = "../index.html";
}
// =========================
// ADD NEW ITEM FUNCTION
// =========================
async function addNewItem(event) {
    event.preventDefault(); // ফর্ম সাবমিট করার পর পেজ রিলোড বন্ধ করবে

    const name = document.getElementById("newName").value.trim();
    const price = document.getElementById("newPrice").value.trim();
    const img = document.getElementById("newImg").value.trim();

    try {
        const res = await fetch(`${window.API_BASE}/api/menu/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // সিকিউরিটির জন্য টোকেন পাঠানো হলো
            },
            body: JSON.stringify({ 
                name: name, 
                price: Number(price), 
                img: img, 
                stock: "available" 
            })
        });

        const data = await res.json();

        if (data.success || res.ok) {
            alert("✅ নতুন খাবার সফলভাবে যোগ করা হয়েছে!");
            showMenu(); // সাথে সাথে মেনু পেজটা রিফ্রেশ হয়ে নতুন আইটেম দেখাবে
        } else {
            alert("❌ Error: " + (data.message || "Failed to add item"));
        }
    } catch (err) {
        console.error(err);
        alert("Server Error! Failed to add item.");
    }
}