import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
    {
        date: {
            type: String, // YYYY-MM-DD
            required: true,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Holiday = mongoose.model('Holiday', holidaySchema);

export default Holiday;
