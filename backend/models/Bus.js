// ======================================
// BUS MODEL
// UniSphere Smart Bus Tracking
// ======================================

const mongoose = require("mongoose");


// ======================================
// SCHEMA
// ======================================

const busSchema = new mongoose.Schema(

{

    // ==========================
    // BUS DETAILS
    // ==========================

    busNumber: {

        type:String,

        required:true,

        unique:true,

        trim:true

    },


    route: {

        type:String,

        default:""

    },


    // ==========================
    // DRIVER DETAILS
    // ==========================

    driverId: {

        type:String,

        default:""

    },


    driverName: {

        type:String,

        default:""

    },


    driverPhone: {

        type:String,

        default:""

    },



    // ==========================
    // BUS STATUS
    // ==========================

    status:{

        type:String,

        enum:[

            "Offline",
            "Running",
            "University",
            "Scheduled"

        ],

        default:"University"

    },



    isOnline:{

        type:Boolean,

        default:false

    },



    // ==========================
    // LIVE LOCATION
    // ==========================

    location:{


        lat:{

            type:Number,

            default:0

        },


        lng:{

            type:Number,

            default:0

        }


    },



    // ==========================
    // TIME DETAILS
    // ==========================

    nextDeparture:{

        type:String,

        default:"--"

    },


    eta:{

        type:String,

        default:"--"

    },



    // ==========================
    // LIVE DATA
    // ==========================

    speed:{

        type:Number,

        default:0

    },


    currentStop:{

        type:String,

        default:"University"

    },



    departureStatus:{

        type:String,

        enum:[

            "Scheduled",
            "Departed",
            "Arrived"

        ],

        default:"Scheduled"

    },



    // ==========================
    // LAST UPDATE
    // ==========================

    lastUpdated:{

        type:Date,

        default:Date.now

    }


},


{

    timestamps:true

}

);




// ======================================
// EXPORT MODEL
// ======================================

module.exports = mongoose.model(
    "Bus",
    busSchema
);