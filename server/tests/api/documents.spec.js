import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import db from '../../app/models';
import helper from '../test.helper';

const superRequest = request.agent(app);
const expect = chai.expect;

const adminParams = helper.adminUser;
const regularParams = helper.regularUser;
const regularParams2 = helper.regularUser2;

const publicD = helper.publicDocument;
const privateD = helper.privateDocument;
const roleD = helper.roleDocument;

const documentArray = helper.documentArray;

const regularRoleParams = helper.testRoleR;
const adminRoleParams = helper.testRoleA;

let adminToken;
let regularToken;
let regularToken2;

let adminUser;
let regularUser;
let regularUser2;

let adminRole;
let regularRole;

let createdDoc;

describe('DOCUMENT API', () => {
  let roleDocument;
  let publicDocument;
  let privateDocument;
  let document;
  let updateDoc;
  before((done) => {
    db.Role.create(adminRoleParams)
      .then((roleA) => {
        adminParams.roleId = roleA.id;
        adminRole = roleA;
        db.Role.create(regularRoleParams)
          .then((roleR) => {
            regularRole = roleR;
            regularParams.roleId = roleR.id;
            regularParams2.roleId = roleR.id;
            superRequest.post('/users')
              .send(adminParams)
              .end((err, res) => {
                adminToken = res.body.token;
                adminUser = res.body.user;
                superRequest.post('/users')
                  .send(regularParams)
                  .end((err1, res1) => {
                    regularToken = res1.body.token;
                    regularUser = res1.body.user;
                    superRequest.post('/users')
                      .send(regularParams2)
                      .end((err2, res2) => {
                        regularToken2 = res2.body.token;
                        regularUser2 = res2.body.user;
                        done();
                      });
                  });
              });
          });
      });
  });
  after(() => {
    db.Role.destroy({ where: {} });
  });
  it('check every data you have created', (done) => {
    expect(adminRole.title).to.equal(adminRoleParams.title);
    expect(regularRole.title).to.equal(regularRoleParams.title);
    expect(adminUser.username).to.equal(adminParams.username);
    expect(regularUser.username).to.equal(regularParams.username);
    expect(regularUser2.username).to.equal(regularParams2.username);
    done();
  });
  describe('CREATE POST /documents', () => {
    it('should create a new document successfully', (done) => {
      superRequest.post('/documents')
        .send(publicD)
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.document.title).to.equal(publicD.title);
          expect(res.body.document.ownerId).to.equal(regularUser.id);
          expect(res.body.document.access).to.equal(publicD.access);
          done();
        });
    });
    it('should not create document if no token is supply', (done) => {
      superRequest.post('/documents')
        .send(publicD)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('verification failed');
          done();
        });
    });
    it('should not create document when no title or content is supply', (done) => {
      const invalidDoc = { content: 'new document' };
      superRequest.post('/documents')
        .send(invalidDoc)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body.message).to.equal('error');
          done();
        });
    });
  });
  describe('Update Document /documents/:id', () => {
    before((done) => {
      superRequest.post('/documents')
        .send(publicD)
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          createdDoc = res.body.document;
          done();
        });
    });

    it('should update doucment for owner alone', (done) => {
      updateDoc = { title: 'andela' };
      superRequest.put(`/documents/${createdDoc.id}`)
        .send(updateDoc)
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.upDoc.title).to.equal(updateDoc.title);
          expect(res.body.upDoc.content).to.equal(createdDoc.content);
          done();
        });
    });
    it('should not update document when user is not the owner', (done) => {
      updateDoc = { content: 'new life, new culture, new community' };
      superRequest.put(`/documents/${createdDoc.id}`)
        .send(updateDoc)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('permission denied');
          done();
        });
    });
    it('should not update document when token is not supply', (done) => {
      updateDoc = { content: 'new life, new culture, new community' };
      superRequest.put(`/documents/${createdDoc.id}`)
        .send(updateDoc)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('verification failed');
          done();
        });
    });
  });
  describe('Delete Document DELETE /documents/:id', () => {
    beforeEach((done) => {
      superRequest.post('/documents')
        .send(privateD)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          document = res.body.document;
          done();
        });
    });
    it('should delete document from owner', (done) => {
      superRequest.delete(`/documents/${document.id}`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('document deleted');
          done();
        });
    });
    it('should not delete document if not the owner', (done) => {
      superRequest.delete(`/documents/${document.id}`)
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('permission denied');
          done();
        });
    });
    it('should display not found when id is not found', (done) => {
      superRequest.delete('/documents/100')
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('no document found');
          done();
        });
    });
  });
  describe('Get user by id /documents/:id', () => {
    describe('get user id with access private', () => {
      before((done) => {
        superRequest.post('/documents')
          .send(privateD)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            privateDocument = res.body.document;
            done();
          });
      });
      it('should return document to the owner alone when access level private', (done) => {
        superRequest.get(`/documents/${privateDocument.id}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message.title).to.equal(privateDocument.title);
            done();
          });
      });
      it('should not get document when requester is not the owner', (done) => {
        superRequest.get(`/documents/${privateDocument.id}`)
          .set({ 'x-access-token': regularToken2 })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('permission denied');
            done();
          });
      });
    });
    describe('PUBLIC DOCUMENt', () => {
      before((done) => {
        superRequest.post('/documents')
          .send(publicD)
          .set({ 'x-access-token': regularToken2 })
          .end((err, res) => {
            publicDocument = res.body.document;
            done();
          });
      });
      it('should return document if the access level is public', (done) => {
        superRequest.get(`/documents/${publicDocument.id}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message.title).to.equal(publicDocument.title);
            done();
          });
      });
    });
    describe('ROLE ACCESS DOCUMENT', () => {
      before((done) => {
        superRequest.post('/documents')
          .send(roleD)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            roleDocument = res.body.document;
            done();
          });
      });
      it('should return document if the owner and requester are of the same role level', (done) => {
        superRequest.get(`/documents/${roleDocument.id}`)
          .set({ 'x-access-token': regularToken2 })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message.title).to.equal(roleDocument.title);
            done();
          });
      });
      it('should not return document if not of the same role id', (done) => {
        superRequest.get(`/documents/${roleDocument.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('permission denied');
            done();
          });
      });
    });
  });
});
