const Mailgen = require('mailgen');
const { sendEmail } = require('../repositorys/email.repository');
const { body } = require('express-validator');

exports.sendMail = async (mailData, token) => {
    const config = {
        service: 'gmail',
        auth: {
            user: process.env.NODEJS_GMAIL_APP_USER,
            pass: process.env.NODEJS_GMAIL_APP_PASSWORD
        }
    };

    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'NéoSanté',
            link: 'https://github.com/Mohamed072005/NeoSante-Auth', // Update with actual website link
            copyright: '© 2025 NéoSanté. Tous droits réservés.',
        }
    });

    const mailBody = {
        body: {
            name: mailData.user_name,
            intro: 'Bienvenue sur NéoSanté ! Nous sommes ravis de vous compter parmi nous.',
            action: {
                instructions: 'Pour confirmer votre compte et commencer à utiliser NéoSanté, cliquez sur le bouton ci-dessous :',
                button: {
                    color: '#22BC66',
                    text: 'Confirmer mon compte',
                    link: `${process.env.BACK_END_URL}${process.env.APP_PORT}/verify/account?token=${token}`
                }
            },
            outro: 'Si vous n’avez pas créé de compte sur NéoSanté, veuillez ignorer cet email. Pour toute assistance, contactez notre support.',
            signature: 'Cordialement, L’équipe NéoSanté'
        }
    };

    const emailContent = mailGenerator.generate(mailBody);
    const message = {
        from: {
            name: 'NéoSanté',
            address: process.env.NODEJS_GMAIL_APP_USER,
        },
        to: mailData.email,
        subject: 'Confirmation de votre compte NéoSanté',
        html: emailContent,
    };

    return await sendEmail(config, message);
};

exports.sendOTPEmail = async (userData, code, agent) => {
    const config = {
        service: 'gmail',
        auth: {
            user: process.env.NODEJS_GMAIL_APP_USER,
            pass: process.env.NODEJS_GMAIL_APP_PASSWORD
        }
    }

    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'NéoSanté',
            link: 'https://github.com/Mohamed072005/NeoSante-Auth',
            copyright: '© 2024 AlloMedia. All rights reserved.',
            // logo: 'http://localhost:3000/img/AlloMedia_transparent-.png'
        }
    })

    const mailBody = {
        body: {
            name: userData.user_name,
            intro: 'We detected a login attempt to your account from a new device or browser.',
            table: {
                data: [
                    {
                        "Used Agent": agent, // Information about the user's new agent
                    }
                ]
            },
            outro: `Your OTP code is: <strong>${code}</strong>. This code will expire in <strong>5 minutes</strong>. If you did not request this, please disregard this email. If you have any concerns, feel free to reach out to our support team.`,
            signature: 'Best regards, The AlloMedia Team'
        }
    }

    const emailContent = mailGenerator.generate(mailBody);
    const message = {
        from: process.env.NODEJS_GMAIL_APP_USER,
        to: userData.email,
        subject: 'Code for security',
        html: emailContent,
    }

    return await sendEmail(config, message);
}