import mongoose  from 'mongoose';
import {generateId} from '../../utils/utils';

const linkSchema = new mongoose.Schema({
    name: { Type: String },
    url: { Type: String }
}, { _id: false});

const pluginSchema = new mongoose.Schema({
    _id: { type: String, default: generateId() },
    name: { type: String },
    summary: { type: String, max: 100 },
    description: { type: String },
    dateReleased: { type: Number, default: Date.now() },
    latestVersion: { type: String },
    versions: {},
    links: [linkSchema],
    deletionStatus: {
        pendingDeletion: { type: Boolean, default: false },
        deletionDate: { type: Number, default: 0 }
    },
    privacy: { type: String, default: "public", enum: ["public", "hidden", "private"]},
    createdBy: { type: String, index: true }
});

const pluginModal = mongoose.model("Plugins", pluginSchema);

export async function getPluginsByUserId(userId) {
    return pluginModal.find({createdBy: userId});
}

export async function getPluginById(id) {
    return pluginModal.findById(id);
}

export default pluginModal;