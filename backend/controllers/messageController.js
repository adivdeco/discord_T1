const Message = require('../models/Message');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { content, senderId, senderName, senderAvatar, channelId, conversationId } = req.body;

        // Create new message
        const newMessage = new Message({
            content,
            senderId,
            senderName,
            senderAvatar,
            channel: channelId,
            conversation: conversationId
        });

        const savedMessage = await newMessage.save();

        // Emit socket event
        if (req.io) {
            if (channelId) {
                req.io.to(channelId).emit('new_message', savedMessage);
            } else if (conversationId) {
                req.io.to(conversationId).emit('new_message', savedMessage);
            }
        }

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get messages for a channel
exports.getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const messages = await Message.find({ channel: channelId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Get messages for a conversation
exports.getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching conversation messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
