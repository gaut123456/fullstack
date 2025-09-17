const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_test';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Mock Contact model used by controllers
jest.mock('../models/Contacts', () => {
  return {
    find: jest.fn(() => ({ sort: jest.fn(async () => []) })),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };
});

const Contact = require('../models/Contacts');
const app = require('../app');

function authHeaderFor(userId = 'u1', email = 'a@b.com') {
  const token = jwt.sign({ sub: userId, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return `Bearer ${token}`;
}

describe('/api/contacts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('lists contacts for user', async () => {
      const list = [
        { _id: 'c1', user: 'u1', firstName: 'Ada', lastName: 'Lovelace', phone: '0123456789' },
      ];
      Contact.find.mockReturnValueOnce({ sort: jest.fn(async () => list) });
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', authHeaderFor('u1'));
      expect(res.status).toBe(200);
      expect(res.body).toEqual(list);
    });
  });

  describe('POST /', () => {
    it('validates required fields', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeaderFor('u1'))
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/firstName requis/i);
    });

    it('creates contact and returns 201', async () => {
      const payload = { firstName: 'Ada', lastName: 'Lovelace', phone: '0123456789' };
      const created = { _id: 'c1', user: 'u1', ...payload };
      Contact.create.mockResolvedValueOnce(created);
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeaderFor('u1'))
        .send(payload);
      expect(Contact.create).toHaveBeenCalledWith({ ...payload, user: 'u1' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
    });
  });

  describe('PATCH /:id', () => {
    it('validates fields for partial update', async () => {
      const res = await request(app)
        .patch('/api/contacts/c1')
        .set('Authorization', authHeaderFor('u1'))
        .send({ firstName: ' ' }); // empty after trim
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/firstName requis/i);
    });

    it('updates and returns document', async () => {
      const updated = { _id: 'c1', user: 'u1', firstName: 'Ada', lastName: 'Byron', phone: '0123456789' };
      Contact.findOneAndUpdate.mockResolvedValueOnce(updated);
      const res = await request(app)
        .patch('/api/contacts/c1')
        .set('Authorization', authHeaderFor('u1'))
        .send({ lastName: 'Byron' });
      expect(Contact.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'c1', user: 'u1' },
        { $set: { lastName: 'Byron' } },
        { new: true }
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    it('returns 404 when not found', async () => {
      Contact.findOneAndUpdate.mockResolvedValueOnce(null);
      const res = await request(app)
        .patch('/api/contacts/unknown')
        .set('Authorization', authHeaderFor('u1'))
        .send({ lastName: 'X' });
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/non trouvé/i);
    });

    it('returns 400 on invalid id (CastError)', async () => {
      Contact.findOneAndUpdate.mockRejectedValueOnce({ name: 'CastError' });
      const res = await request(app)
        .patch('/api/contacts/bad')
        .set('Authorization', authHeaderFor('u1'))
        .send({ lastName: 'X' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/ID invalide/i);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes and returns message', async () => {
      Contact.findOneAndDelete.mockResolvedValueOnce({ _id: 'c1' });
      const res = await request(app)
        .delete('/api/contacts/c1')
        .set('Authorization', authHeaderFor('u1'));
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/supprimé/i);
    });

    it('returns 404 when not found', async () => {
      Contact.findOneAndDelete.mockResolvedValueOnce(null);
      const res = await request(app)
        .delete('/api/contacts/unknown')
        .set('Authorization', authHeaderFor('u1'));
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/non trouvé/i);
    });

    it('returns 400 on invalid id (CastError)', async () => {
      Contact.findOneAndDelete.mockRejectedValueOnce({ name: 'CastError' });
      const res = await request(app)
        .delete('/api/contacts/bad')
        .set('Authorization', authHeaderFor('u1'));
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/ID invalide/i);
    });
  });

  describe('Auth middleware', () => {
    it('rejects missing token', async () => {
      const res = await request(app).get('/api/contacts');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Token manquant/i);
    });

    it('rejects invalid token', async () => {
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', 'Bearer invalid');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Token invalide|Token manquant/i);
    });
  });
});

