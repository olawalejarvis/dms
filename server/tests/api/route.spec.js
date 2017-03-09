import request from 'supertest';
import chai from 'chai';
import app from '../../config/app';

const superRequest = request.agent(app);
const expect = chai.expect;

describe('ROUTE GET /', () => {
  it('should return a welcome message', (done) => {
    superRequest.get('/')
    .end((err, res) => {
      expect(res.status).to.equal(200);
      expect(res.body.message)
        .to.equal('Welcome to Document Management System');
      done();
    });
  });
  it('should return a message when accessing an unknown route', (done) => {
    superRequest.get('/users/name/andela/olawalequest')
    .end((err, res) => {
      expect(res.status).to.equal(404);
      expect(res.body.message)
        .to.equal('REQUEST PAGE NOT FOUND');
      done();
    });
  });
});
