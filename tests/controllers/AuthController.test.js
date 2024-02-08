import dbClient from '../../utils/db';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';

const app = express();

describe('AuthController', () => {
  const mockUser = {
    email: 'kaido@beast.com',
    password: 'hyakuju_no_kaido_wano',
  };
  let token = '';

  before(async function () {
    this.timeout(10000);
    const usersCollection = await dbClient.usersCollection();
    await usersCollection.deleteMany({ email: mockUser.email });
    const response = await request(app)
      .post('/users')
      .send({
        email: mockUser.email,
        password: mockUser.password,
      });
    expect(response.status).to.equal(201);
    expect(response.body.email).to.eql(mockUser.email);
    expect(response.body.id.length).to.be.greaterThan(0);
  });

  describe('GET /connect', () => {
    it('should fail with no "Authorization" header field', async () => {
      const response = await request(app).get('/connect');
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.eql({ error: 'Unauthorized' });
    });

    it('should fail for a non-existent user', async () => {
      const response = await request(app)
        .get('/connect')
        .auth('foo@bar.com', 'raboof', { type: 'basic' });
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.eql({ error: 'Unauthorized' });
    });

    it('should fail with a valid email and wrong password', async () => {
      const response = await request(app)
        .get('/connect')
        .auth(mockUser.email, 'raboof', { type: 'basic' });
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.eql({ error: 'Unauthorized' });
    });

    it('should fail with an invalid email and valid password', async () => {
      const response = await request(app)
        .get('/connect')
        .auth('zoro@strawhat.com', mockUser.password, { type: 'basic' });
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.eql({ error: 'Unauthorized' });
    });

    it('should succeed for an existing user', async () => {
      const response = await request(app)
        .get('/connect')
        .auth(mockUser.email, mockUser.password, { type: 'basic' });
      expect(response.status).to.equal(200);
      expect(response.body.token).to.exist;
      expect(response.body.token.length).to.be.greaterThan(0);
      token = response.body.token;
    });
  });

  describe('GET /disconnect', () => {
    it('should fail with no "X-Token" header field', async () => {
      const response = await request(app).get('/disconnect');
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.eql({ error: 'Unauthorized' });
    });

    it('should fail for a non-existent user', async () => {
      const response = await request(app)
        .get('/disconnect')
        .set('X-Token', 'raboof');
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.eql({ error: 'Unauthorized' });
    });

    it('should succeed with a valid "X-Token" field', async () => {
      const response = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(response.status).to.equal(204);
      expect(response.body).to.deep.eql({});
      expect(response.text).to.eql('');
      expect(response.headers['content-type']).to.not.exist;
      expect(response.headers['content-length']).to.not.exist;
    });
  });
});
