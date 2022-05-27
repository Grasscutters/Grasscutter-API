import mongoose from 'mongoose';
import { generateId } from '../../utils/utils';

const linkSchema = new mongoose.Schema({
    name: { Type: String },
    url: { Type: String }
}, { _id: false});

const pluginSchema = new mongoose.Schema({
    _id: { type: String, default: generateId() },
    name: { type: String, index: true },
    description: { type: String },
    dateReleased: { type: Number, default: Date.now() },
    latestVersion: { type: String },
    versions: {},
    links: [linkSchema],
    createdBy: { type: String, index: true, ref: "Users" }
});

export default mongoose.model("Plugins", pluginSchema);