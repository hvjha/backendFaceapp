import express from 'express';

import adminMiddleware from '../middleware/adminMiddleware.js';
import {
	createEmployee,
	deleteEmployee,
	getEmployeeById,
	getEmployees,
	updateEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/create', adminMiddleware, createEmployee);
router.get('/all', getEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', adminMiddleware, updateEmployee);
router.delete('/:id', adminMiddleware, deleteEmployee);

export default router;
