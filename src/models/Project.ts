import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    videoFileName: { type: String, required: true },
    videoFileSize: { type: Number, required: true },
    audioFileName: { type: String },
    audioFileSize: { type: Number },
    transcription: { type: String },
    processingTime: { type: Number }, // seconds
    createdAt: { type: Date, default: Date.now },
});

export const Project = mongoose.models?.Project || mongoose.model("Project", projectSchema);