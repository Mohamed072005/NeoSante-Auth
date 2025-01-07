const { findUserByEmailPhoneOrCinNumberForRegister, findUserByEmailOrPhoneOrUserName, createUser, findUserByEmail, findUserById, verifiedUserAccount, findUserByIdAndHisAgents } = require('../repositorys/user.repository');
const { generateJWT, verifyJWT } = require('../helpers/jwt.helper');
const { generateOTP } = require('../helpers/otp.generator.helper');
const bcrypt = require('bcryptjs');
const { sendMailForResetPassword, sendOTPEmail } = require('./email.services');
const { createUserAgent } = require('../repositorys/user-agents.repository');
const { sendMail } = require('./email.services');

exports.register = async (userData) => {
    const { 
        email, 
        password, 
        phone_number, 
        last_name,
        first_name,
        cin_number,
        country,
        city,
        address
        } = userData;

    const userExist = await findUserByEmailPhoneOrCinNumberForRegister(email, phone_number, cin_number);
    if(userExist){
        throw new Error('user already exists');
    }
    const hachedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
        email, 
        password: hachedPassword, 
        phone_number, 
        cin_number,
        first_name,
        last_name,
        country,
        city,
        address,
        roleId: "3d38dabe-49b8-4b43-a204-8b4393fb57b8"
    })

    return newUser;
}

exports.checkExistingUserByJWTEmail = async (token) => {
    try{
        if(!token || token === ''){
            throw new Error("invalid token");
        }
        
        const decoded = verifyJWT(token);
        const userEmail = decoded.identifier;
        const user = await verifiedUserAccount(userEmail); 
        if(!user){
            throw new Error('user not found');
        }
        return user;
    }catch(err){
        throw err;
    }

}

exports.verifyUserAgentForOTP = async (userAgent, user) => {
    if (!userAgent || userAgent === '') {
        return false;
    }
        const currentAgent = await user.user_agents.find(ua => ua.agent === userAgent);
        return currentAgent ? currentAgent : null;
    }

exports.login = async (identifier, password, userAagent) => {
    try{
        const user = await findUserByEmailOrPhoneOrUserName(identifier);        
        if(!user){
            throw new Error('Invalide login');
        }

        if (!user.verifiedAt) {
            const token = generateJWT(user.email, '1800s');
            await sendMail(user, token);
            return {
                message: "We send you an email to confirm your account",
                user_email: user.email,
                status: 204
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            const agent = await this.verifyUserAgentForOTP(userAagent, user);
            if(agent && agent.verified){
                const token = generateJWT(user._id, '24h');
                return  {
                    message: "login successfully",
                    agent: true,
                    user,
                    token: token
                };
            }
            const otp = generateOTP();
            const token = generateJWT({code: otp, user_id: user.id, user_email: user.email}, '300s');
            await sendOTPEmail(user, otp, userAagent);
            return  {
                message: "we send you email with code to virefy this new device",
                token: token,
                agent: false,
                user,
            };
        }else{
            throw new Error('Invalide login');
        }
    }catch(err){
        throw  err;
    }
}

exports.sendEmailForResetPassword = async (identifier) => {
    try{
        const findUser = await findUserByEmailOrPhoneOrUserName(identifier);        
        if(!findUser){
            const error = new Error('Invalid Identifier');
            error.status = 401;
            throw error;
        }
        
        const token = generateJWT(identifier, '300s');
        await sendMailForResetPassword(findUser ,token);
        return findUser;
    }catch(err){
        
        throw err;
    }
}

exports.confirmeResetPasswordRequest = async (token) => {
    try {
        if(!token || token === ''){
            const error = new Error('invalide Token'); 
            error.status = 401;
            throw error;
        }
        const virefiedToken = verifyJWT(token);
        const findUser = await findUserByEmailOrPhoneOrUserName(virefiedToken.identifier);
        if(!findUser){
            const error = new Error('User not found'); 
            error.status = 404;
            throw error;
        }
        return findUser.id;
    }catch(err){
        throw err;
    }
}

exports.completeRestPasswordRequest = async (password, user) => {
    try{
        const findUser = await findUserById(user);
        if(!findUser){
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        const hachedPassword = await bcrypt.hash(password, 10);
        findUser.password = hachedPassword;
        await findUser.save();
        return findUser;
    }catch(err){
        throw err;
    }
}

exports.handelOTPCode = async (token, code, rememberMe, userAagent) => {
    try{
        if((!token || token === '') && (!code || code === '')){
            const error = new Error('invalide code or token, try again!'); 
            error.status = 401;
            throw error;
        }
        const verifyToken = verifyJWT(token);
        if(verifyToken.identifier.code !== code){
            const error = new Error('invalide code!'); 
            error.status = 401;
            throw error;
        }

        const user =  await findUserByIdAndHisAgents(verifyToken.identifier.user_id);
        if(!user){
            const error = new Error('user not found!'); 
            error.status = 404;
            throw error;
        }
        const alreadyHaveThisAgent = await this.verifyUserAgentForOTP(userAagent, user);
        
        if(rememberMe){
            if(alreadyHaveThisAgent){
                user.user_agents.verified = new Date().toISOString();
                await user.user_agents.save();
                console.log(user);
            }else {
                await createUserAgent(userAagent, new Date().toISOString(), user.id);
            }
        }else {            
            await createUserAgent(userAagent, null, user.id);
        }
        return {
            token: generateJWT(user.id, '24h'),
            user: user
        } 
    }catch(err){
        console.log(err);
        
        throw err;
    }
}