import mongoose from 'mongoose';
import { generateId } from '../../utils/utils';

const linkSchema = new mongoose.Schema({
    name: { Type: String },
    url: { Type: String }
}, { _id: false});

/*const versionSchema = new mongoose.Schema({
    version: { Type: String },
    changeLog: { Type: String },
    fileData: {
        name: String,
        mimetype: String,
        size: Number,
        md5: String
    },
    uploadDate: { type: Number, default: Date.now() }
}, { _id: false});*/

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