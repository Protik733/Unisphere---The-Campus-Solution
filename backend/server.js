// ======================================
// ENV CONFIG
// ======================================
require("dotenv").config();


// ======================================
// IMPORTS
// ======================================
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Bus = require("./models/Bus");

const helpdeskRoutes = require("./routes/helpdesk");



// ======================================
// APP INITIALIZE
// ======================================
const app = express();

const server = http.createServer(app);



// ======================================
// SOCKET.IO
// ======================================
const io = new Server(server,{

    cors:{
        origin:"*",
        methods:[
            "GET",
            "POST",
            "PUT"
        ]
    }

});



// ======================================
// DATABASE
// ======================================
connectDB();




// ======================================
// AUTO CREATE 5 DEFAULT BUSES
// ======================================

async function createDefaultBuses(){


    try{


        const buses = [

            {
                busNumber:"BUS001",
                route:"Main Gate - University",
                nextDeparture:"08:00 AM"
            },


            {
                busNumber:"BUS002",
                route:"Hostel - University",
                nextDeparture:"09:00 AM"
            },


            {
                busNumber:"BUS003",
                route:"City Center - University",
                nextDeparture:"10:00 AM"
            },


            {
                busNumber:"BUS004",
                route:"Airport - University",
                nextDeparture:"11:00 AM"
            },


            {
                busNumber:"BUS005",
                route:"Station - University",
                nextDeparture:"12:00 PM"
            }

        ];



        for(const item of buses){



            const exists =
            await Bus.findOne({

                busNumber:item.busNumber

            });



            if(!exists){



                await Bus.create({


                    busNumber:item.busNumber,


                    driverId:"",

                    driverName:"",

                    driverPhone:"",



                    route:item.route,


                    nextDeparture:
                    item.nextDeparture,


                    status:
                    "University",


                    eta:
                    "--",


                    speed:0,


                    isOnline:false,



                    location:{

                        lat:0,

                        lng:0

                    },



                    currentStop:
                    "University"



                });



                console.log(
                    "🚌 Created:",
                    item.busNumber
                );

            }


        }



    }
    catch(err){

        console.log(
            "Bus Seed Error:",
            err
        );

    }


}




// wait database ready

setTimeout(()=>{

    createDefaultBuses();

},3000);







// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());


app.use(express.json({

    limit:"50mb"

}));


app.use(express.urlencoded({

    extended:true,

    limit:"50mb"

}));




// ======================================
// STATIC FRONTEND
// ======================================

app.use(

    express.static(

        path.join(
            __dirname,
            "../frontend"
        )

    )

);







// ======================================
// ROUTES
// ======================================

app.use(
    "/api/bus",
    require("./routes/busRoutes")
);


app.use(
    "/api/auth",
    require("./routes/auth")
);


app.use(
    "/api/payment",
    require("./routes/payment")
);


app.use(
    "/api/orders",
    require("./routes/order")
);


app.use(
    "/api/issues",
    require("./routes/issue")
);


app.use(
    "/api/menu",
    require("./routes/menu")
);


app.use(
    "/api/helpdesk",
    helpdeskRoutes
);







// ======================================
// SOCKET CONNECTION
// ======================================

io.on("connection",(socket)=>{


    console.log(
        "🟢 Socket Connected:",
        socket.id
    );




    socket.on(
        "driver-location",
        async(data)=>{


        try{


            const bus =
            await Bus.findOne({

                busNumber:
                data.busNumber

            });



            if(bus){


                bus.location={

                    lat:data.lat,

                    lng:data.lng

                };



                bus.status =
                data.status ||
                "Running";



                bus.isOnline =
                true;



                if(data.driverId){

                    bus.driverId =
                    data.driverId;

                }



                if(data.driverName){

                    bus.driverName =
                    data.driverName;

                }



                if(data.speed !== undefined){

                    bus.speed =
                    data.speed;

                }



                if(data.eta){

                    bus.eta =
                    data.eta;

                }



                bus.lastUpdated =
                new Date();



                await bus.save();


            }





            io.emit("bus-location", {

    busNumber: bus.busNumber,

    driverId: bus.driverId,

    driverName: bus.driverName,

    lat: bus.location.lat,

    lng: bus.location.lng,

    speed: bus.speed,

    eta: bus.eta,

    status: bus.status,

    currentStop: bus.currentStop,

    nextDeparture: bus.nextDeparture,

    route: bus.route,

    isOnline: bus.isOnline,

    lastUpdated: bus.lastUpdated

});
        }
        catch(err){

            console.log(
                "Socket Error:",
                err
            );

        }



    });






    socket.on(
        "disconnect",
        ()=>{


        console.log(
            "🔴 Socket Disconnected:",
            socket.id
        );


    });



});







// ======================================
// HOME
// ======================================

app.get("/",(req,res)=>{


    res.send(
        "🚀 UniSphere Backend Running"
    );


});







// ======================================
// SERVER START
// ======================================

const PORT =
process.env.PORT || 3000;



server.listen(
    PORT,
    ()=>{


    console.log(
        `✅ Server Running On Port ${PORT}`
    );


});