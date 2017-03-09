import chai from 'chai';
import db from '../../app/models';
import helper from '../helper/test.helper';

const expect = chai.expect;

describe('Document Model', () => {
  let userDocument;
  let regularUser;
  const requiredFields = ['title', 'content'];
  const emptyFields = ['title', 'content', 'access'];

  before((done) => {
    db.Role.create({ title: 'regular', id: 2 })
      .then(() => {
        db.User.create(helper.regularUser)
          .then((user) => {
            regularUser = user.dataValues;
            done();
          });
      });
  });

  after((done) => { db.Role.destroy({ where: {} }); done(); });

  describe('CREATE Document', () => {
    it('should create a document', (done) => {
      helper.publicDocument.ownerRoleId = regularUser.roleId;
      helper.publicDocument.ownerId = regularUser.id;
      db.Document.create(helper.publicDocument)
        .then((doc) => {
          userDocument = doc.dataValues;
          expect(doc.dataValues.title).to.equal(helper.publicDocument.title);
          expect(doc.dataValues.content)
            .to.equal(helper.publicDocument.content);
          expect(doc.dataValues).to.have.property('createdAt');
          expect(doc.dataValues.ownerId).to.equal(regularUser.id);
          done();
        });
    });
  });

  describe('Not Null Violation', () => {
    requiredFields.forEach((field) => {
      it('should return "not null Violation message"', (done) => {
        const notNull = Object.assign({}, helper.publicDocument);
        notNull[field] = null;
        db.Document.create(notNull)
          .then()
          .catch((error) => {
            expect(error.errors[0].message).to.equal(`${field} cannot be null`);
            expect(error.errors[0].type).to.equal('notNull Violation');
            expect(error.errors[0].path).to.equal(field);
            expect(error.errors[0].value).to.equal(null);
            done();
          });
      });
    });
  });

  describe('EMPTY STRING', () => {
    emptyFields.forEach((field) => {
      it('should return error', (done) => {
        const emptyString = Object.assign({}, helper.publicDocument);
        emptyString[field] = ' ';
        db.Document.create(emptyString)
          .then()
          .catch((error) => {
            expect(error.errors[0].message)
              .to.equal('This field cannot be empty');
            expect(error.errors[0].type).to.equal('Validation error');
            expect(error.errors[0].path).to.equal(field);
            done();
          });
      });
    });
  });

  describe('ACCESS Violation', () => {
    it('should return error when access is not public, private or role',
    (done) => {
      const accessError = Object.assign({}, helper.publicDocument);
      accessError.access = 'andela';
      db.Document.create(accessError)
        .then()
        .catch((error) => {
          expect(error.errors[0].message)
            .to.equal('public, private or role required');
          expect(error.errors[0].type).to.equal('Validation error');
          expect(error.errors[0].path).to.equal('access');
          done();
        });
    });
  });

  describe('UPDATE Document', () => {
    let newDocument;
    beforeEach((done) => {
      db.Document.findById(userDocument.id)
        .then((doc) => {
          doc.update({ title: 'new andela book' })
            .then((updatedDocument) => {
              newDocument = updatedDocument;
              done();
            });
        });
    });

    it('should give the correct result', (done) => {
      db.Document.findById(userDocument.id)
        .then((doc) => {
          expect(doc.dataValues.id).to.equal(newDocument.id);
          expect(doc.dataValues.title).to.equal('new andela book');
          expect(doc.dataValues.content).to.equal(userDocument.content);
          expect(doc.dataValues.access).to.equal(userDocument.access);
          expect(doc.dataValues.ownerId).to.equal(userDocument.ownerId);
          done();
        });
    });
  });
});
