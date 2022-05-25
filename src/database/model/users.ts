import { number } from 'joi';
import mongoose from 'mongoose';
import { generateId } from '../../utils/utils';

const userSchema = new mongoose.Schema({
    _id: { type: String, default: generateId() },
    username: {
        type: String,
        required: true,
        min: 6,
        max: 255,
        unique: true
    },
    email: {
        type: String,
        required: true,
        max: 255,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    activated: {
        type: String,
        required: true,
        default: 'not_activated',
        enum: ['not_activated', 'activated', 'disabled']
    },
    permissionLevel: {
        type: String,
        required: true,
        default: 'user',
        enum: ['user', 'moderator', 'admin', 'system']
    },
    validation: {
        code: { type: String, default: "" },
        expiry: { type: Number, default: 0 }
    },
    settings: {
        two_factor_authentication: { type: Boolean, required: true, default: false }
    },
    dateCreated: {
        type: Number, 
        default: Date.now()
    }
});

export default mongoose.model('Users', userSchema);