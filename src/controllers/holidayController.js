import Holiday from '../models/Holiday.js';

export const createHoliday = async (req, res) => {
    try {
        const { date, name } = req.body;
        if (!date || !name) {
            return res.status(400).json({
                success: false,
                message: 'Date (YYYY-MM-DD) and Holiday Name are required.'
            });
        }

        const existing = await Holiday.findOne({ date });
        if (existing) {
            existing.name = name;
            await existing.save();
            return res.status(200).json({
                success: true,
                message: 'Holiday updated successfully.',
                data: existing
            });
        }

        const holiday = await Holiday.create({ date, name });
        return res.status(201).json({
            success: true,
            message: 'Holiday added successfully.',
            data: holiday
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find({}).sort({ date: 1 });
        return res.status(200).json({
            success: true,
            count: holidays.length,
            data: holidays
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await Holiday.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: 'Holiday removed successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
