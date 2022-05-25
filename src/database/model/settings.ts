import mongoose, { Schema } from 'mongoose';

const settingsSchema = new mongoose.Schema({
    _id: { type: String },
    value: { type: Schema.Types.Mixed, default: "undefined"}
});

export default mongoose.model('Settings', settingsSchema);
