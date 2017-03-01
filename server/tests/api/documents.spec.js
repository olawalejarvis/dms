
import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';
import db from '../../app/models';
import helper from '../test.helper';

const superRequest = request.agent(app);
const expect = chai.expect;

const publicD = helper.publicDocument;
const privateD = helper.privateDocument;
const roleD = helper.roleDocument;

const compareDates = (firstDate, secondDate) =>
  new Date(firstDate).getTime() <= new Date(secondDate).getTime();

describe('DOCUMENT API', () => {
  let adminToken, regularToken, regularToken2;

  let adminUser, regularUser, regularUser2;

  let createdDoc, roleDocument, publicDocument, privateDocument;

  let document, updateDoc;

  before((done) => {
    db.Role.bulkCreate([helper.testRoleA, helper.testRoleR])
      .then((roles) => {
        helper.adminUser.roleId = roles[0].id;
        db.User.create(helper.adminUser)
          .then((admin) => {
            adminUser = admin.dataValues;
            superRequest.post('/users/login')
              .send(helper.adminUser)
              .end((err, res1) => {
                adminToken = res1.body.token;
                superRequest.post('/users')
                  .send(helper.regularUser)
                  .end((err, res2) => {
                    regularUser = res2.body.user;
                    regularToken = res2.body.token;
                    superRequest.post('/users')
                      .send(helper.regularUser2)
                      .end((err, res3) => {
                        regularUser2 = res3.body.user;
                        regularToken2 = res3.body.token;
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
    expect(adminUser.username).to.equal(helper.adminUser.username);
    expect(regularUser.username).to.equal(helper.regularUser.username);
    expect(regularUser2.username).to.equal(helper.regularUser2.username);
    done();
  });
  describe('CREATE POST /documents', () => {
    it('should create a new document', (done) => {
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
    it('should not create document when no title', (done) => {
      const invalidDoc = { content: 'new document' };
      superRequest.post('/documents')
        .send(invalidDoc)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.body[0].message).to.equal('title cannot be null');
          expect(res.body[0].type).to.equal('notNull Violation');
          expect(res.body[0].value).to.equal(null);
          done();
        });
    });
    it('should not create document when no content is supply', (done) => {
      const invalidDoc = { title: 'new document' };
      superRequest.post('/documents')
        .send(invalidDoc)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.body[0].message).to.equal('content cannot be null');
          expect(res.body[0].type).to.equal('notNull Violation');
          expect(res.body[0].value).to.equal(null);
          done();
        });
    });
    it('should not create document when title or content is an empty string', (done) => {
      const invalidDoc = { title: '', content: '' };
      superRequest.post('/documents')
        .send(invalidDoc)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.body[0].message).to.equal('This field cannot be empty');
          expect(res.body[0].type).to.equal('Validation error');
          expect(res.body[0].path).to.equal('title');
          expect(res.body[1].message).to.equal('This field cannot be empty');
          expect(res.body[1].type).to.equal('Validation error');
          expect(res.body[1].path).to.equal('content');
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
    it('should update document when user is the owner', (done) => {
      updateDoc = { title: 'andela' };
      superRequest.put(`/documents/${createdDoc.id}`)
        .send(updateDoc)
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.updatedDocument.title).to.equal(updateDoc.title);
          expect(res.body.updatedDocument.content).to.equal(createdDoc.content);
          done();
        });
    });
    it('should allow admin to update any document', (done) => {
      updateDoc = { title: 'TIA' };
      superRequest.put(`/documents/${createdDoc.id}`)
        .send(updateDoc)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.updatedDocument.title).to.equal(updateDoc.title);
          expect(res.body.updatedDocument.content).to.equal(createdDoc.content);
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
    it('should return id not found for invalid id', (done) => {
      updateDoc = { content: 'new life, new culture, new community' };
      superRequest.put('/documents/9999')
        .send(updateDoc)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('document not found');
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
    it('should allow admin to delete any document', (done) => {
      superRequest.delete(`/documents/${document.id}`)
        .set({ 'x-access-token': adminToken })
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
  describe('GET document /documents/:id', () => {
    describe('GET document with access PRIVATE', () => {
      before((done) => {
        superRequest.post('/documents')
          .send(privateD)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            privateDocument = res.body.document;
            done();
          });
      });
      it('should return document to the owner alone when document\'s access level is private', (done) => {
        superRequest.get(`/documents/${privateDocument.id}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('success');
            expect(res.body.doc.title).to.equal(privateDocument.title);
            expect(res.body.doc.access).to.equal('private');
            done();
          });
      });
      it('should allow admin to retrieve document with private access level', (done) => {
        superRequest.get(`/documents/${privateDocument.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('success');
            expect(res.body.doc.title).to.equal(privateDocument.title);
            expect(res.body.doc.access).to.equal('private');
            done();
          });
      });
      it('should not get document when requester is not the owner or admin', (done) => {
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
      it('should return document to all users if the access level is public', (done) => {
        superRequest.get(`/documents/${publicDocument.id}`)
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.doc.title).to.equal(publicDocument.title);
            expect(res.body.doc.access).to.equal('public');
            expect(res.body.message).to.equal('success');
            done();
          });
      });
      it('should return document not found for invalid id', (done) => {
        superRequest.get('/documents/99999')
          .set({ 'x-access-token': regularToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('document not found');
            done();
          });
      });
    });
    describe('ROLE ACCESS DOCUMENT', () => {
      let guestToken;
      before((done) => {
        db.Role.create(helper.testRoleG)
          .then((guestRole) => {
            helper.secondUser.roleId = guestRole.id;
            superRequest.post('/users')
              .send(helper.secondUser)
              .end((error, response) => {
                guestToken = response.body.token;
                superRequest.post('/documents')
                  .send(roleD)
                  .set({ 'x-access-token': regularToken })
                  .end((err, res) => {
                    roleDocument = res.body.document;
                    done();
                  });
              });
          });
      });
      it('should return document if the owner and requester are of the same role level', (done) => {
        superRequest.get(`/documents/${roleDocument.id}`)
          .set({ 'x-access-token': regularToken2 })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.doc.title).to.equal(roleDocument.title);
            expect(res.body.doc.access).to.equal('role');
            expect(res.body.message).to.equal('success');
            done();
          });
      });
      it('should allow admin to view all role level access documents', (done) => {
        superRequest.get(`/documents/${roleDocument.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.doc.title).to.equal(roleDocument.title);
            expect(res.body.doc.access).to.equal('role');
            expect(res.body.message).to.equal('success');
            done();
          });
      });
      it('should not return document if not of the same role id', (done) => {
        superRequest.get(`/documents/${roleDocument.id}`)
          .set({ 'x-access-token': guestToken })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('permission denied');
            done();
          });
      });
    });
  });
  describe('GET ALL DOCUMENT', () => {
    it('should return all documents to admin user', (done) => {
      superRequest.get('/documents')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('success');
          res.body.docs.forEach((doc) => {
            expect(doc.access).to.be.oneOf(['role', 'private', 'public']);
          });
          done();
        });
    });
    it('should return all documents created by a particular user irrespective of the access level and every other document with role or puclic access with limit set to 4', (done) => {
      superRequest.get('/documents?limit=4')
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.body.docs.length).to.equal(4);
          expect(res.status).to.equal(200);
          res.body.docs.forEach((doc) => {
            if (doc.ownerId === regularUser2.id) {
              expect(doc.access).to.be.oneOf(['role', 'private', 'public']);
            } else {
              expect(doc.access).to.be.oneOf(['role', 'public']);
            }
          });
          expect(res.body.message).to.equal('success');
          done();
        });
    });
    it('should return all documents in descending order of published date', (done) => {
      superRequest.get('/documents')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('success');
          for (let i = 0; i < res.body.docs.length - 1; i += 1) {
            const flag = compareDates(res.body.docs[i].createdAt, res.body.docs[1 + i].createdAt);
            expect(flag).to.equal(false);
          }
          done();
        });
    });
  });
  describe('DOCUMENT SEARCH PAGINATION', () => {
    it('should return search results', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)}`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.docs.rows.forEach((doc) => {
            if (doc.ownerId === regularUser2.id) {
              expect(doc.access).to.be.oneOf(['public', 'role', 'private']);
            } else { expect(doc.access).to.be.oneOf(['public', 'role']); }
          });
          expect(res.body.message).to.equal('success');
          done();
        });
    });
    it('should return all search results to admin', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)}`)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.docs.rows.forEach((doc) => {
            expect(doc.access).to.be.oneOf(['public', 'role', 'private']);
          });
          done();
        });
    });
    it('should allow multiple terms search', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)} ${publicD.title.substr(1, 6)}`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.docs.rows.forEach((doc) => {
            if (doc.ownerId === regularUser2.id) {
              expect(doc.access).to.be.oneOf(['public', 'role', 'private']);
            } else { expect(doc.access).to.be.oneOf(['public', 'role']); }
          });
          expect(res.body.message).to.equal('success');
          done();
        });
    });
    it('should return all multiple terms search\'s results to admin', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)} ${publicD.title.substr(1, 6)}`)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          res.body.docs.rows.forEach((doc) => {
            expect(doc.access).to.be.oneOf(['public', 'role', 'private']);
          });
          done();
        });
    });
    it('should return enter search string when no query is entered', (done) => {
      superRequest.get('/documents/search')
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.body.message).to.equal('enter search query');
          done();
        });
    });
    it('should return error when limit entered is negative', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)}&limit=-2`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('negative number not allowed');
          done();
        });
    });
    it('should return error when offset entered is negative', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)}&limit=2&offset=-2`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('negative number not allowed');
          done();
        });
    });
    it('should return error when limit entered is string', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)}&limit=aaa`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('only number is allowed');
          done();
        });
    });
    it('should return documents in descending order of published date', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)}&publishedDate=DESC`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          for (let i = 0; i < res.body.docs.length - 1; i += 1) {
            const flag = compareDates(res.body.docs[i].createdAt, res.body.docs[1 + i].createdAt);
            expect(flag).to.equal(false);
          }
          done();
        });
    });
    it('should return documents in ascending order of published date', (done) => {
      superRequest.get(`/documents/search?query=${publicD.content.substr(2, 6)}&publishedDate=ASC`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          for (let i = 0; i < res.body.docs.length - 1; i += 1) {
            const flag = compareDates(res.body.docs[i].createdAt, res.body.docs[1 + i].createdAt);
            expect(flag).to.equal(true);
          }
          done();
        });
    });
  });
  describe('Fetch all user\'s document', () => {
    it('should return all documents created by a particular user', (done) => {
      superRequest.get(`/users/${regularUser.id}/documents`)
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.id).to.equal(regularUser.id);
          expect(res.body.email).to.equal(regularUser.email);
          expect(res.body.Documents.length).to.be.greaterThan(0);
          res.body.Documents.forEach((doc) => {
            expect(doc.ownerId).to.equal(regularUser.id);
            expect(doc.access).to.be.oneOf(['public', 'role', 'private']);
          });
          done();
        });
    });
    it('should return all documents created by a particular user to admin user', (done) => {
      superRequest.get(`/users/${regularUser.id}/documents`)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.id).to.equal(regularUser.id);
          expect(res.body.email).to.equal(regularUser.email);
          expect(res.body.Documents.length).to.be.greaterThan(0);
          res.body.Documents.forEach((doc) => {
            expect(doc.ownerId).to.equal(regularUser.id);
            expect(doc.access).to.be.oneOf(['role', 'private', 'public']);
          });
          done();
        });
    });
    it('should return all public or role access level documents to a requester user', (done) => {
      superRequest.get(`/users/${regularUser.id}/documents`)
        .set({ 'x-access-token': regularToken2 })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.id).to.equal(regularUser.id);
          expect(res.body.email).to.equal(regularUser.email);
          expect(res.body.Documents.length).to.be.greaterThan(0);
          res.body.Documents.forEach((doc) => {
            expect(doc.ownerId).to.equal(regularUser.id);
            if (doc.ownerRoleId === regularUser2.roleId) {
              expect(doc.access).to.be.oneOf(['role', 'public']);
            } else {
              expect(doc.access).to.equal('public');
            }
          });
          done();
        });
    });
    it('should return no document found for invalid id', (done) => {
      superRequest.get('/users/0/documents')
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('no document found');
          done();
        });
    });
  });
});

