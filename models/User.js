let { Schema, model } = require("mongoose");

let UserSchema = new Schema({
  id: { type: String, required: true },
  voteStreak: { type: Number, default: 0 },
  lastVote: { type: Number, default: 0 },
});

module.exports = model("user", UserSchema);
