import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import db from '../../app/models';
import helper from '../test.helper';

const superRequest = request.agent(app);
const expect = chai.expect;

const userParams = helper.regularUser;
// const adminParams = helper.adminUser;
let adminUser;
let newAdminUser;
let adminToken;
let regularToken;
let regularUser;

describe('User API', () => {
  before((done) => {
    db.Role.bulkCreate([helper.testRoleA, helper.testRoleR])
    .then((role) => {
      helper.adminUser.roleId = role[0].id;
      db.User.create(helper.adminUser)
        .then((admin) => {
          newAdminUser = admin.dataValues;
          done();
        });
    });
  });

  after(() => {
    db.Role.destroy({ where: {} });
  });

  describe('New Users', () => {
    describe('Create User', () => {
      it('should create a new user successfully', (done) => {
        superRequest.post('/users')
          .send(helper.regularUser)
          .end((error, response) => {
            regularUser = response.body.user;
            expect(response.status).to.equal(201);
            expect(response.body.user.username).to.equal(helper.regularUser.username);
            expect(response.body.user.firstname).to.equal(helper.regularUser.firstname);
            expect(response.body.user.lastname).to.equal(helper.regularUser.lastname);
            expect(response.body.user.roleId).to.equal(2);
            done();
          });
      });
      it('should not allow user registration with existing email', (done) => {
        superRequest.post('/users')
          .send(helper.regularUser)
          .end((err, res) => {
            expect(res.status).to.equal(500);
            expect(res.body[0].type).to.equal('unique violation');
            done();
          });
      });
      it('should fail for invalid email address', (done) => {
        superRequest.post('/users')
          .send(helper.invalidEmailUser)
          .end((err, res) => {
            expect(res.status).to.equal(500);
            expect(res.body[0].message).to.equal('Input a valid email address');
            expect(res.body[0].type).to.equal('Validation error');
            expect(res.body[0].path).to.equal('email');
            done();
          });
      });
      it('should fail if password is less than 8', (done) => {
        superRequest.post('/users')
          .send(helper.invalidPasswordUser)
          .end((err, res) => {
            expect(res.status).to.equal(500);
            expect(res.body[0].message).to.equal('Minimum of of 8 characters is required');
            expect(res.body[0].type).to.equal('Validation error');
            done();
          });
      });
      it('should not allow admin user to sign up', (done) => {
        helper.firstUser.roleId = 1;
        superRequest.post('/users')
          .send(helper.firstUser)
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal('permission denied');
            done();
          });
      });
    });
  });

  describe('Existing users', () => {
    describe('Login /users/login', () => {
      it('should allow admin user to login', (done) => {
        superRequest.post('/users/login')
          .send(helper.adminUser)
          .end((err, res) => {
            adminToken = res.body.token;
            expect(res.status).to.equal(200);
            expect(res.body.token).to.not.equal(null);
            expect(res.body.message).to.equal('logged in');
            done();
          });
      });
      it('should allow other users to login', (done) => {
        superRequest.post('/users/login')
          .send(helper.regularUser)
          .end((err, res) => {
            regularToken = res.body.token;
            expect(res.status).to.equal(200);
            expect(res.body.token).to.not.equal(null);
            expect(res.body.message).to.equal('logged in');
            done();
          });
      });
      it('should not allow unregistered users to login', (done) => {
        superRequest.post('/users/login')
          .send(helper.firstUser)
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
      it('should not allow login with invalid email or password', (done) => {
        superRequest.post('/users/login')
          .send({ email: newAdminUser.email, password: 'invalid' })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('User varification failed');
            done();
          });
      });
      it('should not allow login when email or password is not provided', (done) => {
        superRequest.post('/users/login')
          .send({ })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('User varification failed');
            done();
          });
      });
    });
    describe('Get all users, GET /users ', () => {
      it('should return verification failed if no token is supply', (done) => {
        superRequest.get('/users')
          .set({ })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('verification failed');
            done();
          });
      });
      it('should return invalid token if token is invalid', (done) => {
        superRequest.get('/users')
          .set({ 'x-access-token': 'hello-andela-tia' })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('invalid token');
            done();
          });
      });
      it('should return permission denied if user is not admin', (done) => {
        superRequest.get('/users')
          .set({ 'x-access-token': regularToken })
          .end((err, resp) => {
            expect(resp.status).to.equal(403);
            expect(resp.body.message).to.equal('permission denied');
            done();
          });
      });
      it('it should allow admin to get all users', (done) => {
        superRequest.get('/users')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.users.length).to.be.greaterThan(0);
            expect(res.body.message).to.equal('success');
            done();
          });
      });
    });
    describe('get user by Id GET /users/:id', () => {
      it('should return verification failed for unregistered user', (done) => {
        superRequest.get(`/users/${newAdminUser.id}`)
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
      it('should return user detail for correct id', (done) => {
        superRequest.get(`/users/${newAdminUser.id}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.user).to.not.equal(null);
            expect(res.body.user.id).to.equal(newAdminUser.id);
            expect(res.body.user.email).to.equal(newAdminUser.email);
            done();
          });
      });
      it('should return not found for incorrect user id', (done) => {
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
        const updateData = { username: 'Olawale', lastname: 'Aladeusi', password: 'newpassword' };
        superRequest.put(`/users/${regularUser.id}`)
          .send(updateData)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('success');
            expect(res.body.updatedUser.username).to.equal('Olawale');
            expect(res.body.updatedUser.lastname).to.equal('Aladeusi');
            done();
          });
      });
      it('should return not found for incorrect user id', (done) => {
        const data = { username: 'wale', lastname: 'ala' };
        superRequest.put('/users/2')
          .send(data)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
      });
      it('should return permission denied when regular user want to edit another user\'s profile', (done) => {
        const data = { username: 'wale', lastname: 'ala' };
        superRequest.put(`/users/${newAdminUser.id}`)
          .send(data)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
      it('should give admin permission to update any users profile', (done) => {
        const data = { username: 'wale', lastname: 'ala' };
        superRequest.put(`/users/${regularUser.id}`)
          .send(data)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('success');
            expect(res.body.updatedUser.username).to.equal('wale');
            expect(res.body.updatedUser.lastname).to.equal('ala');
            done();
          });
      });
    });
    describe('Delete user DELETE /users/:id', () => {
      it('should not delete admin user', (done) => {
        superRequest.delete(`/users/${newAdminUser.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal('can not delete an admin user');
            done();
          });
      });
      it('should return not found for incorrect user id', (done) => {
        superRequest.delete('/users/2')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
      });
      it('should fails when request is from a regular user', (done) => {
        superRequest.delete(`/users/${regularUser.id}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal('permission denied');
            done();
          });
      });
      it('allow admin to delete users', (done) => {
        superRequest.delete(`/users/${regularUser.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('deleted successfully');
            done();
          });
      });
    });
    describe('Logout', () => {
      it('should logout successfully', (done) => {
        superRequest.post('/users/logout')
        .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('logged out');
            done();
          });
      });
    });
  });
});
