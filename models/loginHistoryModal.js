import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema({
    device: {
        type: String,
        required: [true, "Device type is required"],
        enum: ["web", "mobile"],
    },
    deviceName: {
        type: String,
        required: [true, "Device name is required"],
    },
    browser: {
        type: String,
        required: [true, "Browser name is required"],
    },

    ipAddress: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    loginTime: {
        type: Date,
        default: Date.now,
    },
    currentLogin: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const loginHistoryModel = mongoose.model.LoginHistory || mongoose.model("LoginHistory", loginHistorySchema);

export default loginHistoryModel;