const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String, // Should be hashed in real-world apps
});

const User = mongoose.model("User", userSchema);
module.exports = User;
