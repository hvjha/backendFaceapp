import Employee from "../models/Employee.js";

export const createEmployee = async(req,res)=>{
    try{
        const {employeeId,name,department} = req.body;
        const existingEmployee = await Employee.findOne({employeeId});
        if(existingEmployee){
            return res.status(400).json({
                success:false,
                message:"Employee with this ID already exists"
            })
        }
        const employee = await Employee.create({
            employeeId,
            name,
            department
        });
        return res.status(201).json({
            success:true,
            message:"Employee created successfully",
            data:employee
        });
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

export const getEmployees = async(req,res)=>{
    try{
        const employees = await Employee.find();
        res.status(200).json({
            success:true,
            message:"Employees fetched successfully",
            count:employees.length,
            data:employees
        })
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}