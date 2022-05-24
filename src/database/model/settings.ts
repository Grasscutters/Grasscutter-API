import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    _id: { type: String },
    value: { type: String, default: "undefined"},
    type: { 
        type: String, 
        default: 'boolean',
        enum: ['boolean', 'string', 'number']
    }
});

export default mongoose.model('Settings', settingsSchema);
