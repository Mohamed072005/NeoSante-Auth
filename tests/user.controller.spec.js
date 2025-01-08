const {
    sendEmailForResertPassword,
    confirmeResetPassword,
    resetPassword
} = require('../controllers/user.controller');
const userServices = require('../services/user.services');

// Mock the services
jest.mock('../services/user.services');

describe('Password Reset Controllers', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            render: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendEmailForResertPassword', () => {
        it('should successfully send reset password email', async () => {
            const mockResponse = { email: 'test@example.com' };
            userServices.sendEmailForResetPassword.mockResolvedValue(mockResponse);

            req.body.identifier = 'test@example.com';

            await sendEmailForResertPassword(req, res);

            expect(userServices.sendEmailForResetPassword).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email sended success',
                user_email: 'test@example.com'
            });
        });

        it('should handle 401 unauthorized error', async () => {
            const error = new Error('Invalid Identifier');
            error.status = 401;
            userServices.sendEmailForResetPassword.mockRejectedValue(error);

            req.body.identifier = 'invalid@example.com';

            await sendEmailForResertPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid Identifier'
            });
        });

        it('should handle server error', async () => {
            const error = new Error('Server error');
            userServices.sendEmailForResetPassword.mockRejectedValue(error);

            req.body.identifier = 'test@example.com';

            await sendEmailForResertPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(error);
        });
    });

    describe('confirmeResetPassword', () => {
        it('should successfully render reset password page', async () => {
            const mockUser = { id: '123' };
            userServices.confirmeResetPasswordRequest.mockResolvedValue(mockUser);

            req.query.token = 'valid-token';

            await confirmeResetPassword(req, res);

            expect(userServices.confirmeResetPasswordRequest).toHaveBeenCalledWith('valid-token');
            expect(res.render).toHaveBeenCalledWith('resetPasswordPage', {
                user: mockUser
            });
        });

        it('should handle expired JWT', async () => {
            const error = new Error('jwt expired');
            userServices.confirmeResetPasswordRequest.mockRejectedValue(error);

            req.query.token = 'expired-token';

            await confirmeResetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'jwt expired'
            });
        });

        it('should handle invalid JWT signature', async () => {
            const error = new Error('invalid signature');
            userServices.confirmeResetPasswordRequest.mockRejectedValue(error);

            req.query.token = 'invalid-token';

            await confirmeResetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'invalid signature'
            });
        });

        it('should handle server error', async () => {
            const error = new Error('Server error');
            userServices.confirmeResetPasswordRequest.mockRejectedValue(error);

            req.query.token = 'valid-token';

            await confirmeResetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error'
            });
        });
    });

    describe('resetPassword', () => {
        it('should successfully reset password', async () => {
            const mockUser = { id: '123', email: 'test@example.com' };
            userServices.completeRestPasswordRequest.mockResolvedValue(mockUser);

            req.body = {
                password: 'newPassword123',
                user: '123'
            };

            await resetPassword(req, res);

            expect(userServices.completeRestPasswordRequest).toHaveBeenCalledWith('newPassword123', '123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'reset password successfully',
                user: mockUser,
                status: 200
            });
        });

        it('should handle user not found error', async () => {
            const error = new Error('There is no user with this identifier');
            error.status = 404;
            userServices.completeRestPasswordRequest.mockRejectedValue(error);

            req.body = {
                password: 'newPassword123',
                user: 'invalid-id'
            };

            await resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'There is no user with this identifier',
                status: 404
            });
        });
    });
});