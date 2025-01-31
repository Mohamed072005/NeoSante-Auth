const { register, checkExistingUserByJWTEmail, login, handelOTPCode, resetOTPService } = require('../services/user.services');
const { getUsers } = require('../repositorys/user.repository');
const { sendMail } = require('../services/email.services');
const { generateJWT } = require('../helpers/jwt.helper');

exports.register = async (req, res) => {
    const userData = req.body;    
    try{
        const newUser = await register(userData);
        console.log(newUser.id);
        
        const token = generateJWT(newUser.email, '1800s');
        await sendMail(newUser, token);
        return res.status(200).json({
            message: "registered and email sended",
            user: newUser,
            token: token
        })
    }catch(error){        
        if(error.message === 'user already exists'){
            return res.status(409).json({
                errorMessage: error.message
            })
        }
        if(error.name === 'ValidationError'){
            const firstErrorKey = Object.keys(error.errors)[0];
            const firstError = error.errors[firstErrorKey]; 

            return res.status(400).json({
            field: firstError.path,
            message: firstError.message
            });
        }
        return res.status(500).json(error);
    }
}

exports.checkEmailConfirmed = async (req, res) => {
    const token = req.query.token;
    try{
        const user = await checkExistingUserByJWTEmail(token);
        if(!user){
            throw new Error("can't verify the account right know");
        }
        res.redirect(`${process.env.FRONT_END_URL}/auth`);
    }catch(err){
        if(err.message === "can't verify the account right know"){
            return res.status(409).json({
                message: err.message
            });
        }
        if(err.message === 'invalid token'){
            return res.status(400).json({
                message: err.message
            });
        }

        if(err.message === 'user not found'){
            return res.status(404).json({
                message: err.message
            });
        }

        if(err.message === 'jwt expired' || err.message === 'invalid signature'){
            return res.status(401).json({
                message: err.message
            });
        }
        return res.status(500).json({
            message: err.message
        });
    }
}

exports.getUsers = async (req, res) => {
    const response = await getUsers();
    return res.status(200).json(response);
}

exports.login = async (req, res) => {
    const { password, identifier } = req.body;
    const userAgent = req.headers['user-agent'];
    try{
        const user = await login(identifier, password, userAgent);
        return res.status(user.status).json({
            user
        })
    }catch(error){
        if(error.message === 'Invalide login'){
            return res.status(401).json({
                message: "Invalide login!!",
            })
        }
        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
}

exports.virefyOTPCode = async(req, res) => {
    const { otp, rememberMe} = req.body;
    const token = req.headers['authorization'].split(" ")[1];
    const userAgent = req.headers['user-agent'];    
    try{
        const response = await handelOTPCode(token, otp, rememberMe, userAgent);
        return res.status(200).json({
            message: "Login success",
            response
        }) 
    }catch(err){
        console.log(err);
        if(err.status === 401){
            return res.status(401).json({
                message: err.message
            })
        }
        if(err.status === 404){
            return res.status(404).json({
                message: err.message,
            })
        }
        if(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ){
            return res.status(401).json({
                message: "OTP code expired",
            })
        }
        return res.status(500).json(err);
    }
}

exports.resendOTPCode = async (req, res) => {
    const { user_id } = req.body;
    const userAgrnt = req.headers['user-agent'];
    try{
        const resposne = await resetOTPService(user_id, userAgrnt);
        return res.status(200).json({
            message: resposne.message,
            user_id: resposne.user_id,
            user_email: resposne.user_email,
            token: resposne.token
        })
    }catch(err){
        if(err.status === 401){
            return res.status(401).json({
                message: err.message
            })
        }
        if(err.name === 'JsonWebTokenError' || err.message === 'jwt expired' || err.message === 'invalid signature'){
            return res.status(401).json({
                message: err.message,
            })
        }
        return res.status(500).json({
            message: err.message
        })
    }
}