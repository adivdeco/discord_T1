const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    senderId: { type: String, required: true }, // clerkId
    senderName: { type: String, required: true }, // Cache username for display
    senderAvatar: { type: String }, // Cache avatar for display
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }, // Optional if conversation
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }, // Optional if channel
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
