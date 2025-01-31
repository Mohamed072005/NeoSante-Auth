const { User_Agents } = require('../models');

exports.createUserAgent = async (userAgent, verified, userId) => {
    try {
        await User_Agents.create({
            agent: userAgent,
            verified: verified, // Use the correct field name from the model
            userId: userId,     // Ensure the casing matches your parameter
        });
        console.log('User agent successfully created.');
    } catch (error) {
        console.error('Error creating user agent:', error);
        throw new Error('Failed to create user agent.');
    }
};