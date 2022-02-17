require("dotenv").config();
const jwt = require("jsonwebtoken");

function authenticateToken(req,res, next){
    const authHeader = re.headers["authorization"];
    const token = authHeader && authHeader.split("")[1];

    if (!token) res.sendStatus(401);

    jwt.verify(token,process.env.SECRET_KEY,(err,user)=>{
        if(err)res.sendStatus(403);
        req.user =user;
        next();
    });
}

module.exports = authenticateToken;