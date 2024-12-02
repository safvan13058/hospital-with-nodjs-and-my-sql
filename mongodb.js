const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://safvan13058:safvan@safvan.fierc.mongodb.net/nodejs?retryWrites=true&w=majority&appName=safvan')
.then(()=>console.log('Connected to MongoDB'))
.catch((err) => console.error('could not connect to MongoDB',err));

//define the student schema and model
const studentSchema =new mongoose.Schema({
    AdmnNO:{type:Number,required:true,unique:true},
    Name:{type:String,required:true},
    Course:{type:String,required:true},
    Email:{type:String,required:true},
    Duration:{type:String,required:true},

});

const Student=mongoose.model('Student',studentSchema);
module.exports=Student;