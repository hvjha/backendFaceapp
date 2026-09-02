import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { findBestFaceMatch } from '../services/faceMatcher.js';

/**
 * Helper to format Date to YYYY-MM-DD string
 */
const formatDate = (dateObj = new Date()) => {
    return dateObj.toISOString().split('T')[0];
};

/**
 * Face Scan Attendance Handler (Check-In & Check-Out with 1-min rule)
 */
export const scanFaceAndMarkAttendance = async (req, res) => {
    try {
        const { faceEmbedding, employeeId, faceImage } = req.body;

        let matchedEmployee = null;
        let matchScore = 0;

        // If specific employeeId is provided directly
        if (employeeId) {
            matchedEmployee = await Employee.findOne({ _id: employeeId, isDeleted: false });
            if (!matchedEmployee) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee not found.'
                });
            }
        } else if (faceEmbedding && Array.isArray(faceEmbedding) && faceEmbedding.length > 0) {
            // Match face vector against all active registered employees
            const activeEmployees = await Employee.find({ isDeleted: false });
            const bestMatch = findBestFaceMatch(faceEmbedding, activeEmployees, 0.70);

            if (!bestMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Face not recognized. Please make sure you are registered or try positioning your face clearly.'
                });
            }

            matchedEmployee = bestMatch.employee;
            matchScore = bestMatch.similarity;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either faceEmbedding or employeeId must be provided.'
            });
        }

        const now = new Date();
        const todayStr = formatDate(now);

        // Check if there is an active session (checkIn exists, checkOut is null)
        const activeSession = await Attendance.findOne({
            employeeId: matchedEmployee._id,
            checkOut: null
        }).sort({ checkIn: -1 });

        if (!activeSession) {
            // === CHECK-IN (LOGIN) ===
            const newAttendance = await Attendance.create({
                employeeId: matchedEmployee._id,
                customEmployeeId: matchedEmployee.employeeId,
                employeeName: matchedEmployee.name,
                department: matchedEmployee.department || 'General',
                date: todayStr,
                checkIn: now,
                status: 'In Progress',
                checkInPhoto: faceImage || matchedEmployee.faceImage || null
            });

            return res.status(200).json({
                success: true,
                action: 'CHECK_IN',
                message: `Check-in successful! Welcome, ${matchedEmployee.name}.`,
                employee: {
                    _id: matchedEmployee._id,
                    employeeId: matchedEmployee.employeeId,
                    name: matchedEmployee.name,
                    department: matchedEmployee.department,
                    faceImage: matchedEmployee.faceImage
                },
                matchSimilarity: matchScore ? (matchScore * 100).toFixed(1) + '%' : '100%',
                data: newAttendance
            });
        } else {
            // === CHECK-OUT (LOGOUT) ===
            const checkInTime = new Date(activeSession.checkIn).getTime();
            const currentTime = now.getTime();
            const elapsedSeconds = Math.floor((currentTime - checkInTime) / 1000);

            const MIN_WORK_SECONDS = 60; // 1-minute minimum rule

            if (elapsedSeconds < MIN_WORK_SECONDS) {
                const remainingSeconds = MIN_WORK_SECONDS - elapsedSeconds;
                return res.status(400).json({
                    success: false,
                    minDurationViolation: true,
                    remainingSeconds,
                    message: `Cannot check-out yet. Please wait ${remainingSeconds} second(s). (Minimum 1 minute work duration required after check-in).`,
                    employee: {
                        _id: matchedEmployee._id,
                        name: matchedEmployee.name
                    },
                    checkInTime: activeSession.checkIn
                });
            }

            // Perform Check-Out
            const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
            activeSession.checkOut = now;
            activeSession.durationMinutes = durationMinutes;
            activeSession.status = 'Completed';
            if (faceImage) {
                activeSession.checkOutPhoto = faceImage;
            }
            await activeSession.save();

            return res.status(200).json({
                success: true,
                action: 'CHECK_OUT',
                message: `Check-out successful! Goodbye, ${matchedEmployee.name}. Duration: ${durationMinutes} min(s).`,
                employee: {
                    _id: matchedEmployee._id,
                    employeeId: matchedEmployee.employeeId,
                    name: matchedEmployee.name,
                    department: matchedEmployee.department,
                    faceImage: matchedEmployee.faceImage
                },
                matchSimilarity: matchScore ? (matchScore * 100).toFixed(1) + '%' : '100%',
                data: activeSession
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get single employee complete attendance history & analytics
 */
export const getEmployeeHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        const records = await Attendance.find({ employeeId: id }).sort({ checkIn: -1 });

        const totalRecords = records.length;
        const totalMinutes = records.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        
        // Count unique dates attended
        const uniqueDays = new Set(records.map(r => r.date)).size;

        return res.status(200).json({
            success: true,
            data: {
                employee,
                stats: {
                    totalPresentDays: uniqueDays,
                    totalLogs: totalRecords,
                    totalHoursWorked: totalHours,
                    averageMinutesPerDay: uniqueDays > 0 ? Math.round(totalMinutes / uniqueDays) : 0
                },
                history: records
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get attendance report (Daily, Weekly, Monthly, or Particular Date)
 */
export const getAttendanceReport = async (req, res) => {
    try {
        const { filterType, date, startDate, endDate, department } = req.query;

        let query = {};
        const today = new Date();

        if (department) {
            query.department = department;
        }

        if (filterType === 'particularDate' && date) {
            query.date = date;
        } else if (filterType === 'daily' || (!filterType && !date && !startDate)) {
            const todayStr = date || formatDate(today);
            query.date = todayStr;
        } else if (filterType === 'weekly') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - 7);
            const startStr = formatDate(startOfWeek);
            const endStr = formatDate(today);
            query.date = { $gte: startStr, $lte: endStr };
        } else if (filterType === 'monthly') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startStr = formatDate(startOfMonth);
            const endStr = formatDate(today);
            query.date = { $gte: startStr, $lte: endStr };
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(query).sort({ checkIn: -1 });

        return res.status(200).json({
            success: true,
            count: records.length,
            filter: { filterType, date, startDate, endDate },
            data: records
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Export Attendance Data to CSV Format
 */
export const exportAttendanceCSV = async (req, res) => {
    try {
        const { filterType, date, startDate, endDate, employeeId } = req.query;

        let query = {};
        const today = new Date();

        if (employeeId) {
            query.employeeId = employeeId;
        }

        if (filterType === 'particularDate' && date) {
            query.date = date;
        } else if (filterType === 'daily') {
            query.date = date || formatDate(today);
        } else if (filterType === 'weekly') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - 7);
            query.date = { $gte: formatDate(startOfWeek), $lte: formatDate(today) };
        } else if (filterType === 'monthly') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            query.date = { $gte: formatDate(startOfMonth), $lte: formatDate(today) };
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(query).sort({ date: -1, checkIn: -1 });

        // Build CSV Content
        const headers = ['Employee ID', 'Employee Name', 'Department', 'Date', 'Check-In Time', 'Check-Out Time', 'Duration (Mins)', 'Status'];
        const csvRows = [headers.join(',')];

        records.forEach(rec => {
            const checkInFormatted = rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '';
            const checkOutFormatted = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : 'In Progress';
            
            const row = [
                `"${rec.customEmployeeId || ''}"`,
                `"${rec.employeeName || ''}"`,
                `"${rec.department || ''}"`,
                `"${rec.date || ''}"`,
                `"${checkInFormatted}"`,
                `"${checkOutFormatted}"`,
                rec.durationMinutes || 0,
                `"${rec.status || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${filterType || 'export'}_${formatDate(today)}.csv`);

        return res.status(200).json({
            success: true,
            filename: `Attendance_Report_${filterType || 'export'}_${formatDate(today)}.csv`,
            csvContent: csvString,
            totalRecords: records.length
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
