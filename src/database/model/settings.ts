import mongoose, { Schema } from 'mongoose';

const settingsSchema = new mongoose.Schema({
    _id: { type: String },
    value: { type: Schema.Types.Mixed, default: "undefined"}
});

const settingsModel = mongoose.model('Settings', settingsSchema);

/**
 * Returns the value of the setting.
 * @param id The ID of the setting.
 */
export async function getSetting(id: string) {
    const setting = await settingsModel.findById(id);
    if (!setting)
        throw `Unable to fetch setting by the id ${id}`;

    return setting.value;
}

export default settingsModel;
