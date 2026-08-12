const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, default: "" },
  role: { type: String, default: "" },
  duration: { type: String, default: "" },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: "",
    get: (v) => (Array.isArray(v) ? v.join("\n") : (v ? String(v) : "")),
    set: (v) => (Array.isArray(v) ? v.join("\n") : (v ? String(v) : "")),
  },
}, { toJSON: { getters: true }, toObject: { getters: true } });

const EducationSchema = new mongoose.Schema({
  school: { type: String, default: "" },
  degree: { type: String, default: "" },
  year: { type: String, default: "" },
});

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "My Professional Resume",
    },
    content: {
      summary: { type: String, default: "" },
      skills: [{ type: String }],
      experience: [ExperienceSchema],
      education: [EducationSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
