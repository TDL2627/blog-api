const express = require("express");
const cors = require("cors");
const mysql = require('mysql');
// Needed fixes
// https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server
//
//


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"uchiha2627",
    database: "personal_blog"
  });
  


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

// get all users
app.get('/users', (req, res)=>{
    var sql = `SELECT * FROM users`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Users Shown");
      res.send(result)
    });
  });

  // sign in
  app.patch('/users', (req, res)=>{
    const {email,password}=req.body;
    var sql = `SELECT * FROM users WHERE user_email='${email}' AND user_password='${password}'`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("signed in");
      res.send(result)
    });
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
app.post('/users',(req, res) =>{
    const {name, email, contact, password} =req.body;
    if(!name || !email || !contact ||  !password)
    res.status(400).send({msg:"not all data inserted"});
         var sql = `INSERT INTO users (user_name, user_email, user_contact, user_password) VALUES ('${name}', '${email}',  '${contact}','${password}')`;
         con.query(sql, function (err, result) {
           if (err) throw err;
           console.log("1 user inserted");
         });
       });
 


       // get all blogs
app.get('/blogs', (req, res)=>{
  var sql = `SELECT * FROM posts`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Blogs Shown");
    res.send(result)
  });
});
 
// add blog
app.post('/blogs',(req, res) =>{
  const {title, body, date, author} =req.body;
  if(!title || !body || !date || !author )
  res.status(400).send({msg:"not all data inserted"});
       var sql = `INSERT INTO posts (post_title, post_body, post_date , post_author) VALUES ('${title}', '${body}', '${date}' , '${author}')`;
       con.query(sql, function (err, result) {
         if (err) throw err;
         console.log("1 record inserted");
         res.send(result);
       });
     });

// delete a blog
app.delete('/blogs/:id',(req, res) =>{
  var sql = `DELETE FROM posts WHERE post_id=${req.params.id}`;
       con.query(sql, function (err, result) {
         if (err) throw err;
         console.log("Blog Deleted");
         res.send(result)
       });
     });

//  update blog
app.put('/blogs/:id', (req, res)=>{
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