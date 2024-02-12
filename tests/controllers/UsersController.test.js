/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db';

describe('+ UserController', () => {
	const mockUser = {
		email: 'beloxxi@blues.com',
		password: 'melody1982',
	};

	before(async function () {
		this.timeout(10000);
		await dbClient.usersCollection().then((usersCollection) => usersCollection.deleteMany({ email: mockUser.email }));
		await new Promise((resolve) => setTimeout(resolve, 5000));
	});

	describe('+ POST: /users', () => {
		it('+ Fails when email is missing but password is present', function (done) {
			this.timeout(5000);
			request.post('/users')
				.send({
					password: mockUser.password,
				})
				.expect(400)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.body).to.deep.eql({ error: 'Missing email' });
					done();
				});
		});

		it('+ Fails when password is missing but email is present', function (done) {
			this.timeout(5000);
			request.post('/users')
				.send({
					email: mockUser.email,
				})
				.expect(400)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.body).to.deep.eql({ error: 'Missing password' });
					done();
				});
		});

		it('+ Succeeds when both email and password are provided', function (done) {
			this.timeout(5000);
			request.post('/users')
				.send({
					email: mockUser.email,
					password: mockUser.password,
				})
				.expect(201)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.body.email).to.eql(mockUser.email);
					expect(res.body.id.length).to.be.greaterThan(0);
					done();
				});
		});

		it('+ Fails when the user already exists', function (done) {
			this.timeout(5000);
			request.post('/users')
				.send({
					email: mockUser.email,
					password: mockUser.password,
				})
				.expect(400)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.body).to.deep.eql({ error: 'Already exist' });
					done();
				});
		});
	});

});
