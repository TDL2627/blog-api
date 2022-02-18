// mongo

const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



// authenticate
require("dotenv").config();

function authenticateToken(req,res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) res.sendStatus(401);
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err){
          console.log(err)
          res.sendStatus(403)
        };
        req.user =user;
        next();
    });
}



// db conect
mongoose.connect('mongodb+srv://TDL2627:uchiha2627@subscribers.akyll.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
const db = mongoose.connection;
db.on('error',(error)=>console.log(error));
db.once('open',()=> console.log("Connected succesfully"))


  
// date
function getToday() {
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();

  today = yyyy + "/" + mm + "/" + dd;

  return today;
}



const app = express();
app.set("port", process.env.PORT || 1000);

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  const _rootUrl = req.get("host") + req.url;
  res.send({
    msg: "Welcome to the API. Check the routes object ",
    routes: {
      contact: `${_rootUrl}contact`,
    },
  });
});

// users


// get all users
app.get('/users', (req, res)=>{
    var sql = `SELECT * FROM users`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Users Shown");
      res.send(result)
    });
  });

// LOGIN (email, pass)
app.patch('/',async (req, res)=>{
  const {email, password} = req.body;
try {
  var sql = `SELECT * FROM users WHERE user_email = '${email}'`;
  con.query(sql, async function (err, result) {
    if (await bcrypt.compare(password, result[0].user_password))
    {
    const access_token = jwt.sign(JSON.stringify(result[0]), process.env.ACCESS_TOKEN_SECRET)
    res.send({jwt: access_token})
    console.log("User logged in");
    console.log(result)
  }

  });
} catch (error) {
  res.status(500).send()
}
});

// get one
app.get('/users/:id', (req, res)=>{
    var sql = `SELECT * FROM users WHERE user_id=${req.params.id}`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("User Shown");
      res.send(result)
    });
  });

  // //update 1 
  // app.put('/users/:id',(req, res) =>{
  //   const {name, email, contact, password, } =req.body;
  //   if(!name || !email || !contact ||  !password)
  //   res.status(400).send({msg:"not all data inserted"});

  //        var sql = `UPDATE users  SET user_name = '${name}', user_email ='${email}', user_contact = '${contact}' , user_password = '${password}' WHERE user_id=${req.params.id} `;
  //        con.query(sql, function (err, result) {
  //          if (err) throw err;
  //          console.log("1 record updated");
  //          res.send(result)
  //        });
  //      });

  // update2.0
  app.put('/users/:id', (req, res)=>{
    const {name,email,contact,password,avatar,about} = req.body;
    let id = req.params.id;
      var sql = `UPDATE users SET`
      if(name) {sql += ` user_name = '${name}' ,`}
      if(email) {sql += ` user_email = '${email}',`}
      if(contact) {sql += ` user_contact = '${contact}',`}
      if(password) {sql += ` user_password = '${password}',`}
      if(avatar) {sql += ` user_avatar = '${avatar}',`}
      if(about) {sql += ` user_about = '${about}',`}
      if(sql.endsWith(',')) sql = sql.substring(0, sql.length-1)
      sql += ` WHERE user_id=${id}`
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("User Updated!!!")
        res.send(result)
      });
  });




// delete user
app.delete('/users/:id',(req, res) =>{
  var sql = `DELETE FROM users WHERE user_id=${req.params.id}`;
       con.query(sql, function (err, result) {
         if (err) throw err;
         console.log("User Deleted");
       });
     });


// add user
app.post('/users',async(req, res) =>{
    const {name, email, contact, password} =req.body;
    if(!name || !email || !contact ||  !password)
    res.status(400).send({msg:"not all data inserted"});
    try {
      const salt = await bcrypt.genSalt()
      const hashedPassword = await bcrypt.hash(password, salt)
      var sql = ` INSERT INTO users (user_name, user_email, user_contact, user_password) VALUES ('${name}', '${email}', '${contact}','${hashedPassword}')`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("User Added");
      });
    } catch (error) {
      res.status(500).send()
    }
    });
 

      //  BLOGS

       // get all blogs
app.get('/blogs', authenticateToken, (req, res)=>{
  var sql = `SELECT * FROM posts`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Blogs Shown");
    res.send(result)
  });
});
 
// add blog
app.post('/blogs',authenticateToken, (req, res) =>{
  const {title, body} =req.body;
  if(!title || !body  )
  res.status(400).send({msg:"not all data inserted"});
       var sql = `INSERT INTO posts (post_title, post_body, post_date , post_author) VALUES ('${title}', '${body}', '${getToday()}', '${req.user.user_id}')`;
       con.query(sql, function (err, result) {
         if (err) throw err;
         console.log("1 record inserted");
         res.send(result);
       });
     });

// delete a blog
app.delete('/blogs/:id',authenticateToken,(req, res) =>{
  var sql = `DELETE FROM posts WHERE post_id=${req.params.id}`;
       con.query(sql, function (err, result) {
         if (err) throw err;
         console.log("Blog Deleted");
         res.send(result)
       });
     });

//  update blog
app.put('/blogs/:id',authenticateToken, (req, res)=>{
  const {title,body} = req.body;
  let id = req.params.id;
    var sql = `UPDATE posts SET`
    if(title) {sql += ` post_title = '${title}' ,`}
    if(body) {sql += ` post_body = '${body}',`}
    if(sql.endsWith(',')) sql = sql.substring(0, sql.length-1)
    sql += ` WHERE post_id=${id}`
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Blog Updated!!!")
      res.send(result)
    });
});

 

app.listen(app.get("port"), () => {
  console.log(`Listening for calls on port ${app.get("port")}`);
  console.log("Press Ctrl+C to exit server");
});