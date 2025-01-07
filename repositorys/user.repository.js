const { User, User_Agents } = require('../models');
const { Op } = require('sequelize');

exports.findUserByEmailPhoneOrCinNumberForRegister = async (email, phoneNumber, cinNumber) => {
    return User.findOne({
        where: {
            [Op.or]: [
                { email: email },
                { phone_number: phoneNumber },
                { cin_number: cinNumber },
            ],
        },
    });
};

exports.createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
}

exports.getUsers = async () => {
    return User.findAll();
}

exports.findUserByEmail = async (email) => {
    return await User.findOne({
        where: { email },
    });
}

exports.findUserByEmailOrPhoneOrUserName = async (identifier) => {
    return await User.findOne({
        $or: [
            {
                email: identifier
            },
            {
                phone_number: identifier
            }
        ],
        include: [
            {
                model: User_Agents,
                as: 'user_agents',
            },
        ],
    })
}

exports.findUserById = async (userId) => {
    return await User.findOne({ _id: userId });
}

exports.verifiedUserAccount = async (identifier) => {
    return await User.update({
        verifiedAt: new Date(), // Set current timestamp
    }, {
        where: {
            email: identifier// or whatever identifier you're using
        }
    }) || null;
}

exports.findUserByIdAndHisAgents = async (userId) => {
    return await User.findOne({
        where: { id: userId },
        include: [
            {
                model: User_Agents,
                as: 'user_agents',
            },
        ],
    })
}