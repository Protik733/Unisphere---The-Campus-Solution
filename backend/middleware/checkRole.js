const jwt = require("jsonwebtoken");


function checkRole(allowedRoles){

return (req,res,next)=>{

try{

const authHeader=req.headers.authorization;


if(!authHeader){
    return res.status(401).json({
        message:"No token found"
    });
}


const token = authHeader.split(" ")[1];


const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
);



if(decoded.isSuperAdmin === true){

    req.user = decoded;
    return next();

}



if(!allowedRoles.includes(decoded.role)){

    return res.status(403).json({
        message:"Access Denied"
    });

}


req.user = decoded;

next();


}
catch(err){

console.log(err.message);

return res.status(401).json({
    message:"Invalid token"
});

}


}

}


module.exports = checkRole;