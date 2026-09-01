import express from 'express';

import {createEmployee, getEmployees} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/create', createEmployee);
router.get('/all', getEmployees);  

export default router;
