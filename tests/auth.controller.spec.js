const { register: authController, login: authLogin } = require('../controllers/auth.controller');
const { register: registerService, login: loginService } = require('../services/user.services');
const { generateJWT } = require('../helpers/jwt.helper');
const { sendMail } = require('../services/email.services');
const { app, startServer } = require('../app');
const request = require('supertest');


// Mock the dependencies
jest.mock('../services/user.services', () => ({
    register: jest.fn(),
    login: jest.fn()
}));

jest.mock('../helpers/jwt.helper', () => ({
    generateJWT: jest.fn()
}));

jest.mock('../services/email.services', () => ({
    sendMail: jest.fn()
}));

describe('Auth Controller Register', () => {
    let req, res;
    let server;

    beforeAll(async () => {
        server = await startServer(4001);
    });

    afterAll(async () => {
        // Close server after tests
        await new Promise((resolve) => server.close(resolve));
    });

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
                phone_number: '1234567890',
                last_name: 'Doe',
                first_name: 'John',
                cin_number: 'ABC123',
                country: 'USA',
                city: 'New York',
                address: '123 Main St'
            }
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.clearAllMocks();
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully register a new user', async () => {
        const mockUser = {
            id: '123',
            email: 'test@example.com'
        };
        const mockToken = 'mock-token';

        // Set up mock return values
        registerService.mockResolvedValue(mockUser);
        generateJWT.mockReturnValue(mockToken);
        sendMail.mockResolvedValue();

        await authController(req, res);

        expect(registerService).toHaveBeenCalledWith(req.body);
        expect(generateJWT).toHaveBeenCalledWith(mockUser.email, '1800s');
        expect(sendMail).toHaveBeenCalledWith(mockUser, mockToken);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "registered and email sended",
            user: mockUser,
            token: mockToken
        });
    });

    test('should return error user already exist', async () => {
        const mockError = new Error('user already exists');
        registerService.mockRejectedValue(mockError);

        await authController(req, res);

        expect(registerService).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ errorMessage: 'user already exists' });
    })

    test('should return validation error email is require', async () => {
        req.body.email = '';
        const response = await request(app)
            .post('/register')
            .send({
                req: {
                    body: {
                        email: '',
                        password: 'XXXXXXXXXXX',
                        phone_number: '1234567890',
                        last_name: 'Doe',
                        first_name: 'John',
                        cin_number: 'ABC123',
                        country: 'USA',
                        city: 'New York',
                        address: '123 Main St'
                    }
                }
            })
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", 'Full name is required')
    })

    test('should handle validation error (Catch th error from the database)', async () => {
        const validationError = {
            name: 'ValidationError',
            errors: {
                email: {
                    path: 'email',
                    message: 'Invalid email format'
                }
            }
        };
        registerService.mockRejectedValue(validationError);

        await authController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            field: 'email',
            message: 'Invalid email format'
        });
    });
});

describe('Auth Controller Login', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                identifier: 'test@example.com',
                password: 'XXXXXXXXX'
            },
            headers: {
                token: 'uytwtiwfvh7y3287y38yhfbhvjwby378',
                user_agent: 'PostmanRuntime/7.43.0'
            }
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    test('should return 200 and user data on successful login', async () => {
        const mockUser = {
            id: '123',
            email: 'test@example.com',
            token: 'mock-token'
        };

        loginService.mockResolvedValue(mockUser);

        await authLogin(req, res);

        expect(loginService).toHaveBeenCalledWith(
            req.body.identifier,
            req.body.password,
            req.headers['user-agent']
        );
        // expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    test('should return Invalide login', async () => {
        const mockError = new Error('Invalide login');

        loginService.mockRejectedValue(mockError);

        await authLogin(req, res);

        expect(loginService).toHaveBeenCalledWith(
            req.body.identifier,
            req.body.password,
            req.headers['user-agent']
        );
        console.log(res.json);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalide login!!' });
    })

    test('should return Login identifier is required', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                req: {
                    body: {
                        identifier: '',
                        password: 'XXXXXXXXXXX'
                    }
                }
            })

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", 'Login identifier is required')
    })
})