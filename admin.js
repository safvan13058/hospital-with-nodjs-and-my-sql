var express=require('express');
const mysql=require('mysql');
var admin=express.Router();
admin.use(express.json());
admin.use(express.urlencoded({ extended: true }));
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

admin.post('/Doctorreg',(req,res)=>
{ 
    const {name,Phone,Email,Catagory,Qualification,Address,Dateofbirth,Username,password}=req.body;
    console.log(name,Phone,Email,Catagory,Qualification,Address,Dateofbirth);

    connection.query('select * from signin WHERE Username=?',[Username],(err,results)=>{
        if(results.length===0){
            connection.query('INSERT INTO signin(Name,Phone,Email,Password,Username) VAlUES(?,?,?,?,?) ',[name,Phone,Email,password,Username])
            connection.query('INSERT INTO doctor(Name,Phone,Email,Catagory,Qualification,Address,Dateofbirth,Username,Password) VALUES(?,?,?,?,?,?,?,?,?)',[name,Phone,Email,Catagory,Qualification,Address,Dateofbirth,Username,password],(err,results)=>{
                if(err){
                  res.send("error registration")
                }
                res.send(`register success :${results}`)
              });
        }
        else{
            res.send('The username is already register')
        }
    })
    
});

admin.get('/displaydoc',(req,res)=>{
    connection.query('select *from doctor',(err,results)=>{
        if(err){
            res.send("error displaying")
        }
        res.send(results);
    })
});

// -------------------------------
admin.get('/displaybooking',(req,res)=>{

    connection.query('select *from bookings',(err,results)=>{
        if(err){
            console.log('error fetching');
        }
        else{

        if(results.length==0){
           console.log(results.length==0)
           res.send('No Booking found')
        }
        else{
        console.log(results.length)
        res.send(results);  
        }  
    } 
    });
});
// ---------------------------------------------
admin.put('/updatedata/:id',(req,res)=>{

    const {name,Phone,Email,Catagory,Qualification,Address,Dateofbirth}=req.body;
    const userid=req.params.id
   

    connection.query('UPDATE doctor SET Name=? ,Phone=?,Email=?,Catagory=?,Qualification=?,Address=?,Dateofbirth=?) WHERE id=?',[name,Phone,Email,Catagory,Qualification,Address,Dateofbirth,userid],(err,results)=>{
        if(err){
            res.send('error mysql')
        }
        if(results){
            res.send('update successfully ')
        }

    })
});
// -------------------------------------

admin.delete('/delete/:id',(req,res)=>{
    const userid=req.params.id
    connection.query('DELETE doctor WHERE id=?',[userid],(err,results)=>{
        if(err){
            res.send('error')
        }
        if(results.length===0){
            res.send('No doctor found')
        } 
        else{
        res.send('Delete doctor successfully')
        }

    })
});
// -------------------------------------------
module.exports=admin