require("dotenv").config();

const connectDB=require("./config/db");

const Bus=require("./models/Bus");


connectDB();


async function createBus(){


await Bus.deleteMany();



await Bus.insertMany([

{
busNumber:"BUS-01",
nextDeparture:"08:00 AM",
route:"University - Gate"
},

{
busNumber:"BUS-02",
nextDeparture:"09:00 AM",
route:"University - Hostel"
},

{
busNumber:"BUS-03",
nextDeparture:"10:00 AM",
route:"University - City"
},

{
busNumber:"BUS-04",
nextDeparture:"11:00 AM",
route:"University - Station"
},

{
busNumber:"BUS-05",
nextDeparture:"12:00 PM",
route:"University - Campus"
}


]);


console.log(
"Bus Created"
);


process.exit();

}


createBus();