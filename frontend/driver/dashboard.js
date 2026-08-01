// ======================================
// UNISPHERE DRIVER DASHBOARD
// ======================================

const API = window.API_BASE;

let socket = null;
let watchId = null;

let driverId = "";
let driverName = "";
let currentBus = "";

// ======================================
// PAGE LOAD
// ======================================

window.onload = async function () {
    loadUser();
    connectSocket();
    await loadBusList();
    setupEvents();
};

// ======================================
// LOAD USER
// ======================================

function loadUser() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please Login");
        window.location.href = "../../login/login.html";
        return;
    }

    driverId = user._id || user.id || "DRIVER001";
    driverName = user.name || "Driver";

    const name = document.getElementById("driverName");
    if (name) {
        name.innerHTML = "👨‍✈️ " + driverName;
    }
}

// ======================================
// SOCKET CONNECTION
// ======================================

function connectSocket() {
    if (typeof io === "undefined") {
        console.error("Socket.IO Library Missing");
        updateSocketStatus("❌ Socket Missing");
        return;
    }

    socket = io(API, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000
    });

    socket.on("connect", () => {
        console.log("🟢 Socket Connected:", socket.id);
        updateSocketStatus("🟢 Connected");
    });

    socket.on("disconnect", () => {
        console.log("🔴 Socket Disconnected");
        updateSocketStatus("🔴 Disconnected");
    });

    socket.on("connect_error", (err) => {
        console.log(err);
        updateSocketStatus("❌ Connection Error");
    });
}

// ======================================
// SOCKET STATUS
// ======================================

function updateSocketStatus(text) {
    const box = document.getElementById("socketStatus");
    if (box) {
        box.innerHTML = text;
    }
}

// ======================================
// LOAD BUS LIST
// ======================================

async function loadBusList() {
    try {
        const res = await fetch(API + "/api/bus/all");
        const data = await res.json();

        if (!data.success) return;

        const select = document.getElementById("busSelect");
        select.innerHTML = "";

        data.buses.forEach(bus => {
            const option = document.createElement("option");
            option.value = bus.busNumber;
            option.textContent = bus.busNumber;
            select.appendChild(option);
        });

        currentBus = select.value;
        updateSelectedBus();
    } catch (err) {
        console.log(err);
    }
}

// ======================================
// EVENTS
// ======================================

function setupEvents() {
    const busSelect = document.getElementById("busSelect");
    if (busSelect) {
        busSelect.addEventListener("change", () => {
            currentBus = busSelect.value;
            updateSelectedBus();
        });
    }

    const currentStop = document.getElementById("currentStop");
    if (currentStop) {
        currentStop.addEventListener("change", function () {
            const stop = currentStop.value;
            const stopView = document.getElementById("currentStopView");
            if (stopView) {
                stopView.innerHTML = stop;
            }
        });
    }
}

// ======================================
// UPDATE SELECTED BUS
// ======================================

function updateSelectedBus() {
    const busSelect = document.getElementById("busSelect");
    if (busSelect) {
        currentBus = busSelect.value;
    }
    
    const currentBusEl = document.getElementById("currentBus");
    if (currentBusEl) {
        currentBusEl.innerHTML = currentBus;
    }
}

// ======================================
// GO ONLINE
// ======================================

async function goOnline() {
    updateSelectedBus();

    try {
        const res = await fetch(API + "/api/bus/online", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                busNumber: currentBus,
                driverId,
                driverName,
                driverPhone: ""
            })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        document.getElementById("status").innerHTML = "🟢 Online";
        document.getElementById("currentBus").innerHTML = currentBus;

        startGPS(currentBus);
    } catch (err) {
        console.log(err);
        alert("Unable to Go Online");
    }
}

// ======================================
// GO OFFLINE
// ======================================

async function goOffline() {
    try {
        const res = await fetch(API + "/api/bus/offline", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                busNumber: currentBus
            })
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById("status").innerHTML = "🔴 Offline";
            document.getElementById("gpsStatus").innerHTML = "Stopped";

            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
        }
    } catch (err) {
        console.log(err);
    }
}

// ======================================
// START GPS
// ======================================

function startGPS(busNumber) {
    if (!navigator.geolocation) {
        alert("GPS Not Supported");
        return;
    }

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }

    watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const speed = Math.round((position.coords.speed || 0) * 3.6);
            const currentStop = document.getElementById("currentStop") ? document.getElementById("currentStop").value : "";

            document.getElementById("gpsStatus").innerHTML = "🟢 Live";
            document.getElementById("latitude").innerHTML = lat.toFixed(6);
            document.getElementById("longitude").innerHTML = lng.toFixed(6);
            document.getElementById("speed").innerHTML = speed + " km/h";
            document.getElementById("lastUpdate").innerHTML = new Date().toLocaleTimeString();

            const payload = {
                busNumber,
                driverId,
                driverName,
                lat,
                lng,
                speed,
                eta: "--",
                status: "Running",
                currentStop
            };

            // SOCKET SEND
            if (socket && socket.connected) {
                socket.emit("driver-location", payload);
            }

            // DATABASE UPDATE
            try {
                await fetch(API + "/api/bus/location", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.log("Location Update Error", err);
            }
        },
        (error) => {
            console.log(error);
            document.getElementById("gpsStatus").innerHTML = "❌ GPS Error";
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ======================================
// UPDATE SCHEDULE
// ======================================

async function updateSchedule() {
    const departureTime = document.getElementById("departureTime").value;

    if (!departureTime) {
        alert("Please Select Departure Time");
        return;
    }

    try {
        const res = await fetch(API + "/api/bus/schedule", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                busNumber: currentBus,
                nextDeparture: departureTime
            })
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById("currentTime").innerHTML = departureTime;
            alert("Departure Time Updated");
        }
    } catch (err) {
        console.log(err);
        alert("Unable To Update Schedule");
    }
}

// ======================================
// UPDATE CURRENT STOP
// ======================================

async function updateCurrentStop() {
    const stop = document.getElementById("currentStop").value;

    try {
        await fetch(API + "/api/bus/status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                busNumber: currentBus,
                status: "Running",
                currentStop: stop
            })
        });
    } catch (err) {
        console.log(err);
    }
}

// ======================================
// LOGOUT
// ======================================

// ======================================
// LOGOUT
// ======================================

function logout() {

    if (!confirm("Are you sure you want to logout?")) {
        return;
    }


    // Stop GPS
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }


    // Disconnect Socket
    if (socket) {
        socket.disconnect();
        socket = null;
    }


    // Remove Login Data
    localStorage.removeItem("user");
    localStorage.removeItem("token");


    // Redirect Login Page
    window.location.href = "../index.html";

}
// ======================================
// GLOBAL FUNCTIONS
// ======================================

window.goOnline = goOnline;
window.goOffline = goOffline;
window.updateSchedule = updateSchedule;
window.updateCurrentStop = updateCurrentStop;
window.logout = logout;