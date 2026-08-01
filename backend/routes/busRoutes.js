const express = require("express");
const router = express.Router();

const Bus = require("../models/Bus");


// ======================================
// GET ALL BUS
// ======================================
router.get("/all", async (req,res)=>{

    try{

        const buses = await Bus.find()
        .sort({
            busNumber:1
        });


        res.json({

            success:true,
            buses

        });


    }
    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,
            message:"Server Error"

        });

    }

});





// ======================================
// DRIVER GO ONLINE
// ======================================
router.put("/online", async(req,res)=>{

    try{


        const {
            busNumber,
            driverId,
            driverName,
            driverPhone
        } = req.body;



        const bus = await Bus.findOne({

            busNumber

        });



        if(!bus){

            return res.status(404).json({

                success:false,
                message:"Bus not found"

            });

        }



        bus.driverId =
        driverId || "";

        bus.driverName =
        driverName || "";

        bus.driverPhone =
        driverPhone || "";



        bus.status =
        "Running";


        bus.isOnline =
        true;



        bus.lastUpdated =
        new Date();



        await bus.save();



        res.json({

            success:true,

            message:"Driver Online",

            bus

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,
            message:"Server Error"

        });

    }

});







// ======================================
// DRIVER GO OFFLINE
// ======================================
router.put("/offline", async(req,res)=>{


    try{


        const {
            busNumber
        } = req.body;



        const bus =
        await Bus.findOne({

            busNumber

        });



        if(!bus){

            return res.status(404).json({

                success:false,
                message:"Bus not found"

            });

        }



        bus.driverId="";
        bus.driverName="";
        bus.driverPhone="";



        bus.status =
        "University";


        bus.isOnline =
        false;



        bus.location={

            lat:0,
            lng:0

        };



        bus.lastUpdated =
        new Date();



        await bus.save();



        res.json({

            success:true,

            message:"Driver Offline",

            bus

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }


});








// ======================================
// UPDATE BUS SCHEDULE
// ======================================
router.put("/schedule", async(req,res)=>{


    try{


        const {
            busNumber,
            nextDeparture
        } = req.body;



        const bus =
        await Bus.findOne({

            busNumber

        });



        if(!bus){

            return res.status(404).json({

                success:false,
                message:"Bus not found"

            });

        }



        bus.nextDeparture =
        nextDeparture;



        bus.lastUpdated =
        new Date();



        await bus.save();



        res.json({

            success:true,

            message:"Schedule Updated",

            bus

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }


});







// ======================================
// UPDATE BUS LOCATION
// ======================================
router.put("/location", async(req,res)=>{


    try{


        const {

            busNumber,
            lat,
            lng,
            speed,
            eta,
            currentStop
        } = req.body;




        const bus =
        await Bus.findOne({

            busNumber

        });



        if(!bus){

            return res.status(404).json({

                success:false,

                message:"Bus not found"

            });

        }



        bus.location.lat =
        lat;


        bus.location.lng =
        lng;



        if(speed !== undefined){

            bus.speed =
            speed;

        }



        if(eta){

            bus.eta =
            eta;

        }

if(currentStop){

    bus.currentStop =
    currentStop;

}

        bus.status =
        "Running";


        bus.isOnline =
        true;



        bus.lastUpdated =
        new Date();



        await bus.save();



        res.json({

            success:true,

            message:"Location Updated",

            bus

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }


});





// ======================================
// UPDATE ETA
// ======================================
router.put("/eta", async(req,res)=>{


    try{


        const {

            busNumber,
            eta

        } = req.body;



        const bus =
        await Bus.findOne({

            busNumber

        });



        if(!bus){

            return res.status(404).json({

                success:false,

                message:"Bus not found"

            });

        }



        bus.eta =
        eta;


        bus.lastUpdated =
        new Date();



        await bus.save();



        res.json({

            success:true,

            bus

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }


});

// ======================================
// UPDATE STATUS
// ======================================
router.put("/status", async(req,res)=>{


    try{


        const {
            busNumber,
            status,
            currentStop
        } = req.body;



        const bus =
        await Bus.findOne({

            busNumber

        });



        if(!bus){

            return res.status(404).json({

                success:false,

                message:"Bus not found"

            });

        }



        bus.status =
        status;
          if(currentStop){

    bus.currentStop =
    currentStop;

}


        bus.lastUpdated =
        new Date();



        await bus.save();



        res.json({

            success:true,

            bus

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }


});



// ======================================
// RESET ALL BUS
// ======================================
router.delete("/reset", async(req,res)=>{


    try{


        await Bus.updateMany(

            {},

            {

                driverId:"",

                driverName:"",

                driverPhone:"",


                status:"University",

                isOnline:false,


                eta:"--",

                speed:0,


                location:{

                    lat:0,

                    lng:0

                },

                   currentStop:"University",
                lastUpdated:
                new Date()

            }

        );



        res.json({

            success:true,

            message:
            "All buses reset successfully"

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }


});









// ======================================
// CREATE 5 DEFAULT BUS
// ======================================
router.post("/seed", async(req,res)=>{


    try{


        const buses = [

            "BUS001",

            "BUS002",

            "BUS003",

            "BUS004",

            "BUS005"

        ];



        let created=[];



        for(const number of buses){



            const exist =
            await Bus.findOne({

                busNumber:number

            });



            if(!exist){



                const bus =
                await Bus.create({



                    busNumber:number,



                    driverId:"",

                    driverName:"",

                    driverPhone:"",



                    status:
                    "University",



                    route:
                    "Main Gate - University",



                    nextDeparture:
                    "08:00 AM",



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



                created.push(bus);

            }


        }




        res.json({

            success:true,

            message:
            "5 Bus Seed Completed",

            created

        });



    }
    catch(err){


        console.log(err);



        res.status(500).json({

            success:false,

            message:err.message

        });


    }


});











// ======================================
// GET SINGLE BUS
// IMPORTANT: THIS MUST BE AFTER ALL PUT ROUTES
// ======================================
router.get("/:busNumber", async(req,res)=>{


    try{


        const bus =
        await Bus.findOne({

            busNumber:
            req.params.busNumber

        });



        if(!bus){

            return res.status(404).json({

                success:false,

                message:"Bus not found"

            });

        }



        res.json({

            success:true,

            bus

        });



    }
    catch(err){

        console.log(err);


        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }


});


// ======================================
// EXPORT ROUTER
// ======================================
module.exports = router;