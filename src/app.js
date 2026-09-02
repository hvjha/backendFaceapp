import express from "express";
import cors from "cors";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get('/',(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Face Attendance API is running"
    })
})

export default app;