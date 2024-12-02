var express=require('express');
var app=express();
const mysql=require("mysql");
const nodemailer = require('nodemailer');
const session = require('express-session');
app.get('/',function(req,res){
    res.send('hello world');
});
// ------------------admin page-----------------------
const admin=require('./admin.js');
app.use('/admin',admin);

// ------------doc page----------------------
const doctor=require('./doctor.js');
app.use('/doctor',doctor);
// ------------------

const reception=require('./reception.js');
app.use('/reception',reception);

// ---------------end page--------------------------
// ------------------sql connection--------------

const connection=mysql.createConnection({   
    host:'localhost',
    user:'root',
    password:'', 
    database:'hospital'
});
connection.connect((error)=>{
    if(error){ 
        console.error(" error database conntecting ");
        return;
    }
    console.log("connected"+connection.threadId);
});

// ----------------------end sql ------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'c3312a015664ea80c6e023345559fc687c384c8c1112df52cf0fa7f673953fa8',          // Secret key used to sign the session ID cookie
    resave: false,                     // Do not save session if unmodified
    saveUninitialized: false,          // Do not create a session until something is stored
    // cookie: { maxAge: 120000 }          // Session expiration time (in milliseconds, e.g., 60000 = 1 min)
}));
app.post('/register',(req,res)=>{
    const { name,phone,Username,password,email} = req.body; 
    connection.query('SELECT * FROM signin where Username=?',[Username],(err,results)=>{
      if(results.length===0){

     
    const OTP = Math.floor(100000 + Math.random() * 900000);
    console.log(OTP);



    var transport = nodemailer.createTransport({
        service: 'gmail',
        auth:{
           user: 'make13058@gmail.com',
           pass: 'keaj awno ztep vcmu'
        }
     });
     message = {
        from: "make13058@gmail.com",
        to: email,
        subject: "OTP of your Registration",
        text: `Dear ${name},Your OTP is ${OTP}`
     }
     transport.sendMail(message, function(err, info) {
        if (err) {
           res.json({message:"Not able to send OTP"});
         }
         else {
            req.session.user = { name: name, phone:phone,Username:Username,password:password,email:email};
            connection.query('INSERT INTO otp(OTP,Email)  VALUES (?,?)',[OTP,email],(error, results) => {
            if (error) {
              console.error("Error posting");
         }});
        console.log("send otp")
        res.json({message:"Check your Email for OTP"});
     }
     });
    }
    else{
      res.send('The username is already Exist')
    }
  })


    });
    
app.post('/otp',(req,res)=>
{
    const {otp} = req.body; 

    // const otps=req.session.user.OTP
    const name=req.session.user.name
    const phone=req.session.user.phone
    const Username=req.session.user.Username
    const password=req.session.user.password
    const email=req.session.user.email
    
    const otps=connection.query('select OTP from otp WHERE Email=?',[email],(error,results)=>{

    
    const Otp=results[0].OTP;
    console.log(Otp)

    if (otp==Otp){
        console.log(Otp)
        connection.query('INSERT INTO signin(Name,Phone,Username,Email,Password) VALUES (?,?,?,?,?)', [name,phone,Username,email,password], (error, results) => {
            if (error) {
              console.error("Error posting");
            //   return res.status(500).send({ error: "Error posting data" });
            }
            connection.query('DELETE FROM otp WHERE Email=?',[email])
            res.send(`Welcome ${name},happy to join us`);
          });
       
    }
});
});

app.post('/login',(req,res)=>{
    if(req.session.login){
        res.send("you are already login")
    }
    else{

    const {user,pass}=req.body
    
    connection.query('SELECT * FROM signin WHERE  Username=? AND Password=?',[user,pass],(err,results)=>{
       if(err){
        res.send("Username or Password is wrong,Try again");
       }
       else{
       if(results.length === 0){
           console.log('wrong');
           res.send("Username or Password is wrong,Try again");
       }
       console.log(results)
       req.session.login={user:user,pass:pass}
       res.send("Login successfully")
      }

        
    });
}
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to log out');
      }
      res.send('Logged out successfully');
    });
  });
// .........................
// app.post('/booking',(req,res)=>{
//      const{name,phone,Doctor}=req.body
    
//      connection.query('select MAX(Token) from bookings',(err,results)=>{
//         if(results.length===0){
//               Token=100
//               connection.query('INSERT INTO bookings(Name,Phone,DoctorName,Token) VALUES(?,?,?,?)',[name,phone,Doctor,Token],(err,results)=>{
//                 if(err){
//                   res.send('not booked')
//                 }
//                 res.send(`YOUR are booked token NO:${Token}`)
//               })
//         }
//         else{ 
//           Token=results[0].Token+1
//           console.log(results[0].Token)
//           console.log(Token)
//           connection.query('INSERT INTO bookings(Name,Phone,DoctorName,Token) VALUES(?,?,?,?)',[name,phone,Doctor,Token],(err,results)=>{
//             if(err){
//               res.send('not booked')
//             }
//             res.send(`YOUR are booked token NO:${Token}`)
//           })
//         }
         
//      }) 
// });
// ;...........................

app.post('/booking', (req, res) => {
  const { name, phone, Doctor,Age,Place,gender } = req.body;
   
  connection.query('SELECT Phone FROM bookings Where Phone=?',[phone],(err,results)=>{

      
    if (results.length!==0){
      res.send('Your already Appointed')
      console.log(results.length!==0)
      console.log('Your already Appointed')
    
    }
    else{
  // console.log(results)
     connection.query('SELECT MAX(Token) as Token FROM bookings', (err, results) => {
      if (err) {
          console.error("Error retrieving max token:", err);
          return res.status(500).send('Internal Server Error');
      }

      let Token = 100; // Default token if no bookings exist
      if (results[0].Token) {
          Token = results[0].Token + 1; // Increment token if there are bookings
      }

      console.log(`Assigned Token: ${Token}`);

      connection.query(
          'INSERT INTO bookings (Name, Phone, DoctorName,Age,Place,gender, Token) VALUES (?,?,?,?,?,?,?)',
          [name, phone, Doctor,Age,Place,gender ,Token],
          (err, results) => {
              if (err) {
                  console.error("Booking failed:", err);
                  return res.status(500).send('Booking failed');
              }

              res.send(`Your booking is confirmed. Your token number is: ${Token}`);
          }
      );
  });
}
});
});


app.delete ('/deletebooking/:id',(req,res)=>{
  console.log(req.params)
  const {id}=req.params;
   console.log(id)
  connection.query('DELETE FROM bookings WHERE id=?',[id],(err,results)=>{
    if(err){
      console.log('error fetching')
      res.send('error mysql')
    }
    else{
      if(results.length===0){
        res.send("booking not able to delete")
        
      }
      else{
        res.send("delete successfully")
      }
    }

  });
});


app.listen(3000);