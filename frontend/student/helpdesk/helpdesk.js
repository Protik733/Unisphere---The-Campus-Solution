// ======================================
// 🎓 UNISPHERE ACADEMIC HELP DESK JS
// ======================================


const API =
`${window.API_BASE}/api/helpdesk`;


const departments=[

"CSE",
"BIOSCIENCE",
"LAW",
"AGRICULTURE",
"PHARMACY"

];


const resultContainer =
document.getElementById(
"resultContainer"
);




// ======================================
// CHATBOT
// ======================================


async function sendMessage(){


const input =
document.getElementById(
"searchBox"
);


const question =
input.value.trim();



if(!question)
return;



const chat =
document.getElementById(
"chatBox"
);



chat.innerHTML += `

<div class="user-msg">
👤 ${question}
</div>

`;



input.value="";



chat.innerHTML += `

<div class="bot-msg" id="typing">
🤖 Thinking...
</div>

`;



try{


const res =
await fetch(
API+"/search",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

question

})

}

);



const data =
await res.json();



document
.getElementById("typing")
.remove();



chat.innerHTML += `

<div class="bot-msg">

🤖

<div>
${data.answer || "Information not available"}
</div>

</div>

`;



}
catch(err){


document
.getElementById("typing")
.remove();


chat.innerHTML += `

<div class="bot-msg">

🤖 Server Error

</div>

`;

}


chat.scrollTop =
chat.scrollHeight;


}









// ======================================
// RESULT SCROLL
// ======================================


function showResult(){


setTimeout(()=>{


resultContainer.scrollIntoView({

behavior:"smooth",

block:"center"

});


},200);


}









// ======================================
// PYQ OPEN
// ======================================


function openPYQ(){



resultContainer.innerHTML=`


<div class="result-card">


<h2>
📄 Previous Year Paper
</h2>



<select id="pyqDept"
class="department-select">


<option>
Select Department
</option>


${departments.map(dep=>`

<option value="${dep}">
${dep}
</option>

`).join("")}


</select>



<button
class="open-drive"
onclick="openPYQDrive()">

Open Google Drive

</button>


</div>


`;



showResult();


}







async function openPYQDrive(){



const dept =
document.getElementById(
"pyqDept"
).value;



if(dept==="Select Department"){

alert(
"Please select department"
);

return;

}



try{


const res =
await fetch(
API+"/pyq"
);



const data =
await res.json();



const item =
data.find(
x=>x.department===dept
);



if(item){


window.open(
item.driveLink,
"_blank"
);


}
else{


alert(
"PYQ not found"
);


}



}
catch(err){

console.log(err);

alert(
"Server Error"
);

}



}









// ======================================
// SYLLABUS
// ======================================


function openSyllabus(){



resultContainer.innerHTML=`


<div class="result-card">


<h2>
📘 Department Syllabus
</h2>



<select id="syllabusDept"
class="department-select">


<option>
Select Department
</option>


${departments.map(dep=>`

<option value="${dep}">
${dep}
</option>

`).join("")}


</select>




<button
class="open-drive"
onclick="openSyllabusDrive()">


Open Google Drive


</button>


</div>


`;



showResult();


}







async function openSyllabusDrive(){



const dept =
document.getElementById(
"syllabusDept"
).value;



if(dept==="Select Department"){

alert(
"Please select department"
);

return;

}



try{


const res =
await fetch(
API+"/syllabus"
);



const data =
await res.json();



const item =
data.find(
x=>x.department===dept
);



if(item){


window.open(

item.driveLink,

"_blank"

);


}

else{


alert(
"Syllabus not found"
);


}



}
catch(err){


console.log(err);


}



}









// ======================================
// ACADEMIC CALENDAR
// ======================================


async function showCalendar(){


try{


const res =
await fetch(
API+"/academic-calendar"
);


const data =
await res.json();



resultContainer.innerHTML=`


<div class="result-card">


<h2>
📅 Academic Calendar
</h2>



${data.map(item=>`


<div class="resource-item">


<div class="year-badge">
${item.year}
</div>



<div class="resource-content">


<h3>
Academic Calendar ${item.year}
</h3>


<p>
Semester schedule information
</p>



<a 
href="${item.pdfLink}"
target="_blank"
class="pdf-btn">

📄 Open PDF

</a>


</div>


</div>


`).join("")}


</div>


`;


showResult();


}

catch(err){

console.log(err);

defaultMessage(
"Academic Calendar"
);

}


}



// ======================================
// HOLIDAY
// ======================================


async function showHoliday(){


try{


const res =
await fetch(
API+"/holiday-list"
);


const data =
await res.json();



resultContainer.innerHTML=`


<div class="result-card">


<h2>
🎉 Holiday List
</h2>



${data.map(item=>`


<div class="resource-item">


<div class="year-badge">
${item.year}
</div>



<div class="resource-content">


<h3>
Holiday List ${item.year}
</h3>


<p>
University holiday information
</p>



<a 
href="${item.pdfLink}"
target="_blank"
class="pdf-btn">

📄 Open PDF

</a>


</div>


</div>


`).join("")}



</div>


`;


showResult();


}

catch(err){

console.log(err);

}



}
// ======================================
// ROUTINE
// ======================================


function showRoutine(){


defaultMessage(
"Exam Routine"
);


}








function defaultMessage(title){


resultContainer.innerHTML=`


<div class="result-card">


<h2>
${title}
</h2>


<p>
Information not updated yet.
</p>


</div>


`;


showResult();


}







function goBack(){


window.location.href =
"../dashboard.html";


}




// expose global functions

window.openPYQ =
openPYQ;


window.openSyllabus =
openSyllabus;


window.openPYQDrive =
openPYQDrive;


window.openSyllabusDrive =
openSyllabusDrive;


window.showCalendar =
showCalendar;


window.showHoliday =
showHoliday;


window.showRoutine =
showRoutine;


window.goBack =
goBack;



console.log(
"🎓 UniSphere Academic Help Desk Loaded"
);