import chai from 'chai';
import db from '../../app/models';
import helper from '../test.helper';

const expect = chai.expect;

describe('User Model', () => {
  const requiredFields = [
    'username',
    'firstname',
    'lastname',
    'email',
    'password'
  ];
  const uniqueFields = ['username', 'email'];
  const emptyFields = ['firstname', 'lastname'];
  const defaultRoleId = 2;
  let regularUser;

  before((done) => {
    db.Role.create({ title: 'regular', id: 2 }).then(() => {
      done();
    });
  });
  after((done) => { db.Role.destroy({ where: {} }); done(); });

  describe('Create user', () => {
    it('should create a user', (done) => {
      db.User.create(helper.regularUser)
        .then((user) => {
          regularUser = user.dataValues;
          expect(user.dataValues.firstname)
            .to.equal(helper.regularUser.firstname);
          expect(user.dataValues.lastname)
            .to.equal(helper.regularUser.lastname);
          expect(user.dataValues.username)
            .to.equal(helper.regularUser.username);
          expect(user.dataValues.email).to.equal(helper.regularUser.email);
          expect(user.dataValues.roleId).to.equal(defaultRoleId);
          expect(user.dataValues.password)
            .to.not.equal(helper.regularUser.password);
          done();
        });
    });

    it('should not create a user when email is invalid', (done) => {
      db.User.create(helper.invalidEmailUser)
        .then()
        .catch((error) => {
          expect(error.errors[0].message)
            .to.equal('Input a valid email address');
          expect(error.errors[0].type).to.equal('Validation error');
          expect(error.errors[0].path).to.equal('email');
          done();
        });
    });

    it('should not create a user when password character is not up to 8',
    (done) => {
      db.User.create(helper.invalidPasswordUser)
        .then()
        .catch((error) => {
          expect(error.errors[0].message)
            .to.equal('Minimum of 8 characters is required');
          expect(error.errors[0].type).to.equal('Validation error');
          expect(error.errors[0].path).to.equal('validatePassword');
          done();
        });
    });
  });

  describe('Unique', () => {
    uniqueFields.forEach((field) => {
      const uniqueTest = Object.assign({}, helper.firstUser);
      uniqueTest[field] = helper.regularUser[field];
      it(`should fails for existing ${field}`, (done) => {
        db.User.create(uniqueTest)
        .then()
        .catch((error) => {
          expect(error.errors[0].message).to.equal(`${field} already exist`);
          expect(error.errors[0].type).to.equal('unique violation');
          expect(error.errors[0].path).to.equal(field);
          done();
        });
      });
    });
  });

  describe('NOT NULL VIOLATIONS', () => {
    requiredFields.forEach((field) => {
      it(`should fails when ${field} is null`, (done) => {
        const nullField = Object.assign({}, helper.secondUser);
        nullField[field] = null;
        db.User.create(nullField)
          .then()
          .catch((error) => {
            expect(error.errors[0].message).to.equal(`${field} cannot be null`);
            expect(error.errors[0].type).to.equal('notNull Violation');
            done();
          });
      });
    });
  });

  describe('Empty string Violations', () => {
    emptyFields.forEach((field) => {
      it(`should fails when ${field} is empty`, (done) => {
        const emptyField = Object.assign({}, helper.secondUser);
        emptyField[field] = '';
        db.User.create(emptyField)
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

  describe('Login In', () => {
    let decryptPassword;
    it('should login a user', () => {
      db.User.findOne({ where: { email: regularUser.email } })
        .then((user) => {
          decryptPassword = user.validPassword(helper.regularUser.password);
          expect(decryptPassword).to.be.equal(true);
          expect(user.password).to.not.equal(helper.regularUser.password);
        });
    });
  });

  describe('Update user', () => {
    const updatedUser = {};
    beforeEach((done) => {
      const updateD = { firstname: 'olawale', password: 'newnewnewnew' };
      db.User.findById(regularUser.id)
        .then((user) => {
          user.update(updateD)
          .then((upUser) => {
            Object.assign(updatedUser, upUser.dataValues);
            done();
          });
        });
    });

    it('ensures password is hashed', (done) => {
      db.User.findById(updatedUser.id)
        .then((user) => {
          expect(user.dataValues.password).is.not.equal(regularUser.password);
          expect(user.dataValues.id).to.equal(regularUser.id);
          expect(user.dataValues.firstname).to.not.equal(regularUser.firstname);
          expect(user.dataValues.email).to.equal(regularUser.email);
          done();
        });
    });
  });
});
