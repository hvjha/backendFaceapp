import Employee from "../models/Employee.js";

// Create Employee
export const createEmployee = async(req,res)=>{
    try{
        const {employeeId,name,department,isPhoneAllowed,faceEmbedding,faceImage} = req.body;
        const existingEmployee = await Employee.findOne({employeeId,isDeleted: false});
        if(existingEmployee){
            return res.status(400).json({
                success:false,
                message:"Employee with this ID already exists"
            })
        }
        const employee = await Employee.create({
            employeeId,
            name,
            department,
            isPhoneAllowed,
            faceEmbedding: faceEmbedding || [],
            faceImage: faceImage || ""
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

// Fetch All Employees
export const getEmployees = async(req,res)=>{
    try{
        const employees = await Employee.find({isDeleted: false});
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

// Fetch Single Employee By Id
export const getEmployeeById = async(req,res)=>{
    try{
        const {id} = req.params;

        const employee = await Employee.findOne({_id: id, isDeleted: false});
        if(!employee){
            return res.status(404).json({
                success:false,
                message:"Employee not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Employee fetched successfully",
            data:employee
        })
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

// Update Employee
export const updateEmployee = async(req,res)=>{
    try{
        const {id} = req.params;

        const {employeeId,name,department,isPhoneAllowed,faceEmbedding,faceImage} = req.body;

        const employee = await Employee.findOne({_id: id, isDeleted: false});
        if(!employee){
            return res.status(404).json({
                success:false,
                message:"Employee not found"
            })
        }

        // Check if the new employeeId is already taken by another employee
        if(employeeId && employeeId !== employee.employeeId){
            const existingEmployee = await Employee.findOne({employeeId, _id: {$ne: id}, isDeleted: false});
            if(existingEmployee){
                return res.status(400).json({
                    success:false,
                    message:"Employee with this ID already exists"
                })
            }
        }

        // Update the employee
        if (employeeId !== undefined) employee.employeeId = employeeId;
        if (name !== undefined) employee.name = name;
        if (department !== undefined) employee.department = department;
        if (isPhoneAllowed !== undefined) employee.isPhoneAllowed = isPhoneAllowed;
        if (faceEmbedding !== undefined) employee.faceEmbedding = faceEmbedding;
        if (faceImage !== undefined) employee.faceImage = faceImage;

        await employee.save();

        res.status(200).json({
            success:true,
            message:"Employee updated successfully",
            data:employee
        })
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}


// Delete Employee

export const deleteEmployee = async(req,res)=>{
    try{
        const {id} = req.params;

        const employee = await Employee.findOne({_id: id, isDeleted: false});
        if(!employee){
            return res.status(404).json({
                success:false,
                message:"Employee not found"
            })
        }

        employee.isDeleted = true;
        employee.deletedAt = new Date();
        await employee.save();

        res.status(200).json({
            success:true,
            message:"Employee deleted successfully",
            data:employee
        })
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

