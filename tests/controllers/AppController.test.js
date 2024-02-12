import dbClient from '../../utils/db';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';

const app = express();

describe('AppController', () => {
	before(async function () {
		this.timeout(10000);
		await Promise.all([
			dbClient.usersCollection().deleteMany({}),
			dbClient.filesCollection().deleteMany({})
		]);
	});

	describe('GET /status', () => {
		it('should return status 200 and indicate that services are online', async () => {
			const response = await request(app).get('/status');
			expect(response.status).to.equal(200);
			expect(response.body).to.deep.equal({ redis: true, db: true });
		});
	});

	describe('GET /stats', () => {
		it('should return correct statistics about db collections', async () => {
			const response = await request(app).get('/stats');
			expect(response.status).to.equal(200);
			expect(response.body).to.deep.equal({ users: 0, files: 0 });
		});

		it('should return correct statistics about db collections after adding data', async () => {
			this.timeout(10000);
			const usersCollection = await dbClient.usersCollection();
			const filesCollection = await dbClient.filesCollection();
			await Promise.all([
				usersCollection.insertMany([{ email: 'john@mail.com' }]),
				filesCollection.insertMany([
					{ name: 'foo.txt', type: 'file' },
					{ name: 'pic.png', type: 'image' },
				])
			]);

			const response = await request(app).get('/stats');
			expect(response.status).to.equal(200);
			expect(response.body).to.deep.equal({ users: 1, files: 2 });
		});
	});
});
