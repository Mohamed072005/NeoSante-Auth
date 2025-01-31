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

exports.sendMailForResetPassword = async (mailData, token) => {
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
            link: 'https://github.com/Mohamed072005/NeoSante-Auth', // Update with actual website link
            copyright: '© 2025 NéoSanté. Tous droits réservés.',
            // logo: 'http://localhost:3000/img/AlloMedia_transparent-.png'
        }
    })

    const mailBody = {
        body: {
            name: mailData.user_name,
            intro: 'Il semble que vous ayez demandé une réinitialisation de mot de passe pour votre compte AlloMedia. Pas de souci, nous sommes là pour vous aider !',
            action: {
                instructions: 'Pour réinitialiser votre mot de passe et retrouver l’accès à votre compte, cliquez sur le bouton ci-dessous :',
                button: {
                    color: '#FF5F57',
                    text: 'Réinitialiser le mot de passe',
                    link: `${process.env.BACK_END_URL}${process.env.APP_PORT}/to/reset/password?token=${token}`,
                }
            },
            outro: 'Si vous n’avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email. Si vous avez des questions ou des préoccupations, n’hésitez pas à contacter notre équipe d’assistance.',
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
        subject: 'Reset password email',
        html: emailContent,
    }

    return await sendEmail(config, message);
}

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
            copyright: '© 2025 NéoSanté. Tous droits réservés.',
            // logo: 'http://localhost:3000/img/AlloMedia_transparent-.png'
        }
    })

    const mailBody = {
        body: {
            name: userData.user_name,
            intro: 'Nous avons détecté une tentative de connexion à votre compte depuis un nouvel appareil ou navigateur.',
            table: {
                data: [
                    {
                        "Agent utilisé": agent, // Informations sur le nouvel agent de l'utilisateur
                    }
                ]
            },
            outro: `Votre code OTP est : <strong>${code}</strong>. Ce code expirera dans <strong>5 minutes</strong>. Si vous n’êtes pas à l’origine de cette demande, veuillez ignorer cet email. Si vous avez des questions ou des préoccupations, n’hésitez pas à contacter notre équipe d’assistance.`,
            signature: 'Cordialement, L’équipe NéoSanté'
        }
    }

    const emailContent = mailGenerator.generate(mailBody);
    const message = {
        from: {
            name: 'NéoSanté',
            address: process.env.NODEJS_GMAIL_APP_USER,
        },
        to: userData.email,
        subject: 'Code for security',
        html: emailContent,
    }

    return await sendEmail(config, message);
}