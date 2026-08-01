// ======================================
// UNISPHERE STUDENT BUS TRACKING
// PART 1
// ======================================

const API = window.API_BASE;

let socket = null;
let map = null;
let marker = null;
let selectedBus = "BUS001";

// ======================================
// GET BUS NUMBER FROM URL
// ======================================

const params = new URLSearchParams(window.location.search);

selectedBus = params.get("bus") || "BUS001";

// ======================================
// PAGE LOAD
// ======================================

window.onload = () => {

    initMap();

    connectSocket();

    loadBus();

    setInterval(loadBus,5000);

};

// ======================================
// SOCKET CONNECTION
// ======================================

function connectSocket(){

    if(typeof io==="undefined"){

        console.log("Socket Library Missing");

        updateSocketStatus("🔴 Socket Missing");

        return;

    }

    socket = io(API,{

        transports:[
            "websocket",
            "polling"
        ],

        reconnection:true,

        reconnectionAttempts:Infinity,

        reconnectionDelay:1000,

        timeout:20000

    });

    socket.on("connect",()=>{

        console.log("🟢 Connected");

        updateSocketStatus("🟢 Connected");

    });

    socket.on("disconnect",()=>{

        console.log("🔴 Disconnected");

        updateSocketStatus("🔴 Disconnected");

    });

    socket.on("connect_error",(err)=>{

        console.log(err);

        updateSocketStatus("🔴 Connection Error");

    });

    socket.on("bus-location",(data)=>{

        if(data.busNumber!==selectedBus) return;

        updateInfo(data);

        updateMarker(data.lat,data.lng);

        updateLiveLocation(data.lat,data.lng);

    });

}

// ======================================
// SOCKET STATUS
// ======================================

function updateSocketStatus(text){

    const box=document.getElementById("socketStatus");

    const head=document.getElementById("connectionStatus");

    if(box) box.innerHTML=text;

    if(head) head.innerHTML=text;

}
// ======================================
// MAP INITIALIZE
// ======================================

function initMap(){

    map = L.map("map",{

        zoomControl:true

    }).setView([22.5726,88.3639],13);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom:19,
            attribution:"© OpenStreetMap"
        }
    ).addTo(map);

    setTimeout(()=>{

        map.invalidateSize();

    },500);

}

// ======================================
// LOAD BUS DATA
// ======================================

async function loadBus(){

    try{

        const res = await fetch(
            `${API}/api/bus/${selectedBus}`
        );

        const data = await res.json();

        if(!data.success) return;

        const bus = data.bus;

        updateInfo(bus);

        if(
            bus.location &&
            bus.location.lat &&
            bus.location.lng
        ){

            updateMarker(
                bus.location.lat,
                bus.location.lng
            );

            updateLiveLocation(
                bus.location.lat,
                bus.location.lng
            );

        }

    }
    catch(err){

        console.log("Bus Load Error",err);

    }

}

// ======================================
// UPDATE BUS INFO
// ======================================

function updateInfo(bus){

    setText("busNumber",bus.busNumber);

    setText(
        "busStatus",
        bus.isOnline
            ? "🟢 Running"
            : "🔴 Offline"
    );

    setText(
        "driverName",
        bus.driverName || "Not Assigned"
    );

    setText(
        "departure",
        bus.nextDeparture || "--"
    );

    setText(
        "currentStop",
        bus.currentStop || "University"
    );

    setText(
        "eta",
        bus.eta || "--"
    );

    setText(
        "speed",
        (bus.speed || 0) + " km/h"
    );

    setText(
        "route",
        bus.route || "--"
    );

    if(bus.lastUpdated){

        setText(
            "lastUpdate",
            new Date(
                bus.lastUpdated
            ).toLocaleTimeString()
        );

    }else{

        setText("lastUpdate","--");

    }

}

// ======================================
// SET TEXT
// ======================================

function setText(id,value){

    const el=document.getElementById(id);

    if(el){

        el.innerHTML=value;

    }

}
// ======================================
// UPDATE MAP MARKER
// ======================================

function updateMarker(lat, lng) {

    if (
        lat === undefined ||
        lng === undefined ||
        lat === 0 ||
        lng === 0
    ) {
        return;
    }

    const position = [lat, lng];

    if (!marker) {

        marker = L.marker(position)
            .addTo(map)
            .bindPopup("🚌 " + selectedBus);

    } else {

        marker.setLatLng(position);

    }

    marker.openPopup();

    map.setView(position, 16, {
        animate: true,
        duration: 1
    });

}

// ======================================
// UPDATE LIVE LOCATION
// ======================================

function updateLiveLocation(lat, lng) {

    const box = document.getElementById("liveLocation");

    if (!box) return;

    box.innerHTML =
        `📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

}

// ======================================
// REFRESH LAST UPDATE
// ======================================

function refreshLastUpdate() {

    const box = document.getElementById("lastUpdate");

    if (box) {

        box.innerHTML =
            new Date().toLocaleTimeString();

    }

}

// ======================================
// CONNECTION CHECK
// ======================================

setInterval(() => {

    if (!socket) return;

    if (socket.connected) {

        updateSocketStatus("🟢 Connected");

    } else {

        updateSocketStatus("🔴 Reconnecting...");

    }

}, 3000);

// ======================================
// AUTO REFRESH BUS DATA
// ======================================

setInterval(() => {

    loadBus();

    refreshLastUpdate();

}, 5000);

// ======================================
// WINDOW RESIZE FIX
// ======================================

window.addEventListener("resize", () => {

    if (map) {

        setTimeout(() => {

            map.invalidateSize();

        }, 300);

    }

});

// ======================================
// PAGE HIDDEN / VISIBLE
// ======================================

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        loadBus();

        if (map) {

            setTimeout(() => {

                map.invalidateSize();

            }, 300);

        }

    }

});

// ======================================
// BEFORE UNLOAD
// ======================================

window.addEventListener("beforeunload", () => {

    if (socket) {

        socket.disconnect();

    }

});

// ======================================
// END OF FILE
// ======================================

console.log("✅ UniSphere Student Bus Tracking Loaded");