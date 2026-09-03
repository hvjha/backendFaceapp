import express from 'express';
import {
    scanFaceAndMarkAttendance,
    getEmployeeHistory,
    getAttendanceReport,
    exportAttendanceCSV,
    getRecentAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

// Face Recognition Check-In / Check-Out
router.post('/scan-face', scanFaceAndMarkAttendance);

// Single Employee Attendance History & Stats
router.get('/employee/:id', getEmployeeHistory);

// Date & Department Attendance Reports
router.get('/report', getAttendanceReport);

// Recent Attendance Logs for Kiosk Table
router.get('/recent', getRecentAttendance);

// Export Attendance Records to CSV
router.get('/export', exportAttendanceCSV);

export default router;

