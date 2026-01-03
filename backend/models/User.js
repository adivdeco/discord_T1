const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String }, // URL to avatar image
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
