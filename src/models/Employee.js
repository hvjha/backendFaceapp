import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    employeeId:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    department:{
        type:String,
        trim:true
    },
    faceEmbedding:{
        type:[Number],
        default:[],
    }
},{timestamps:true});

const Employee = mongoose.model("Employee",employeeSchema);
export default Employee;