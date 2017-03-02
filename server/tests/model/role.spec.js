import chai from 'chai';
import db from '../../app/models';
import helper from '../test.helper';

const expect = chai.expect;

describe('ROLE', () => {
  let guestRole;
  after((done) => {
    db.Role.destroy({ where: {} });
    done();
  });

  describe('Create Role', () => {
    it('should create a role', (done) => {
      db.Role.create(helper.testRoleG)
        .then((role) => {
          guestRole = role.dataValues;
          expect(role.dataValues.title).to.equal(helper.testRoleG.title);
          expect(role.dataValues.id).to.equal(helper.testRoleG.id);
          done();
        });
    });
    it('should fail when role title already exist', (done) => {
      const newRole = { title: 'guest' };
      db.Role.create(newRole)
        .then()
        .catch((error) => {
          expect(error.errors[0].message).to.equal('role already exist');
          expect(error.errors[0].type).to.equal('unique violation');
          expect(error.errors[0].path).to.equal('title');
          expect(error.errors[0].value).to.equal('guest');
          done();
        });
    });
  });
  describe('NOT NULL violation', () => {
    it('should fail when title of a role is null', (done) => {
      const nullTitle = { title: null };
      db.Role.create(nullTitle)
        .then()
        .catch((error) => {
          expect(error.errors[0].message).to.equal('title cannot be null');
          expect(error.errors[0].type).to.equal('notNull Violation');
          expect(error.errors[0].value).to.equal(null);
          done();
        });
    });
  });
  describe('EMPTY String violation', () => {
    it('should fail for empty string title', (done) => {
      const emptyTitle = { title: ' ' };
      db.Role.create(emptyTitle)
        .then()
        .catch((error) => {
          expect(error.errors[0].message).to.equal('Input a valid title');
          expect(error.errors[0].type).to.equal('Validation error');
          expect(error.errors[1].message).to.equal('This field cannot be empty');
          done();
        });
    });
  });
  describe('Update Role', () => {
    let newRole;
    before((done) => {
      db.Role.findById(guestRole.id)
        .then((role) => {
          role.update({ title: 'fellow' })
            .then((updatedRole) => {
              newRole = updatedRole;
              done();
            });
        });
    });
    it('should update a role', (done) => {
      db.Role.findById(newRole.id)
        .then((role) => {
          expect(role.dataValues.id).to.equal(guestRole.id);
          expect(role.dataValues.title).to.not.equal(guestRole.title);
          expect(role.dataValues.title).to.equal('fellow');
          done();
        });
    });
  });
  describe('DELETE role', () => {
    it('should delete a role', (done) => {
      db.Role.destroy({ where: { id: guestRole.id } })
        .then(() => {
          db.Role.findById(guestRole.id)
            .then((res) => {
              expect(res).to.equal(null);
              done();
            });
        });
    });
  });
});
