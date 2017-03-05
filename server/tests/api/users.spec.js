import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import db from '../../app/models';
import helper from '../test.helper';

const superRequest = request.agent(app);
const expect = chai.expect;

let newAdminUser;
let adminToken;
let regularToken;
let regularUser;
const emptyValue = ['username', 'lastname', 'firstname', 'password', 'email'];
const uniqueField = ['username', 'email'];

describe('User API', () => {
  before((done) => {
    db.Role.bulkCreate([{ title: 'admin', id: 1 }, { title: 'regular', id: 2 }])
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
      it('should create a user', (done) => {
        superRequest.post('/users')
          .send(helper.regularUser)
          .end((error, response) => {
            regularUser = response.body.user;
            expect(response.status).to.equal(201);
            expect(response.body.user.username)
              .to.equal(helper.regularUser.username);
            expect(response.body.user.firstname)
              .to.equal(helper.regularUser.firstname);
            expect(response.body.user.lastname)
              .to.equal(helper.regularUser.lastname);
            expect(response.body.user.roleId).to.equal(2);
            done();
          });
      });

      uniqueField.forEach((field) => {
        const uniqueUser = Object.assign({}, helper.firstUser);
        uniqueUser[field] = helper.regularUser[field];
        it(`should fail when already existing ${field} is supplied`, (done) => {
          superRequest.post('/users')
            .send(uniqueUser)
            .end((err, res) => {
              expect(res.status).to.equal(409);
              expect(res.body.success).to.equal(false);
              expect(res.body.message).to
                .equal(`${field} already exist`);
              done();
            });
        });
      });

      emptyValue.forEach((field) => {
        const invalidUser = Object.assign({}, helper.secondUser);
        invalidUser[field] = '';
        it(`should fail when ${field} is invalid`, (done) => {
          superRequest.post('/users')
            .send(invalidUser)
            .end((err, res) => {
              expect(res.status).to.equal(400);
              expect(res.body.success).to.equal(false);
              expect(res.body.message).to
                .equal(`Enter a valid ${field}`);
              done();
            });
        });
      });

      it('should fail if password is less than 8', (done) => {
        superRequest.post('/users')
          .send(helper.invalidPasswordUser)
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body.message)
              .to.equal('Minimum of 8 characters is allowed for password');
            expect(res.body.success).to.equal(false);
            done();
          });
      });

      it('should not allow admin user to sign up', (done) => {
        helper.firstUser.roleId = 1;
        superRequest.post('/users')
          .send(helper.firstUser)
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body.message).to
              .equal('Permission denied, You cannot sign up as an admin user');
            expect(res.body.success).to.equal(false);
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
            expect(res.body.message).to
              .equal('You have successfully logged in');
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
            expect(res.body.message).to
              .equal('You have successfully logged in');
            done();
          });
      });

      it('should not allow unregistered users to login', (done) => {
        superRequest.post('/users/login')
          .send(helper.firstUser)
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to
              .equal('Please enter a valid email or password to log in');
            done();
          });
      });

      it('should not allow login with invalid password', (done) => {
        superRequest.post('/users/login')
          .send({ email: newAdminUser.email, password: 'invalid' })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to
              .equal('Please enter a valid email or password to log in');
            done();
          });
      });

      it('should not allow login when email and password is not provided',
      (done) => {
        superRequest.post('/users/login')
          .send({ })
          .end((err, res) => {
            expect(res.body.success).to.equal(false);
            expect(res.status).to.equal(400);
            expect(res.body.message).to
              .equal('Please provide your email and password to login');
            done();
          });
      });
    });

    describe('Get all users, GET /users ', () => {
      it('should return verification failed if no token is supply', (done) => {
        superRequest.get('/users')
          .set({ })
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body.message).to
              .equal('Please sign in or register to get a token');
            done();
          });
      });

      it('should return invalid token if token is invalid', (done) => {
        superRequest.get('/users')
          .set({ 'x-access-token': 'hello-andela-tia' })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to
              .equal('The token you supplied has expired');
            done();
          });
      });

      it(`should return users own profile, 
      when the requester is a regular user`, (done) => {
        superRequest.get('/users')
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to
              .equal('You have successfully retrived all users');
            expect(res.body.users.count).to.equal(1);
            expect(res.body.users.rows[0].username).to
              .equal(helper.regularUser.username);
            done();
          });
      });

      it(`should return all users profile, 
      when the requester is an admin user`, (done) => {
        superRequest.get('/users')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to
              .equal('You have successfully retrived all users');
            expect(res.body.users.count).to.equal(2);
            expect(res.body.success).to.equal(true);
            done();
          });
      });
    });

    describe('Get user by Id GET /users/:id', () => {
      it('should return verification failed for unregistered user', (done) => {
        superRequest.get(`/users/${newAdminUser.id}`)
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body.message).to
              .equal('Please sign in or register to get a token');
            done();
          });
      });

      it('should return user\'s profile when valid user\'s id is supplied',
      (done) => {
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

      it('should return not found for invalid user id', (done) => {
        superRequest.get('/users/9999')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('This user does not exist');
            done();
          });
      });
    });

    describe('Update user attributes PUT /users/:id', () => {
      it('should update user\'s profile when valid user token is supplied',
      (done) => {
        const updateData = {
          username: 'Olawale',
          lastname: 'Aladeusi',
          password: 'newpassword'
        };
        superRequest.put(`/users/${regularUser.id}`)
          .send(updateData)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Your profile has been updated');
            expect(res.body.updatedUser.username).to.equal('Olawale');
            expect(res.body.updatedUser.lastname).to.equal('Aladeusi');
            done();
          });
      });

      it('should return error when passing a null field', (done) => {
        superRequest.put(`/users/${regularUser.id}`)
          .send({ username: '' })
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body.success).to.equal(false);
            expect(res.body.errorArray[0].message).to
              .equal('Input a valid username');
            done();
          });
      });

      it('should return error when updating with an existing username',
      (done) => {
        superRequest.put(`/users/${regularUser.id}`)
          .send({ username: helper.adminUser.username })
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body.success).to.equal(false);
            expect(res.body.errorArray[0].message)
              .to.equal('username already exist');
            done();
          });
      });

      it('should return not found for invalid user id', (done) => {
        const data = { username: 'wale', lastname: 'ala' };
        superRequest.put('/users/99999')
          .send(data)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('This user does not exist');
            done();
          });
      });

      it(`should return permission denied when regular user want to
        update another user's profile`, (done) => {
        const data = { username: 'wale', lastname: 'ala' };
        superRequest.put(`/users/${newAdminUser.id}`)
          .send(data)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to
              .equal('You are not permitted to update this profile');
            done();
          });
      });

      it('should give admin permission to update any user\'s profile',
      (done) => {
        const data = { username: 'wale', lastname: 'ala' };
        superRequest.put(`/users/${regularUser.id}`)
          .send(data)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to
              .equal('Your profile has been updated');
            expect(res.body.updatedUser.username).to.equal('wale');
            expect(res.body.updatedUser.lastname).to.equal('ala');
            done();
          });
      });
    });

    describe('Delete user DELETE /users/:id', () => {
      let newUser;
      before((done) => {
        superRequest.post('/users')
          .send(helper.thirdUser)
          .end((err, res) => {
            newUser = res.body.user;
            done();
          });
      });

      it('should return not found for invalid user id', (done) => {
        superRequest.delete('/users/999')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.body.message).to.equal('This user does not exist');
            expect(res.status).to.equal(404);
            done();
          });
      });

      it('should fail when request is from a regular user', (done) => {
        superRequest.delete(`/users/${regularUser.id}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body.message).to
              .equal('You are not permitted to perform this action');
            done();
          });
      });

      it('allow admin to delete a user', (done) => {
        superRequest.delete(`/users/${newUser.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to
              .equal('This account has been successfully deleted');
            done();
          });
      });
    });

    describe('SEARCH USERS PAGINATION', () => {
      const arrayUsers = helper.usersArray();
      before((done) => {
        db.User.bulkCreate(arrayUsers);
        done();
      });

      it('should return search result', (done) => {
        superRequest.get(`/users/search?query=
        ${arrayUsers[0].firstname.substr(1, 6)}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.body.message).to.equal('Your search was successful');
            done();
          });
      });

      it('should return search result with pagnation', (done) => {
        superRequest.get(`/users/search?query=
        ${arrayUsers[0].firstname.substr(1, 6)} 
        ${arrayUsers[2].firstname.substr(1, 6)}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.body.message).to.equal('Your search was successful');
            expect(res.body.pagnation).to.have.property('page_count');
            expect(res.body.pagnation).to.have.property('Page');
            expect(res.body.pagnation).to.have.property('page_size');
            expect(res.body.pagnation).to.have.property('total_count');
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
            expect(res.body.message).to
              .equal('You have successfully logged out');
            done();
          });
      });
      it('should not allow user to get user after logout', (done) => {
        superRequest.get('/users')
        .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to
              .equal('Please sign in to access your account');
            done();
          });
      });
    });
  });
});
