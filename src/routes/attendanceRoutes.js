import express from 'express';
import {
    scanFaceAndMarkAttendance,
    getEmployeeHistory,
    getAttendanceReport,
    exportAttendanceCSV
} from '../controllers/attendanceController.js';

const router = express.Router();

// Face Recognition Check-In / Check-Out
router.post('/scan-face', scanFaceAndMarkAttendance);

// Single Employee Attendance History & Stats
router.get('/employee/:id', getEmployeeHistory);

// Date & Department Attendance Reports
router.get('/report', getAttendanceReport);

// Export Attendance Records to CSV
router.get('/export', exportAttendanceCSV);

export default router;
