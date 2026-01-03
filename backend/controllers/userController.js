const User = require('../models/User');

exports.syncUser = async (req, res) => {
    try {
        const { clerkId, username, email, avatar } = req.body;

        if (!clerkId || !username || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Upsert user: Update if exists, Insert if not
        const user = await User.findOneAndUpdate(
            { clerkId },
            {
                clerkId,
                username,
                email,
                avatar,
                lastActiveAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`[SYNC] Synced user: ${username} (${clerkId})`);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
};
