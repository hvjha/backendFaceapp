import express from "express";
import cors from "cors";
import employeeRoutes from "./routes/employeeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/employees", employeeRoutes);

app.get('/',(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Face Attendence Api"
    })
})

export default app;