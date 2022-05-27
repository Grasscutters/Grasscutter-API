import mongoose, { plugin } from 'mongoose';
import { generateId } from '../../utils/utils';

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
    createdBy: { type: String, index: true }
});

const pluginModal = mongoose.model("Plugins", pluginSchema)

export async function getPluginsByUserID(userId) {
    return await pluginModal.find({ createdBy: userId });
}

export async function GetPluginByID(id) {
    return await pluginModal.findById(id);
}

export default pluginModal;