const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String },
});

module.exports = mongoose.model("User", userSchema);
