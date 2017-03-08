/* eslint no-unused-expressions: 0 */
import httpMocks from 'node-mocks-http';
import events from 'events';
import chai from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import app from '../../config/app';
import helper from '../helper/test.helper';
import db from '../../app/models';
import Auth from '../../app/middlewares/Auth';

const expect = chai.expect;
const superRequest = supertest(app);

let request;
const responseEvent = () => httpMocks
  .createResponse({ eventEmitter: events.EventEmitter });

describe('MIDDLEWARE UNIT TEST', () => {
  let adminToken, regularToken, regularUser;
  let publicDocument, privateDocument;

  before((done) => {
    db.Role.bulkCreate([{ title: 'admin', id: 1 }, { title: 'regular', id: 2 }])
      .then((roles) => {
        helper.adminUser.roleId = roles[0].id;
        helper.regularUser.roleId = roles[1].id;
        db.User.create(helper.adminUser)
          .then(() => {
            superRequest.post('/users/login')
              .send(helper.adminUser)
              .end((err, res) => {
                adminToken = res.body.token;
                db.User.create(helper.regularUser)
                  .then((reUser) => {
                    regularUser = reUser;
                    superRequest.post('/users/login')
                      .send(helper.regularUser)
                      .end((err, res) => {
                        regularToken = res.body.token;
                        done();
                      });
                  });
              });
          });
      });
  });

  after((done) => {
    db.Role.destroy({ where: {} });
    done();
  });

  describe('VERIFY TOKEN', () => {
    it('should continue if token is valid', (done) => {
      const response = httpMocks.createResponse();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/users',
        headers: { 'x-access-token': adminToken }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.verifyToken(request, response, stub.next);
      expect(stub.next).to.have.been.called;
      done();
    });

    it('should not continue if token is invalid', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/users',
        headers: { 'x-access-token': 'hhehagagagg' }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.verifyToken(request, response, stub.next);
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
        done();
      });
    });
  });

  describe('Admin', () => {
    it('should not continue when requester is not an admin user', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/roles',
        headers: { 'x-access-token': regularToken },
        tokenDecode: { roleId: regularUser.roleId }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.hasAdminPermission(request, response, stub.next);
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
        done();
      });
    });

    it('should continue for admin user', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/roles',
        headers: { 'x-access-token': adminToken },
        tokenDecode: { roleId: helper.adminUser.roleId }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.hasAdminPermission(request, response, stub.next);
      expect(stub.next).to.have.been.called;
      done();
    });
  });

  describe('validateUserInput', () => {
    it('should not continue when username is null', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/users',
        body: {
          firstname: 'andela',
        }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateUserInput(request, response, stub.next);
    });

    it('should continue when all the fields are complete', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/users',
        body: {
          username: 'andela',
          firstname: 'andela',
          lastname: 'andela',
          email: 'andela@mail.com',
          password: 'password'
        }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.validateUserInput(request, response, stub.next);
      expect(stub.next).to.have.been.called;
      done();
    });
  });

  describe('validateLoginInput', () => {
    it('should continue when email and password is provided', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/users/login',
        body: {
          email: helper.adminUser.email,
          password: helper.adminUser.password
        }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.validateLoginInput(request, response, stub.next);
      expect(stub.next).to.have.been.called;
      done();
    });

    it('should not continue when password is null', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/users/login',
        body: {
          email: 'kk@mail.com',
        }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateLoginInput(request, response, stub.next);
    });
  });

  describe('validateUserUpdate', () => {
    it('should not continue when user want to modify admin profile', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'PUT',
        url: '/users/1',
        params: {
          id: '1'
        },
        body: {
          email: 'new@mail.com',
        },
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateUserUpdate(request, response, stub.next);
    });

    it('should continue when user is the owner', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'PUT',
        url: '/users/2',
        headers: { 'x-access-token': regularToken },
        body: {
          firstname: 'kkmailcom',
        },
        params: {
          id: regularUser.id
        },
        tokenDecode: { roleId: regularUser.roleId }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.validateUserUpdate(request, response, stub.next);
      expect(stub.next).not.to.have.been.called;
      done();
    });
  });

  describe('getSingleUser', () => {
    it('should not continue when user does not exist', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/users/1',
        params: {
          id: 66
        },
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.getSingleUser(request, response, stub.next);
    });

    it('should continue when user exist', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/users/2',
        params: {
          id: regularUser.id
        },
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.getSingleUser(request, response, stub.next);
      expect(stub.next).not.to.have.been.called;
      done();
    });
  });

  describe('validateDeleteUser', () => {
    it('should not continue when user want to delete the default admin user',
    () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/users/1',
        params: {
          id: 1
        },
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateDeleteUser(request, response, stub.next);
    });
  });

  describe('validateSearch', () => {
    it('should not continue when limit is negative', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/users/search',
        query: {
          limit: -2,
        }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateSearch(request, response, stub.next);
    });

    it('should not continue when offset is negative', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/users/search',
        query: {
          offset: -2,
        }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateSearch(request, response, stub.next);
    });
  });

  describe('validateDocumentsInput', () => {
    it('should not continue when title field is missing', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/documents',
        body: {
          content: 'Andela is the name'
        },
        tokenDecode: { userId: 2, roleId: 2 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateDocumentsInput(request, response, stub.next);
    });

    it('should not continue when access level is andela', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/documents',
        body: {
          title: 'andela',
          content: 'andela andela',
          access: 'andela'
        },
        tokenDecode: { userId: 2, roleId: 2 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.validateDocumentsInput(request, response, stub.next);
    });
  });

  describe('getSingleDocument', () => {
    before((done) => {
      superRequest.post('/documents')
        .send(helper.publicDocument)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          publicDocument = res.body.document;
          superRequest.post('/documents')
            .send(helper.privateDocument)
            .set({ 'x-access-token': adminToken })
            .end((error, response) => {
              privateDocument = response.body.document;
              done();
            });
        });
    });
    it('should not continue when document does not exist', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/documents/7',
        params: { id: 7 },
        tokenDecode: { userId: 2, roleId: 2 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.getSingleDocument(request, response, stub.next);
    });

    it('should not continue when document is private', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/documents/2',
        params: { id: privateDocument.id },
        tokenDecode: { userId: 2, roleId: 2 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.getSingleDocument(request, response, stub.next);
    });

    it('should continue when document is public', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/documents/1',
        params: { id: publicDocument.id },
        tokenDecode: { userId: 2, roleId: 2 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.getSingleDocument(request, response, stub.next);
      expect(stub.next).not.to.have.been.called;
      done();
    });
  });

  describe('hasDocumentPermission', () => {
    it('should not continue when user is not the owner of the document', () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'PUT',
        url: '/documents/1',
        body: {
          content: 'Andela is the name'
        },
        params: {
          id: 1
        },
        tokenDecode: { userId: 2, roleId: 2 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.hasDocumentPermission(request, response, stub.next);
    });

    it('should continue when user is the owner of the document', (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/documents',
        body: {
          title: 'andela',
        },
        tokenDecode: { userId: 1, roleId: 1 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      Auth.hasDocumentPermission(request, response, stub.next);
      expect(stub.next).not.to.have.been.called;
      done();
    });
  });

  describe('modifyRolePermission', () => {
    it('should not continue when admin want to modify the default admin role',
    () => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/roles/1',
        params: {
          id: 1
        },
        tokenDecode: { userId: 1, roleId: 1 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.modifyRolePermission(request, response, stub.next);
    });

    it('should not continue when admin want to delete the default regular role',
    (done) => {
      const response = responseEvent();
      request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/roles',
        params: {
          id: 2
        },
        tokenDecode: { userId: 1, roleId: 1 }
      });
      const stub = {
        next: () => { }
      };
      sinon.spy(stub, 'next');
      response.on('end', () => {
        expect(response._getData().success).to.equal(false);
      });
      Auth.modifyRolePermission(request, response, stub.next);
      done();
    });
  });
});
