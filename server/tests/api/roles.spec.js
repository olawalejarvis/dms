
import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import db from '../../app/models';
import helper from '../test.helper';

const superRequest = request.agent(app);
const expect = chai.expect;

const adminParams = helper.firstUser;
const adminRoleParams = helper.testRoleA;
const regularRoleParams = helper.testRoleR;

let adminToken, reguToken;
let role;

describe('ROLE API', () => {
  before((done) => {
    db.Role.create(adminRoleParams)
      .then((newRole) => {
        adminParams.roleId = newRole.id;
        db.User.create(adminParams)
          .then(() => {
            superRequest.post('/users/login')
              .send(adminParams)
              .end((err, res) => {
                adminToken = res.body.token;
                done();
              });
          });
      });
  });
  after(() => db.Role.destroy({ where: {} }));

  describe('ADMIN', () => {
    it('should allow admin to create a role', (done) => {
      superRequest.post('/roles')
        .send(regularRoleParams)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.role.title).to.equal(regularRoleParams.title);
          done();
        });
    });
    it('should return error when role title already exist', (done) => {
      superRequest.post('/roles')
        .send(regularRoleParams)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.body[0].type).to.equal('unique violation');
          done();
        });
    });
    it('should return error for empty string title', (done) => {
      superRequest.post('/roles')
        .send({ title: '' })
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.body[0].type).to.equal('Validation error');
          expect(res.body[1].message).to.equal('This field cannot be empty');
          done();
        });
    });
    it('should return varification failed when no token is supplied',
    (done) => {
      superRequest.post('/roles')
        .send(helper.testRoleG)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('verification failed');
          done();
        });
    });
    it('should not allow regular user to create a role', (done) => {
      superRequest.post('/users')
        .send(helper.regularUser2)
        .end((err, res) => {
          reguToken = res.body.token;
          superRequest.post('/roles')
            .send(helper.testRoleSample)
            .set({ 'x-access-token': reguToken })
            .end((er, re) => {
              expect(re.status).to.equal(403);
              expect(re.body.message).to.equal('permission denied');
              done();
            });
        });
    });
  });
  describe('DELETE ROLE, DELETE /roles', () => {
    before((done) => {
      superRequest.post('/roles')
        .send(helper.testRoleG)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          role = res.body.role;
          done();
        });
    });
    it('should delete a role', (done) => {
      superRequest.delete(`/roles/${role.id}`)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('role deleted');
          done();
        });
    });
    it('should not allow regular user to delete a role', (done) => {
      superRequest.get(`/roles/${role.id}`)
        .set({ 'x-access-token': reguToken })
        .end((er, re) => {
          expect(re.status).to.equal(403);
          expect(re.body.message).to.equal('permission denied');
          done();
        });
    });
    it('should return id not found for invalid id', (done) => {
      superRequest.delete('/roles/999')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('role not found');
          done();
        });
    });
  });
  describe('GET BY ID', () => {
    before((done) => {
      superRequest.post('/roles')
        .send(helper.testRoleG1)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          role = res.body.role;
          done();
        });
    });
    it('should return role when provided with valid id', (done) => {
      superRequest.get(`/roles/${role.id}`)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('success');
          expect(res.body.role.title).to.equal(role.title);
          done();
        });
    });
    it('should not allow regular user to get role', (done) => {
      superRequest.get(`/roles/${role.id}`)
        .set({ 'x-access-token': reguToken })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('permission denied');
          done();
        });
    });
    it('should return not found when provided with invalid id', (done) => {
      superRequest.get('/roles/9999')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('role not found');
          done();
        });
    });
  });
  describe('UPDATE PUT /roles/:id', () => {
    let newRole;
    before((done) => {
      superRequest.post('/roles')
        .send(helper.testRoleG2)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          newRole = res.body.role;
          done();
        });
    });
    it('should update a role when given a valid id', (done) => {
      superRequest.put(`/roles/${newRole.id}`)
        .send({ title: 'andela' })
        .set({ 'x-access-token': adminToken })
        .end((er, re) => {
          expect(re.status).to.equal(200);
          expect(re.body.message).to.equal('success');
          expect(re.body.updatedRole.title).to.equal('andela');
          done();
        });
    });
    it('should not allow regular user to update role', (done) => {
      superRequest.get(`/roles/${newRole.id}`)
        .set({ 'x-access-token': reguToken })
        .end((er, re) => {
          expect(re.status).to.equal(403);
          expect(re.body.message).to.equal('permission denied');
          done();
        });
    });
    it('should return not found for invalid id', (done) => {
      superRequest.put('/roles/999')
        .send({ title: 'talent' })
        .set({ 'x-access-token': adminToken })
        .end((error, resp) => {
          expect(resp.status).to.equal(404);
          expect(resp.body.message).to.equal('role not found');
          done();
        });
    });
  });
  describe('GET ALL ROLES GET /roles', () => {
    before((done) => {
      superRequest.post('/roles')
        .send(helper.testRoleG2)
        .set({ 'x-access-token': adminToken });
      done();
    });
    it('it should allow admin to view all roles', (done) => {
      superRequest.get('/roles')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.be.equal('success');
          expect(res.body.roles.length).to.be.greaterThan(0);
          done();
        });
    });
    it('should not allow regular user to view all roles', (done) => {
      superRequest.get('/roles')
        .set({ 'x-access-token': reguToken })
        .end((er, re) => {
          expect(re.status).to.equal(403);
          expect(re.body.message).to.equal('permission denied');
          done();
        });
    });
  });
});

