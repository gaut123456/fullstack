const request = require('supertest');

// Ensure required env vars for auth
process.env.BCRYPT_SECRET = process.env.BCRYPT_SECRET || 'pepper_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_test';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Mock User model used by controllers
jest.mock('../models/User', () => {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
  };
});

// Optionally stub bcrypt for speed/predictability
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(async () => 'salt'),
  hash: jest.fn(async (s) => `hashed:${s}`),
  compare: jest.fn(async (rawPlusPepper, hashed) => hashed === `hashed:${rawPlusPepper}`),
}));

const User = require('../models/User');
const app = require('../app');

describe('/api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('returns 400 when email/password missing', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Email et mot de passe requis/i);
    });

    it("returns 400 for invalid email format", async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'bad', password: 'secret' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Format d'email invalide/i);
    });

    it('returns 400 for short password', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/au moins 6/i);
    });

    it('returns 409 if email already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'u1', email: 'a@b.com' });
      const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'secret' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/déjà utilisé/i);
    });

    it('creates user and returns 201 with id/email', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: 'newid', email: 'a@b.com' });
      const res = await request(app).post('/api/auth/register').send({ email: 'A@B.com', password: 'secret' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toBe(201);
      expect(res.body.user).toEqual({ id: 'newid', email: 'a@b.com' });
    });
  });

  describe('POST /login', () => {
    it('returns 400 when email/password missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/requis/i);
    });

    it('returns 400 when user not found', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Identifiants invalides/i);
    });

    it('returns 400 when password mismatch', async () => {
      // bcrypt.compare is mocked to succeed only when hashed matches
      User.findOne.mockResolvedValue({ _id: 'u1', email: 'a@b.com', password: 'hashed:wrongpepper' });
      const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Identifiants invalides/i);
    });

    it('returns token and user on success', async () => {
      const bcrypt = require('bcryptjs');
      // make stored password match our mock compare
      const storedHash = await bcrypt.hash('secret' + process.env.BCRYPT_SECRET, 'salt');
      User.findOne.mockResolvedValue({ _id: 'u1', email: 'a@b.com', password: storedHash });

      const res = await request(app).post('/api/auth/login').send({ email: 'A@B.com', password: 'secret' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user).toEqual({ id: 'u1', email: 'a@b.com' });
    });
  });
});

