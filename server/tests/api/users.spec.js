
import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import db from '../../app/models';
import helper from '../test.helper';

const superRequest = request.agent(app);
const expect = chai.expect;

const userParams = helper.regularUser;
const adminParams = helper.adminUser;
let adminUser;
let adminToken;
let regularToken;

describe('User API', () => {
  before((done) => {
    db.Role.create(helper.testRoleA)
    .then((role) => {
      adminParams.roleId = role.id;
      done();
    });
  });

  after(() => {
    db.Role.destroy({ where: {} });
  });

  describe('New Users', () => {
    describe('Create User', () => {
      it('should create a new user successfully', (done) => {
        superRequest.post('/users')
          .send(adminParams)
          .end((error, response) => {
            expect(response.status).to.equal(201);
            expect(response.body.user.username).to.equal(adminParams.username);
            expect(response.body.user.firstname).to.equal(adminParams.firstname);
            expect(response.body.user.lastname).to.equal(adminParams.lastname);
            expect(response.body.user.roleId).to.not.equal(adminParams.roleId);
            done();
          });
      });
      it('should not allow user registration with existing email', (done) => {
        superRequest.post('/users')
          .send(adminParams)
          .end((err, res) => {
            expect(res.status).to.equal(409);
            done();
          });
      });
      it('should fail for invalid email address', (done) => {
        superRequest.post('/users')
          .send(helper.invalidEmailUser)
          .end((err, res) => {
            expect(res.status).to.equal(409);
            done();
          });
      });
    });
  });

  describe('Existing users', () => {
    beforeEach((done) => {
      superRequest.post('/users')
        .send(adminParams)
        .end((err, res) => {
          adminUser = res.body.user;
          adminToken = res.body.token;
          done();
        });
    });

    afterEach(() => {
      db.User.destroy({ where: {} });
    });

    describe('Login /users/login', () => {
      it('should allow user to login', (done) => {
        superRequest.post('/users/login')
          .send(adminParams)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.token).to.not.equal(null);
            expect(res.body.message).to.equal('login');
            done();
          });
      });
      it('should not allow unregister users to login', (done) => {
        superRequest.post('/users/login')
          .send(helper.firstUser)
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.token).to.not.exist;
            done();
          });
      });
      it('should not allow login with invalid email or password', (done) => {
        superRequest.post('/users/login')
          .send({ email: adminParams.email, password: 'invalid' })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
    });
    describe('Get all users, GET /users ', () => {
      it('should return verification failed if no token is supply', (done) => {
        superRequest.get('/users')
          .send(adminParams)
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('verification failed');
            done();
          });
      });
      it('should return permission denied if user is not admin', (done) => {
        db.Role.create(helper.testRoleR)
          .then((role) => {
            userParams.roleId = role.id;
            superRequest.post('/users')
              .send(userParams)
              .end((err, res) => {
                regularToken = res.body.token;
                superRequest.get('/users')
                  .set({ 'x-access-token': regularToken })
                  .end((err, resp) => {
                    expect(resp.status).to.equal(403);
                    expect(resp.body.message).to.equal('permission denied');
                    done();
                  });
              });
          });
      });
      it('it should allow admin to get all users', (done) => {
        superRequest.get('/users')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(Array.isArray(res.body.message)).to.be.true;
            expect(res.body.message.length).to.be.greaterThan(0);
            done();
          });
      });
    });
    describe('get user by Id GET /users/:id', () => {
      it('should return verification failed for unregister user', (done) => {
        superRequest.get(`/users/${adminUser.id}`)
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
      it('should return user detail for correct id', (done) => {
        superRequest.get(`/users/${adminUser.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.not.equal(null);
            expect(res.body.message.id).to.equal(adminUser.id);
            done();
          });
      });
      it('should rturn not found for incorrect user id', (done) => {
        superRequest.get(`/users/2`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
      });
    });
    describe('Update user attributes PUT /users/:id', () => {
      it('it should update the user profile for correct user token', (done) => {
        const updateData = { username: 'Olawale', lastname: 'Aladeusi' };
        superRequest.put(`/users/${adminUser.id}`)
          .send(updateData)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message.username).to.equal('Olawale');
            expect(res.body.message.lastname).to.equal('Aladeusi');
            done();
          });
      });
      it('should return not found for incorrect user id', (done) => {
        const data = { username: 'wale', lastname: 'ala' };
        superRequest.put(`/users/2`)
          .send(data)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
      });
    });
    describe('Delete user DELETE /users/:id', () => {
      it('delete user with valid id ', (done) => {
        superRequest.delete(`/users/${adminUser.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            done();
          });
      });
      it('should return not found for incorrect user id', (done) => {
        superRequest.delete(`/users/2`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
      });
    });
    describe('Logout', () => {
      it('should logout successfully', (done) => {
        superRequest.post('/users/logout')
        .expect(200, done);
      });
    });
  });
});

