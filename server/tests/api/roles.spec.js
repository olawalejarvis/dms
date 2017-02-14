
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

let adminToken;
let role;

describe('ROLE API', () => {
  before((done) => {
    db.Role.create(adminRoleParams)
      .then((adminRole) => {
        adminParams.roleId = adminRole.id;
        superRequest.post('/users')
          .send(adminParams)
          .end((err, res) => {
            adminToken = res.body.token;
            done();
          });
      });
  });
  after(() => db.Role.destroy({ where: {} }));

  describe('CREATE ROLE POST /roles/', () => {
    describe('ADMIN', () => {
      it('should allow admin to create role', (done) => {
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
            expect(res.status).to.equal(409);
            expect(res.body.message).to.equal('error');
            done();
          });
      });
      it('should return error when invalid or no token is set', (done) => {
        superRequest.post('/roles')
          .send(helper.testRoleG)
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('verification failed');
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
    it('should return id not found for invalid id', (done) => {
      superRequest.delete('/roles/3')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('error');
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
          done();
        });
    });
    it('should return not found when provided with invalid id', (done) => {
      superRequest.get('/roles/9999')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
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
          done();
        });
    });
    it('should return not found for invalid id', (done) => {
      superRequest.put('/roles/999')
        .send({ title: 'talent' })
        .set({ 'x-access-token': adminToken })
        .end((error, resp) => {
          expect(resp.status).to.equal(404);
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
    it('it should allow admin to get all users', (done) => {
      superRequest.get('/roles')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(Array.isArray(res.body.message)).to.be.true;
          expect(res.body.message.length).to.be.greaterThan(0);
          done();
        });
    });
  });
});

