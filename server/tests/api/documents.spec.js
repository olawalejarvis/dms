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
let regulartoken;
let regularToken2;

let adminUser;
let regularUser;
let regularUser2;

let adminRole;
let regularRole;

describe('DOCUMENT API', () => {
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
                    regulartoken = res1.body.token;
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
  describe()
});
