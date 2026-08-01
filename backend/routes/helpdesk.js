const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const askUniSphere = require("../services/openrouterService");


// ==============================
// LOAD JSON FUNCTION
// ==============================

function loadJSON(fileName) {

    const filePath = path.join(
        __dirname,
        "../data",
        fileName
    );


    if (!fs.existsSync(filePath)) {

        return [];

    }


    return JSON.parse(
        fs.readFileSync(
            filePath,
            "utf8"
        )
    );

}




// ==============================
// SEARCH KNOWLEDGE BASE
// ==============================


// ==============================
// SEARCH KNOWLEDGE BASE
// ==============================

function searchKnowledge(question){

    const files = [

        // Knowledge Base
        "knowledge/academicKnowledge.json",
        "knowledge/campus.json",
        "knowledge/holidayKnowledge.json",
        "knowledge/roomKnowledge.json",
        "knowledge/universityInfo.json",

        // Quick Access
        "academicCalendar.json",
        "holidayList.json",
        "pyq.json",
        "services.json",
        "syllabus.json"

    ];


    question = question.toLowerCase().trim();



    for(const file of files){


        const data = loadJSON(file);



        for(const item of data){


            // TITLE MATCH

            if(
                item.title &&
                item.title
                .toLowerCase()
                .includes(question)
            ){

                return item.answer;

            }



            // KEYWORD MATCH

            if(item.keywords){


                for(const word of item.keywords){


                    if(
                        question.includes(
                            word.toLowerCase()
                        )
                    ){

                        return item.answer;

                    }

                }

            }


        }


    }


    return null;

}
// ==============================
// CHATBOT SEARCH API
// ==============================


router.post(
"/search",
async(req,res)=>{


    try{


        const {
            question
        } = req.body;



        if(!question){


            return res.json({

                success:false,

                message:
                "Question required"

            });


        }




        // Knowledge Base Search


        const localAnswer =
        searchKnowledge(question);




        if(localAnswer){


            return res.json({

                success:true,

                source:
                "Knowledge Base",

                answer:
                localAnswer

            });


        }


        const answer =
await askUniSphere(question);



        res.json({

            success:true,

          source:
"OpenRouter",

            answer

        });



    }


    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:
            "Server Error"

        });


    }



});

// ==============================
// ACADEMIC CALENDAR API
// ==============================

router.get(
"/academic-calendar",
(req,res)=>{


    try{


        const data =
        loadJSON(
            "academicCalendar.json"
        );



        res.json(data);



    }


    catch(error){


        res.status(500).json({

            success:false,

            message:
            "Academic Calendar not available"

        });


    }



});

// ==============================
// HOLIDAY LIST API
// ==============================


router.get(
"/holiday-list",
(req,res)=>{


    try{


        const data =
        loadJSON(
            "holidayList.json"
        );



        res.json(data);



    }


    catch(error){


        res.status(500).json({

            success:false,

            message:
            "Holiday List not available"

        });


    }



});
// ==============================
// PYQ API
// ==============================

router.get(
"/pyq",
(req,res)=>{

    try{

        const data =
        loadJSON("pyq.json");

        res.json(data);

    }
    catch(error){

        res.status(500).json({

            success:false,
            message:"PYQ not available"

        });

    }

});



// ==============================
// SYLLABUS API
// ==============================

router.get(
"/syllabus",
(req,res)=>{

    try{

        const data =
        loadJSON("syllabus.json");

        res.json(data);

    }
    catch(error){

        res.status(500).json({

            success:false,
            message:"Syllabus not available"

        });

    }

});

module.exports = router;