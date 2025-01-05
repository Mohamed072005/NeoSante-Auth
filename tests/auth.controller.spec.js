const { register: authController } = require('../controllers/auth.controller');
const { register: registerService } = require('../services/user.services');
const { generateJWT } = require('../helpers/jwt.helper');
const { sendMail } = require('../services/email.services');
const app = require('../app');
const request = require('supertest');


// Mock the dependencies
jest.mock('../services/user.services', () => ({
    register: jest.fn()
}));

jest.mock('../helpers/jwt.helper', () => ({
    generateJWT: jest.fn()
}));

jest.mock('../services/email.services', () => ({
    sendMail: jest.fn()
}));

describe('Auth Controller', () => {
    let req, res;

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

    test('should return error user already exist',  async () => {
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