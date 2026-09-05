import express from 'express';
import adminMiddleware from '../middleware/adminMiddleware.js';
import {
    createHoliday,
    getHolidays,
    deleteHoliday
} from '../controllers/holidayController.js';

const router = express.Router();

router.get('/all', getHolidays);
router.post('/create', adminMiddleware, createHoliday);
router.delete('/:id', adminMiddleware, deleteHoliday);

export default router;
