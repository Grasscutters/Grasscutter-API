import mongoose from "mongoose";

import {number} from "joi";
import {generateId} from "../../utils/utils";

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

const userModal = mongoose.model('Users', userSchema);

export async function getUserById(id: string) {
    return userModal.findById(id);
}

export async function getUserByEmail(email: string) {
    return userModal.findOne({email});
}

export async function getUserByUsername(username: string) {
    return userModal.findOne({username});
}

export default userModal;